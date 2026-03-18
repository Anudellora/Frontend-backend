import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            api.get('/auth/me')
                .then(({ data }) => {
                    setUser(data);
                    localStorage.setItem('userRole', data.role || 'user');
                })
                .catch(() => {
                    localStorage.clear();
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('userRole', data.user.role || 'user');
        setUser(data.user);
        return data.user;
    };

    const register = async (email, first_name, last_name, password, role = 'user') => {
        const { data } = await api.post('/auth/register', { email, first_name, last_name, password, role });
        return data;
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
    };

    const refreshTokens = async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('Нет refresh-токена');
        const { data } = await api.post('/auth/refresh', null, {
            headers: { 'x-refresh-token': refreshToken },
        });
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        return data;
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, register, refreshTokens }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
