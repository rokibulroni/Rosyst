import httpx
import os
import base64
from fastapi import HTTPException

class AdGuardClient:
    def __init__(self):
        self.url = os.getenv("ADGUARD_URL", "http://adguardhome:80").rstrip("/")
        self.username = os.getenv("ADGUARD_USERNAME", "")
        self.password = os.getenv("ADGUARD_PASSWORD", "")
        
        # Setup basic auth header
        auth_str = f"{self.username}:{self.password}"
        b64_auth = base64.b64encode(auth_str.encode()).decode()
        self.headers = {"Authorization": f"Basic {b64_auth}"}

    async def get_clients(self):
        """Fetches the list of all connected devices from AdGuard Home."""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"{self.url}/control/clients", headers=self.headers, timeout=5.0)
                response.raise_for_status()
                data = response.json()
                
                devices = []
                # AdGuard returns configured clients and auto-clients
                all_clients = data.get("clients", []) + data.get("auto_clients", [])
                
                for client_data in all_clients:
                    devices.append({
                        "ip": client_data.get("ip", ""),
                        "mac": client_data.get("mac", ""),
                        "hostname": client_data.get("name", ""),
                        "is_active": True
                    })
                return devices
            except Exception as e:
                print(f"AdGuard API Error (Clients): {e}")
                return []

    async def get_query_log(self):
        """Fetches recent DNS queries."""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"{self.url}/control/querylog", headers=self.headers, timeout=5.0)
                response.raise_for_status()
                data = response.json()
                
                domains = []
                for log in data.get("data", [])[:50]: # Top 50 recent
                    question = log.get("question", {})
                    domains.append({
                        "domain": question.get("name", ""),
                        "client_ip": log.get("client", ""),
                        "status": log.get("status", ""),
                        "time": log.get("time", "")
                    })
                return domains
            except Exception as e:
                print(f"AdGuard API Error (QueryLog): {e}")
                return []

    async def block_domain(self, domain: str):
        """Adds a domain to AdGuard's custom filtering rules."""
        async with httpx.AsyncClient() as client:
            try:
                # First fetch existing rules
                get_rules = await client.get(f"{self.url}/control/filtering/status", headers=self.headers)
                get_rules.raise_for_status()
                rules = get_rules.json().get("user_rules", [])
                
                # Append new block rule
                block_rule = f"||{domain}^"
                if block_rule not in rules:
                    rules.append(block_rule)
                    
                    # Save rules back
                    save_res = await client.post(
                        f"{self.url}/control/filtering/set_rules", 
                        headers=self.headers, 
                        json={"rules": rules}
                    )
                    save_res.raise_for_status()
                    return True
                return False
            except Exception as e:
                print(f"AdGuard API Error (BlockDomain): {e}")
                raise HTTPException(status_code=500, detail="Failed to communicate with AdGuard API")
