from django.contrib import admin
from .models import SessionReport, SessionReportStudent, SessionMedia


class SessionReportStudentInline(admin.TabularInline):
    model = SessionReportStudent
    extra = 0


class SessionMediaInline(admin.TabularInline):
    model = SessionMedia
    extra = 0


@admin.register(SessionReport)
class SessionReportAdmin(admin.ModelAdmin):
    list_display = ['period', 'date', 'teacher', 'status', 'improvement_level', 'created_at']
    list_filter = ['status', 'date']
    search_fields = ['period__subject', 'teacher__email', 'activity_done']
    ordering = ['-date']
    inlines = [SessionReportStudentInline, SessionMediaInline]
