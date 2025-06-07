from django.urls import path
from .views import StudentListCreateView, SubjectListCreateView, AssignmentListCreateView

urlpatterns = [
    path("students/", StudentListCreateView.as_view(), name="student-list"),
    path("subjects/", SubjectListCreateView.as_view(), name="student-list"),
    path("assignments/", AssignmentListCreateView.as_view(), name="student-list"),
]