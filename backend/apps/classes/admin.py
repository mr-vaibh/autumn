from django.contrib import admin
from .models import AcademicYear, Class, Section


@admin.register(AcademicYear)
class AcademicYearAdmin(admin.ModelAdmin):
    list_display = ['name', 'start_date', 'end_date', 'is_current']
    list_filter = ['is_current']


@admin.register(Class)
class ClassAdmin(admin.ModelAdmin):
    list_display = ['name', 'academic_year', 'class_teacher', 'is_active']
    list_filter = ['academic_year', 'is_active']
    search_fields = ['name']


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ['name', 'class_ref', 'capacity', 'is_active']
    list_filter = ['class_ref', 'is_active']
    search_fields = ['name']
    filter_horizontal = ['students']
