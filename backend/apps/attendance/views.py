from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Q
from .models import StudentAttendance, StaffAttendance
from .serializers import StudentAttendanceSerializer, StaffAttendanceSerializer, BulkAttendanceSerializer


class StudentAttendanceViewSet(viewsets.ModelViewSet):
    queryset = StudentAttendance.objects.all().select_related('student', 'marked_by')
    serializer_class = StudentAttendanceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['student', 'status', 'date']
    ordering = ['-date']

    def perform_create(self, serializer):
        serializer.save(marked_by=self.request.user)

    @action(detail=False, methods=['post'], url_path='bulk-mark')
    def bulk_mark(self, request):
        serializer = BulkAttendanceSerializer(data=request.data)
        if serializer.is_valid():
            date = serializer.validated_data['date']
            attendances = serializer.validated_data['attendances']
            results = []
            for att in attendances:
                obj, created = StudentAttendance.objects.update_or_create(
                    student_id=att['student_id'],
                    date=date,
                    defaults={
                        'status': att.get('status', 'present'),
                        'marked_by': request.user,
                        'notes': att.get('notes', ''),
                    }
                )
                results.append({'id': obj.id, 'student_id': obj.student_id, 'status': obj.status})
            return Response({'detail': f'{len(results)} attendance records updated', 'results': results})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='summary')
    def summary(self, request):
        date = request.query_params.get('date')
        if not date:
            from django.utils import timezone
            date = timezone.now().date()
        summary = StudentAttendance.objects.filter(date=date).values('status').annotate(count=Count('id'))
        return Response({
            'date': str(date),
            'summary': list(summary)
        })


class StaffAttendanceViewSet(viewsets.ModelViewSet):
    queryset = StaffAttendance.objects.all().select_related('staff')
    serializer_class = StaffAttendanceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['staff', 'status', 'date']
    ordering = ['-date']


class AttendanceSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from django.utils import timezone
        today = timezone.now().date()
        from apps.students.models import Student
        total_students = Student.objects.filter(is_active=True).count()
        today_present = StudentAttendance.objects.filter(date=today, status='present').count()
        today_absent = StudentAttendance.objects.filter(date=today, status='absent').count()
        attendance_rate = (today_present / total_students * 100) if total_students > 0 else 0
        return Response({
            'date': str(today),
            'total_students': total_students,
            'present': today_present,
            'absent': today_absent,
            'attendance_rate': round(attendance_rate, 2)
        })
