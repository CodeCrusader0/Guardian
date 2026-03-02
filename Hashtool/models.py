from django.db import models

class FileRegistry(models.Model):
    # 'upload_to' automatically organizes files into year/month folders in your media directory
    file = models.FileField(upload_to='uploads/%Y/%m/')
    
    # The digital fingerprint. Unique=True prevents duplicates at the database level.
    sha256_hash = models.CharField(max_length=64, unique=True, db_index=True)
    
    # Metadata for tracking
    original_name = models.CharField(max_length=255)
    file_size = models.BigIntegerField(help_text="Size in bytes")
    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_archived = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.original_name} ({self.sha256_hash[:8]}...)"