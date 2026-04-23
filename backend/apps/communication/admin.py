from django.contrib import admin
from .models import Announcement, Message, Notification


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ['title', 'created_by', 'target', 'is_active', 'is_pinned', 'created_at']
    list_filter = ['target', 'is_active', 'is_pinned']
    search_fields = ['title', 'body']
    ordering = ['-created_at']


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['sender', 'recipient', 'is_read', 'created_at']
    list_filter = ['is_read']
    search_fields = ['sender__email', 'recipient__email', 'content']
    ordering = ['-created_at']


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'notification_type', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read']
    search_fields = ['user__email', 'title']
    ordering = ['-created_at']
