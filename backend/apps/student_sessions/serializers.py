from rest_framework import serializers
from .models import SessionReport, SessionReportStudent, SessionMedia


class SessionMediaSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.full_name', read_only=True)

    class Meta:
        model = SessionMedia
        fields = ['id', 'file', 'media_type', 'caption', 'uploaded_by', 'uploaded_by_name', 'created_at']
        read_only_fields = ['id', 'created_at', 'uploaded_by']


class SessionReportStudentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    student_id_display = serializers.CharField(source='student.student_id', read_only=True)

    class Meta:
        model = SessionReportStudent
        fields = [
            'id', 'student', 'student_name', 'student_id_display',
            'individual_notes', 'improvement_level', 'was_present', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class SessionReportSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.full_name', read_only=True)
    period_name = serializers.CharField(source='period.name', read_only=True)
    period_subject = serializers.CharField(source='period.subject', read_only=True)
    student_reports = SessionReportStudentSerializer(many=True, read_only=True)
    media = SessionMediaSerializer(many=True, read_only=True)

    class Meta:
        model = SessionReport
        fields = [
            'id', 'period', 'period_name', 'period_subject', 'date',
            'teacher', 'teacher_name', 'status', 'activity_done',
            'student_response', 'behavior_notes', 'improvement_level',
            'general_notes', 'skip_reason', 'student_reports', 'media',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SessionReportListSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.full_name', read_only=True)
    period_subject = serializers.CharField(source='period.subject', read_only=True)
    class_name = serializers.CharField(source='period.class_ref.name', read_only=True)

    class Meta:
        model = SessionReport
        fields = [
            'id', 'period', 'period_subject', 'class_name', 'date',
            'teacher', 'teacher_name', 'status', 'improvement_level', 'created_at'
        ]
