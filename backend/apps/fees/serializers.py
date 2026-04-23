from rest_framework import serializers
from .models import FeeStructure, StudentFee, Payment, PromoCode


class FeeStructureSerializer(serializers.ModelSerializer):
    academic_year_name = serializers.CharField(source='academic_year.name', read_only=True)

    class Meta:
        model = FeeStructure
        fields = ['id', 'name', 'academic_year', 'academic_year_name', 'amount', 'frequency', 'description', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class PromoCodeSerializer(serializers.ModelSerializer):
    is_valid = serializers.ReadOnlyField()

    class Meta:
        model = PromoCode
        fields = ['id', 'code', 'discount_percent', 'valid_from', 'valid_to', 'max_uses', 'used_count', 'is_active', 'is_valid', 'created_at']
        read_only_fields = ['id', 'created_at', 'used_count']


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'id', 'student_fee', 'razorpay_order_id', 'razorpay_payment_id',
            'amount', 'status', 'paid_at', 'receipt_number', 'payment_method', 'created_at'
        ]
        read_only_fields = ['id', 'receipt_number', 'created_at']


class StudentFeeSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    student_id_display = serializers.CharField(source='student.student_id', read_only=True)
    fee_structure_name = serializers.CharField(source='fee_structure.name', read_only=True)
    net_amount = serializers.ReadOnlyField()
    payments = PaymentSerializer(many=True, read_only=True)

    class Meta:
        model = StudentFee
        fields = [
            'id', 'student', 'student_name', 'student_id_display',
            'fee_structure', 'fee_structure_name', 'due_date', 'amount',
            'discount_amount', 'net_amount', 'promo_code', 'status', 'notes',
            'payments', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CreateRazorpayOrderSerializer(serializers.Serializer):
    student_fee_id = serializers.IntegerField()


class VerifyPaymentSerializer(serializers.Serializer):
    razorpay_order_id = serializers.CharField()
    razorpay_payment_id = serializers.CharField()
    razorpay_signature = serializers.CharField()
