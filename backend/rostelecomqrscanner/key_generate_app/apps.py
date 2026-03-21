from django.apps import AppConfig


class KeyGenerateAppConfig(AppConfig):
    name = 'key_generate_app'
    default_auto_field = 'django.db.models.BigAutoField'
    verbose_name = "Генератор QR-кодов"
