from django.db import models
from students.models import Student

class Subject(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='subjects')
    name = models.CharField(max_length=100)
    course_description = models.TextField(max_length=1000, blank=True, null=True)
    notes = models.TextField(max_length=1000, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.student.first_name}'s {self.name}"
