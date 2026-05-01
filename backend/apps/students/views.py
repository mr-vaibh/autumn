from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Student, StudentDocument, StudentParent
from .serializers import StudentSerializer, StudentListSerializer, StudentDocumentSerializer, StudentParentSerializer


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all().prefetch_related('parents', 'documents')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['autism_level', 'is_active']
    search_fields = ['name', 'student_id', 'diagnosis']
    ordering_fields = ['name', 'enrollment_date', 'created_at']
    ordering = ['name']

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if user.role == 'PARENT':
            student_ids = user.children.values_list('student_id', flat=True)
            queryset = queryset.filter(id__in=student_ids)
        elif user.role in ['TEACHER', 'THERAPIST']:
            # Teachers see students in sections they teach
            from apps.classes.models import Section
            section_ids = Section.objects.filter(class_ref__class_teacher=user).values_list('id', flat=True)
            teacher_section_ids = Section.objects.filter(
                periods__teacher=user
            ).values_list('id', flat=True)
            all_section_ids = list(section_ids) + list(teacher_section_ids)
            queryset = queryset.filter(sections__id__in=all_section_ids).distinct()
        return queryset

    def get_serializer_class(self):
        if self.action == 'list':
            return StudentListSerializer
        return StudentSerializer

    @action(detail=True, methods=['get', 'post'], url_path='documents')
    def documents(self, request, pk=None):
        student = self.get_object()
        if request.method == 'GET':
            docs = StudentDocument.objects.filter(student=student)
            serializer = StudentDocumentSerializer(docs, many=True)
            return Response(serializer.data)
        elif request.method == 'POST':
            serializer = StudentDocumentSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(student=student, uploaded_by=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get', 'post'], url_path='parents')
    def parents(self, request, pk=None):
        student = self.get_object()
        if request.method == 'GET':
            parents = StudentParent.objects.filter(student=student).select_related('parent')
            serializer = StudentParentSerializer(parents, many=True)
            return Response(serializer.data)
        elif request.method == 'POST':
            serializer = StudentParentSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(student=student)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StudentDocumentViewSet(viewsets.ModelViewSet):
    queryset = StudentDocument.objects.all()
    serializer_class = StudentDocumentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)
