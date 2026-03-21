from django.urls import path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from . import views

urlpatterns = [
    path('api/login/', views.LoginView.as_view(), name='login'),
    path('api/logout/', views.LogoutView.as_view(), name='logout'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),

    path('api/profile/', views.ProfileView.as_view(), name='profile'),
    path('api/change-password/', views.ChangePasswordView.as_view(), name='change_password'),

    path('api/users/', views.UserListView.as_view(), name='user_list'),
    path('api/users/create/', views.user_create, name='user_create'),
    path('api/users/<int:user_id>/', views.UserDetailView.as_view(), name='user_detail'),
    path('api/users/<int:user_id>/update/', views.user_update, name='user_update'),
    path('api/users/<int:user_id>/delete/', views.user_delete, name='user_delete'),
    path('api/users/active/', views.active_user_list, name='active_user_list'),
    path('api/users/<int:user_id>/restore/', views.user_restore, name='user_restore'),

    path('api/keys/', views.key_list, name='key_list'),
    path('api/keys/<int:key_id>/', views.key_detail, name='key_detail'),
    path('api/keys/create/', views.KeyCreateView.as_view(), name='key_create'),
    path('api/keys/<int:key_id>/delete/', views.KeyDeleteView.as_view(), name='key_delete'),

    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/swagger/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]