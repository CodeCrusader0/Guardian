from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission

class User(AbstractUser):
    groups = models.ManyToManyField(
        Group,
        verbose_name=('groups'),
        blank=True,
        help_text=('The groups this user belongs to.'),
        related_name="custom_user_set",
        related_query_name="user",
    )
    user_permissions = models.ManyToManyField(
        Permission,
        verbose_name=('user permissions'),
        blank=True,
        help_text=('Specific permissions for this user.'),
        related_name="custom_user_set",
        related_query_name="user",
    )
    
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