import logging
logger = logging.getLogger(__name__)

from django.db import models
from django.contrib.auth.models import User
import random
import string
from django.forms.models import model_to_dict
import uuid

# Utility functions
def generate_random_code():
    choices = string.ascii_uppercase + string.digits
    choices = choices.replace("I", "")
    choices = choices.replace("1", "")
    choices = choices.replace("0", "")
    choices = choices.replace("O", "")
    return ''.join(random.choices(choices, k=6))
    # return str(uuid.uuid4()).replace('-', '')

# Create your models here.
class Script(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    text = models.TextField(blank=True, null=True)
    code = models.CharField(max_length=8, default=generate_random_code, unique=True)
    connected_users = models.ManyToManyField(User, blank=True, related_name="connected_users")
    def __str__(self):
        return self.name
    
    def get_new_random_code(self):
        return generate_random_code()
    
    def get_dict(self):
        q_dict = model_to_dict(self)
        return q_dict
    
    def get_state(self, user):
        state = self.get_dict()
        users = []
        for user in self.connected_users.all():
            users.append({
                "id": user.id, 
                "username": user.username
            })
        state["connected_users"] = users
        return state