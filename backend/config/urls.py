from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView


def health_check(request):
    return JsonResponse({'status': 'healthy', 'service': 'Global Autism Learning School API'})


urlpatterns = [
    path('django-admin/', admin.site.urls),
    path('api/health/', health_check, name='health_check'),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/auth/', include('apps.authentication.urls')),
    path('api/users/', include('apps.users.urls')),
    path('api/students/', include('apps.students.urls')),
    path('api/classes/', include('apps.classes.urls')),
    path('api/timetable/', include('apps.timetable.urls')),
    path('api/sessions/', include('apps.student_sessions.urls')),
    path('api/attendance/', include('apps.attendance.urls')),
    path('api/fees/', include('apps.fees.urls')),
    path('api/communication/', include('apps.communication.urls')),
    path('api/diet/', include('apps.diet.urls')),
    path('api/reports/', include('apps.reports.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
