from justwebsocket import justwebsocket
from smd_requests import smd_requests
from smd_transformer import smd_transformer
from constants import PROTOCOL_CONFIG, MESSAGE_TYPES

import json
import msgpack
import asyncio
import random
import time

class SMD(smd_requests):
    def __init__(self):
        super().__init__()

        self.account_connected = False
        self.websocket_error = 0
        self.username = None

        self._userid = None
        self._public_key = None

        self.websocket = justwebsocket(PROTOCOL_CONFIG['WEBSOCKET_URLS'])
        self.websocket.default_timeout = PROTOCOL_CONFIG['DEFAULT_TIMEOUT']
        self.websocket.ping_range = PROTOCOL_CONFIG['DEFAULT_TIMEOUT']

        self.set_request_url(PROTOCOL_CONFIG['REQUEST_URLS'][self.websocket.current_url_index])

        def on_new_message(data):
            if 'type' in data:
                del data['type']
            
            if 'message' in data:
                new_message = self._decode_message(data['message'])
                data['message'] = new_message
            
            self.call('new_message', data)
        
        self.websocket.add(f"T{MESSAGE_TYPES['NEW_MESSAGE']}", on_new_message)


    
    async def connect(self, userid, public_key):
        future = asyncio.Future()

        def on_connected():
            self._send_encoded_data({
                'userid': userid,
                'public_key': public_key
            })

            def on_successful_auth(data):
                self.account_connected = True
                self.username = data['username']

                self.set_userid(userid)
                self.set_public_key(public_key)

                future.set_result(True)

            def on_error(data):
                if 'code' in data:
                    self.websocket_error = data['code']
                
                future.set_result(False)

            self.websocket.add(f"T{MESSAGE_TYPES['SUCCESSFUL_AUTH']}", on_successful_auth)
            self.websocket.add(f"T{MESSAGE_TYPES['ERROR']}", on_error)

        self.websocket.add('connected', on_connected)

        await self.websocket.connect()

        try:
            return await asyncio.wait_for(future, PROTOCOL_CONFIG['CONNECTION_TIMEOUT'] / 1000)
        except asyncio.TimeoutError:
            return False
        except Exception as e:
            print(f"Connection failed: {e}")
            return False
        
    

    async def send_message(self, chatid, message):
        if self.account_connected is False:
            return False
        
        request_id = self._generate_request_id()

        message_data = smd_transformer.shorten({
            "version": PROTOCOL_CONFIG['MESSAGE_VERSION'],
            "parse_mode": "markdown",
            "message": message
        })

        def on_send_message_successful(data):
            if request_id != data["request_id"]:
                return True
            
            # результат True
            return True

        def on_send_message_error(data):
            if request_id != data["request_id"]:
                return True

            # результат False
            return True

        self.websocket.add(f"T{MESSAGE_TYPES['SEND_MESSAGE_SUCCESS']}", on_send_message_successful)
        self.websocket.add(f"T{MESSAGE_TYPES['SEND_MESSAGE_ERROR']}", on_send_message_error)

        self._send_encoded_data({
            "type": MESSAGE_TYPES['SEND_MESSAGE'],
            "request_id": request_id,
            "chatid": chatid,
            "message": json.dumps(message_data)
        })

        return False 
    
        # ЯЯЯЯ ебал твой пайтон со своей ебливой корутиновой системой, она наитупейшая, цель пайтона - упростить работу
        # А он создает тысячи с хуем, почему ООП настолько сырое, JS на его фоне еще ничего, почему в нем нет
        # Такой еботни, что блокирует, а что нет. в JS который фактически изгой из-за тупой логики и фактически
        # Отсутствия типов. Короче я заебался, аналогичный код сверху выводит результаты, а сука ебучее лицо старой
        # псины нет. понабиться, переделаешь, я делаю базу. скажем так форк уместен.



    async def create_private_chat(self, userid):
        if self.account_connected is False:
            return False
        
        request_id = self._generate_request_id()

        self._send_encoded_data({
            "type": MESSAGE_TYPES['CREATE_PRIVATE_CHAT'],
            "request_id": request_id,
            "userid": userid,
        })

        def on_create_successful(data):
            if request_id != data["request_id"]:
                return True
            
            # результат True
            return True

        def on_create_error(data):
            if request_id != data["request_id"]:
                return True

            # результат False
            return True
        
        self.websocket.add(f"T{MESSAGE_TYPES['CREATE_PRIVATE_CHAT']}", on_create_successful)
        self.websocket.add(f"T{MESSAGE_TYPES['CREATE_PRIVATE_CHAT_ERROR']}", on_create_error)

        return True
    


    async def set_profile_avatar(self, file_key):
        if self.account_connected is False:
            return False
        
        request_id = self._generate_request_id()

        self._send_encoded_data({
            "type": MESSAGE_TYPES['SET_AVATAR'],
            "request_id": request_id,
            "key": file_key,
        })

        def on_set_avatar(data):
            if request_id != data["request_id"]:
                return True
            
            if 'code' in data:
                if data['code'] == False:
                    # результат False
                    pass
            
            # результат True
            return True

        self.websocket.add(f"T{MESSAGE_TYPES['SET_AVATAR']}", on_set_avatar)

        return True



    async def get_chat_info(self, chatid):
        if self.account_connected is False:
            return False
        
        request_id = self._generate_request_id()

        self._send_encoded_data({
            "type": MESSAGE_TYPES['CHATINFO'],
            "request_id": request_id,
            "chatid": chatid,
        })

        def on_get_chat_info(data):
            if request_id != data["request_id"]:
                return True
            
            if 'type' in data:
                del data['type']
            
            if 'request_id' in data:
                del data['request_id']
            
            # результат data
            return True
        
        def on_get_chat_info_error(data):
            if request_id != data["request_id"]:
                return True
            
            # результат False
            return True
        
        self.websocket.add(f"T{MESSAGE_TYPES['CHATINFO']}", on_get_chat_info)
        self.websocket.add(f"T{MESSAGE_TYPES['CHATINFO_ERROR']}", on_get_chat_info_error)

        return True



    async def get_chats(self, last_chatid = None, offset = None, limit = None, post_message = True):
        if self.account_connected is False:
            return False
        
        request_id = self._generate_request_id()

        data = {
            "type": MESSAGE_TYPES['CHATS'],
            "request_id": request_id,
        }

        if last_chatid is not None:
            data['last_chatid'] = last_chatid
        
        if offset is not None:
            data['offset'] = offset
        
        if limit is not None:
            data['limit'] = limit
        
        if post_message is not False:
            data['post'] = post_message
        
        self._send_encoded_data(data)

        return await self._selection_worker(
            f"T{MESSAGE_TYPES['CHATS']}",
            f"T{MESSAGE_TYPES['CHATS_ERROR']}",
            request_id
        )



    async def get_chat(self, chatid, last_messageid = None, offset = None, limit = None, post_message = True):
        if self.account_connected is False:
            return False
        
        request_id = self._generate_request_id()

        data = {
            "type": MESSAGE_TYPES['CHATS'],
            "request_id": request_id,
            "chatid": chatid
        }

        if last_messageid is not None:
            data['last_messageid'] = last_messageid
        
        if offset is not None:
            data['offset'] = offset
        
        if limit is not None:
            data['limit'] = limit
        
        if post_message is not False:
            data['post'] = post_message
        
        self._send_encoded_data(data)

        return await self._selection_worker(
            f"T{MESSAGE_TYPES['CHAT']}",
            f"T{MESSAGE_TYPES['CHAT_ERROR']}",
            request_id
        )

    async def search_users(self, username, offset = None, limit = None):
        if self.account_connected is False:
            return False
        
        request_id = self._generate_request_id()

        data = {
            "type": MESSAGE_TYPES['CHATS'],
            "request_id": request_id,
            "username": username
        }

        if offset is not None:
            data['offset'] = offset
        
        if limit is not None:
            data['limit'] = limit
        
        self._send_encoded_data(data)

        return await self._selection_worker(
            f"T{MESSAGE_TYPES['SEARCH_USERS']}",
            f"T{MESSAGE_TYPES['SEARCH_USERS_ERROR']}",
            request_id
        )
    
    async def search_chats(self, chatname, offset = None, limit = None):
        if self.account_connected is False:
            return False
        
        request_id = self._generate_request_id()

        data = {
            "type": MESSAGE_TYPES['CHATS'],
            "request_id": request_id,
            "chatname": chatname
        }

        if offset is not None:
            data['offset'] = offset
        
        if limit is not None:
            data['limit'] = limit
        
        self._send_encoded_data(data)

        return await self._selection_worker(
            f"T{MESSAGE_TYPES['SEARCH_CHATS']}",
            f"T{MESSAGE_TYPES['SEARCH_CHATS_ERROR']}",
            request_id
        )
    
    async def _selection_worker(self, success_name, error_name, request_id):
        request_data = []
        last_get_time = 0

        def on_success(data):
            global last_get_time

            if request_id != data["request_id"]:
                return True
            
            if 'count' not in data or data['count'] < 0:
                pass
                # результат False
                
            count = data['count']

            if 'message' not in data:
                pass
                # результат False
            
            new_message = self._decode_message(data['message'])
            data['message'] = new_message

            if 'type' in data:
                del data['type']

            if 'index' in data:
                del data['index']

            if 'count' in data:
                del data['count']

            if 'request_id' in data:
                del data['request_id']

            request_data.append(data)

            if len(request_data) is count:
                # результат request_data
                return True
            
            last_get_time = int(time.time())
        
        def on_error(data):
            if request_id != data["request_id"]:
                return True

            # результат False
            return True

        self.websocket.add(f"T{success_name}", on_success)
        self.websocket.add(f"T{error_name}", on_error)

        while True:
            current_time = int(time.time())

            if current_time - last_get_time > PROTOCOL_CONFIG["CONNECTION_TIMEOUT"]:
                # результат False
                return
            
            await asyncio.sleep(PROTOCOL_CONFIG["CONNECTION_TIMEOUT"] / 1000)
    


    def _send_encoded_data(self, data):
        shorten_data = smd_transformer.shorten(data)
        encoded_data = msgpack.packb(shorten_data)

        self.websocket.send(encoded_data)
    
    def _decode_message(self, message):
        decoded_message = json.loads(message)
        return smd_transformer.expand(decoded_message)

    def _generate_request_id(self):
        return random.randint(1, 999999)