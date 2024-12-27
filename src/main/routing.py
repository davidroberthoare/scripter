# main/routing.py
from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    re_path(r"ws/script/(?P<room_name>[\w-]+)/$", consumers.ScriptConsumer.as_asgi()),
]