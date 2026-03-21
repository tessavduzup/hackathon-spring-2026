from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, Role


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    role_name = serializers.CharField(source='role.role', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'surname', 'middle_name', 'full_name',
                  'role', 'role_name', 'is_active', 'is_staff', 'registered_at']
        read_only_fields = ['id', 'registered_at']

    def get_full_name(self, obj):
        return f"{obj.surname} {obj.name} {obj.middle_name or ''}".strip()


class UserCreateSerializer(serializers.ModelSerializer):
    """
    Сериализатор для создания пользователя (только для админов)
    """
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )

    class Meta:
        model = User
        fields = ['email', 'name', 'surname', 'middle_name', 'password', 'role', 'is_staff']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create(**validated_data)
        user.set_password(password)  # Хешируем пароль
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        # Проверяем, не удален ли пользователь
        try:
            user = User.objects.get(email=email)
            if user.deleted_at:
                raise serializers.ValidationError("Учетная запись удалена")
        except User.DoesNotExist:
            pass

        user = authenticate(request=self.context.get('request'),
                            username=email, password=password)

        if not user:
            raise serializers.ValidationError("Неверный email или пароль")

        if not user.is_active:
            raise serializers.ValidationError("Учетная запись не активна")

        attrs['user'] = user
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    confirm_password = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError(
                {"confirm_password": "Пароли не совпадают"}
            )
        return attrs

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Неверный старый пароль")
        return value