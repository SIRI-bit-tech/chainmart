from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from .models import Product, ProductImage
from .serializers import ProductListSerializer, ProductDetailSerializer, ProductCreateUpdateSerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related('seller__kyc_record').filter(is_active=True)
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'seller']
    search_fields = ['title', 'description']
    ordering_fields = ['price', 'rating', 'sale_count', '-created']
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ProductCreateUpdateSerializer
        elif self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductListSerializer
    
    def perform_create(self, serializer):
        import hashlib
        import json
        product_data = {
            'title': serializer.validated_data['title'],
            'description': serializer.validated_data['description'],
            'price': str(serializer.validated_data['price']),
        }
        product_hash = hashlib.sha256(json.dumps(product_data).encode()).hexdigest()
        listing_id = f"LST_{hashlib.md5(str(product_data).encode()).hexdigest()[:8].upper()}"
        
        serializer.save(
            seller=self.request.user,
            product_hash=product_hash,
            listing_id=listing_id
        )
    
    def get_queryset(self):
        if self.action == 'my_products':
            return Product.objects.select_related('seller__kyc_record').filter(seller=self.request.user)
        return super().get_queryset()
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_products(self, request):
        queryset = self.get_queryset()
        serializer = ProductListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def deactivate(self, request, pk=None):
        product = self.get_object()
        if product.seller != request.user:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        product.is_active = False
        product.save()
        return Response({'status': 'product deactivated'})
