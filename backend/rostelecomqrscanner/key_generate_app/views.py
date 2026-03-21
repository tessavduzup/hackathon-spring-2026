import hashlib
import json
from datetime import datetime
import qrcode
from django.contrib.auth.hashers import make_password
from django.forms.models import model_to_dict
from django.http import HttpRequest, JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from io import BytesIO
from .models import User, Key
from .serializers import (
    UserSerializer, LoginSerializer,
    ChangePasswordSerializer
)
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response

class LoginView(TokenObtainPairView):
    """
    Вход пользователя
    POST /api/login/

    Возвращает:
    - access: токен для API запросов
    - refresh: токен для обновления access токена
    - user: данные пользователя
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        try:
            serializer = LoginSerializer(data=request.data, context={'request': request})
            serializer.is_valid(raise_exception=True)
            user = serializer.validated_data['user']

            refresh = RefreshToken.for_user(user)

            return Response({
                'success': True,
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            })

class LogoutView(APIView):
    """
    Выход пользователя
    POST /api/logout/
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, key_id: int):
        try:
            key = get_object_or_404(Key, pk=key_id, user=request.user)

            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()

            key.delete()

            return Response({
                'success': True,
                'message': 'Успешный выход'
            }, status=status.HTTP_200_OK)

        except Key.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Ключ не найден или не принадлежит пользователю'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(APIView):
    """
    Получение и обновление профиля текущего пользователя
    GET /api/profile/ - получить данные
    PATCH /api/profile/ - обновить данные
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            user = request.user
            return Response({
                'success': True,
                'id': user.pk,
                'name': user.name,
                'surname': user.surname,
                'middle_name': user.middle_name,
                'email': user.email,
                'role': {
                    'id': user.role.id,
                    'name': user.role.role
                },
                'is_active': user.is_active,
                'is_staff': user.is_staff,
                'registered_at': user.registered_at
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            })

    def patch(self, request):
        try:
            user = request.user
            data = request.data

            allowed_fields = ['name', 'surname', 'middle_name', 'email']
            for field in allowed_fields:
                if field in data:
                    setattr(user, field, data[field])

            user.save()

            return Response({
                'message': 'Profile updated successfully',
                'user': {
                    'id': user.pk,
                    'name': user.name,
                    'surname': user.surname,
                    'middle_name': user.middle_name,
                    'email': user.email
                }
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            })

class ChangePasswordView(generics.UpdateAPIView):
    """
    Смена пароля
    POST /api/change-password/
    """
    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def update(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()

            return Response({'success':True, 'message': 'Пароль успешно изменен'}, status=status.HTTP_200_OK)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            })

class UserListView(generics.ListAPIView):
    """
    Список пользователей (только для админов)
    GET /api/users/
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        try:
            users = User.objects.select_related('role').all()
            users_data = []
            for user in users:
                users_data.append({
                    'id': user.pk,
                    'name': user.name,
                    'surname': user.surname,
                    'middle_name': user.middle_name,
                    'email': user.email,
                    'role': {
                        'id': user.role.id,
                        'name': user.role.role  # предполагаю, что в Role есть поле role
                    },
                    'is_active': user.is_active,
                    'is_staff': user.is_staff,
                    'registered_at': user.registered_at,
                    'deleted_at': user.deleted_at
                })

            return Response({
                'success': True,
                'users_count': len(users_data),
                'users': users_data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@require_http_methods(["GET"])
def user_list(request: HttpRequest):
    try:
        users = User.objects.select_related('role').all()
        users_data = []
        for user in users:
            users_data.append(
                {
                    'id': user.pk,
                    'name': user.name,
                    'surname': user.surname,
                    'middle_name': user.middle_name,
                    'email': user.email,
                    'role': {
                        'id': user.role.id,
                        'name': user.role.role
                    },
                    'registered_at': user.registered_at,
                    'deleted_at': user.deleted_at
                }
            )

        return JsonResponse(
            {
                'success': True,
                'users_count': len(users_data),
                'users': users_data
            }
        )
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

@require_http_methods(["GET"])
def active_user_list(request: HttpRequest):
    try:
        users = User.objects.select_related('role').all()

        users_data = []
        for user in users:
            if not user.deleted_at:
                users_data.append(
                    {
                        'id': user.pk,
                        'name': user.name,
                        'surname': user.surname,
                        'middle_name': user.middle_name,
                        'email': user.email,
                        'role': {
                            'id': user.role.id,
                            'name': user.role.role
                        },
                        'registered_at': user.registered_at,
                        'deleted_at': user.deleted_at
                    }
                )

        return JsonResponse(
            {
                'success': True,
                'users_count': len(users_data),
                'users': users_data
            }
        )
    except Exception as e:
        return JsonResponse({'success': False,'error': str(e)}, status=500)

@require_http_methods(["GET"])
def user_detail(request: HttpRequest, user_id: int):
    try:
        user = get_object_or_404(User, id=user_id)
        return JsonResponse({
            'success': True,
            'user': {
                'id': user.pk,
                'name': user.name,
                'surname': user.surname,
                'middle_name': user.middle_name,
                'email': user.email,
                'role': {
                    'id': user.role.id,
                    'name': user.role.role
                },
                'registered_at': user.registered_at,
                'deleted_at': user.deleted_at
            }
        }, status=200)
    except User.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'User not found'}, status=400)
    except Exception as ex:
        return JsonResponse({'success': False, 'error': str(ex)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def user_create(request: HttpRequest):
    try:
        data = json.loads(request.body)

        required_fields = ['name', 'surname', 'email', 'password', 'role_id']
        for field in required_fields:
            if field not in data:
                return JsonResponse({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }, status=400)

        if User.objects.filter(email=data['email']).exists():
            return JsonResponse({
                'success': False,
                'error': 'User with this email already exists'
            }, status=400)

        user = User.objects.create(
            name=data['name'],
            surname=data['surname'],
            middle_name=data.get('middle_name') or None,
            email=data['email'],
            password=make_password(data['password']),
            role_id=data['role_id'],
            registered_at=datetime.now()
        )

        return JsonResponse({
            'success': True,
            'message': 'User created successfully',
            'user': {
                'id': user.pk,
                'name': user.name,
                'surname': user.surname,
                'email': user.email,
                'role_id': user.role.pk,
                'registered_at': user.registered_at
            }
        }, status=201)

    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["PUT", "PATCH"])
def user_update(request: HttpRequest, user_id: int):
    try:
        user = get_object_or_404(User, pk=user_id)
        data = json.loads(request.body)

        allowed_fields = ['name', 'surname', 'middle_name', 'email', 'role_id', 'key_id']

        for field in allowed_fields:
            if field in data:
                setattr(user, field, data[field])

        user.save()

        return JsonResponse({
            'success': True,
            'message': 'User updated successfully',
            'user': {
                'id': user.pk,
                'name': user.name,
                'surname': user.surname,
                'email': user.email,
            }
        }, status=200)

    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON'}, status=400)
    except User.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'User Not Found'}, status=404)
    except Exception as ex:
        return JsonResponse({'success': False, 'error': str(ex)}, status=500)

@require_http_methods(["DELETE"])
def user_delete(request: HttpRequest, user_id: int):
    try:
        user = get_object_or_404(User, pk=user_id)

        user_data = {
            'id': user.pk,
            'email': user.email,
            'name': f"{user.name} {user.surname}"
        }

        user.delete()

        return JsonResponse( {
            'success': False,
            'message': 'User deleted successfully',
            'user_data': user_data
        })

    except User.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'User Not Found'}, status=404)
    except Exception as ex:
        return JsonResponse({'success': False, 'error': str(ex)}, status=500)

@require_http_methods(["GET"])
def key_list(request: HttpRequest):
    try:
        keys = Key.objects.select_related('role').all()
        key_data = []
        for key in keys:
            key_data.append(
                {
                    'id': key.pk,
                    'key_code': key.key_code,
                    'status': key.status,
                    'user': key.user,
                    'created_at': key.created_at,
                    'deleted_at': key.deleted_at
                }
            )

        return JsonResponse(
            {
                'success': True,
                'keys_count': len(key_data),
                'keys': keys
            }
        )
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

@require_http_methods(["GET"])
def key_detail(request: HttpRequest, key_id: int):
    try:
        key = get_object_or_404(Key, id=key_id)
        return JsonResponse({
            'success': True,
            'key': {
                'id': key.pk,
                'key_code': key.key_code,
                'status': key.status,
                'user': key.user,
                'created_at': key.created_at,
                'deleted_at': key.deleted_at
            }
        }, status=200)
    except Key.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Key not found'}, status=400)
    except Exception as ex:
        return JsonResponse({'success': False, 'error': str(ex.print_with_stacktrace())}, status=500)

class KeyCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            user = request.user
            user_data = model_to_dict(user)
            json_data = json.dumps(user_data, ensure_ascii=False, default=str)
            qr_img = qrcode.make(json_data)

            buffer = BytesIO()
            qr_img.save(buffer, format='PNG')
            # encoded_qr = base64.b64encode(buffer.getvalue()).decode()

            key_hash = hashlib.sha256(json_data.encode()).hexdigest()

            key = Key.objects.create(
                key_code=key_hash,
                created_at=datetime.now(),
                user_id=user_data['id'],
                status_id=1
            )

            return JsonResponse({
                'success': True,
                'key': model_to_dict(key),
                'user_data': user_data
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@require_http_methods(["DELETE"])
def key_delete(request: HttpRequest, key_id: int):
    try:
        key = get_object_or_404(Key, pk=key_id)

        key_data = {
            'id': key.pk,
            'key_code': key.key_code,
            'user': f"{key.user.name} {key.user.surname}"
        }

        key.delete()

        return JsonResponse({
            'success': True,
            'message': 'Key deleted successfully',
            'key_data': key_data
        })

    except Key.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Key Not Found'}, status=404)
    except Exception as ex:
        return JsonResponse({'success': False, 'error': str(ex)}, status=500)