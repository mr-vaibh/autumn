from django.db import models
from django.conf import settings


class DietPlan(models.Model):
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE, related_name='diet_plans')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='created_diet_plans')
    title = models.CharField(max_length=200, default='Diet Plan')
    start_date = models.DateField()
    end_date = models.DateField()
    notes = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    dietary_restrictions = models.TextField(blank=True, null=True)
    goals = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'diet_plans'
        verbose_name = 'Diet Plan'
        verbose_name_plural = 'Diet Plans'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['student', 'is_active']),
        ]

    def __str__(self):
        return f"Diet Plan for {self.student.name} ({self.start_date} - {self.end_date})"


class MealEntry(models.Model):
    class MealType(models.TextChoices):
        BREAKFAST = 'breakfast', 'Breakfast'
        LUNCH = 'lunch', 'Lunch'
        SNACK = 'snack', 'Snack'
        DINNER = 'dinner', 'Dinner'
        SUPPLEMENT = 'supplement', 'Supplement'

    class DayOfWeek(models.IntegerChoices):
        MONDAY = 0, 'Monday'
        TUESDAY = 1, 'Tuesday'
        WEDNESDAY = 2, 'Wednesday'
        THURSDAY = 3, 'Thursday'
        FRIDAY = 4, 'Friday'
        SATURDAY = 5, 'Saturday'
        SUNDAY = 6, 'Sunday'

    diet_plan = models.ForeignKey(DietPlan, on_delete=models.CASCADE, related_name='meal_entries')
    meal_type = models.CharField(max_length=20, choices=MealType.choices)
    day_of_week = models.IntegerField(choices=DayOfWeek.choices)
    food_items = models.TextField()
    calories = models.PositiveIntegerField(null=True, blank=True)
    protein_g = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    carbs_g = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    fat_g = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    special_notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'meal_entries'
        verbose_name = 'Meal Entry'
        verbose_name_plural = 'Meal Entries'
        ordering = ['day_of_week', 'meal_type']

    def __str__(self):
        return f"{self.get_meal_type_display()} - Day {self.day_of_week} ({self.diet_plan.student.name})"


class DetoxSchedule(models.Model):
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE, related_name='detox_schedules')
    title = models.CharField(max_length=200)
    schedule = models.TextField()
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    notes = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'detox_schedules'
        verbose_name = 'Detox Schedule'
        verbose_name_plural = 'Detox Schedules'
        ordering = ['-created_at']

    def __str__(self):
        return f"Detox Schedule for {self.student.name}"
