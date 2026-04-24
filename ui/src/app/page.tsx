'use client';
import { useEffect, useState } from 'react';

export default function Home() {
  const [traffic, setTraffic] = useState({ bytes_sent: 0, bytes_recv: 0, active_flows: 0 });
  const [domains, setDomains] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ top_domains: [], top_clients: [] });
  const [blockedDomains, setBlockedDomains] = useState<string[]>([]);
  const [blockingDomain, setBlockingDomain] = useState<string | null>(null);

  const handleBlock = async (domain: string) => {
    setBlockingDomain(domain);
    try {
      await fetch('http://192.168.8.247:8000/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain })
      });
      // Briefly show feedback or just rely on next poll to show it blocked (or just let the user know)
      setTimeout(() => setBlockingDomain(null), 1000);
    } catch (err) {
      console.error("Failed to block domain", err);
      setBlockingDomain(null);
    }
  };

  useEffect(() => {
    // Poll the backend API every 2 seconds
    const fetchData = async () => {
      try {
        const trafficRes = await fetch('http://192.168.8.247:8000/traffic');
        const trafficData = await trafficRes.json();
        setTraffic(trafficData);

        const domainRes = await fetch('http://192.168.8.247:8000/domains');
        const domainData = await domainRes.json();
        setDomains(domainData);

        const statsRes = await fetch('http://192.168.8.247:8000/stats');
        const statsData = await statsRes.json();
        setStats(statsData);

        const blockedRes = await fetch('http://192.168.8.247:8000/blocked');
        const blockedData = await blockedRes.json();
        setBlockedDomains(blockedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <main className="container">
      <header className="header" style={{ marginBottom: '1rem', paddingBottom: '1rem' }}>
        <h1 className="logo">Rosyst Intelligence</h1>
        <div style={{color: 'var(--muted)'}}>Live Network Monitor</div>
      </header>

      <nav style={{ display: 'flex', gap: '2rem', marginBottom: '3rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem' }}>
        <a href="/" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Dashboard</a>
        <a href="/devices" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Devices</a>
        <a href="/control" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Control Center</a>
      </nav>

      <div className="grid" style={{ marginBottom: '2rem' }}>
        <div className="glass-card">
          <div className="stat-label">Total Data Received</div>
          <div className="stat-value">{formatBytes(traffic.bytes_recv)}</div>
        </div>
        <div className="glass-card">
          <div className="stat-label">Total Data Sent</div>
          <div className="stat-value">{formatBytes(traffic.bytes_sent)}</div>
        </div>
        <div className="glass-card">
          <div className="stat-label">Active Network Flows</div>
          <div className="stat-value">{traffic.active_flows}</div>
        </div>
      </div>

      <div className="grid" style={{ marginBottom: '2rem' }}>
        <div className="glass-card">
          <h2 style={{ marginBottom: '1rem', color: 'var(--accent)' }}>Live DNS Queries</h2>
          {domains.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>Waiting for DNS traffic...</p>
          ) : (
            <div>
              {domains.slice(0, 10).map((log, idx) => {
                // It's blocked if either it was blocked at query time, OR it's currently in the active blocklist
                const isBlocked = log.status === 'FilteredBlackList' || log.status === 'Filtered' || blockedDomains.includes(log.domain);
                return (
                <div key={idx} className="list-item" style={{ alignItems: 'center', opacity: isBlocked ? 0.6 : 1 }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="domain-name" style={{ textDecoration: isBlocked ? 'line-through' : 'none', color: isBlocked ? 'var(--danger)' : 'inherit' }}>
                      {log.domain}
                    </span>
                    {isBlocked && <span style={{ fontSize: '0.7rem', color: 'var(--danger)', fontWeight: 600 }}>BLOCKED BY POLICY</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span style={{color: 'var(--muted)', fontSize: '0.9rem'}}>{new Date(log.time).toLocaleTimeString()}</span>
                    {!isBlocked && (
                      <button 
                        onClick={() => handleBlock(log.domain)}
                        disabled={blockingDomain === log.domain}
                        style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '4px',
                          border: 'none',
                          backgroundColor: blockingDomain === log.domain ? 'var(--accent)' : 'var(--danger)',
                          color: 'var(--foreground)',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: blockingDomain === log.domain ? 'default' : 'pointer',
                          transition: 'all 0.2s',
                          opacity: 0.9
                        }}
                      >
                        {blockingDomain === log.domain ? 'Blocked ✓' : 'Block'}
                      </button>
                    )}
                  </div>
                </div>
              )})}
            </div>
          )}
        </div>

        <div className="glass-card">
          <h2 style={{ marginBottom: '1rem', color: 'var(--islamic-gold)' }}>Top Queried Domains</h2>
          {(!stats.top_domains || stats.top_domains.length === 0) ? (
            <p style={{ color: 'var(--muted)' }}>No statistics available yet...</p>
          ) : (
            <div>
              {stats.top_domains.map((item: any, idx: number) => {
                const domain = Object.keys(item)[0];
                const count = item[domain];
                return (
                <div key={idx} className="list-item" style={{ alignItems: 'center' }}>
                  <span className="domain-name">{domain}</span>
                  <span className="domain-count" style={{ fontSize: '1.2rem' }}>{count}</span>
                </div>
              )})}
            </div>
          )}
        </div>

        <div className="glass-card">
          <h2 style={{ marginBottom: '1rem', color: 'var(--danger)' }}>Active Blocked Sources</h2>
          {blockedDomains.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>No domains currently blocked.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {blockedDomains.map((domain, idx) => (
                <div key={idx} className="list-item" style={{ padding: '0.5rem 0', opacity: 0.8 }}>
                  <span className="domain-name" style={{ color: 'var(--danger)' }}>{domain}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
