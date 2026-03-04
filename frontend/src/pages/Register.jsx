import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { ArrowLeft } from 'lucide-react';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const usernameRegex = /^[a-zA-Z0-9_\s]{3,20}$/;
        if (!username || !usernameRegex.test(username)) {
            return setError('Username must be 3–20 characters long.');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            return setError('Please enter a valid email address.');
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W]{8,}$/;
        if (!password || !passwordRegex.test(password)) {
            return setError('Password must be at least 8 characters, with 1 uppercase and 1 number.');
        }

        try {
            await authService.register({ username, email, password });
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">

                <button onClick={() => navigate('/')} className="auth-back-link">
                    <ArrowLeft size={15} /> Back to home
                </button>

                <h2 className="auth-title">Create a new account</h2>

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
                            <label className="label">Username</label>
                            <input type="text" required className="input-field" placeholder="e.g. john_doe" value={username} onChange={(e) => setUsername(e.target.value)} />
                        </div>
                        <div className="auth-form-group">
                            <label className="label">Email address</label>
                            <input type="email" required className="input-field" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="auth-form-group">
                            <label className="label">Password</label>
                            <input type="password" required className="input-field" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Min 8 characters, 1 uppercase, 1 number.</p>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '0.875rem' }}>Create Account</button>
                    </form>

                    <div className="auth-divider"><span>Already have an account?</span></div>
                    <div className="auth-footer-link"><Link to="/login">Sign in instead</Link></div>
                </div>
            </div>
        </div>
    );
};

export default Register;
