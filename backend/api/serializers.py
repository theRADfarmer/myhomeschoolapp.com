from rest_framework import serializers
from students.models import Student
from subjects.models import Subject
from assignments.models import Assignment

class StudentSerializer(serializers.ModelSerializer):
    clerk_user_id = serializers.CharField(read_only=True)
    class Meta:
        model = Student
        fields = '__all__'
        extra_kwargs = {
            'clerk_user_id': {'read_only': True}
        }

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'

class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = '__all__'