import React from 'react';
import avatar from '../assets/avatar.jpg';

// ── Data ────────────────────────────────────────────────
const skills = {
  'Backend': ['Golang', 'REST API', 'gRPC'],
  'Базы данных': ['PostgreSQL', 'Redis'],
  'Очереди': ['Kafka', 'RabbitMQ'],
  'DevOps': ['Docker', 'Kubernetes', 'Linux'],
  'Другое': ['Git', 'JavaScript'],
  'Языки': ['Русский — родной', 'Английский — A2'],
};

const experience = [
  {
    role: 'Golang Backend Developer',
    company: 'Freelance',
    period: 'Май 2025 — Август 2025',
    desc: 'Разрабатывал бэкенд-приложения для различных проектов. Работал с высоконагруженными системами, реализовывал RESTful API, работал с базами данных и очередями сообщений.',
    stack: ['Golang', 'PostgreSQL', 'Docker', 'REST API', 'JavaScript'],
  },
  {
    role: 'Университетские групповые проекты',
    company: 'РТУ МИРЭА',
    period: '2024 — по наст. время',
    desc: 'Участие в разработке групповых проектов на Golang, работа с системным проектированием и архитектурой приложений.',
    stack: ['Golang', 'Архитектура', 'Системное проектирование'],
  },
];

// ── Sub-components ───────────────────────────────────────
function SkillBadge({ label }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '0.3rem 0.75rem',
      borderRadius: 999,
      border: '1px solid var(--border)',
      background: 'var(--bg-card)',
      color: 'var(--purple-pale)',
      fontSize: '0.8rem',
      fontWeight: 500,
      fontFamily: "'JetBrains Mono', monospace",
      transition: 'all 0.2s',
      cursor: 'default',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = 'var(--purple-main)';
      e.currentTarget.style.background = 'var(--bg-card-hover)';
      e.currentTarget.style.color = 'var(--accent)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = 'var(--border)';
      e.currentTarget.style.background = 'var(--bg-card)';
      e.currentTarget.style.color = 'var(--purple-pale)';
    }}
    >
      {label}
    </span>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '1.75rem',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      ...style,
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = 'var(--border-glow)';
      e.currentTarget.style.boxShadow = '0 0 24px #7c3aed1a';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = 'var(--border)';
      e.currentTarget.style.boxShadow = 'none';
    }}
    >
      {children}
    </div>
  );
}

function ContactLink({ href, icon, label }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" style={{
      display: 'flex', alignItems: 'center', gap: '0.6rem',
      padding: '0.6rem 1.1rem',
      borderRadius: 'var(--radius-sm)',
      border: '1px solid var(--border)',
      background: 'var(--bg-card)',
      color: 'var(--text-secondary)',
      textDecoration: 'none',
      fontSize: '0.875rem',
      fontWeight: 500,
      transition: 'all 0.2s',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = 'var(--purple-main)';
      e.currentTarget.style.color = 'var(--purple-pale)';
      e.currentTarget.style.background = 'var(--bg-card-hover)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = 'var(--border)';
      e.currentTarget.style.color = 'var(--text-secondary)';
      e.currentTarget.style.background = 'var(--bg-card)';
    }}
    >
      <span style={{ fontSize: '1rem' }}>{icon}</span>
      {label}
    </a>
  );
}

// ── Page ─────────────────────────────────────────────────
export default function Home() {
  return (
    <main>
      {/* ── Hero ── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center',
        paddingTop: 80,
      }}>
        <div className="container" style={{ width: '100%' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '3rem',
            alignItems: 'center',
          }}>
            <div>
              <p style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: 'var(--purple-light)',
                fontSize: '0.875rem',
                marginBottom: '0.75rem',
                letterSpacing: '0.1em',
              }}>
                {'// Привет, меня зовут'}
              </p>

              <h1 style={{
                fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                lineHeight: 1.1,
                marginBottom: '0.5rem',
                background: 'linear-gradient(135deg, #f1eeff 0%, #a78bfa 60%, #e879f9 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Савельев Антон
              </h1>

              <h2 style={{
                fontSize: 'clamp(1.2rem, 3vw, 1.75rem)',
                fontWeight: 400,
                color: 'var(--text-secondary)',
                marginBottom: '1.5rem',
              }}>
                Golang Backend Developer
              </h2>

              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '1rem',
                lineHeight: 1.8,
                maxWidth: 520,
                marginBottom: '2rem',
              }}>
                Бэкенд-разработчик, основной стек&nbsp;— <span style={{ color: 'var(--purple-pale)' }}>Go</span>.
                Недавно завершил фриланс-проект: за месяц с нуля спроектировал и реализовал серверную часть на базе REST API.
                Ценю чистую архитектуру и открытую коммуникацию в команде.
              </p>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <ContactLink href="mailto:anudellora@mail.ru"    icon="✉" label="anudellora@mail.ru" />
                <ContactLink href="https://t.me/anudellora"      icon="✈" label="@anudellora" />
                <ContactLink href="tel:+79152849773"             icon="☎" label="+7 (915) 284-97-73" />
              </div>
            </div>

            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                position: 'absolute', inset: -3,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #7c3aed, #e879f9, #4c1d95)',
                animation: 'spin 6s linear infinite',
              }} />
              <div style={{
                position: 'relative',
                width: 200, height: 200,
                borderRadius: '50%',
                overflow: 'hidden',
                border: '4px solid var(--bg-base)',
              }}>
                <img
                  src={avatar}
                  alt="Антон Савельев"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Skills ── */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">
            <span>02.</span> Навыки
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
          }}>
            {Object.entries(skills).map(([group, items]) => (
              <Card key={group}>
                <p style={{
                  color: 'var(--accent)',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  marginBottom: '0.85rem',
                  textTransform: 'uppercase',
                }}>
                  {group}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {items.map(s => <SkillBadge key={s} label={s} />)}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Experience ── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <h2 className="section-title">
            <span>03.</span> Опыт работы
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {experience.map((exp, i) => (
              <Card key={i}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap',
                  marginBottom: '0.75rem',
                }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                      {exp.role}
                    </h3>
                    <p style={{ color: 'var(--purple-light)', fontWeight: 600, fontSize: '0.9rem' }}>
                      {exp.company}
                    </p>
                  </div>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.78rem',
                    color: 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                    paddingTop: '0.2rem',
                  }}>
                    {exp.period}
                  </span>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1rem' }}>
                  {exp.desc}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {exp.stack.map(s => (
                    <span key={s} style={{
                      padding: '0.2rem 0.6rem',
                      borderRadius: 4,
                      background: '#2d1b6920',
                      border: '1px solid #4c1d9540',
                      color: 'var(--purple-pale)',
                      fontSize: '0.75rem',
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>{s}</span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Education ── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <h2 className="section-title">
            <span>04.</span> Образование
          </h2>

          <Card>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem',
            }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.3rem' }}>
                  РТУ МИРЭА
                </h3>
                <p style={{ color: 'var(--purple-light)', fontWeight: 500, fontSize: '0.9rem' }}>
                  Программа «Фуллстек-разработчик»
                </p>
              </div>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
              }}>
                Сентябрь 2024 — по наст. время
              </span>
            </div>
          </Card>
        </div>
      </section>

      {/* ── About me ── */}
      <section className="section" style={{ paddingTop: 0, paddingBottom: '8rem' }}>
        <div className="container">
          <h2 className="section-title">
            <span>05.</span> Обо мне
          </h2>

          <Card>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.5rem',
            }}>
              {[
                {
                  icon: '💬',
                  title: 'Открытая коммуникация',
                  text: 'Ценю прозрачность в команде. Лучше лишний раз задать вопрос, чем потом переделывать задачу.',
                },
                {
                  icon: '⚡',
                  title: 'Быстро вникаю',
                  text: 'Мне нравится разбираться в том, как всё устроено «под капотом», и сразу применять это на практике.',
                },
                {
                  icon: '✅',
                  title: 'Ответственность',
                  text: 'Если взял задачу в спринт — она будет доведена до логического завершения.',
                },
                {
                  icon: '🔄',
                  title: 'Адаптивность',
                  text: 'Легко подстраиваюсь под процессы команды и принятые стандарты, не теряя в продуктивности.',
                },
              ].map(({ icon, title, text }) => (
                <div key={title}>
                  <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{icon}</div>
                  <h4 style={{ color: 'var(--purple-pale)', marginBottom: '0.4rem', fontSize: '0.95rem' }}>{title}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.7 }}>{text}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}
