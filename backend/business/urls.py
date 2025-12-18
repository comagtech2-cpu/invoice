from django.urls import path
from .views import BusinessListCreateView, BusinessDetailView

urlpatterns = [
    path('businesses/', BusinessListCreateView.as_view(), name='business-list-create'),
    path('businesses/<int:pk>/', BusinessDetailView.as_view(), name='business-detail'),
]