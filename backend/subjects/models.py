from django.db import models
from django.contrib.auth.models import User

class Subject(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subjects')
    name = models.CharField(max_length=100)
    course_description = models.TextField(max_length=1000, blank=True, null=True)
    notes = models.TextField(max_length=1000, blank=True, null=True)

    def __str__(self):
        return self.name
