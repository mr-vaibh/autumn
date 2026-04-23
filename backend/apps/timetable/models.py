from django.db import models
from django.conf import settings


class PeriodTemplate(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    color = models.CharField(max_length=7, default='#7C3AED')
    icon = models.CharField(max_length=50, blank=True, null=True)
    default_duration_minutes = models.PositiveIntegerField(default=45)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'period_templates'
        verbose_name = 'Period Template'
        verbose_name_plural = 'Period Templates'
        ordering = ['name']

    def __str__(self):
        return self.name


class Period(models.Model):
    class DayOfWeek(models.IntegerChoices):
        MONDAY = 0, 'Monday'
        TUESDAY = 1, 'Tuesday'
        WEDNESDAY = 2, 'Wednesday'
        THURSDAY = 3, 'Thursday'
        FRIDAY = 4, 'Friday'
        SATURDAY = 5, 'Saturday'
        SUNDAY = 6, 'Sunday'

    name = models.CharField(max_length=100)
    class_ref = models.ForeignKey('classes.Class', on_delete=models.CASCADE, related_name='periods')
    section = models.ForeignKey('classes.Section', on_delete=models.SET_NULL, null=True, blank=True, related_name='periods')
    subject = models.CharField(max_length=100)
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='teaching_periods'
    )
    day_of_week = models.IntegerField(choices=DayOfWeek.choices)
    start_time = models.TimeField()
    end_time = models.TimeField()
    order = models.PositiveIntegerField(default=0)
    color = models.CharField(max_length=7, default='#7C3AED')
    template = models.ForeignKey(PeriodTemplate, on_delete=models.SET_NULL, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    room = models.CharField(max_length=50, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'periods'
        verbose_name = 'Period'
        verbose_name_plural = 'Periods'
        ordering = ['day_of_week', 'order', 'start_time']
        indexes = [
            models.Index(fields=['class_ref', 'day_of_week']),
            models.Index(fields=['teacher', 'day_of_week']),
        ]

    def __str__(self):
        day_name = self.get_day_of_week_display()
        return f"{self.subject} - {self.class_ref.name} ({day_name} {self.start_time})"
