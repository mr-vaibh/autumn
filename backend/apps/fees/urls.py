from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FeeStructureViewSet, StudentFeeViewSet, PaymentViewSet, PromoCodeViewSet

router = DefaultRouter()
router.register(r'structures', FeeStructureViewSet, basename='fee-structures')
router.register(r'promo-codes', PromoCodeViewSet, basename='promo-codes')
router.register(r'student-fees', StudentFeeViewSet, basename='student-fees')
router.register(r'payments', PaymentViewSet, basename='payments')

urlpatterns = [
    path('', include(router.urls)),
]
