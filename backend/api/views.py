from rest_framework import generics
from students.models import Student
from subjects.models import Subject
from assignments.models import Assignment
from .serializers import StudentSerializer, SubjectSerializer, AssignmentSerializer
from .clerk_auth import ClerkAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

# Base class for authentications
class AuthenticatedViewMixin:
    authentication_classes = [ClerkAuthentication]
    permission_classes = [IsAuthenticated]

# Student
class StudentListCreateView(generics.ListCreateAPIView, AuthenticatedViewMixin):
    serializer_class = StudentSerializer

    def get_queryset(self):
        return Student.objects.filter(clerk_user_id=str(self.request.user))

    def perform_create(self, serializer):
        serializer.save(clerk_user_id=str(self.request.user))

class StudentDetailView(generics.RetrieveUpdateDestroyAPIView, AuthenticatedViewMixin):
    serializer_class = StudentSerializer

    def get_queryset(self):
        return Student.objects.filter(clerk_user_id=str(self.request.user))

# Subject
class SubjectListCreateView(generics.ListCreateAPIView, AuthenticatedViewMixin):
    serializer_class = SubjectSerializer

    def get_queryset(self):
        # Only allow subjects for students owned by the current user
        queryset = Subject.objects.filter(student__clerk_user_id=str(self.request.user))
        student_id = self.request.query_params.get('student')
        if student_id is not None:
            queryset = queryset.filter(student_id=student_id)
        return queryset

    def perform_create(self, serializer):
        # Only allow creating a subject for a student owned by the current user
        student = serializer.validated_data.get('student')
        if student.clerk_user_id != str(self.request.user):
            raise PermissionDenied('You do not have permission to add a subject for this student.')
        serializer.save()

class SubjectDetailView(generics.RetrieveUpdateDestroyAPIView, AuthenticatedViewMixin):
    serializer_class = SubjectSerializer

    def get_queryset(self):
        # Only allow access to subjects for students owned by the current user
        return Subject.objects.filter(student__clerk_user_id=str(self.request.user))

# Assignment
class AssignmentListCreateView(generics.ListCreateAPIView, AuthenticatedViewMixin):
    serializer_class = AssignmentSerializer

    def get_queryset(self):
        # Only allow assignments for subjects owned by the current user
        queryset = Assignment.objects.filter(subject__student__clerk_user_id=str(self.request.user))
        subject_id = self.request.query_params.get('subject')
        if subject_id is not None:
            queryset = queryset.filter(subject_id=subject_id)
        return queryset

    def perform_create(self, serializer):
        # Only allow creating an assignment for a subject owned by the current user
        subject = serializer.validated_data.get('subject')
        if subject.student.clerk_user_id != str(self.request.user):
            raise PermissionDenied('You do not have permission to add an assignment for this subject.')
        serializer.save()

class AssignmentDetailView(generics.RetrieveUpdateDestroyAPIView, AuthenticatedViewMixin):
    serializer_class = AssignmentSerializer

    def get_queryset(self):
        # Only allow access to assignments for subjects owned by the current user
        return Assignment.objects.filter(subject__student__clerk_user_id=str(self.request.user))