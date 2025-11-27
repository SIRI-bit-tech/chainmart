from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BlockchainTransactionViewSet

router = DefaultRouter()
router.register(r'', BlockchainTransactionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
