from django.db import models
from django.contrib.auth.models import User

class Student(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='students')
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    birth_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"
