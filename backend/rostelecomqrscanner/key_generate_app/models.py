from django.db import models


class Status(models.Model):
    status = models.CharField(max_length=100, unique=True)

    class Meta:
        verbose_name = "Status"
        verbose_name_plural = "Statuses"

    def __str__(self):
        return self.status


class Role(models.Model):
    role = models.CharField(max_length=100, unique=True)

    class Meta:
        verbose_name = "Role"
        verbose_name_plural = "Roles"

    def __str__(self):
        return self.role


class User(models.Model):
    name = models.CharField(max_length=100)
    surname = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True, null=True)

    role = models.ForeignKey(
        Role,
        on_delete=models.PROTECT,
        related_name="users"
    )

    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    registered_at = models.DateTimeField(auto_now_add=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        full_name = f"{self.surname} {self.name}"
        if self.middle_name:
            full_name += f" {self.middle_name}"
        return full_name

class Key(models.Model):
    key_code = models.CharField(max_length=255, unique=True)
    status = models.ForeignKey(
        Status,
        on_delete=models.PROTECT,
        related_name="keys"
    )
    user = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="keys"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Key"
        verbose_name_plural = "Keys"

    def __str__(self):
        return self.key_code