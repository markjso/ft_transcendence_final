from django.urls import path

from . import views

urlpatterns = [
    path("add/", views.post, name="add"),
    path("get/", views.get, name="get"),
]
