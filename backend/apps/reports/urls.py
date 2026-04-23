from django.urls import path
from .views import (
    AttendanceReportView, TherapyProgressReportView,
    ClassPerformanceView, DashboardStatsView
)

urlpatterns = [
    path('attendance/', AttendanceReportView.as_view(), name='attendance-report'),
    path('therapy-progress/', TherapyProgressReportView.as_view(), name='therapy-progress-report'),
    path('class-performance/', ClassPerformanceView.as_view(), name='class-performance'),
    path('dashboard/', DashboardStatsView.as_view(), name='dashboard-stats'),
]
