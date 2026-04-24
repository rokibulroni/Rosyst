"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Device {
  ip: string;
  mac: string;
  hostname: string;
  source: string;
}

export default function Devices() {
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    fetch('http://192.168.8.247:8000/devices')
      .then(res => res.json())
      .then(data => {
        // Due to docker routing, there might be duplicate IP masking.
        // For visual aesthetics, we'll map them cleanly.
        setDevices(data);
      })
      .catch(console.error);
  }, []);

  return (
    <main className="container">
      <header className="header" style={{ marginBottom: '1rem', paddingBottom: '1rem' }}>
        <h1 className="logo">Rosyst Intelligence</h1>
        <div style={{color: 'var(--muted)'}}>Connected Devices</div>
      </header>

      <nav style={{ display: 'flex', gap: '2rem', marginBottom: '3rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem' }}>
        <Link href="/" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Dashboard</Link>
        <Link href="/devices" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Devices</Link>
        <Link href="/control" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Control Center</Link>
      </nav>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', color: 'var(--islamic-gold)' }}>Active Network Clients</h2>
        {devices.length === 0 ? (
          <div style={{ color: 'var(--muted)', padding: '1rem 0' }}>No devices discovered yet. Waiting for DHCP/DNS queries...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {devices.map((device, i) => (
              <div key={i} style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '1rem',
                borderBottom: '1px solid var(--card-border)',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <div style={{ fontWeight: 'bold' }}>{device.hostname ? device.hostname : "Unknown Device"}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{device.mac || "MAC Masked"}</div>
                </div>
                <div style={{ color: 'var(--islamic-gold)', fontFamily: 'monospace' }}>
                  {device.ip}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="glass-card" style={{ backgroundColor: 'hsla(0, 55%, 45%, 0.05)', border: '1px solid hsla(0, 55%, 45%, 0.2)' }}>
        <h3 style={{ color: 'var(--danger)', marginBottom: '0.5rem' }}>Topology Note</h3>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
          Due to AdGuard Home running inside a Docker bridge network on WSL, device IP addresses may appear masked as the Docker Gateway IP (e.g., 172.18.0.1). 
          To enable true per-device MAC and IP visibility, AdGuard must be run directly on the host network or configured with a dedicated macvlan interface.
        </p>
      </div>
    </main>
  );
}
