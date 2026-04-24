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
                all_clients = (data.get("clients") or []) + (data.get("auto_clients") or [])
                
                for client_data in all_clients:
                    devices.append({
                        "ip": client_data.get("ip", ""),
                        "mac": client_data.get("mac", ""),
                        "hostname": client_data.get("name", ""),
                        "is_active": True
                    })
                if not devices:
                    # Fallback to querylog to extract active IPs masked by Docker NAT
                    q_res = await client.get(f"{self.url}/control/querylog", headers=self.headers, timeout=5.0)
                    if q_res.status_code == 200:
                        q_data = q_res.json()
                        ips = set()
                        for log in q_data.get("data", []):
                            ips.add(log.get("client", ""))
                        for ip in ips:
                            if ip:
                                devices.append({
                                    "ip": ip,
                                    "mac": "Network Masked",
                                    "hostname": "Docker Gateway Network",
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

    async def get_stats(self):
        """Fetches top queried domains and clients."""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"{self.url}/control/stats", headers=self.headers, timeout=5.0)
                response.raise_for_status()
                data = response.json()
                return {
                    "top_domains": data.get("top_queried_domains", [])[:10],
                    "top_clients": data.get("top_clients", [])[:10]
                }
            except Exception as e:
                print(f"AdGuard API Error (Stats): {e}")
                return {"top_domains": [], "top_clients": []}


    async def get_blocked_domains(self):
        """Fetches the list of custom blocked domains."""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"{self.url}/control/filtering/status", headers=self.headers, timeout=5.0)
                response.raise_for_status()
                rules = response.json().get("user_rules", [])
                # Extract domains from AdGuard syntax (||domain.com^)
                blocked = []
                for rule in rules:
                    if rule.startswith("||") and rule.endswith("^"):
                        blocked.append(rule[2:-1])
                    else:
                        blocked.append(rule)
                return blocked
            except Exception as e:
                print(f"AdGuard API Error (BlockedDomains): {e}")
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
