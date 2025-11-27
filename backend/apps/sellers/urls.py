from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SellerProfileViewSet

router = DefaultRouter()
router.register(r'', SellerProfileViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
