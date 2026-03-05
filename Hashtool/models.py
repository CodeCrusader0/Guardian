from django.db import models

class FileRegistry(models.Model):
    file = models.FileField(upload_to='uploads/%Y/%m/')
    sha256_hash = models.CharField(max_length=64, unique=True, db_index=True)
    original_name = models.CharField(max_length=255)
    file_size = models.BigIntegerField(help_text="Size in bytes")
    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_archived = models.BooleanField(default=False)
    
    class Meta:
        permissions = [
            ("can_archive", "Can trigger the archival process"),
        ]

    def __str__(self):
        return f"{self.original_name} ({self.sha256_hash[:8]}...)"