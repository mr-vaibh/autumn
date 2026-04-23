from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentViewSet, StudentDocumentViewSet

router = DefaultRouter()
router.register(r'', StudentViewSet, basename='students')
router.register(r'documents', StudentDocumentViewSet, basename='student-documents')

urlpatterns = [
    path('', include(router.urls)),
]
