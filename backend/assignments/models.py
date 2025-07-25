from django.db import models
from django.forms import ValidationError
from students.models import Student
from subjects.models import Subject

class Assignment(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="assignments")
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="assignments")
    name = models.CharField(max_length=50)
    notes = models.TextField(blank=True)
    date_completed = models.DateField(null=True, blank=True)
    completed = models.BooleanField(default=False)
    grade = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.student.first_name}'s {self.subject.name} assignment)"
    
    def clean(self):
        if self.subject.student != self.student:
            raise ValidationError("Subject does not belong to this student.")