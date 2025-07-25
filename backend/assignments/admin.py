from django.contrib import admin
from .models import Assignment

@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ("name", "student", "subject", "completed", "grade", "date_completed")
    list_filter = ("completed", "student", "subject")
    search_fields = ("name", "student__first_name", "subject__name")
