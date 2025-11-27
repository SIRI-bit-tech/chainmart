from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import SellerProfile, SellerReview
from .serializers import SellerProfileSerializer, SellerReviewSerializer

class SellerProfileViewSet(viewsets.ModelViewSet):
    queryset = SellerProfile.objects.all()
    serializer_class = SellerProfileSerializer
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_store(self, request):
        profile = SellerProfile.objects.get(user=request.user)
        serializer = SellerProfileSerializer(profile)
        return Response(serializer.data)
