import React from 'react';

function InfoBlock({ title, children }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '1.75rem',
      marginBottom: '1.25rem',
    }}>
      <h3 style={{
        color: 'var(--accent)',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.75rem',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        marginBottom: '1rem',
      }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function About() {
  return (
    <main style={{ paddingTop: 80, minHeight: '100vh' }}>
      <div className="container section">
        <h1 className="section-title" style={{ marginBottom: '2.5rem' }}>
          <span>01.</span> О практической работе
        </h1>

        <InfoBlock title="Что такое Lazy Loading">
          <ol style={{ color: 'var(--text-secondary)', lineHeight: 2.2, paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
            <li>Webpack / Rollup видит <code>import()</code> с динамическим путём</li>
            <li>Создаёт отдельный чанк для этого модуля</li>
            <li>Браузер загружает чанк только когда код достигает <code>React.lazy()</code></li>
            <li><code>Suspense</code> показывает <em style={{ color: 'var(--purple-pale)' }}>fallback</em> пока чанк не загружен</li>
          </ol>
        </InfoBlock>

        <InfoBlock title="Результат оптимизации">
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.9rem' }}>
            Начальный бандл уменьшается — пользователь быстрее видит первый экран,
            а дополнительные страницы подгружаются по требованию. Эта страница
            (<code>About.jsx</code>) загружена отдельным чанком — проверь в DevTools на вкладке Network.
          </p>
        </InfoBlock>

        <InfoBlock title="Как запустить анализ бандла">
          <div style={{
            background: 'var(--bg-base)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '1rem 1.25rem',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.83rem',
            color: 'var(--purple-pale)',
            lineHeight: 1.8,
          }}>
            <div><span style={{ color: 'var(--text-muted)' }}># production-сборка</span></div>
            <div>npm run build</div>
            <br />
            <div><span style={{ color: 'var(--text-muted)' }}># сборка + открыть анализатор (dist/stats.html)</span></div>
            <div><span style={{ color: 'var(--accent)' }}>ANALYZE</span>=true npm run build</div>
          </div>
        </InfoBlock>
      </div>
    </main>
  );
}
