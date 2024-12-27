import json
from channels.generic.websocket import AsyncWebsocketConsumer
from main.functions import get_script_state , add_user_to_script, remove_user_from_script, save_script_text
from asgiref.sync import sync_to_async, async_to_sync
from channels.layers import get_channel_layer

import logging
logger = logging.getLogger(__name__)

class ScriptConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"script_{self.room_name}"

        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        # group_channels = await self.channel_layer.get_group_channels("group_name")
        # logging.info(f"group_channels:", group_channels)
        await sync_to_async(add_user_to_script)(self.room_name, self.user)
        # send the current state of this group --NOTE: maybe not needed because the state is embedded in the template anyway, so they get it on first load?
        state = await sync_to_async(get_script_state)(self.room_name, self.user)
        await self.send(text_data=json.dumps({"state": state},  default=str))

    async def disconnect(self, close_code):
        # Leave room group
        await sync_to_async(remove_user_from_script)(self.room_name, self.user)
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)


    # Echo message to room group
    async def script_state(self, event):
        state = event["state"]
        # Send message to WebSocket
        await self.send(text_data=json.dumps({"state": state},  default=str))


    # Echo message to room group
    async def script_connected_users(self, event):
        count = event["connected_users"]
        # Send message to WebSocket
        await self.send(text_data=json.dumps({"connected_users": count},  default=str))


    # generic "receive" any messages
    async def receive(self, text_data):
        data = json.loads(text_data)
        
        # if it's a text-change with a delta
        if data["type"]=="text_change" and data["delta"]:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "text_change",
                    "sender_channel_name": self.channel_name,
                    "delta": data["delta"]
                }
            )
            
        # if it's a text-change with a delta
        if data["type"]=="selection_change" and data["range"]:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "selection_change",
                    "sender_channel_name": self.channel_name,
                    "userid": data["userid"],
                    "range": data["range"]
                }
            )
            
        
        # if it's a SAVE command with text contents
        if data["type"]=="save_cmd" and data["text"]:
            state = await sync_to_async(save_script_text)(self.room_name, self.user, data["text"]) #save it
            # await self.send(text_data=json.dumps({"state": state},  default=str))   #echo the state back
            await self.channel_layer.group_send(self.room_group_name,{
                "type": "script_state",
                "state": state
            })


    async def text_change(self, event):
        sender_channel_name = event["sender_channel_name"]
        # Only send the message if the current channel is not the sender's channel
        if self.channel_name != sender_channel_name:
            await self.send(text_data=json.dumps(event))
            
            
            
    async def selection_change(self, event):
        sender_channel_name = event["sender_channel_name"]
        # Only send the message if the current channel is not the sender's channel
        if self.channel_name != sender_channel_name:
            await self.send(text_data=json.dumps(event))