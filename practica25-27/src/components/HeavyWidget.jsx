import React from 'react';

const metrics = [
  { label: 'main.js',           value: '5.86 КБ',   sub: 'entry chunk' },
  { label: 'vendor.chunk.js',   value: '~0 КБ',     sub: 'React (inlined)' },
  { label: 'router.chunk.js',   value: '164 КБ',    sub: '46 КБ brotli' },
  { label: 'About.chunk.js',    value: '2.11 КБ',   sub: 'lazy' },
  { label: 'Dashboard.chunk.js',value: '1.96 КБ',   sub: 'lazy' },
  { label: 'LazyChart.chunk.js',value: '1.05 КБ',   sub: 'nested lazy' },
];

export default function HeavyWidget() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      gap: '0.75rem',
    }}>
      {metrics.map(m => (
        <div key={m.label} style={{
          padding: '1.1rem',
          borderRadius: 'var(--radius)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--purple-pale)', fontFamily: "'JetBrains Mono', monospace" }}>
            {m.value}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--accent)', marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>
            {m.sub}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6 }}>
            {m.label}
          </div>
        </div>
      ))}
    </div>
  );
}
