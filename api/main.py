import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from models.schemas import Device, DomainQuery, TrafficStats
from services.adguard_client import AdGuardClient
from services.ntopng_client import NtopngClient
from pydantic import BaseModel

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Rosyst API",
    description="Unified Backend API for Rosyst Local Network Intelligence",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

adguard = AdGuardClient()
ntopng = NtopngClient()

@app.get("/")
async def root():
    return {"message": "Rosyst API is running!"}

@app.get("/devices", response_model=list[Device])
async def get_devices():
    """
    Fetches the list of all connected devices from AdGuard Home.
    """
    devices = await adguard.get_clients()
    return devices

@app.get("/domains", response_model=list[DomainQuery])
async def get_domains():
    """
    Fetches the top domains and recent DNS queries from AdGuard Home.
    """
    domains = await adguard.get_query_log()
    return domains


@app.get("/blocked", response_model=list[str])
async def get_blocked():
    """
    Fetches the list of user-defined blocked domains.
    """
    return await adguard.get_blocked_domains()

@app.get("/stats")
async def get_stats():
    """
    Fetches the top queried domains.
    """
    return await adguard.get_stats()

@app.get("/traffic", response_model=TrafficStats)
async def get_traffic():
    """
    Fetches real-time bandwidth usage and historical traffic data from ntopng.
    """
    traffic = await ntopng.get_traffic_stats()
    return traffic

class BlockRequest(BaseModel):
    domain: str
    client_ip: str | None = None

@app.post("/block")
async def block_domain(request: BlockRequest):
    """
    Instantly blocks a domain via AdGuard Home custom filtering rules.
    """
    success = await adguard.block_domain(request.domain)
    if success:
        return {"status": "success", "blocked_domain": request.domain}
    else:
        return {"status": "success", "message": "Domain was already blocked", "blocked_domain": request.domain}
