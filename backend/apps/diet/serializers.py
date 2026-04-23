from rest_framework import serializers
from .models import DietPlan, MealEntry, DetoxSchedule


class MealEntrySerializer(serializers.ModelSerializer):
    meal_type_display = serializers.CharField(source='get_meal_type_display', read_only=True)
    day_display = serializers.CharField(source='get_day_of_week_display', read_only=True)

    class Meta:
        model = MealEntry
        fields = [
            'id', 'diet_plan', 'meal_type', 'meal_type_display', 'day_of_week', 'day_display',
            'food_items', 'calories', 'protein_g', 'carbs_g', 'fat_g', 'special_notes', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class DietPlanSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    meal_entries = MealEntrySerializer(many=True, read_only=True)

    class Meta:
        model = DietPlan
        fields = [
            'id', 'student', 'student_name', 'created_by', 'created_by_name',
            'title', 'start_date', 'end_date', 'notes', 'is_active',
            'dietary_restrictions', 'goals', 'meal_entries', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']


class DetoxScheduleSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)

    class Meta:
        model = DetoxSchedule
        fields = [
            'id', 'student', 'student_name', 'title', 'schedule',
            'start_date', 'end_date', 'created_by', 'created_by_name',
            'notes', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'created_by']
