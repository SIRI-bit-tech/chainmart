from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, verify_wallet_public

router = DefaultRouter()
router.register(r'', UserViewSet, basename='user')

urlpatterns = [
    path('verify-wallet/', verify_wallet_public, name='verify-wallet'),
    path('', include(router.urls)),
]
