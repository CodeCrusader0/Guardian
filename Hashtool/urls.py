from django.urls import path
from . import views

urlpatterns = [
    path('api/check-hash/', views.check_hash, name='check_hash'),
    path('api/upload/', views.upload_file, name='upload_file'),
    path('api/files/', views.list_files, name='list_files'),
    path('api/archive/', views.trigger_archive, name='trigger_archive'),
    path('api/login/', views.login_view, name='login'),
    path('api/logout/', views.logout_view, name='logout'),
    path('api/auth-status/', views.check_auth_status, name='auth_status'),
    path('api/users/', views.manage_users, name='manage_users'),
    path('api/users/<int:user_id>/', views.delete_user, name='delete_user'),
]