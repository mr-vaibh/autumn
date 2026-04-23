from rest_framework import serializers
from .models import StudentAttendance, StaffAttendance


class StudentAttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    student_id_display = serializers.CharField(source='student.student_id', read_only=True)
    marked_by_name = serializers.CharField(source='marked_by.full_name', read_only=True)

    class Meta:
        model = StudentAttendance
        fields = [
            'id', 'student', 'student_name', 'student_id_display', 'date', 'status',
            'marked_by', 'marked_by_name', 'notes', 'check_in_time', 'check_out_time',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'marked_by']


class BulkAttendanceSerializer(serializers.Serializer):
    date = serializers.DateField()
    attendances = serializers.ListField(
        child=serializers.DictField()
    )


class StaffAttendanceSerializer(serializers.ModelSerializer):
    staff_name = serializers.CharField(source='staff.full_name', read_only=True)
    staff_role = serializers.CharField(source='staff.role', read_only=True)

    class Meta:
        model = StaffAttendance
        fields = [
            'id', 'staff', 'staff_name', 'staff_role', 'date',
            'check_in', 'check_out', 'status', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
