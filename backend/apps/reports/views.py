from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Avg, Q
from django.utils import timezone
import datetime


class AttendanceReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from apps.attendance.models import StudentAttendance
        from apps.students.models import Student

        student_id = request.query_params.get('student_id')
        date_from = request.query_params.get('from')
        date_to = request.query_params.get('to')

        queryset = StudentAttendance.objects.all()

        if student_id:
            queryset = queryset.filter(student_id=student_id)
        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        if date_to:
            queryset = queryset.filter(date__lte=date_to)

        summary = queryset.values('status').annotate(count=Count('id'))
        total = queryset.count()
        present = queryset.filter(status='present').count()
        attendance_rate = (present / total * 100) if total > 0 else 0

        monthly_data = []
        today = timezone.now().date()
        for i in range(6):
            month_date = today.replace(day=1) - datetime.timedelta(days=i * 30)
            month_start = month_date.replace(day=1)
            month_end = (month_start + datetime.timedelta(days=32)).replace(day=1) - datetime.timedelta(days=1)
            month_present = queryset.filter(date__range=(month_start, month_end), status='present').count()
            month_total = queryset.filter(date__range=(month_start, month_end)).count()
            monthly_data.append({
                'month': month_start.strftime('%b %Y'),
                'present': month_present,
                'total': month_total,
                'rate': round((month_present / month_total * 100) if month_total > 0 else 0, 2)
            })

        return Response({
            'total_records': total,
            'present': present,
            'attendance_rate': round(attendance_rate, 2),
            'summary': list(summary),
            'monthly_trend': list(reversed(monthly_data)),
        })


class TherapyProgressReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from apps.student_sessions.models import SessionReport, SessionReportStudent

        student_id = request.query_params.get('student_id')

        if student_id:
            reports = SessionReportStudent.objects.filter(
                student_id=student_id,
                improvement_level__isnull=False
            ).select_related('session_report')

            monthly_progress = []
            today = timezone.now().date()
            for i in range(6):
                month_date = today.replace(day=1) - datetime.timedelta(days=i * 30)
                month_start = month_date.replace(day=1)
                month_end = (month_start + datetime.timedelta(days=32)).replace(day=1) - datetime.timedelta(days=1)
                month_reports = reports.filter(session_report__date__range=(month_start, month_end))
                avg_improvement = month_reports.aggregate(avg=Avg('improvement_level'))['avg']
                monthly_progress.append({
                    'month': month_start.strftime('%b %Y'),
                    'average_improvement': round(avg_improvement, 2) if avg_improvement else 0,
                    'session_count': month_reports.count()
                })

            overall_avg = reports.aggregate(avg=Avg('improvement_level'))['avg']
            return Response({
                'student_id': student_id,
                'overall_average': round(overall_avg, 2) if overall_avg else 0,
                'total_sessions': reports.count(),
                'monthly_progress': list(reversed(monthly_progress))
            })

        return Response({'detail': 'student_id parameter required'}, status=400)


class ClassPerformanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from apps.student_sessions.models import SessionReport
        from apps.classes.models import Class

        class_id = request.query_params.get('class_id')

        if class_id:
            reports = SessionReport.objects.filter(period__class_ref_id=class_id)
            status_summary = reports.values('status').annotate(count=Count('id'))
            avg_improvement = reports.filter(improvement_level__isnull=False).aggregate(
                avg=Avg('improvement_level')
            )['avg']
            return Response({
                'class_id': class_id,
                'total_sessions': reports.count(),
                'average_improvement': round(avg_improvement, 2) if avg_improvement else 0,
                'status_summary': list(status_summary),
            })
        return Response({'detail': 'class_id parameter required'}, status=400)


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.now().date()

        if user.role == 'ADMIN':
            from apps.students.models import Student
            from apps.users.models import User
            from apps.fees.models import StudentFee
            from apps.attendance.models import StudentAttendance

            total_students = Student.objects.filter(is_active=True).count()
            total_staff = User.objects.filter(role__in=['TEACHER', 'THERAPIST', 'DIETICIAN']).count()
            pending_fees = StudentFee.objects.filter(status='pending').count()
            overdue_fees = StudentFee.objects.filter(status='overdue').count()
            today_present = StudentAttendance.objects.filter(date=today, status='present').count()
            today_attendance_rate = (today_present / total_students * 100) if total_students > 0 else 0

            return Response({
                'total_students': total_students,
                'total_staff': total_staff,
                'pending_fees': pending_fees,
                'overdue_fees': overdue_fees,
                'today_attendance_rate': round(today_attendance_rate, 2),
                'today_present': today_present,
            })

        elif user.role in ['TEACHER', 'THERAPIST']:
            from apps.timetable.models import Period
            from apps.student_sessions.models import SessionReport

            today_periods = Period.objects.filter(
                teacher=user,
                day_of_week=today.weekday(),
                is_active=True
            ).count()
            pending_reports = SessionReport.objects.filter(
                teacher=user,
                status='pending'
            ).count()
            total_sessions = SessionReport.objects.filter(teacher=user).count()

            return Response({
                'today_periods': today_periods,
                'pending_reports': pending_reports,
                'total_sessions': total_sessions,
            })

        elif user.role == 'PARENT':
            from apps.students.models import StudentParent
            from apps.attendance.models import StudentAttendance
            from apps.fees.models import StudentFee

            children = StudentParent.objects.filter(parent=user).select_related('student')
            child_ids = [sp.student_id for sp in children]

            pending_fees = StudentFee.objects.filter(student__in=child_ids, status='pending').count()
            today_attendance = StudentAttendance.objects.filter(
                student__in=child_ids, date=today
            ).values('student', 'status')

            return Response({
                'children_count': len(children),
                'pending_fees': pending_fees,
                'today_attendance': list(today_attendance),
            })

        return Response({'role': user.role})
