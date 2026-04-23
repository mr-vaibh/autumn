from rest_framework import serializers
from apps.users.serializers import UserSerializer
from .models import Student, StudentDocument, StudentParent


class StudentDocumentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.full_name', read_only=True)

    class Meta:
        model = StudentDocument
        fields = ['id', 'document_type', 'title', 'file', 'uploaded_by', 'uploaded_by_name', 'notes', 'created_at']
        read_only_fields = ['id', 'created_at', 'uploaded_by']


class StudentParentSerializer(serializers.ModelSerializer):
    parent_name = serializers.CharField(source='parent.full_name', read_only=True)
    parent_email = serializers.CharField(source='parent.email', read_only=True)
    parent_phone = serializers.CharField(source='parent.phone', read_only=True)

    class Meta:
        model = StudentParent
        fields = ['id', 'parent', 'parent_name', 'parent_email', 'parent_phone', 'relationship', 'is_primary', 'created_at']
        read_only_fields = ['id', 'created_at']


class StudentSerializer(serializers.ModelSerializer):
    age = serializers.ReadOnlyField()
    parents = StudentParentSerializer(many=True, read_only=True)
    documents_count = serializers.SerializerMethodField()
    profile_pic_url = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = [
            'id', 'name', 'student_id', 'date_of_birth', 'age', 'diagnosis',
            'autism_level', 'enrollment_date', 'profile_pic', 'profile_pic_url',
            'is_active', 'medical_notes', 'emergency_contact_name',
            'emergency_contact_phone', 'emergency_contact_relation',
            'blood_group', 'allergies', 'parents', 'documents_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'student_id', 'created_at', 'updated_at']

    def get_documents_count(self, obj):
        return obj.documents.count()

    def get_profile_pic_url(self, obj):
        if obj.profile_pic:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_pic.url)
        return None


class StudentListSerializer(serializers.ModelSerializer):
    age = serializers.ReadOnlyField()

    class Meta:
        model = Student
        fields = ['id', 'name', 'student_id', 'date_of_birth', 'age', 'autism_level', 'is_active', 'enrollment_date']
