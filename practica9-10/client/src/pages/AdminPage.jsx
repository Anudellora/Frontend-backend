import { useState } from 'react';

const BASE = '/api';

const ENDPOINTS = [
    {
        group: 'Auth',
        items: [
            {
                id: 'register',
                method: 'POST',
                path: '/auth/register',
                description: 'Регистрация пользователя',
                defaultBody: JSON.stringify({ email: 'new@test.com', first_name: 'Ivan', last_name: 'Petrov', password: 'pass1234' }, null, 2),
                auth: false,
                useRefresh: false,
            },
            {
                id: 'login',
                method: 'POST',
                path: '/auth/login',
                description: 'Вход в систему',
                defaultBody: JSON.stringify({ email: 'demo@test.com', password: 'demo1234' }, null, 2),
                auth: false,
                useRefresh: false,
            },
            {
                id: 'refresh',
                method: 'POST',
                path: '/auth/refresh',
                description: 'Обновление пары токенов',
                defaultBody: '',
                auth: false,
                useRefresh: true,
            },
            {
                id: 'me',
                method: 'GET',
                path: '/auth/me',
                description: 'Получить текущего пользователя',
                defaultBody: '',
                auth: true,
                useRefresh: false,
            },
        ],
    },
    {
        group: 'Users',
        items: [
            {
                id: 'users-list',
                method: 'GET',
                path: '/users',
                description: 'Получить список пользователей',
                defaultBody: '',
                auth: true,
                useRefresh: false,
            },
            {
                id: 'users-get',
                method: 'GET',
                path: '/users/:id',
                description: 'Получить пользователя по id',
                defaultBody: '',
                auth: true,
                useRefresh: false,
                pathParam: true,
            },
            {
                id: 'users-update',
                method: 'PUT',
                path: '/users/:id',
                description: 'Обновить информацию пользователя',
                defaultBody: JSON.stringify({ role: 'seller', blocked: false }, null, 2),
                auth: true,
                useRefresh: false,
                pathParam: true,
            },
            {
                id: 'users-delete',
                method: 'DELETE',
                path: '/users/:id',
                description: 'Заблокировать пользователя',
                defaultBody: '',
                auth: true,
                useRefresh: false,
                pathParam: true,
            },
        ],
    },
    {
        group: 'Products',
        items: [
            {
                id: 'products-create',
                method: 'POST',
                path: '/products',
                description: 'Создать товар',
                defaultBody: JSON.stringify({ title: 'Новый товар', category: 'Техника', description: 'Описание', price: 9999 }, null, 2),
                auth: true,
                useRefresh: false,
            },
            {
                id: 'products-list',
                method: 'GET',
                path: '/products',
                description: 'Получить список товаров',
                defaultBody: '',
                auth: true,
                useRefresh: false,
            },
            {
                id: 'products-get',
                method: 'GET',
                path: '/products/:id',
                description: 'Получить товар по id',
                defaultBody: '',
                auth: true,
                useRefresh: false,
                pathParam: true,
            },
            {
                id: 'products-update',
                method: 'PUT',
                path: '/products/:id',
                description: 'Обновить товар',
                defaultBody: JSON.stringify({ title: 'Обновлённый товар', price: 7777 }, null, 2),
                auth: true,
                useRefresh: false,
                pathParam: true,
            },
            {
                id: 'products-delete',
                method: 'DELETE',
                path: '/products/:id',
                description: 'Удалить товар',
                defaultBody: '',
                auth: true,
                useRefresh: false,
                pathParam: true,
            },
        ],
    },
];

const METHOD_COLORS = {
    GET: '#22c55e',
    POST: '#3b82f6',
    PUT: '#f59e0b',
    DELETE: '#ef4444',
};

function EndpointRow({ ep, accessToken, refreshToken, onTokensUpdated }) {
    const [open, setOpen] = useState(false);
    const [pathId, setPathId] = useState('1');
    const [body, setBody] = useState(ep.defaultBody);
    const [response, setResponse] = useState(null);
    const [status, setStatus] = useState(null);
    const [elapsed, setElapsed] = useState(null);
    const [loading, setLoading] = useState(false);

    const actualPath = ep.pathParam ? ep.path.replace(':id', pathId) : ep.path;

    const buildCurl = () => {
        const url = `http://localhost:4000${BASE}${actualPath}`;
        let cmd = `curl -X '${ep.method}' '${url}'`;
        if (ep.auth && accessToken) cmd += ` \\\n  -H 'Authorization: Bearer ${accessToken.slice(0, 20)}...'`;
        if (ep.useRefresh && refreshToken) cmd += ` \\\n  -H 'x-refresh-token: ${refreshToken.slice(0, 20)}...'`;
        if (body && (ep.method === 'POST' || ep.method === 'PUT')) {
            cmd += ` \\\n  -H 'Content-Type: application/json'`;
            cmd += ` \\\n  -d '${body.replace(/\n/g, ' ')}'`;
        }
        return cmd;
    };

    const execute = async () => {
        setLoading(true);
        setResponse(null);
        const url = `${BASE}${actualPath}`;
        const headers = { Accept: 'application/json' };
        if (ep.auth && accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
        if (ep.useRefresh && refreshToken) headers['x-refresh-token'] = refreshToken;
        const opts = { method: ep.method, headers };
        if (body && (ep.method === 'POST' || ep.method === 'PUT')) {
            headers['Content-Type'] = 'application/json';
            opts.body = body;
        }
        const t0 = performance.now();
        try {
            const res = await fetch(url, opts);
            const ms = Math.round(performance.now() - t0);
            const json = await res.json();
            setStatus(res.status);
            setElapsed(ms);
            setResponse(json);

            // Store new tokens if login/refresh
            if ((ep.id === 'login' || ep.id === 'refresh') && json.accessToken) {
                onTokensUpdated(json.accessToken, json.refreshToken);
            }
        } catch (err) {
            setStatus('ERR');
            setElapsed(Math.round(performance.now() - t0));
            setResponse({ error: err.message });
        } finally {
            setLoading(false);
        }
    };

    const isOk = status && status < 400;

    return (
        <div className="api-row" style={{ marginBottom: '0.75rem' }}>
            {/* Header bar */}
            <button
                className="api-row-header"
                onClick={() => setOpen((o) => !o)}
                style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                    background: open ? 'rgba(255,255,255,0.05)' : 'var(--bg3)',
                    border: '1px solid var(--border)', borderRadius: open ? '10px 10px 0 0' : '10px',
                    padding: '0.75rem 1rem', cursor: 'pointer', transition: 'all 0.15s',
                }}
            >
                <span style={{
                    background: METHOD_COLORS[ep.method] + '22',
                    color: METHOD_COLORS[ep.method],
                    border: `1px solid ${METHOD_COLORS[ep.method]}44`,
                    borderRadius: 6, padding: '0.15rem 0.55rem',
                    fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 700, minWidth: 58, textAlign: 'center',
                }}>{ep.method}</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.88rem', color: 'var(--text)', flex: 1, textAlign: 'left' }}>
                    /api{ep.path}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{ep.description}</span>
                {ep.auth && <span style={{ fontSize: '0.7rem', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 4, padding: '0.1rem 0.4rem' }}>🔒 JWT</span>}
                {ep.useRefresh && <span style={{ fontSize: '0.7rem', color: '#a855f7', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)', borderRadius: 4, padding: '0.1rem 0.4rem' }}>🔄 refresh</span>}
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{open ? '▲' : '▼'}</span>
            </button>

            {/* Expanded body */}
            {open && (
                <div style={{
                    background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: 'none',
                    borderRadius: '0 0 10px 10px', padding: '1rem',
                }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', minWidth: 0 }}>
                        {/* Left: request */}
                        <div style={{ minWidth: 0, overflow: 'hidden' }}>
                            {ep.pathParam && (
                                <div className="form-group">
                                    <label className="form-label">ID товара</label>
                                    <input className="form-input" value={pathId} onChange={(e) => setPathId(e.target.value)} placeholder="1" style={{ maxWidth: 120 }} />
                                </div>
                            )}
                            {(ep.method === 'POST' || ep.method === 'PUT') && (
                                <div className="form-group">
                                    <label className="form-label">Request Body (JSON)</label>
                                    <textarea
                                        className="form-textarea"
                                        rows={8}
                                        value={body}
                                        onChange={(e) => setBody(e.target.value)}
                                        style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                                    />
                                </div>
                            )}

                            {/* Curl preview */}
                            <div style={{ marginBottom: '0.75rem' }}>
                                <div className="form-label" style={{ marginBottom: '0.3rem' }}>cURL</div>
                                <pre style={{
                                    background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6,
                                    padding: '0.6rem 0.8rem', fontSize: '0.72rem', fontFamily: 'monospace',
                                    color: 'var(--text-muted)', overflow: 'hidden', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                                }}>{buildCurl()}</pre>
                            </div>

                            <button className="btn btn-primary btn-sm" onClick={execute} disabled={loading}>
                                {loading ? 'Выполнение...' : '▶ Выполнить'}
                            </button>
                        </div>

                        {/* Right: response */}
                        <div style={{ minWidth: 0, overflow: 'hidden' }}>
                            <div className="form-label" style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>Ответ</span>
                                {status && (
                                    <span style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <span style={{
                                            background: isOk ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                                            color: isOk ? '#22c55e' : '#ef4444',
                                            border: `1px solid ${isOk ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                                            borderRadius: 4, padding: '0.1rem 0.5rem', fontSize: '0.78rem', fontWeight: 700,
                                        }}>{status}</span>
                                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{elapsed}ms</span>
                                    </span>
                                )}
                            </div>
                            <pre style={{
                                background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6,
                                padding: '0.75rem', fontSize: '0.78rem', fontFamily: 'monospace',
                                color: response ? (isOk ? '#86efac' : '#fca5a5') : 'var(--text-muted)',
                                minHeight: 200, maxHeight: 360, overflowY: 'auto', overflowX: 'hidden',
                                whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                            }}>
                                {response
                                    ? JSON.stringify(response, null, 2)
                                    : 'Нажмите "Выполнить" для отправки запроса'}
                            </pre>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AdminPage() {
    const [accessToken, setAccessToken] = useState(() => localStorage.getItem('accessToken') || '');
    const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('refreshToken') || '');

    const handleTokensUpdated = (at, rt) => {
        setAccessToken(at);
        setRefreshToken(rt);
        localStorage.setItem('accessToken', at);
        if (rt) { setRefreshToken(rt); localStorage.setItem('refreshToken', rt); }
    };

    return (
        <div className="page">
            <div className="container">
                <div className="page-header">
                    <h1>🔧 API Tester</h1>
                    <p>Интерактивное тестирование всех эндпоинтов — аналог Swagger UI</p>
                </div>

                {/* Token status panel */}
                <div style={{
                    background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10,
                    padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Access Token</span>
                        <span style={{
                            background: accessToken ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                            color: accessToken ? '#22c55e' : '#ef4444',
                            border: `1px solid ${accessToken ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                            borderRadius: 4, padding: '0.1rem 0.5rem', fontSize: '0.72rem',
                        }}>{accessToken ? '✓ есть' : '✗ нет'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Refresh Token</span>
                        <span style={{
                            background: refreshToken ? 'rgba(168,85,247,0.12)' : 'rgba(239,68,68,0.12)',
                            color: refreshToken ? '#a855f7' : '#ef4444',
                            border: `1px solid ${refreshToken ? 'rgba(168,85,247,0.3)' : 'rgba(239,68,68,0.3)'}`,
                            borderRadius: 4, padding: '0.1rem 0.5rem', fontSize: '0.72rem',
                        }}>{refreshToken ? '✓ есть' : '✗ нет'}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                        💡 После Login / Refresh токены обновляются автоматически
                    </span>
                </div>

                {/* Endpoint groups */}
                {ENDPOINTS.map((group) => (
                    <div key={group.group} style={{ marginBottom: '2rem' }}>
                        <div style={{
                            fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase',
                            letterSpacing: '0.1em', color: 'var(--accent2)', marginBottom: '0.75rem',
                        }}>
                            {group.group}
                        </div>
                        {group.items.map((ep) => (
                            <EndpointRow
                                key={ep.id}
                                ep={ep}
                                accessToken={accessToken}
                                refreshToken={refreshToken}
                                onTokensUpdated={handleTokensUpdated}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
