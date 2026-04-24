from pydantic import BaseModel

class Device(BaseModel):
    ip: str
    mac: str | None
    hostname: str | None
    is_active: bool

class DomainQuery(BaseModel):
    domain: str
    client_ip: str
    status: str
    time: str

class TrafficStats(BaseModel):
    bytes_sent: int
    bytes_recv: int
    active_flows: int
