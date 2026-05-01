from django.db import models
from django.conf import settings


class Student(models.Model):
    class AutismLevel(models.TextChoices):
        LEVEL1 = 'Level1', 'Level 1 - Requiring Support'
        LEVEL2 = 'Level2', 'Level 2 - Requiring Substantial Support'
        LEVEL3 = 'Level3', 'Level 3 - Requiring Very Substantial Support'

    name = models.CharField(max_length=200)
    date_of_birth = models.DateField()
    diagnosis = models.TextField(blank=True, null=True)
    autism_level = models.CharField(max_length=10, choices=AutismLevel.choices, default=AutismLevel.LEVEL1)
    enrollment_date = models.DateField()
    profile_pic = models.ImageField(upload_to='students/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    medical_notes = models.TextField(blank=True, null=True)
    emergency_contact_name = models.CharField(max_length=200, blank=True, null=True)
    emergency_contact_phone = models.CharField(max_length=15, blank=True, null=True)
    emergency_contact_relation = models.CharField(max_length=50, blank=True, null=True)
    blood_group = models.CharField(max_length=10, blank=True, null=True)
    allergies = models.TextField(blank=True, null=True)
    student_id = models.CharField(max_length=20, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'students'
        verbose_name = 'Student'
        verbose_name_plural = 'Students'
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['is_active']),
            models.Index(fields=['autism_level']),
        ]

    def __str__(self):
        return f"{self.name} ({self.student_id or 'No ID'})"

    def save(self, *args, **kwargs):
        if not self.student_id:
            import datetime
            year = datetime.date.today().year
            from django.db.models import Max
            last = Student.objects.filter(
                student_id__startswith=f'GALS{year}'
            ).aggregate(Max('student_id'))['student_id__max']
            if last:
                try:
                    num = int(last[-4:]) + 1
                except (ValueError, IndexError):
                    num = Student.objects.count() + 1
            else:
                num = 1
            self.student_id = f"GALS{year}{num:04d}"
        super().save(*args, **kwargs)

    @property
    def age(self):
        import datetime
        today = datetime.date.today()
        return today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )


class StudentDocument(models.Model):
    class DocumentType(models.TextChoices):
        MEDICAL = 'medical', 'Medical Report'
        ASSESSMENT = 'assessment', 'Assessment Report'
        CONSENT = 'consent', 'Consent Form'
        BIRTH_CERT = 'birth_cert', 'Birth Certificate'
        PHOTO_ID = 'photo_id', 'Photo ID'
        OTHER = 'other', 'Other'

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=20, choices=DocumentType.choices, default=DocumentType.OTHER)
    title = models.CharField(max_length=200)
    file = models.FileField(upload_to='student_documents/')
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'student_documents'
        verbose_name = 'Student Document'
        verbose_name_plural = 'Student Documents'

    def __str__(self):
        return f"{self.student.name} - {self.title}"


class StudentParent(models.Model):
    class Relationship(models.TextChoices):
        FATHER = 'father', 'Father'
        MOTHER = 'mother', 'Mother'
        GUARDIAN = 'guardian', 'Guardian'
        SIBLING = 'sibling', 'Sibling'
        OTHER = 'other', 'Other'

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='parents')
    parent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='children')
    relationship = models.CharField(max_length=20, choices=Relationship.choices, default=Relationship.FATHER)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'student_parents'
        verbose_name = 'Student Parent'
        verbose_name_plural = 'Student Parents'
        unique_together = ['student', 'parent']
        indexes = [
            models.Index(fields=['student', 'parent']),
        ]

    def __str__(self):
        return f"{self.parent.full_name} - {self.relationship} of {self.student.name}"
