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
            <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '920px', display: 'flex', overflow: 'hidden', padding: 0, position: 'relative' }}>
                {/* Decorative glows inside panel */}
                <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '50%', background: 'radial-gradient(circle, rgba(0,246,255,0.1) 0%, transparent 60%)', filter: 'blur(40px)', zIndex: 0 }} />
                <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '50%', background: 'radial-gradient(circle, rgba(93,0,255,0.1) 0%, transparent 60%)', filter: 'blur(40px)', zIndex: 0 }} />

                {/* Visual Side Panel */}
                <div className="login-side-panel" style={{ flex: 1, background: 'linear-gradient(135deg, rgba(0, 246, 255, 0.05), rgba(93, 0, 255, 0.1))', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px', borderRight: '1px solid var(--glass-border)', position: 'relative', zIndex: 1 }}>
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'inline-flex', padding: '12px', background: 'linear-gradient(135deg, rgba(0,246,255,0.1), rgba(93,0,255,0.1))', borderRadius: '50%', border: '1px solid rgba(0,246,255,0.3)', boxShadow: '0 0 20px rgba(0,246,255,0.2)' }}>
                            <img src="/assets/logo.png" alt="Hydrosecure Logo" style={{ width: 80, height: 80, objectFit: 'contain', filter: 'drop-shadow(0px 0px 15px rgba(0,246,255,0.6))' }} />
                        </div>
                    </div>
                    <h1 style={{ fontSize: '2.4rem', lineHeight: '1.2', marginBottom: '16px', fontWeight: 700 }} className="premium-text-glow">
                        Water Security.<br /><span className="text-gradient" style={{ fontWeight: 800 }}>Engineered.</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '32px' }}>
                        Hydrosecure is the premium standard for real-time dam and water level monitoring across India.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {features.map((f, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                                <div style={{ color: 'var(--primary)', flexShrink: 0, padding: '8px', background: 'rgba(0,246,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(0,246,255,0.2)' }}>
                                    {f.icon}
                                </div>
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
                <div style={{ flex: 1, padding: 'clamp(24px, 5vw, 48px) clamp(20px, 4vw, 40px)', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 1, boxSizing: 'border-box', width: '100%' }}>
                    <div className="animate-pulse-glow" style={{ margin: '0 auto 24px', width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(0,246,255,0.2), rgba(93,0,255,0.2))', border: '1px solid rgba(0,246,255,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 0 20px rgba(0,246,255,0.3)' }}>
                        <Lock color="var(--primary)" size={28} />
                    </div>
                    <h2 style={{ marginBottom: '6px', fontSize: 'clamp(1.2rem, 4vw, 1.6rem)', fontWeight: 600 }}>{t('login_title')}</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '0.95rem' }}>Welcome back. Please enter your credentials.</p>

                    <form onSubmit={handleLogin} style={{ textAlign: 'left', width: '100%' }}>
                        <div className="input-group">
                            <label style={{ fontWeight: 500, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)' }}>{t('username')}</label>
                            <input
                                type="text"
                                className="input-control w-full"
                                placeholder="e.g. admin"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', width: '100%', boxSizing: 'border-box' }}
                                required
                            />
                        </div>
                        <div className="input-group" style={{ marginTop: '8px' }}>
                            <label style={{ fontWeight: 500, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)' }}>{t('password')}</label>
                            <input
                                type="password"
                                className="input-control w-full"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', width: '100%', boxSizing: 'border-box' }}
                                required
                            />
                        </div>

                        {error && (
                            <div className="badge badge-danger" style={{ marginBottom: '12px', marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px 16px', borderRadius: '12px', boxShadow: '0 0 15px rgba(239, 68, 68, 0.3)', width: '100%', boxSizing: 'border-box' }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary w-full" disabled={isLoading} style={{ marginTop: '24px', padding: '16px', fontSize: '1.05rem', boxShadow: '0 0 20px rgba(0,246,255,0.4)', borderRadius: '12px', width: '100%', boxSizing: 'border-box' }}>
                            {isLoading ? '⏳ Authenticating...' : t('login_btn')}
                        </button>
                    </form>

                    {/* Demo Accounts */}
                    <div style={{ marginTop: '32px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px', width: '100%' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Demo Accounts</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {demoAccounts.map(acc => (
                                <button
                                    key={acc.user}
                                    type="button"
                                    onClick={() => { setUsername(acc.user); setPassword(acc.pass); }}
                                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', width: '100%', boxSizing: 'border-box' }}
                                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(0,246,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(0,246,255,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                                    onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'translateY(0)' }}
                                >
                                    <span style={{ fontWeight: 500, color: 'white' }}>{acc.label}</span>
                                    <span style={{ fontFamily: 'monospace', opacity: 0.8, color: 'var(--primary)', maxWidth: '50%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{acc.user} /*</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

