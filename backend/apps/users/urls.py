from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, verify_wallet_public, request_nonce

router = DefaultRouter()
router.register(r'', UserViewSet, basename='user')

urlpatterns = [
    path('request-nonce/', request_nonce, name='request-nonce'),
    path('verify-wallet/', verify_wallet_public, name='verify-wallet'),
    path('', include(router.urls)),
]
