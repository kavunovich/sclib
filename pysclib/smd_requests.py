from smd_transformer import smd_transformer
from event_manager import event_manager
import aiohttp
import json

# код нейронки снизу, я даже хз, работает или нет

class smd_requests(event_manager):
    def __init__(self):
        super().__init__()
        self._url = None
        self._userid = None
        self._public_key = None

    def set_request_url(self, url):
        self._url = url

    def set_userid(self, userid):
        self._userid = userid

    def set_public_key(self, public_key):
        self._public_key = public_key

    async def post_request(self, url, headers, body, json_response=True):
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(url, headers=headers, data=body) as response:
                    if json_response:
                        return {"response": await response.json()}
                    else:
                        return {"response": await response.read()}
        except Exception as error:
            return {"error": error}

    async def upload_file(self, binary_data):
        if self._url is None or self._userid is None or self._public_key is None:
            return None
        
        hex_string = binary_data.hex()

        url = f"{self._url}/upload/"
        headers = {
            "Content-Type": "application/json"
        }

        body = smd_transformer.shorten({
            "userid": self._userid,
            "public_key": self._public_key,
            "data": hex_string
        })

        request = await self.post_request(
            url, headers, json.dumps(body)
        )

        if "error" in request:
            return None

        result = smd_transformer.expand(request["response"])
        return result

    async def get_file(self, token):
        if len(token) < 5:
            return None

        url = f"{self._url}/download/"
        headers = {
            "Content-Type": "application/json"
        }

        body = smd_transformer.shorten({
            "userid": self._userid,
            "public_key": self._public_key,
            "key": token
        })

        request = await self.post_request(
            url, headers, json.dumps(body), json_response=False
        )

        if "error" in request:
            return None

        return request["response"]