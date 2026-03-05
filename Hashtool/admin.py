from django.contrib import admin
from django.core.management import call_command
from .models import FileRegistry


@admin.action(description="Archive old files")
def archive_old_files(modeladmin, request, queryset):
    call_command("archive_files", days=30)
    
@admin.register(FileRegistry)
class FileRegistryAdmin(admin.ModelAdmin):
    list_display = ('original_name', 'sha256_hash', 'file_size', 'uploaded_at')
    search_fields = ('sha256_hash', 'original_name')