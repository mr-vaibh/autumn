from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import SessionReport, SessionReportStudent, SessionMedia
from .serializers import (
    SessionReportSerializer, SessionReportListSerializer,
    SessionReportStudentSerializer, SessionMediaSerializer
)


class SessionReportViewSet(viewsets.ModelViewSet):
    queryset = SessionReport.objects.all().select_related('period', 'teacher').prefetch_related('student_reports', 'media')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'teacher', 'period__class_ref']
    search_fields = ['activity_done', 'general_notes']
    ordering = ['-date', '-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return SessionReportListSerializer
        return SessionReportSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if user.role in ['TEACHER', 'THERAPIST']:
            queryset = queryset.filter(teacher=user)
        elif user.role == 'PARENT':
            student_ids = user.children.values_list('student_id', flat=True)
            queryset = queryset.filter(student_reports__student__in=student_ids)
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        if date_to:
            queryset = queryset.filter(date__lte=date_to)
        return queryset.distinct()

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)

    @action(detail=True, methods=['post'], url_path='add-media')
    def add_media(self, request, pk=None):
        report = self.get_object()
        serializer = SessionMediaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(session_report=report, uploaded_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SessionMediaViewSet(viewsets.ModelViewSet):
    queryset = SessionMedia.objects.all()
    serializer_class = SessionMediaSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)
