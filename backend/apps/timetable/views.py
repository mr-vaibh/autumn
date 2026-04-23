from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Period, PeriodTemplate
from .serializers import PeriodSerializer, PeriodTemplateSerializer, PeriodReorderSerializer


class PeriodTemplateViewSet(viewsets.ModelViewSet):
    queryset = PeriodTemplate.objects.all()
    serializer_class = PeriodTemplateSerializer
    permission_classes = [IsAuthenticated]


class PeriodViewSet(viewsets.ModelViewSet):
    queryset = Period.objects.all().select_related('class_ref', 'section', 'teacher', 'template')
    serializer_class = PeriodSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['class_ref', 'section', 'teacher', 'day_of_week', 'is_active']
    search_fields = ['name', 'subject', 'room']
    ordering = ['day_of_week', 'order', 'start_time']

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if user.role == 'TEACHER' or user.role == 'THERAPIST':
            queryset = queryset.filter(teacher=user)
        return queryset

    @action(detail=False, methods=['post'], url_path='reorder')
    def reorder(self, request):
        serializer = PeriodReorderSerializer(data=request.data)
        if serializer.is_valid():
            periods_data = serializer.validated_data['periods']
            for item in periods_data:
                Period.objects.filter(id=item['id']).update(order=item['order'])
            return Response({'detail': 'Periods reordered successfully'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
