import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { ArrowLeft } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            return setError('Please enter a valid email address.');
        }
        if (!password) {
            return setError('Password is required.');
        }

        try {
            await authService.login({ email, password });
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Check your credentials.');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">

                <button onClick={() => navigate('/')} className="auth-back-link">
                    <ArrowLeft size={15} /> Back to home
                </button>

                <h2 className="auth-title">Sign in to your account</h2>

                <div className="auth-card">
                    {error && (
                        <div style={{
                            marginBottom: '1.25rem', background: '#fef2f2',
                            border: '1px solid #fecaca', borderRadius: '0.5rem',
                            padding: '0.875rem 1rem'
                        }}>
                            <p style={{ fontSize: '0.875rem', color: '#b91c1c' }}>{error}</p>
                        </div>
                    )}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="auth-form-group">
                            <label className="label">Email address</label>
                            <input type="email" required className="input-field" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="auth-form-group">
                            <label className="label">Password</label>
                            <input type="password" required className="input-field" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '0.875rem' }}>Sign in</button>
                    </form>

                    <div className="auth-divider"><span>Don't have an account?</span></div>
                    <div className="auth-footer-link"><Link to="/register">Create a new account</Link></div>
                </div>
            </div>
        </div>
    );
};

export default Login;
