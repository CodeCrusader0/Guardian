from django.contrib import admin
from .models import FileRegistry

@admin.register(FileRegistry)
class FileRegistryAdmin(admin.ModelAdmin):
    list_display = ('original_name', 'sha256_hash', 'file_size', 'uploaded_at')
    search_fields = ('sha256_hash', 'original_name')