import React from 'react';

const AuthForm = ({ authMode, setAuthMode, onSubmit }) => {
  const inputStyle = { padding: '12px', borderRadius: '6px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155' };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ textAlign: 'center', color: '#38bdf8', marginBottom: '10px' }}>
        {authMode === 'login' ? 'Welcome Back' : authMode === 'signup' ? 'Create Account' : 'Reset Password'}
      </h2>
      
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        {authMode === 'signup' && <input type="text" placeholder="Full Name" required style={inputStyle} />}
        <input type="email" placeholder="Email Address" required style={inputStyle} />
        {authMode !== 'forgot' && <input type="password" placeholder="Password" required style={inputStyle} />}
        <button type="submit" style={{ padding: '12px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: authMode === 'forgot' ? '#ef4444' : '#38bdf8', color: authMode === 'forgot' ? 'white' : '#0f172a' }}>
          {authMode === 'login' ? 'Log In' : authMode === 'signup' ? 'Sign Up' : 'Send Reset Link'}
        </button>
      </form>

      <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {authMode === 'login' && (
          <>
            <span onClick={() => setAuthMode('signup')} style={{ color: '#94a3b8', cursor: 'pointer' }}>New here? <span style={{ color: '#38bdf8' }}>Sign up</span></span>
            <span onClick={() => setAuthMode('forgot')} style={{ color: '#ef4444', cursor: 'pointer' }}>Forgot Password?</span>
          </>
        )}
        {authMode === 'signup' && <span onClick={() => setAuthMode('login')} style={{ color: '#94a3b8', cursor: 'pointer' }}>Already have an account? <span style={{ color: '#38bdf8' }}>Log in</span></span>}
        {authMode === 'forgot' && <span onClick={() => setAuthMode('login')} style={{ color: '#38bdf8', cursor: 'pointer' }}>Back to Login</span>}
      </div>
    </div>
  );
};
export default AuthForm;