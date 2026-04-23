from django.contrib import admin
from .models import Student, StudentDocument, StudentParent


class StudentDocumentInline(admin.TabularInline):
    model = StudentDocument
    extra = 0


class StudentParentInline(admin.TabularInline):
    model = StudentParent
    extra = 0


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['name', 'student_id', 'autism_level', 'enrollment_date', 'is_active']
    list_filter = ['autism_level', 'is_active']
    search_fields = ['name', 'student_id']
    ordering = ['name']
    inlines = [StudentDocumentInline, StudentParentInline]


@admin.register(StudentDocument)
class StudentDocumentAdmin(admin.ModelAdmin):
    list_display = ['student', 'document_type', 'title', 'uploaded_by', 'created_at']
    list_filter = ['document_type']
    search_fields = ['student__name', 'title']


@admin.register(StudentParent)
class StudentParentAdmin(admin.ModelAdmin):
    list_display = ['student', 'parent', 'relationship', 'is_primary']
    list_filter = ['relationship', 'is_primary']
    search_fields = ['student__name', 'parent__email']
