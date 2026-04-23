from django.contrib import admin
from .models import DietPlan, MealEntry, DetoxSchedule


class MealEntryInline(admin.TabularInline):
    model = MealEntry
    extra = 0


@admin.register(DietPlan)
class DietPlanAdmin(admin.ModelAdmin):
    list_display = ['student', 'title', 'start_date', 'end_date', 'is_active', 'created_by']
    list_filter = ['is_active']
    search_fields = ['student__name', 'title']
    inlines = [MealEntryInline]


@admin.register(DetoxSchedule)
class DetoxScheduleAdmin(admin.ModelAdmin):
    list_display = ['student', 'title', 'start_date', 'is_active']
    list_filter = ['is_active']
    search_fields = ['student__name', 'title']
