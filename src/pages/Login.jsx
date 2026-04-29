import React, { useState } from 'react';
import { apiService } from '../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await apiService.login(email, password);
            window.location.href = '/dashboard';
        } catch (err) {
            setError(err.response?.data?.message || 'Identifiants incorrects');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#F3F4F6', fontFamily: 'Inter, sans-serif'
        }}>
            <div style={{
                width: 380, padding: 40, background: '#fff', borderRadius: 16,
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                textAlign: 'center'
            }}>
                <div style={{
                    width: 64, height: 64, background: '#1A3A6B', borderRadius: 16,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', margin: '0 auto 20px', fontSize: 24, fontWeight: 800
                }}>
                    S
                </div>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1F2937', marginBottom: 8 }}>SIGDA v2.0</h1>
                <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 32 }}>Système Intégré de Gestion de Distribution</p>

                <form onSubmit={handleSubmit}>
                    <div style={{ textAlign: 'left', marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #D1D5DB',
                                fontSize: 14, outline: 'none', transition: 'border-color 0.2s'
                            }}
                            placeholder="votre@email.com"
                        />
                    </div>
                    <div style={{ textAlign: 'left', marginBottom: 24 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Mot de passe</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #D1D5DB',
                                fontSize: 14, outline: 'none'
                            }}
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div style={{ 
                            padding: 10, background: '#FEE2E2', color: '#991B1B', borderRadius: 8, 
                            fontSize: 12, marginBottom: 16, fontWeight: 500 
                        }}>
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{
                            width: '100%', padding: '12px', background: '#1A3A6B', color: '#fff',
                            border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                            transition: 'background 0.2s'
                        }}
                    >
                        {loading ? 'Connexion en cours...' : 'Se connecter'}
                    </button>
                </form>

                <div style={{ marginTop: 32, fontSize: 12, color: '#9CA3AF' }}>
                    © 2026 SIGDA Distribution. Tous droits réservés.
                </div>
            </div>
        </div>
    );
};

export default Login;
