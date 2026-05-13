import React from 'react';

const data = [40, 65, 30, 80, 55, 90, 45, 70, 35, 85];
const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
const max = Math.max(...data);

export default function LazyChart() {
  return (
    <div style={{
      marginTop: '1.5rem',
      padding: '1.75rem',
      background: 'var(--bg-card)',
      borderRadius: 'var(--radius)',
      border: '1px solid var(--border)',
    }}>
      <h3 style={{ color: 'var(--text-primary)', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
        Активность по месяцам
      </h3>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100 }}>
        {data.map((v, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: '100%',
              background: `linear-gradient(180deg, var(--accent) 0%, var(--purple-main) 100%)`,
              borderRadius: '4px 4px 0 0',
              height: `${(v / max) * 88}px`,
              opacity: 0.85,
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.85'}
            />
            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
              {labels[i]}
            </span>
          </div>
        ))}
      </div>

      <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
        Загружен отдельным чанком: LazyChart.[hash].chunk.js
      </p>
    </div>
  );
}
