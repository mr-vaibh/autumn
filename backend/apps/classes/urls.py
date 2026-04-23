from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AcademicYearViewSet, ClassViewSet, SectionViewSet

router = DefaultRouter()
router.register(r'academic-years', AcademicYearViewSet, basename='academic-years')
router.register(r'sections', SectionViewSet, basename='sections')
router.register(r'', ClassViewSet, basename='classes')

urlpatterns = [
    path('', include(router.urls)),
]
