import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      padding: '0 1.5rem',
      background: scrolled
        ? 'rgba(10,8,18,0.85)'
        : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      transition: 'all 0.3s ease',
    }}>
      <div style={{
        maxWidth: 900, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 60,
      }}>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          color: 'var(--purple-pale)',
          fontWeight: 600,
          fontSize: '0.95rem',
          letterSpacing: '0.05em',
        }}>
          anudellora<span style={{ color: 'var(--accent)' }}>.</span>dev
        </span>

        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {[
            { to: '/', label: 'Портфолио' },
            { to: '/about', label: 'О работе' },
            { to: '/dashboard', label: 'Bundle' },
          ].map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === '/'} style={({ isActive }) => ({
              padding: '0.4rem 0.9rem',
              borderRadius: 'var(--radius-sm)',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: isActive ? 'var(--purple-pale)' : 'var(--text-secondary)',
              background: isActive ? 'var(--bg-card)' : 'transparent',
              border: isActive ? '1px solid var(--border)' : '1px solid transparent',
              transition: 'all 0.2s',
            })}>
              {label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
