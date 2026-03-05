import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import FileRegistry
from django.core.management import call_command
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User, Group

def get_user_role(user):
    if user.is_superuser:
        return 'admin'
    elif user.groups.filter(name='Manager').exists():
        return 'manager'
    return 'user'

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        user = authenticate(request, username=data['username'], password=data['password'])
        if user is not None:
            login(request, user)
            return JsonResponse({'message': 'Login successful', 'role': get_user_role(user)})
        return JsonResponse({'error': 'Invalid credentials'}, status=401)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def logout_view(request):
    logout(request)
    return JsonResponse({'message': 'Logged out successfully'})

@csrf_exempt
def check_hash(request):
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
    if request.method == 'POST':
        # Must be logged in
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Unauthorized'}, status=403)

        uploaded_file = request.FILES.get('file')
        file_hash = request.POST.get('hash')

        if not uploaded_file or not file_hash:
            return JsonResponse({'error': 'Missing file or hash'}, status=400)

        if FileRegistry.objects.filter(sha256_hash=file_hash).exists():
            return JsonResponse({'error': 'File already exists on server'}, status=409)

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
    if request.method == 'GET':
        files = FileRegistry.objects.all().order_by('-uploaded_at')
        file_list = []
        for f in files:
            file_url = None
            if not f.is_archived and f.file:
                try:
                    file_url = f.file.url
                except ValueError:
                    file_url = None
                    
            file_list.append({
                'id': f.id,
                'original_name': f.original_name,
                'sha256_hash': f.sha256_hash,
                'file_size': f.file_size, 
                'uploaded_at': f.uploaded_at.strftime('%Y-%m-%d %H:%M'),
                'is_archived': f.is_archived,
                'file_url': file_url
            })
        return JsonResponse({'files': file_list})
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def trigger_archive(request):
    if request.method == 'POST':
        if not request.user.is_authenticated or get_user_role(request.user) == 'user':
            return JsonResponse({'error': 'Insufficient permissions'}, status=403)
            
        try:
            call_command('archive_files', days=0)          
            return JsonResponse({'success': True, 'message': 'Archival process completed successfully.'})
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)}, status=500)          
    return JsonResponse({'error': 'Only POST requests allowed'}, status=405)

@csrf_exempt
def manage_users(request):
    if not request.user.is_authenticated or get_user_role(request.user) == 'user':
        return JsonResponse({'error': 'Forbidden'}, status=403)

    if request.method == 'GET':
        users = User.objects.all().values('id', 'username', 'is_superuser', 'date_joined')
        user_data = []
        for u in users:
            user_obj = User.objects.get(id=u['id'])
            role = get_user_role(user_obj)
            user_data.append({
                'id': u['id'],
                'username': u['username'],
                'role': role,
                'date_joined': u['date_joined'].strftime('%Y-%m-%d')
            })
        return JsonResponse({'users': user_data})

    elif request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        role = data.get('role', 'user')

        if User.objects.filter(username=username).exists():
            return JsonResponse({'error': 'User already exists'}, status=400)

        user = User.objects.create(username=username)
        user.set_password(password)
        
        if role == 'admin':
            user.is_superuser = True
            user.is_staff = True
        elif role == 'manager':
            manager_group, _ = Group.objects.get_or_create(name='Manager')
            user.groups.add(manager_group)
            
        user.save()
        return JsonResponse({'message': 'User created successfully'})

@csrf_exempt
def delete_user(request, user_id):
    if request.method == 'DELETE':
        if not request.user.is_authenticated or get_user_role(request.user) == 'user':
            return JsonResponse({'error': 'Forbidden'}, status=403)
        
        if request.user.id == user_id:
            return JsonResponse({'error': 'Cannot delete yourself'}, status=400)

        try:
            user = User.objects.get(id=user_id)
            user.delete()
            return JsonResponse({'message': 'User deleted successfully'})
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        
@csrf_exempt
def check_auth_status(request):
    """Checks if the user already has a valid session cookie."""
    if request.user.is_authenticated:
        return JsonResponse({
            'isAuthenticated': True, 
            'role': get_user_role(request.user)
        })
    return JsonResponse({'isAuthenticated': False}, status=401)