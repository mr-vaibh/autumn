from django.contrib import admin
from .models import Period, PeriodTemplate


@admin.register(PeriodTemplate)
class PeriodTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'default_duration_minutes', 'color']
    search_fields = ['name']


@admin.register(Period)
class PeriodAdmin(admin.ModelAdmin):
    list_display = ['name', 'subject', 'class_ref', 'teacher', 'day_of_week', 'start_time', 'end_time', 'is_active']
    list_filter = ['day_of_week', 'is_active', 'class_ref']
    search_fields = ['name', 'subject', 'teacher__email']
    ordering = ['day_of_week', 'order', 'start_time']
