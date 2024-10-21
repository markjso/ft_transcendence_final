from django.urls import path
from .views import Outh42RegisterationView

urlpatterns = [
    path('account/42/', Outh42RegisterationView.as_view(), name = "42 social account"),
]