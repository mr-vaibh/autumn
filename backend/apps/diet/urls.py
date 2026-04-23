from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DietPlanViewSet, MealEntryViewSet, DetoxScheduleViewSet

router = DefaultRouter()
router.register(r'plans', DietPlanViewSet, basename='diet-plans')
router.register(r'meals', MealEntryViewSet, basename='meal-entries')
router.register(r'detox', DetoxScheduleViewSet, basename='detox-schedules')

urlpatterns = [
    path('', include(router.urls)),
]
