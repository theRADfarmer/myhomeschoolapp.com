from django.test import TestCase
from rest_framework.test import APITestCase, APIClient
from django.urls import reverse
from students.models import Student
from subjects.models import Subject
from assignments.models import Assignment
from django.contrib.auth import get_user_model
from rest_framework import status
from unittest.mock import patch

User = get_user_model()

class MockUser:
    def __init__(self, clerk_user_id):
        self.clerk_user_id = clerk_user_id
        self.is_authenticated = True
    def __str__(self):
        return self.clerk_user_id

class APITests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.mock_user_id = 'user_123'
        self.mock_user = MockUser(self.mock_user_id)
        # Patch authentication to always return mock_user
        patcher = patch('api.clerk_auth.ClerkAuthentication.authenticate', return_value=(self.mock_user, None))
        self.addCleanup(patcher.stop)
        self.mock_auth = patcher.start()
        # Do NOT use force_authenticate, let the authentication class handle it
        # self.client.force_authenticate(user=self.mock_user)
        # Create a student for this user
        self.student = Student.objects.create(
            clerk_user_id=self.mock_user_id,
            first_name='Test',
            last_name='Student',
            birth_date='2010-01-01'
        )
        # Create a subject for this student
        self.subject = Subject.objects.create(
            student=self.student,
            name='Math'
        )
        # Create an assignment for this subject
        self.assignment = Assignment.objects.create(
            student=self.student,
            subject=self.subject,
            name='Homework 1'
        )

    def test_student_list(self):
        url = reverse('student-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(any(s['id'] == self.student.id for s in response.data))

    def test_student_create(self):
        url = reverse('student-list')
        data = {
            'first_name': 'New',
            'last_name': 'Student',
            'birth_date': '2011-02-02'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Student.objects.filter(clerk_user_id=self.mock_user_id).count(), 2)

    def test_student_detail(self):
        url = reverse('student-detail', args=[self.student.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.student.id)

    def test_subject_list(self):
        url = reverse('subject-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(any(s['id'] == self.subject.id for s in response.data))

    def test_subject_create(self):
        url = reverse('subject-list')
        data = {
            'name': 'Science',
            'student': self.student.id
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Subject.objects.filter(student__clerk_user_id=self.mock_user_id).count(), 2)

    def test_subject_create_permission_denied(self):
        other_student = Student.objects.create(
            clerk_user_id='other_user',
            first_name='Other',
            last_name='Student',
            birth_date='2012-03-03'
        )
        url = reverse('subject-list')
        data = {'name': 'Science', 'student': other_student.id}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_subject_detail(self):
        url = reverse('subject-detail', args=[self.subject.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.subject.id)

    def test_assignment_list(self):
        url = reverse('assignment-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(any(a['id'] == self.assignment.id for a in response.data))

    def test_assignment_create(self):
        url = reverse('assignment-list')
        data = {
            'name': 'Homework 2',
            'student': self.student.id,
            'subject': self.subject.id
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Assignment.objects.filter(subject__student__clerk_user_id=self.mock_user_id).count(), 2)

    def test_assignment_create_permission_denied(self):
        other_student = Student.objects.create(
            clerk_user_id='other_user',
            first_name='Other',
            last_name='Student',
            birth_date='2012-03-03'
        )
        other_subject = Subject.objects.create(student=other_student, name='Other Subject')
        url = reverse('assignment-list')
        data = {
            'name': 'Homework X',
            'student': other_student.id,
            'subject': other_subject.id
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_assignment_detail(self):
        url = reverse('assignment-detail', args=[self.assignment.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.assignment.id)
