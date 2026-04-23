from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Announcement, Message, Notification
from .serializers import AnnouncementSerializer, MessageSerializer, NotificationSerializer


class AnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.all().select_related('created_by', 'target_class')
    serializer_class = AnnouncementSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['target', 'is_active', 'is_pinned']
    search_fields = ['title', 'body']
    ordering = ['-is_pinned', '-created_at']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if user.role == 'PARENT':
            queryset = queryset.filter(Q(target='all') | Q(target='parents'), is_active=True)
        elif user.role in ['TEACHER', 'THERAPIST']:
            queryset = queryset.filter(Q(target='all') | Q(target='teachers'), is_active=True)
        return queryset


class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all().select_related('sender', 'recipient')
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering = ['created_at']

    def get_queryset(self):
        user = self.request.user
        return Message.objects.filter(
            Q(sender=user) | Q(recipient=user)
        ).select_related('sender', 'recipient').order_by('created_at')

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

    @action(detail=False, methods=['get'], url_path='threads')
    def threads(self, request):
        user = request.user
        messages = Message.objects.filter(
            Q(sender=user) | Q(recipient=user)
        ).values('thread_id').distinct()
        thread_data = []
        for msg in messages:
            last_msg = Message.objects.filter(thread_id=msg['thread_id']).order_by('-created_at').first()
            if last_msg:
                other_user = last_msg.recipient if last_msg.sender == user else last_msg.sender
                unread = Message.objects.filter(thread_id=msg['thread_id'], recipient=user, is_read=False).count()
                thread_data.append({
                    'thread_id': str(msg['thread_id']),
                    'other_user': {
                        'id': other_user.id,
                        'name': other_user.full_name,
                        'role': other_user.role,
                    },
                    'last_message': last_msg.content[:100],
                    'last_message_at': last_msg.created_at,
                    'unread_count': unread,
                })
        return Response(thread_data)

    @action(detail=False, methods=['post'], url_path='mark-read')
    def mark_read(self, request):
        thread_id = request.data.get('thread_id')
        if thread_id:
            Message.objects.filter(thread_id=thread_id, recipient=request.user).update(is_read=True)
        else:
            Message.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
        return Response({'detail': 'Messages marked as read'})


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['is_read', 'notification_type']

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_read(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'detail': 'All notifications marked as read'})

    @action(detail=False, methods=['get'], url_path='unread-count')
    def unread_count(self, request):
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({'unread_count': count})
