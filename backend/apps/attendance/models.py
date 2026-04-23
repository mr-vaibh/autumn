from django.db import models
from django.conf import settings


class StudentAttendance(models.Model):
    class Status(models.TextChoices):
        PRESENT = 'present', 'Present'
        ABSENT = 'absent', 'Absent'
        LATE = 'late', 'Late'
        LEAVE = 'leave', 'Leave'
        HALF_DAY = 'half_day', 'Half Day'

    student = models.ForeignKey('students.Student', on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PRESENT)
    marked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True,
        related_name='marked_attendances'
    )
    notes = models.TextField(blank=True, null=True)
    check_in_time = models.TimeField(null=True, blank=True)
    check_out_time = models.TimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'student_attendances'
        verbose_name = 'Student Attendance'
        verbose_name_plural = 'Student Attendances'
        unique_together = ['student', 'date']
        ordering = ['-date']
        indexes = [
            models.Index(fields=['student', 'date']),
            models.Index(fields=['date', 'status']),
        ]

    def __str__(self):
        return f"{self.student.name} - {self.date} - {self.status}"


class StaffAttendance(models.Model):
    class Status(models.TextChoices):
        PRESENT = 'present', 'Present'
        ABSENT = 'absent', 'Absent'
        LATE = 'late', 'Late'
        LEAVE = 'leave', 'Leave'
        HALF_DAY = 'half_day', 'Half Day'
        WORK_FROM_HOME = 'wfh', 'Work From Home'

    staff = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='staff_attendances')
    date = models.DateField()
    check_in = models.TimeField(null=True, blank=True)
    check_out = models.TimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PRESENT)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'staff_attendances'
        verbose_name = 'Staff Attendance'
        verbose_name_plural = 'Staff Attendances'
        unique_together = ['staff', 'date']
        ordering = ['-date']
        indexes = [
            models.Index(fields=['staff', 'date']),
        ]

    def __str__(self):
        return f"{self.staff.full_name} - {self.date} - {self.status}"
