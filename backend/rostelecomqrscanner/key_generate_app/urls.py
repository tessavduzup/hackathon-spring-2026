from django.urls import path
from . import views

urlpatterns = [
    path('users/', views.user_list, name='user_list'),
    path('active_users/', views.active_user_list, name='active_user_list'),
    path('users/<int:user_id>/', views.user_detail, name='user_detail'),
    path('users/create/', views.user_create, name='user_create'),
    path('users/<int:user_id>/update/', views.user_update, name='user_update'),
    path('users/<int:user_id>/delete/', views.user_delete, name='user_delete'),

    path('keys/', views.key_list, name='key_list'),
    path('keys/<int:key_id>/', views.key_detail, name='key_detail'),
    path('keys/create/', views.key_create, name='key_create'),
    path('keys/<int:key_id>/delete/', views.key_delete, name='key_delete'),
]