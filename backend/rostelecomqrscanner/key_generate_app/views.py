import json
from datetime import datetime
import qrcode
from django.contrib.auth.hashers import make_password
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

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
        serializer = LoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        refresh = RefreshToken.for_user(user)

        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })


class LogoutView(APIView):
    """
    Выход пользователя
    POST /api/logout/
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()  # Добавляем токен в черный список
            return Response({'message': 'Успешный выход'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# views.py - исправленный ProfileView
class ProfileView(APIView):
    """
    Получение и обновление профиля текущего пользователя
    GET /api/profile/ - получить данные
    PATCH /api/profile/ - обновить данные
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
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

    def patch(self, request):
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


class ChangePasswordView(generics.UpdateAPIView):
    """
    Смена пароля
    POST /api/change-password/
    """
    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()

        return Response({'message': 'Пароль успешно изменен'}, status=status.HTTP_200_OK)


# views.py - исправленный UserListView
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
                'users_count': len(users_data),
                'users': users_data
            }
        )
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

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
                'users_count': len(users_data),
                'users': users_data
            }
        )
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

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
        return JsonResponse({'error': 'User not found'}, status=400)
    except Exception as ex:
        return JsonResponse({'error': str(ex)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def user_create(request: HttpRequest):
    try:
        data = json.loads(request.body)

        required_fields = ['name', 'surname', 'email', 'password', 'role_id']
        for field in required_fields:
            if field not in data:
                return JsonResponse({
                    'error': f'Missing required field: {field}'
                }, status=400)

        if User.objects.filter(email=data['email']).exists():
            return JsonResponse({
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
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

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
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User Not Found'}, status=404)
    except Exception as ex:
        return JsonResponse({'error': str(ex)}, status=500)

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
            'message': 'User deleted successfully',
            'user_data': user_data
        })

    except User.DoesNotExist:
        return JsonResponse({'error': 'User Not Found'}, status=404)
    except Exception as ex:
        return JsonResponse({'error': str(ex)}, status=500)


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
                'keys_count': len(key_data),
                'keys': keys
            }
        )
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

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
        return JsonResponse({'error': 'Key not found'}, status=400)
    except Exception as ex:
        return JsonResponse({'error': str(ex)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def key_create(request: HttpRequest):
    user_data = {
        "user_id": 123,
        "name": "Иван Петров",
        "email": "ivan@example.com",
        "role": "admin",
        "permissions": ["read", "write", "delete"],
        "issued_at": "2024-01-15T10:30:00"
    }

    json_data = json.dumps(user_data, ensure_ascii=False)
    qr = qrcode.make(json_data)
    qr.save("user_qr.png")

    return JsonResponse({'123':"asdas"}, status=200)

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
            'message': 'Key deleted successfully',
            'key_data': key_data
        })

    except Key.DoesNotExist:
        return JsonResponse({'error': 'Key Not Found'}, status=404)
    except Exception as ex:
        return JsonResponse({'error': str(ex)}, status=500)