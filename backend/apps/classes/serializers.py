from rest_framework import serializers
from apps.users.serializers import UserSerializer
from .models import AcademicYear, Class, Section


class AcademicYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicYear
        fields = ['id', 'name', 'start_date', 'end_date', 'is_current', 'created_at']
        read_only_fields = ['id', 'created_at']


class SectionSerializer(serializers.ModelSerializer):
    student_count = serializers.ReadOnlyField()
    is_full = serializers.ReadOnlyField()
    class_name = serializers.CharField(source='class_ref.name', read_only=True)

    class Meta:
        model = Section
        fields = ['id', 'name', 'class_ref', 'class_name', 'capacity', 'student_count', 'is_full', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class ClassSerializer(serializers.ModelSerializer):
    sections = SectionSerializer(many=True, read_only=True)
    teacher_name = serializers.CharField(source='class_teacher.full_name', read_only=True)
    academic_year_name = serializers.CharField(source='academic_year.name', read_only=True)
    total_students = serializers.SerializerMethodField()

    class Meta:
        model = Class
        fields = [
            'id', 'name', 'academic_year', 'academic_year_name',
            'class_teacher', 'teacher_name', 'description', 'color',
            'is_active', 'sections', 'total_students', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def get_total_students(self, obj):
        return sum(section.students.count() for section in obj.sections.all())
