from django.urls import path
from .views import (
    StudentListCreateView, StudentDetailView,
    SubjectListCreateView, SubjectDetailView,
    AssignmentListCreateView, AssignmentDetailView
)

urlpatterns = [
    # Students
    path("students/", StudentListCreateView.as_view(), name="student-list"),
    path("students/<int:pk>", StudentDetailView.as_view(), name="student-detail"),

    # Subjects
    path("subjects/", SubjectListCreateView.as_view(), name="subject-list"),
    path("subjects/<int:pk>", SubjectDetailView.as_view(), name="subject-detail"),

    # Assignments
    path("assignments/", AssignmentListCreateView.as_view(), name="assignment-list"),
    path("assignments/<int:pk>", AssignmentDetailView.as_view(), name="assignment-detail"),
]