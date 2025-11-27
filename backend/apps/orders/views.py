from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Order
from .serializers import OrderSerializer

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if self.action == 'buyer_orders':
            return Order.objects.filter(buyer=user)
        elif self.action == 'seller_orders':
            return Order.objects.filter(seller=user)
        return Order.objects.filter(buyer=user) | Order.objects.filter(seller=user)
    
    @action(detail=False, methods=['get'])
    def buyer_orders(self, request):
        queryset = self.get_queryset()
        serializer = OrderSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def seller_orders(self, request):
        queryset = self.get_queryset()
        serializer = OrderSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def complete_order(self, request, pk=None):
        order = self.get_object()
        if order.buyer != request.user:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        order.status = 'COMPLETED'
        order.save()
        return Response(OrderSerializer(order).data)
    
    @action(detail=True, methods=['post'])
    def raise_dispute(self, request, pk=None):
        order = self.get_object()
        if order.buyer != request.user and order.seller != request.user:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        order.status = 'DISPUTED'
        order.dispute_reason = request.data.get('reason', '')
        order.save()
        return Response(OrderSerializer(order).data)
