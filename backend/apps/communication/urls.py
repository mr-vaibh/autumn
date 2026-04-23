from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AnnouncementViewSet, MessageViewSet, NotificationViewSet

router = DefaultRouter()
router.register(r'announcements', AnnouncementViewSet, basename='announcements')
router.register(r'messages', MessageViewSet, basename='messages')
router.register(r'notifications', NotificationViewSet, basename='notifications')

urlpatterns = [
    path('', include(router.urls)),
]
