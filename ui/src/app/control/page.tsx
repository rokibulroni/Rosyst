"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function Control() {
  const [domain, setDomain] = useState('');
  const [status, setStatus] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [loading, setLoading] = useState(false);

  const handleBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain) return;
    
    setLoading(true);
    try {
      const res = await fetch('http://192.168.8.247:8000/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain })
      });
      const data = await res.json();
      
      setStatus({ 
        message: data.message || `Successfully blocked ${domain} across the network.`, 
        type: 'success' 
      });
      setTimeout(() => setStatus(null), 2000);
      setDomain('');
    } catch {
      setStatus({ message: 'Failed to update rules. Make sure the API is running.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <header className="header" style={{ marginBottom: '1rem', paddingBottom: '1rem' }}>
        <h1 className="logo">Rosyst Intelligence</h1>
        <div style={{color: 'var(--muted)'}}>Network Control Center</div>
      </header>

      <nav style={{ display: 'flex', gap: '2rem', marginBottom: '3rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem' }}>
        <Link href="/" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Dashboard</Link>
        <Link href="/devices" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Devices</Link>
        <Link href="/control" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Control Center</Link>
      </nav>

      <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '1rem', color: 'var(--danger)' }}>Instant Domain Blocking</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '2rem', lineHeight: 1.5 }}>
          Enter a domain below to instantly sinkhole it across your entire local network. 
          This will inject a custom filtering rule into AdGuard Home.
        </p>

        <form onSubmit={handleBlock} style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
          <div>
            <input 
              type="text" 
              placeholder="e.g., netflix.com, tracking.xyz"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid var(--card-border)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--foreground)',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading || !domain}
            style={{
              padding: '1rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'var(--danger)',
              color: 'var(--foreground)',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: loading || !domain ? 'not-allowed' : 'pointer',
              opacity: loading || !domain ? 0.5 : 1,
              transition: 'all 0.2s'
            }}
          >
            {loading ? 'Injecting Rule...' : 'Block Domain Globally'}
          </button>
        </form>

        {status && (
          <div style={{ 
            marginTop: '1.5rem', 
            padding: '1rem', 
            borderRadius: '8px',
            backgroundColor: status.type === 'success' ? 'hsla(160, 50%, 45%, 0.1)' : 'hsla(0, 55%, 45%, 0.1)',
            color: status.type === 'success' ? 'var(--accent)' : 'var(--danger)',
            border: `1px solid ${status.type === 'success' ? 'var(--accent)' : 'var(--danger)'}`
          }}>
            {status.message}
          </div>
        )}
      </div>
    </main>
  );
}
