import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google'; // 🌟 NEW

const AuthPage = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleStandardSubmit = async (e) => {
        e.preventDefault();
        if (!isLogin && name) localStorage.setItem('devleap_custom_name', name);

        try {
            const res = await axios.post('/api/users/init', {
                username: isLogin ? null : name, 
                email: email,
                password: password
            });
            localStorage.setItem('devleap_user_id', res.data.user._id);
            navigate('/tracker');
        } catch (err) {
            const serverError = err.response?.data?.error;
            alert(`Authentication Failed:\n\n${serverError || err.message}`);
        }
    };

    // 🌟 NEW: Handle successful Google login
    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const res = await axios.post('/api/users/google', {
                credential: credentialResponse.credential
            });
            
            localStorage.setItem('devleap_user_id', res.data.user._id);
            localStorage.setItem('devleap_custom_name', res.data.user.username);
            navigate('/tracker');
        } catch (err) {
            console.error("Google Auth Failed to hit backend", err);
            alert("Google Sign-In failed on the server.");
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '50px 40px', borderRadius: '24px', width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', color: 'white', textAlign: 'center' }}>
                <h1 style={{ margin: '0 0 10px 0', fontSize: '2.5rem', fontWeight: 900 }}>Dev<span style={{ color: '#3b82f6' }}>Leap</span></h1>
                <p style={{ color: '#94a3b8', marginBottom: '30px', fontSize: '1.1rem' }}>Welcome back, developer.</p>

                {/* 🌟 NEW: Google Login Button */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                    <GoogleLogin 
                        onSuccess={handleGoogleSuccess} 
                        onError={() => console.log('Google Login Failed')} 
                        theme="filled_black"
                        shape="pill"
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                    <div style={{ flex: 1, height: '1px', background: '#334155' }}></div>
                    <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 'bold' }}>OR CONTINUE WITH EMAIL</span>
                    <div style={{ flex: 1, height: '1px', background: '#334155' }}></div>
                </div>

                <form onSubmit={handleStandardSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {!isLogin && (
                        <div style={{ textAlign: 'left' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8' }}>FULL NAME</label>
                            <input type="text" required onChange={(e) => setName(e.target.value)} value={name} style={{ width: '100%', padding: '14px', background: 'rgba(0,0,0,0.2)', border: '1px solid #334155', borderRadius: '12px', color: 'white', marginTop: '8px', outline: 'none' }} placeholder="John Doe" />
                        </div>
                    )}
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8' }}>EMAIL</label>
                        <input type="email" required onChange={(e) => setEmail(e.target.value)} value={email} style={{ width: '100%', padding: '14px', background: 'rgba(0,0,0,0.2)', border: '1px solid #334155', borderRadius: '12px', color: 'white', marginTop: '8px', outline: 'none' }} placeholder="you@university.edu" />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8' }}>PASSWORD</label>
                        <input type="password" required onChange={(e) => setPassword(e.target.value)} value={password} style={{ width: '100%', padding: '14px', background: 'rgba(0,0,0,0.2)', border: '1px solid #334155', borderRadius: '12px', color: 'white', marginTop: '8px', outline: 'none' }} placeholder="••••••••" />
                    </div>
                    
                    <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', padding: '15px', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
                        {isLogin ? 'Sign In to Workspace' : 'Create Account'}
                    </button>
                </form>

                <p style={{ marginTop: '25px', color: '#94a3b8' }}>
                    {isLogin ? "New here? " : "Already have an account? "}
                    <span onClick={() => setIsLogin(!isLogin)} style={{ color: '#3b82f6', fontWeight: 'bold', cursor: 'pointer' }}>
                        {isLogin ? 'Create Account' : 'Sign In'}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default AuthPage;