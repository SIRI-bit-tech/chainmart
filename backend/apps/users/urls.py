from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet,
    login_user,
    register_user,
    request_nonce,
    social_login,
    verify_wallet_public,
)

router = DefaultRouter()
router.register(r'', UserViewSet, basename='user')

urlpatterns = [
    path('register/', register_user, name='register'),
    path('login/', login_user, name='login'),
    path('social-login/', social_login, name='social-login'),  # Secure OAuth with token verification
    path('request-nonce/', request_nonce, name='request-nonce'),
    path('verify-wallet/', verify_wallet_public, name='verify-wallet'),
    path('', include(router.urls)),
]
