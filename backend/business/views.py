from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Business
from .serializers import BusinessSerializer


class BusinessListCreateView(APIView):
    def get(self, request):
        businesses = Business.objects.filter(created_by=request.user)
        serializer = BusinessSerializer(businesses, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = BusinessSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BusinessDetailView(APIView):
    def get(self, request, pk):
        try:
            business = Business.objects.get(pk=pk, created_by=request.user)
            serializer = BusinessSerializer(business)
            return Response(serializer.data)
        except Business.DoesNotExist:
            return Response({'error': 'Business not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def put(self, request, pk):
        try:
            business = Business.objects.get(pk=pk, created_by=request.user)
            serializer = BusinessSerializer(business, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Business.DoesNotExist:
            return Response({'error': 'Business not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def delete(self, request, pk):
        try:
            business = Business.objects.get(pk=pk, created_by=request.user)
            business.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Business.DoesNotExist:
            return Response({'error': 'Business not found'}, status=status.HTTP_404_NOT_FOUND)
