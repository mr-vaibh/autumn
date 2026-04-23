from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import DietPlan, MealEntry, DetoxSchedule
from .serializers import DietPlanSerializer, MealEntrySerializer, DetoxScheduleSerializer


class DietPlanViewSet(viewsets.ModelViewSet):
    queryset = DietPlan.objects.all().select_related('student', 'created_by').prefetch_related('meal_entries')
    serializer_class = DietPlanSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['student', 'is_active']
    search_fields = ['title', 'notes']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class MealEntryViewSet(viewsets.ModelViewSet):
    queryset = MealEntry.objects.all().select_related('diet_plan')
    serializer_class = MealEntrySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['diet_plan', 'meal_type', 'day_of_week']


class DetoxScheduleViewSet(viewsets.ModelViewSet):
    queryset = DetoxSchedule.objects.all().select_related('student', 'created_by')
    serializer_class = DetoxScheduleSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['student', 'is_active']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
