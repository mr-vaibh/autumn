from rest_framework import serializers
from .models import Announcement, Message, Notification


class AnnouncementSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    target_class_name = serializers.CharField(source='target_class.name', read_only=True)

    class Meta:
        model = Announcement
        fields = [
            'id', 'title', 'body', 'created_by', 'created_by_name',
            'target', 'target_class', 'target_class_name', 'is_active',
            'is_pinned', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.full_name', read_only=True)
    recipient_name = serializers.CharField(source='recipient.full_name', read_only=True)
    sender_role = serializers.CharField(source='sender.role', read_only=True)

    class Meta:
        model = Message
        fields = [
            'id', 'sender', 'sender_name', 'sender_role',
            'recipient', 'recipient_name', 'content', 'is_read',
            'thread_id', 'parent', 'created_at'
        ]
        read_only_fields = ['id', 'sender', 'thread_id', 'created_at']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'notification_type', 'is_read', 'action_url', 'created_at']
        read_only_fields = ['id', 'created_at']
