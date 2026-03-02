import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import FileRegistry

@csrf_exempt
def check_hash(request):
    """API endpoint to check if a SHA-256 hash already exists."""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            incoming_hash = data.get('hash')

            if not incoming_hash:
                return JsonResponse({'error': 'No hash provided'}, status=400)

            
            duplicate = FileRegistry.objects.filter(sha256_hash=incoming_hash).first()

            if duplicate:
                return JsonResponse({
                    'exists': True,
                    'message': 'Duplicate found!',
                    'file_name': duplicate.original_name,
                })
            return JsonResponse({'exists': False, 'message': 'File is unique.'})

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
            
    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def upload_file(request):
    """API endpoint to handle the actual file upload."""
    if request.method == 'POST':
        uploaded_file = request.FILES.get('file')
        file_hash = request.POST.get('hash')

        if not uploaded_file or not file_hash:
            return JsonResponse({'error': 'Missing file or hash'}, status=400)

        if FileRegistry.objects.filter(sha256_hash=file_hash).exists():
            return JsonResponse({'error': 'File already exists on server'}, status=409)

        # Save the file and create the database record
        new_record = FileRegistry.objects.create(
            file=uploaded_file,
            sha256_hash=file_hash,
            original_name=uploaded_file.name,
            file_size=uploaded_file.size
        )

        return JsonResponse({
            'success': True,
            'message': 'File uploaded and secured successfully.',
            'file_id': new_record.id
        })

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def list_files(request):
    """API endpoint to retrieve all files currently in the registry."""
    if request.method == 'GET':
        # Get all files, newest first
        files = FileRegistry.objects.all().order_by('-uploaded_at')
        
        file_list = []
        for f in files:
            file_list.append({
                'id': f.id,
                'original_name': f.original_name,
                'sha256_hash': f.sha256_hash,
                'file_size': f.file_size, 
                'uploaded_at': f.uploaded_at.strftime('%Y-%m-%d %H:%M'),
                'is_archived': f.is_archived
            })
            
        return JsonResponse({'files': file_list})

    return JsonResponse({'error': 'Method not allowed'}, status=405)