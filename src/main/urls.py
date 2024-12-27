from django.urls import include, path

from . import views
from django.views.generic import TemplateView, RedirectView
from .api import api

urlpatterns = [
    path("", views.index, name="index"),
    path("accounts/", include("django.contrib.auth.urls")),
    path("api/", api.urls),
    path('site.webmanifest', views.webmanifest),
    path('sw.js', TemplateView.as_view(template_name='main/sw.js', content_type='application/x-javascript')),
    path('favicon.ico', RedirectView.as_view(url='/static/img/favicon/favicon.ico', permanent=True), name='favicon'),
    path("about", views.about, name="about"),
    path("terms", views.terms, name="terms"),
    path("privacy", views.privacy, name="privacy"),
    path("home", views.home, name="home"),
    path("s/<str:id>", views.edit, name="edit"),
    path("s/<str:id>/j/<str:joincode>", views.join, name="join"),
    path("s/<str:id>/p/<str:publiccode>", views.public, name="public"),
]