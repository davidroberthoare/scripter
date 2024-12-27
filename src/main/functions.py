import logging
logger = logging.getLogger(__name__)
import json
# from django.db.models import Func, Value
from django.forms.models import model_to_dict

# GET the current script state
def get_script_state(id, user):
    from main.models import Script
    s = Script.objects.get(id=id)
        
    # build, and modify if needed, the script_state
    script_state = s.get_state(user)
    # logger.info(f"script_state: {script_state}")
    
    return script_state


# SEND the current script state to all members of the script's group channels
def send_script_state(id, user):
    from channels.layers import get_channel_layer
    from asgiref.sync import async_to_sync
    
    script_state = get_script_state(id, user)
    # logger.info(f"script_state: {script_state}")
    
    group_name = f"script_{id}"
    channel_layer = get_channel_layer() #function imported at top
    
    async_to_sync(channel_layer.group_send)(group_name, {"type": "script.state", "state": script_state})
    
    return script_state



# add a user from the script-connected-users tracker
def add_user_to_script(id, user):
    # logger.info(f"adding connected_users: {user.id}")
    from main.models import Script
    s = Script.objects.get(id=id)
    s.connected_users.add(user) 
        
    return
#  subtract a user from the script-connected-users tracker
def remove_user_from_script(id, user):
    # logger.info(f"removing connected_users: {user.id}")
    from main.models import Script
    s = Script.objects.get(id=id)
    s.connected_users.remove(user) 
        
    return


# GET the current script state
def save_script_text(id, user, text):
    from main.models import Script
    s = Script.objects.get(id=id)
    
    # only let the owner actually save anything
    if s.owner_id==user.id:
        s.text = text
        s.save()
    
    # build, and modify if needed, the script_state
    script_state = s.get_state(user)
    return script_state

