import React, { useState } from 'react';
import HeavyWidget from '../components/HeavyWidget.jsx';

const LazyChart = React.lazy(() => import('../components/LazyChart.jsx'));

export default function Dashboard() {
  const [showChart, setShowChart] = useState(false);

  return (
    <main style={{ paddingTop: 80, minHeight: '100vh' }}>
      <div className="container section">
        <h1 className="section-title">
          <span>06.</span> Bundle Dashboard
        </h1>

        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
          Эта страница загружается лениво (<code>React.lazy</code>).
          График ниже — ещё один уровень lazy loading по клику.
        </p>

        <HeavyWidget />

        <div style={{ marginTop: '2rem' }}>
          <button
            onClick={() => setShowChart(true)}
            disabled={showChart}
            style={{
              padding: '0.65rem 1.4rem',
              background: showChart ? 'var(--bg-card)' : 'var(--purple-main)',
              color: showChart ? 'var(--text-muted)' : '#fff',
              border: '1px solid ' + (showChart ? 'var(--border)' : 'var(--purple-main)'),
              borderRadius: 'var(--radius-sm)',
              cursor: showChart ? 'default' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
          >
            {showChart ? 'График загружен' : 'Загрузить график (lazy chunk)'}
          </button>

          {showChart && (
            <React.Suspense fallback={
              <p style={{ color: 'var(--text-muted)', marginTop: '1rem', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem' }}>
                Загрузка LazyChart.chunk.js...
              </p>
            }>
              <LazyChart />
            </React.Suspense>
          )}
        </div>
      </div>
    </main>
  );
}
