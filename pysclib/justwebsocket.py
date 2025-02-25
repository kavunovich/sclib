from event_manager import event_manager
from smd_transformer import smd_transformer

import asyncio
import websocket
import threading
import msgpack
import time

class justwebsocket(event_manager):

    def __init__(self, socket_urls):
        super().__init__()
        self.socket_urls = socket_urls if isinstance(socket_urls, list) else [socket_urls]
        self.is_debug = True
        self.current_url_index = 0
        self.websocket = None
        self.connection_worker = None
        self.worker_iteration = 500
        self.is_connecting = False
        self.is_connected = False
        self.last_ping_time = 0
        self.time_request = 0
        self.ping_range = -1
        self.ping = 0

    async def connect(self):
        if self.connection_worker:
            self.connection_worker.cancel()
            self.connection_worker = None

        self.connection_worker = asyncio.create_task(self._connection_worker())

    async def _connection_worker(self):
        while True:
            # Если все еще не подключено, но идет подключение по истечению таймаута все обнуляется

            if self.is_connected is False and self.is_connecting is True and (int(time.time()) - self.time_request) * 1000 > self.default_timeout:
                await self.websocket.close()
                self.websocket = None
                self.is_connecting = False
                continue

            # Если не было подключения и нет подключения на данный момент

            if self.is_connecting is False and self.is_connected is False:
                self.is_connecting = True
                self.time_request = int(time.time())

                # Выбираем сервак и делаем попытку на подключение

                self.current_url_index = (self.current_url_index + 1) % len(self.socket_urls)
                await self.set_connection_websocket(self.socket_urls[self.current_url_index])

            # Если подключено, то отправляем пинг

            if self.is_connected is True:
                if self.ping_range > 0 and (int(time.time()) - self.last_ping_time) > self.ping_range / 1000:
                    self.call('heartbeat')
                    self.last_ping_time = int(time.time())
                    self.send_ping()
            
            await asyncio.sleep(self.worker_iteration / 1000)
    
    async def set_connection_websocket(self, url):
        if self.websocket:
            await self.websocket.close()
            self.websocket = None
        
        self.websocket = websocket.WebSocketApp(url)

        self.websocket.on_open = self.handler_open
        self.websocket.on_message = self.handler_message
        self.websocket.on_error = self.handler_error
        self.websocket.on_close = self.handler_close

        threading.Thread(target=self.websocket.run_forever, daemon=True).start()

    def handler_message(self, ws, message):
        if isinstance(message, bytes):
            if(message == bytes([1])):
                self.ping = int(time.time()) - self.last_ping_time
                return
            try:
                unpacked_data = msgpack.unpackb(message, strict_map_key=False)
                expanded_data = smd_transformer.expand(unpacked_data)

                if 'type' in expanded_data:
                    self.call(f'T{expanded_data["type"]}', expanded_data)

                self.call('message', expanded_data)
            except Exception as e:
                print(e)

    def handler_open(self, ws):
        self.is_connected = True
        self.log("WebSocket is connected")
        self.call('connected')
    
    def handler_error(self, ws, error):
        self.is_connected = False
        self.error(f"WebSocket closed by error")
        self.call('connection_error')
    
    def handler_close(self, ws, close_status_code, close_msg):
        self.log(f"WebSocket closed with reason: {close_msg} and code {close_status_code}")
        self.is_connected = False
        self.call('close')
    
    def send_ping(self):
        self.send(bytes([1]))

    def send(self, data: bytes):
        if self.websocket and isinstance(self.websocket, websocket.WebSocketApp):
            try:
                self.websocket.send(data)
                return True
            except Exception as error:
                return False
        else:
            return False
    
    def log(self, data):
        if self.is_debug is True:
            print('[JWS] / INFO ' + data)
    
    def error(self, data):
        if self.is_debug is True:
            print('[JWS] / ERROR ' + data)