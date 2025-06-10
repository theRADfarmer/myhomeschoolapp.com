from django.contrib import admin
from .models import Student

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ("first_name", "last_name", "user", "birth_date")
    list_filter = ("user",)
    search_fields = ("first_name", "last_name", "user__email")
