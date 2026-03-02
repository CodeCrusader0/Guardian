from django.urls import path
from . import views

urlpatterns = [
    path('api/check-hash/', views.check_hash, name='check_hash'),
    path('api/upload/', views.upload_file, name='upload_file'),
    path('api/files/', views.list_files, name='list_files'),
]