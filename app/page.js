'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useSession, signIn, signOut } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function Home() {
  const { data: session, status } = useSession();
  const [guilds, setGuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (session) {
      fetchGuilds();
    } else {
      setLoading(false);
    }
  }, [session]);

  const fetchGuilds = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/guilds`);
      setGuilds(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to connect to bot API. Is the bot running?');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (status === 'loading') {
    return (
      <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="loading-spinner"></div>
      </main>
    );
  }

  // Not logged in - Premium Login Screen
  if (!session) {
    return (
      <main>
        <div className="login-page">
          {/* Floating particles */}
          <div className="particles">
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
          </div>

          <div className="login-card">
            {/* NF Logo */}
            <div className="login-logo-wrapper">
              <img src="/logo.png" alt="NF Rules Bot" className="login-logo" />
              <div className="login-logo-glow"></div>
            </div>

            <h1>NF Rules Bot</h1>
            <p>Manage & sync your Discord server rules from the web. Edit rules, preview embeds, and push updates instantly.</p>
            
            <button className="btn-discord" onClick={() => signIn('discord')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.947 2.418-2.157 2.418z"/>
              </svg>
              Login with Discord
            </button>

            <div className="login-features">
              <div className="login-feature">
                <div className="login-feature-icon">✏️</div>
                <span className="login-feature-text">Edit Rules</span>
              </div>
              <div className="login-feature">
                <div className="login-feature-icon">🔄</div>
                <span className="login-feature-text">Auto Sync</span>
              </div>
              <div className="login-feature">
                <div className="login-feature-icon">👁️</div>
                <span className="login-feature-text">Live Preview</span>
              </div>
            </div>

            <div className="login-commands">
              <span className="login-command">/rules</span>
              <span className="login-command">&gt;rules</span>
              <span className="login-command">/setruleschannel</span>
              <span className="login-command">&gt;help</span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Logged in - Server Selection
  return (
    <main>
      <header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src="/logo.png" alt="NF" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
          <h1>📜 NF Rules Bot</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img 
              src={session.user.image} 
              alt={session.user.name} 
              style={{ width: '32px', height: '32px', borderRadius: '50%' }} 
            />
            <span style={{ fontWeight: '500' }}>{session.user.name}</span>
          </div>
          <button className="btn btn-secondary" onClick={() => signOut()}>
            Logout
          </button>
          <a href="https://discord.com/api/oauth2/authorize?client_id=1427664738694725732&permissions=8&scope=bot%20applications.commands" target="_blank" className="btn btn-primary" rel="noreferrer">
            Invite Bot
          </a>
        </div>
      </header>

      <div className="container" style={{ marginTop: '2rem' }}>
        <h2 className="title">Select a Server</h2>
        <p className="subtitle">Choose a server to manage its rules.</p>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="loading-spinner"></div>
          </div>
        ) : guilds.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <h3>No Servers Found</h3>
            <p style={{ color: '#94a3b8', marginTop: '1rem', marginBottom: '2rem' }}>
              The bot is not in any servers yet, or the API is unreachable.
            </p>
            <button className="btn btn-primary" onClick={fetchGuilds}>
              Refresh
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2">
            {guilds.map(guild => (
              <div key={guild.id} className="card server-card" onClick={() => router.push(`/dashboard/${guild.id}`)}>
                {guild.icon ? (
                  <img 
                    src={guild.icon} 
                    alt={guild.name} 
                    style={{ width: '64px', height: '64px', borderRadius: '50%' }} 
                  />
                ) : (
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#2b2d31', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {guild.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{guild.name}</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{guild.memberCount} Members</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
