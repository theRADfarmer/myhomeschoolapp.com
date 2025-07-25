from django.contrib import admin
from .models import Student

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ("first_name", "last_name", "clerk_user_id", "birth_date")
    list_filter = ("clerk_user_id",)
    search_fields = ("first_name", "last_name", "clerk_user_id")
