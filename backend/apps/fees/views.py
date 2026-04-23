from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.conf import settings
from django.utils import timezone
from .models import FeeStructure, StudentFee, Payment, PromoCode
from .serializers import (
    FeeStructureSerializer, StudentFeeSerializer, PaymentSerializer,
    PromoCodeSerializer, CreateRazorpayOrderSerializer, VerifyPaymentSerializer
)


class FeeStructureViewSet(viewsets.ModelViewSet):
    queryset = FeeStructure.objects.all().select_related('academic_year')
    serializer_class = FeeStructureSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['academic_year', 'frequency', 'is_active']
    search_fields = ['name']


class PromoCodeViewSet(viewsets.ModelViewSet):
    queryset = PromoCode.objects.all()
    serializer_class = PromoCodeSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'], url_path='validate')
    def validate_code(self, request):
        code = request.data.get('code')
        try:
            promo = PromoCode.objects.get(code=code)
            if promo.is_valid:
                return Response({'valid': True, 'discount_percent': promo.discount_percent})
            return Response({'valid': False, 'detail': 'Code is expired or exhausted'})
        except PromoCode.DoesNotExist:
            return Response({'valid': False, 'detail': 'Invalid code'})


class StudentFeeViewSet(viewsets.ModelViewSet):
    queryset = StudentFee.objects.all().select_related('student', 'fee_structure').prefetch_related('payments')
    serializer_class = StudentFeeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['student', 'status', 'fee_structure']
    search_fields = ['student__name', 'student__student_id']
    ordering = ['-due_date']

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.role == 'PARENT':
            student_ids = self.request.user.children.values_list('student_id', flat=True)
            queryset = queryset.filter(student__in=student_ids)
        return queryset


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all().select_related('student_fee')
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'student_fee']
    ordering = ['-created_at']

    @action(detail=False, methods=['post'], url_path='create-order')
    def create_order(self, request):
        serializer = CreateRazorpayOrderSerializer(data=request.data)
        if serializer.is_valid():
            student_fee_id = serializer.validated_data['student_fee_id']
            try:
                student_fee = StudentFee.objects.get(id=student_fee_id)
            except StudentFee.DoesNotExist:
                return Response({'detail': 'Fee not found'}, status=status.HTTP_404_NOT_FOUND)

            amount_paise = int(student_fee.net_amount * 100)

            try:
                import razorpay
                client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
                order = client.order.create({
                    'amount': amount_paise,
                    'currency': 'INR',
                    'receipt': f'fee_{student_fee_id}',
                    'notes': {
                        'student_name': student_fee.student.name,
                        'fee_structure': student_fee.fee_structure.name,
                    }
                })
                payment = Payment.objects.create(
                    student_fee=student_fee,
                    razorpay_order_id=order['id'],
                    amount=student_fee.net_amount,
                    status=Payment.Status.CREATED
                )
                return Response({
                    'order_id': order['id'],
                    'amount': amount_paise,
                    'currency': 'INR',
                    'key_id': settings.RAZORPAY_KEY_ID,
                    'payment_id': payment.id,
                    'student_name': student_fee.student.name,
                })
            except Exception as e:
                return Response({'detail': f'Payment gateway error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='verify')
    def verify(self, request):
        serializer = VerifyPaymentSerializer(data=request.data)
        if serializer.is_valid():
            order_id = serializer.validated_data['razorpay_order_id']
            payment_id = serializer.validated_data['razorpay_payment_id']
            signature = serializer.validated_data['razorpay_signature']

            try:
                import razorpay
                client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
                client.utility.verify_payment_signature({
                    'razorpay_order_id': order_id,
                    'razorpay_payment_id': payment_id,
                    'razorpay_signature': signature
                })
                payment = Payment.objects.get(razorpay_order_id=order_id)
                payment.razorpay_payment_id = payment_id
                payment.razorpay_signature = signature
                payment.status = Payment.Status.PAID
                payment.paid_at = timezone.now()
                payment.save()

                payment.student_fee.status = StudentFee.Status.PAID
                payment.student_fee.save()

                return Response({'detail': 'Payment verified successfully', 'receipt': payment.receipt_number})
            except Exception as e:
                return Response({'detail': f'Payment verification failed: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
