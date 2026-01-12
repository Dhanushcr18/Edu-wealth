"""
URL configuration for eduwealth project.
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from datetime import datetime

def health_check(request):
    return JsonResponse({
        'status': 'ok',
        'timestamp': datetime.utcnow().isoformat() + 'Z'
    })

def api_root(request):
    return JsonResponse({
        'message': 'EduWealth API - Django Backend',
        'version': '1.0.0',
        'endpoints': {
            'health': '/health',
            'api': '/api/',
            'admin': '/admin/',
            'auth': {
                'signup': '/api/auth/signup',
                'login': '/api/auth/login',
                'refresh': '/api/auth/refresh',
                'google': '/api/auth/google',
            },
            'user': {
                'profile': '/api/me',
                'budget': '/api/me/budget',
            },
            'interests': {
                'all': '/api/interests',
                'user': '/api/interests/me',
            },
            'courses': {
                'list': '/api/courses',
                'saved': '/api/courses/saved',
            },
            'expenses': {
                'list': '/api/expenses',
            }
        },
        'frontend': 'http://localhost:3000',
        'status': 'running'
    })

urlpatterns = [
    path('', api_root),
    path('admin/', admin.site.urls),
    path('health', health_check),
    path('api/', include('api.urls')),
]
