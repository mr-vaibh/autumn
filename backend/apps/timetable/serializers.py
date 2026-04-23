from rest_framework import serializers
from .models import Period, PeriodTemplate


class PeriodTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PeriodTemplate
        fields = ['id', 'name', 'description', 'color', 'icon', 'default_duration_minutes', 'created_at']
        read_only_fields = ['id', 'created_at']


class PeriodSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.full_name', read_only=True)
    class_name = serializers.CharField(source='class_ref.name', read_only=True)
    section_name = serializers.CharField(source='section.name', read_only=True)
    day_name = serializers.CharField(source='get_day_of_week_display', read_only=True)

    class Meta:
        model = Period
        fields = [
            'id', 'name', 'class_ref', 'class_name', 'section', 'section_name',
            'subject', 'teacher', 'teacher_name', 'day_of_week', 'day_name',
            'start_time', 'end_time', 'order', 'color', 'template', 'is_active',
            'room', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class PeriodReorderSerializer(serializers.Serializer):
    periods = serializers.ListField(
        child=serializers.DictField(child=serializers.IntegerField()),
        help_text='List of {id: period_id, order: new_order}'
    )
