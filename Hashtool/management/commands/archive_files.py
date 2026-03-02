import os
import json
import zipfile
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.conf import settings
from Hashtool.models import FileRegistry

class Command(BaseCommand):
    help = 'Archives old files, generates a hash manifest, and frees up server space.'

    def add_arguments(self, parser):
        parser.add_argument('--days', type=int, default=365, help='Archive files older than this many days.')

    def handle(self, *args, **options):
        days_old = options['days']
        cutoff_date = timezone.now() - timedelta(days=days_old)

        # Find files older than the cutoff that haven't been archived yet
        target_files = FileRegistry.objects.filter(uploaded_at__lt=cutoff_date, is_archived=False)

        if not target_files.exists():
            self.stdout.write(self.style.WARNING(f"No files older than {days_old} days found to archive."))
            return

        # Setup archive naming and paths
        archive_name = f"archive_{timezone.now().strftime('%Y%m%d_%H%M%S')}.zip"
        archive_path = os.path.join(settings.MEDIA_ROOT, archive_name)
        manifest = []

        self.stdout.write(f"Found {target_files.count()} files. Building archive: {archive_name}...")

        # 1. Create the ZIP file
        with zipfile.ZipFile(archive_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for record in target_files:
                file_path = record.file.path
                
                # Double check the physical file still exists on the hard drive
                if os.path.exists(file_path):
                    # Add to the zip file
                    zipf.write(file_path, arcname=record.original_name)
                    
                    # Add to our JSON manifest for your data science verification later
                    manifest.append({
                        "original_name": record.original_name,
                        "sha256_hash": record.sha256_hash,
                        "archived_at": timezone.now().isoformat()
                    })

            # 2. Save the manifest directly into the zip file
            zipf.writestr("manifest.json", json.dumps(manifest, indent=4))

        # 3. Cleanup: Delete the physical files and update the database
        for record in target_files:
            file_path = record.file.path
            if os.path.exists(file_path):
                os.remove(file_path) # Deletes it from GoDaddy's hard drive
            
            record.is_archived = True
            record.save() # Keeps the hash in the DB, but flags it as archived

        self.stdout.write(self.style.SUCCESS(f"✅ Success! {target_files.count()} files archived and removed from disk."))
        self.stdout.write(self.style.SUCCESS(f"📦 Archive saved to: {archive_path}"))