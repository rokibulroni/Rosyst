import httpx
import os

class NtopngClient:
    def __init__(self):
        self.url = os.getenv("NTOPNG_URL", "http://ntopng:3000").rstrip("/")
        self.username = os.getenv("NTOPNG_USERNAME", "admin")
        self.password = os.getenv("NTOPNG_PASSWORD", "admin")
        self.cookies = {}

    async def login(self):
        """Authenticates with ntopng to retrieve the session cookie."""
        async with httpx.AsyncClient() as client:
            try:
                auth_data = {
                    "user": self.username,
                    "password": self.password,
                    "referer": "/"
                }
                response = await client.post(f"{self.url}/lua/login.lua", data=auth_data, timeout=5.0)
                if "ntopng.session" in response.cookies:
                    self.cookies = {"ntopng.session": response.cookies["ntopng.session"]}
            except Exception as e:
                print(f"ntopng Login Error: {e}")

    async def get_traffic_stats(self):
        """Fetches traffic stats for the default interface (ifid=0)."""
        if not self.cookies:
            await self.login()

        async with httpx.AsyncClient(cookies=self.cookies) as client:
            try:
                # ifid=0 usually refers to the first monitoring interface
                response = await client.get(f"{self.url}/lua/rest/v2/get/interface/data.lua?ifid=0", timeout=5.0)
                response.raise_for_status()
                data = response.json()
                
                # Extract basic traffic stats from the complex ntopng payload
                rsp = data.get("rsp", {})
                return {
                    "bytes_sent": rsp.get("bytes_upload", 0),
                    "bytes_recv": rsp.get("bytes_download", 0),
                    "active_flows": rsp.get("num_flows", 0)
                }
            except Exception as e:
                print(f"ntopng API Error (Traffic): {e}")
                # Clear cookies on failure to force re-login next time
                self.cookies = {}
                return {
                    "bytes_sent": 0,
                    "bytes_recv": 0,
                    "active_flows": 0
                }
