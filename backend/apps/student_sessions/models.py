from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class SessionReport(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        COMPLETED = 'completed', 'Completed'
        SKIPPED = 'skipped', 'Skipped'

    period = models.ForeignKey('timetable.Period', on_delete=models.CASCADE, related_name='session_reports')
    date = models.DateField()
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True,
        related_name='session_reports'
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    activity_done = models.TextField(blank=True, null=True)
    student_response = models.TextField(blank=True, null=True)
    behavior_notes = models.TextField(blank=True, null=True)
    improvement_level = models.IntegerField(
        null=True, blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    general_notes = models.TextField(blank=True, null=True)
    skip_reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'session_reports'
        verbose_name = 'Session Report'
        verbose_name_plural = 'Session Reports'
        unique_together = ['period', 'date']
        ordering = ['-date', '-created_at']
        indexes = [
            models.Index(fields=['period', 'date']),
            models.Index(fields=['teacher', 'date']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"Session Report - {self.period} - {self.date}"


class SessionReportStudent(models.Model):
    session_report = models.ForeignKey(SessionReport, on_delete=models.CASCADE, related_name='student_reports')
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE, related_name='session_reports')
    individual_notes = models.TextField(blank=True, null=True)
    improvement_level = models.IntegerField(
        null=True, blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    was_present = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'session_report_students'
        verbose_name = 'Session Report Student'
        verbose_name_plural = 'Session Report Students'
        unique_together = ['session_report', 'student']

    def __str__(self):
        return f"{self.student.name} - {self.session_report}"


class SessionMedia(models.Model):
    class MediaType(models.TextChoices):
        IMAGE = 'image', 'Image'
        VIDEO = 'video', 'Video'
        DOCUMENT = 'document', 'Document'

    session_report = models.ForeignKey(SessionReport, on_delete=models.CASCADE, related_name='media')
    file = models.FileField(upload_to='session_media/')
    media_type = models.CharField(max_length=20, choices=MediaType.choices, default=MediaType.IMAGE)
    caption = models.CharField(max_length=200, blank=True, null=True)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'session_media'
        verbose_name = 'Session Media'
        verbose_name_plural = 'Session Media'

    def __str__(self):
        return f"{self.media_type} for {self.session_report}"
