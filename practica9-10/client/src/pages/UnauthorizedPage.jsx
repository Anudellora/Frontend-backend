import { Link } from 'react-router-dom';

export default function UnauthorizedPage() {
    return (
        <div className="page">
            <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚫</div>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Доступ запрещён</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    У вас недостаточно прав для доступа к этой странице.
                </p>
                <Link to="/" className="btn btn-primary">
                    ← Вернуться на главную
                </Link>
            </div>
        </div>
    );
}
