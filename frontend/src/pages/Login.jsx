import { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Lock, Droplets, ShieldCheck, MapPin, Globe } from 'lucide-react';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useContext(AuthContext);
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const res = await login(username, password);
        if (!res.success) {
            setError(res.error || 'Invalid credentials. Please try again.');
        }
        setIsLoading(false);
    };

    const demoAccounts = [
        { label: '🟢 Field Agent', user: 'field1', pass: 'field123' },
        { label: '🔵 Supervisor', user: 'supervisor1', pass: 'super123' },
        { label: '🔴 Admin', user: 'admin', pass: 'admin123' },
    ];

    const features = [
        { icon: <ShieldCheck size={18} />, text: 'GPS-verified field readings' },
        { icon: <Droplets size={18} />, text: 'Real-time water level monitoring' },
        { icon: <MapPin size={18} />, text: '6 Tamil Nadu dam sites active' },
    ];

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '20px' }}>
            <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '920px', display: 'flex', overflow: 'hidden', padding: 0 }}>

                {/* Visual Side Panel */}
                <div className="login-side-panel" style={{ flex: 1, background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.35), rgba(99, 102, 241, 0.45))', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px', borderRight: '1px solid var(--glass-border)' }}>
                    <div style={{ marginBottom: '24px' }}>
                        <img src="/assets/logo.png" alt="Hydrosecure Logo" style={{ width: 90, height: 90, objectFit: 'contain', filter: 'drop-shadow(0px 4px 20px rgba(14,165,233,0.5))' }} />
                    </div>
                    <h1 style={{ fontSize: '2.4rem', lineHeight: '1.2', marginBottom: '16px', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                        Water Security.<br /><span className="text-gradient">Engineered.</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.7', marginBottom: '32px' }}>
                        Hydrosecure is the premium standard for real-time dam and water level monitoring across India.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {features.map((f, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                                <span style={{ color: 'var(--primary)', flexShrink: 0 }}>{f.icon}</span>
                                {f.text}
                            </div>
                        ))}
                    </div>
                    
                    <div style={{ marginTop: '40px' }}>
                        <button 
                            type="button" 
                            onClick={() => navigate('/')}
                            className="btn btn-secondary" 
                            style={{ padding: '12px 24px', fontSize: '0.95rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', display: 'inline-flex', gap: '8px' }}
                        >
                            <Globe size={18} /> View Public Dashboard
                        </button>
                    </div>
                </div>

                {/* Login Form Side */}
                <div style={{ flex: 1, padding: '48px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div className="animate-pulse-glow" style={{ margin: '0 auto 24px', width: '64px', height: '64px', borderRadius: '18px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Lock color="white" size={30} />
                    </div>
                    <h2 style={{ marginBottom: '6px', fontSize: '1.6rem' }}>{t('login_title')}</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '0.9rem' }}>Welcome back. Please enter your credentials.</p>

                    <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
                        <div className="input-group">
                            <label style={{ fontWeight: 500 }}>{t('username')}</label>
                            <input
                                type="text"
                                className="input-control w-full"
                                placeholder="e.g. admin"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group" style={{ marginTop: '4px' }}>
                            <label style={{ fontWeight: 500 }}>{t('password')}</label>
                            <input
                                type="password"
                                className="input-control w-full"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <div className="badge badge-danger" style={{ marginBottom: '12px', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px 16px', borderRadius: '10px' }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary w-full" disabled={isLoading} style={{ marginTop: '20px', padding: '14px', fontSize: '1rem' }}>
                            {isLoading ? '⏳ Authenticating...' : t('login_btn')}
                        </button>
                    </form>

                    {/* Demo Accounts */}
                    <div style={{ marginTop: '32px', borderTop: '1px solid var(--glass-border)', paddingTop: '24px' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Demo Accounts</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {demoAccounts.map(acc => (
                                <button
                                    key={acc.user}
                                    type="button"
                                    onClick={() => { setUsername(acc.user); setPassword(acc.pass); }}
                                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 14px', color: 'var(--text-muted)', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }}
                                    onMouseOver={e => e.currentTarget.style.background = 'rgba(14,165,233,0.1)'}
                                    onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                                >
                                    <span>{acc.label}</span>
                                    <span style={{ fontFamily: 'monospace', opacity: 0.6 }}>{acc.user} / {acc.pass}</span>
                                </button>
                            ))}
                        </div>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '10px', opacity: 0.6 }}>Click any account to auto-fill credentials</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

