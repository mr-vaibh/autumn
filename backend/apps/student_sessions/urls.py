from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SessionReportViewSet, SessionMediaViewSet

router = DefaultRouter()
router.register(r'reports', SessionReportViewSet, basename='session-reports')
router.register(r'media', SessionMediaViewSet, basename='session-media')

urlpatterns = [
    path('', include(router.urls)),
]
