from django.contrib import admin
from .models import Subject

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ("name", "student__first_name")
    list_filter = ("student",)
    search_fields = ("name", "student__first_name")