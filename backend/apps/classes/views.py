from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import AcademicYear, Class, Section
from .serializers import AcademicYearSerializer, ClassSerializer, SectionSerializer


class AcademicYearViewSet(viewsets.ModelViewSet):
    queryset = AcademicYear.objects.all()
    serializer_class = AcademicYearSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering = ['-start_date']


class ClassViewSet(viewsets.ModelViewSet):
    queryset = Class.objects.all().select_related('academic_year', 'class_teacher').prefetch_related('sections')
    serializer_class = ClassSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['academic_year', 'is_active']
    search_fields = ['name', 'description']
    ordering = ['name']


class SectionViewSet(viewsets.ModelViewSet):
    queryset = Section.objects.all().select_related('class_ref').prefetch_related('students')
    serializer_class = SectionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['class_ref', 'is_active']
    search_fields = ['name']
