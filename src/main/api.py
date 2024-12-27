import logging
logger = logging.getLogger(__name__)

from datetime import datetime
from django.utils.timezone import localtime
from typing import List, Optional
from ninja import NinjaAPI, Schema, ModelSchema, File, Form, Field
from ninja.security import django_auth
from django.contrib.admin.views.decorators import staff_member_required
from django.core.exceptions import ValidationError, PermissionDenied
from main.models import *

from django.forms.models import model_to_dict
import json
from django.http import JsonResponse

# for channel communication
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
#end channel stuff 

from main.functions import send_script_state


api = NinjaAPI(auth=django_auth, docs_decorator=staff_member_required, csrf=True)



# ************ VARIOUS SCHEMA USED IN RESPONSES BELOW
# ************ VARIOUS SCHEMA USED IN RESPONSES BELOW
class ResponseMsg(Schema):
    status: str='success'
    msg: str=None
    data: list=None
    
class Test(Schema):
    foo: str
    
class UserSchema(Schema):
    id: int
    username: str
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    
# class ScriptSchema(ModelSchema):
#     class Meta:
#         model = Script
#         fields = ['id', 'name']
#         fields_optional = "__all__"

# ********** END SCHEMA DEFINITIONS
# ********** END SCHEMA DEFINITIONS





#******
# API-style endpoints
#******



@api.get("/hello")
def hello(request):
    return "Hello world"


# @api.get("/test")
# def test(request):
#     try:
#         s = Script.objects.all().first()
#         s_dict = s.get_dict()
#         logger.info(f"Test data: {s_dict}")
        
#         return s_dict

#     except ValidationError as e:
#         return 200, {"status":"error", "msg":e.message_dict}


@api.get("/script/new")
def script_new(request, name):
    try:
        s = Script(name=name, owner=request.user)
        s.save()
        return 200

    except ValidationError as e:
        return 200, {"status":"error", "msg":e.message_dict}


@api.get("/script/{id}/rename")
def script_rename(request, id, name):
    try:
        s = Script.objects.get(id=id, owner=request.user)
        s.name = name
        s.save()
        return 200

    except ValidationError as e:
        return 200, {"status":"error", "msg":e.message_dict}

