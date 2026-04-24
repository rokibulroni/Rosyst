import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Rosyst API",
    description="Unified Backend API for Rosyst Local Network Intelligence",
    version="1.0.0"
)

@app.get("/")
async def root():
    return {"message": "Rosyst API is running!"}

@app.get("/devices")
async def get_devices():
    """
    Fetches the list of all connected devices from AdGuard/ntopng.
    """
    # TODO: Implement actual AdGuard/ntopng client calls
    return {"devices": []}

@app.get("/domains")
async def get_domains():
    """
    Fetches the top domains and recent DNS queries from AdGuard Home.
    """
    # TODO: Implement actual AdGuard client call
    return {"domains": []}

@app.get("/traffic")
async def get_traffic():
    """
    Fetches real-time bandwidth usage and historical traffic data from ntopng.
    """
    # TODO: Implement actual ntopng client call
    return {"traffic": {}}

class BlockRequest(BaseModel):
    domain: str
    client_ip: str | None = None

@app.post("/block")
async def block_domain(request: BlockRequest):
    """
    Instantly blocks a domain either globally or for a specific client via AdGuard Home.
    """
    # TODO: Implement AdGuard filtering rules update
    return {"status": "success", "blocked_domain": request.domain}
