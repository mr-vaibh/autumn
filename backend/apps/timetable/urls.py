from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PeriodViewSet, PeriodTemplateViewSet

router = DefaultRouter()
router.register(r'templates', PeriodTemplateViewSet, basename='period-templates')
router.register(r'periods', PeriodViewSet, basename='periods')

urlpatterns = [
    path('', include(router.urls)),
]
