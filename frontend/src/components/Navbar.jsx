import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const userName = localStorage.getItem('devleap_custom_name') || 'Dev';
  const userInitial = userName.charAt(0).toUpperCase();
  const userId = localStorage.getItem('devleap_user_id');

  const [userRole, setUserRole] = useState('user');
  const [badges, setBadges] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/users/${userId}/progress`)
      .then(r => r.json())
      .then(data => {
        if (data) {
          setUserRole(data.role || 'user');
          setBadges(data.badges || []);
          setHistory(data.history || []);
        }
      })
      .catch(() => {});
  }, [userId]);

  const navLinks = [
    { label: 'Problems',     path: '/tracker' },
    { label: 'Interview AI', path: '/interview' },
    { label: 'Roadmaps',     path: '/roadmaps' },
    { label: 'Contests',     path: '/contests' },
    { label: 'Hackathons',   path: '/hackathons' },
    { label: 'Community',    path: '/discuss' },
  ];

  const dropdownItems = [
    { label: 'My Profile',      icon: 'account_circle', action: () => navigate('/profile') },
    { label: 'Dashboard',       icon: 'dashboard',      action: () => navigate('/dashboard') },
    { label: 'Resume Builder',  icon: 'description',    action: () => navigate('/resume-builder') },
    { label: 'Study Plans',     icon: 'menu_book',      action: () => navigate('/study-plans') },
    { label: 'Behavioral Prep', icon: 'mic',            action: () => navigate('/behavioral') },
    { label: 'Jobs Board',      icon: 'work',           action: () => navigate('/jobs') },
    { label: 'Mentorship',      icon: 'school',         action: () => navigate('/mentorship') },
    { label: 'Code Review',     icon: 'code',           action: () => navigate('/code-review') },
    { label: 'Project Showcase',icon: 'integration_instructions', action: () => navigate('/showcase') },
    { label: 'Habit Tracker',   icon: 'task_alt',       action: () => navigate('/habit-tracker') },
    { label: 'Interview Exps',  icon: 'rate_review',    action: () => navigate('/experiences') },
    { label: 'Live Classes',    icon: 'live_tv',        action: () => navigate('/live-classes') },
    { label: 'Code Racing',     icon: 'sports_score',   action: () => navigate('/code-racing') },
    { label: 'Peer Interviews', icon: 'groups',         action: () => navigate('/peer-interviews') },
    { label: 'AI Pair Prog',    icon: 'smart_toy',      action: () => navigate('/ai-pair') },
    { label: 'Settings',        icon: 'settings',       action: () => navigate('/settings') },
  ];

  if (!badges.includes('Premium Pro')) {
    dropdownItems.splice(5, 0, { label: 'Upgrade to Pro', icon: 'workspace_premium', action: () => navigate('/premium') });
  }
  if (userRole === 'admin') {
    dropdownItems.push({ label: 'Admin Panel', icon: 'admin_panel_settings', action: () => navigate('/admin') });
  }

  const notifications = history.length > 0 
    ? history.slice(-3).reverse().map((h, i) => ({
        id: h._id || i,
        text: `You solved "${h.questionId?.title || 'a problem'}"! 🔥`,
        time: h.solvedAt ? new Date(h.solvedAt).toLocaleDateString() : 'Recently',
        unread: true
      }))
    : [
        { id: 1, text: 'Welcome to DevLeap! Start your first problem.', time: 'Just now', unread: true },
        { id: 2, text: 'DevAI is ready to assist you.', time: 'Just now', unread: true }
      ];

  const unreadCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/auth');
    setDropdownOpen(false);
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: '64px', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px',
      background: 'rgba(19,19,25,0.8)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      fontFamily: 'Inter, sans-serif',
    }}>

      {/* ── LEFT: Logo + Nav Links ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>

        {/* Logo */}
        <div
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}
        >
          <span style={{ fontSize: '20px', lineHeight: 1 }}>⚡</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '1px', fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px' }}>
            <span style={{ color: '#e4e1ea' }}>DEV</span>
            <span style={{
              background: 'linear-gradient(135deg, #adc6ff, #d0bcff)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>LEAP</span>
          </div>
        </div>

        {/* Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          {navLinks.map(link => (
            <div key={link.path} style={{ position: 'relative' }}>
              <button
                onClick={() => navigate(link.path)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '8px 14px', fontSize: '14px', fontWeight: 500,
                  fontFamily: 'Inter, sans-serif',
                  color: isActive(link.path) ? '#adc6ff' : '#c2c6d6',
                  borderBottom: isActive(link.path) ? '2px solid #adc6ff' : '2px solid transparent',
                  paddingBottom: '6px',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => { if (!isActive(link.path)) e.currentTarget.style.color = '#e4e1ea'; }}
                onMouseLeave={e => { if (!isActive(link.path)) e.currentTarget.style.color = '#c2c6d6'; }}
              >
                {link.label}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT: Search + Actions + Avatar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

        {/* Search Bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: searchFocused ? '#2a2930' : '#1f1f26',
          border: searchFocused ? '1px solid rgba(173,198,255,0.4)' : '1px solid rgba(255,255,255,0.08)',
          borderRadius: '9999px',
          padding: '6px 14px',
          transition: 'all 0.2s',
          minWidth: '220px',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#8c909f' }}>search</span>
          <input
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search problems..."
            style={{
              background: 'none', border: 'none', outline: 'none',
              color: '#e4e1ea', fontSize: '13px', fontFamily: 'Inter, sans-serif',
              width: '160px',
            }}
          />
        </div>

        {/* Upgrade to Pro button */}
        {userId && !badges.includes('Premium Pro') && (
          <button
            onClick={() => navigate('/premium')}
            style={{
              background: 'rgba(173,198,255,0.12)',
              border: '1px solid rgba(173,198,255,0.25)',
              borderRadius: '9999px',
              color: '#adc6ff',
              padding: '6px 16px',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              transition: 'all 0.2s',
              textTransform: 'uppercase',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(173,198,255,0.2)'; e.currentTarget.style.borderColor = 'rgba(173,198,255,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(173,198,255,0.12)'; e.currentTarget.style.borderColor = 'rgba(173,198,255,0.25)'; }}
          >
            Upgrade to Pro
          </button>
        )}

        {/* Bolt / AI quick button */}
        <IconBtn icon="bolt" onClick={() => navigate('/interview')} />

        {/* Notification Bell */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <IconBtn icon="notifications" onClick={() => { setNotifOpen(!notifOpen); setDropdownOpen(false); }} badge={unreadCount > 0 ? unreadCount : null} />
          {notifOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 10px)', right: 0,
              width: '320px',
              background: 'rgba(31,31,38,0.98)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px', overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)', zIndex: 1100,
            }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#e4e1ea' }}>Notifications</span>
                <span style={{ fontSize: '11px', color: '#adc6ff', cursor: 'pointer' }}>Mark all read</span>
              </div>
              {notifications.map(n => (
                <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#adc6ff', marginTop: '5px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '12.5px', color: '#c2c6d6', lineHeight: 1.5 }}>{n.text}</div>
                    <div style={{ fontSize: '11px', color: '#8c909f', marginTop: '3px' }}>{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Avatar + Dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false); }}
            style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #adc6ff 0%, #d0bcff 100%)',
              border: dropdownOpen ? '2px solid rgba(173,198,255,0.6)' : '2px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: '14px', fontWeight: 800, color: '#002e6a',
              boxShadow: dropdownOpen ? '0 0 0 3px rgba(173,198,255,0.2)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            {userInitial}
          </button>

          {dropdownOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 10px)', right: 0,
              width: '224px',
              background: 'rgba(31,31,38,0.98)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px', overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)', zIndex: 1100,
            }}>
              {/* Header */}
              <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(173,198,255,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#e4e1ea' }}>{userName}</span>
                  {badges.includes('Premium Pro') && (
                    <span style={{ background: 'rgba(173,198,255,0.15)', color: '#adc6ff', fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(173,198,255,0.25)', letterSpacing: '0.08em' }}>PRO</span>
                  )}
                </div>
                <div style={{ fontSize: '12px', color: '#8c909f', marginTop: '2px' }}>
                  {userRole === 'admin' ? 'Administrator' : 'devleap member'}
                </div>
              </div>

              {/* Items */}
              <div style={{ padding: '6px 0' }}>
                <div style={{ padding: '4px 16px', fontSize: '11px', fontWeight: 700, color: '#8c909f', textTransform: 'uppercase' }}>Ecosystem</div>
                <button onClick={() => { navigate('/bounties'); setDropdownOpen(false); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
                    color: '#c2c6d6', fontSize: '13.5px', fontWeight: 500,
                    fontFamily: 'Inter, sans-serif', textAlign: 'left', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#e4e1ea'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#c2c6d6'; }}
                >
                  💰 Bounties
                </button>
                <button onClick={() => { navigate('/guilds'); setDropdownOpen(false); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
                    color: '#c2c6d6', fontSize: '13.5px', fontWeight: 500,
                    fontFamily: 'Inter, sans-serif', textAlign: 'left', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#e4e1ea'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#c2c6d6'; }}
                >
                  🛡️ Guilds
                </button>
                <button onClick={() => { navigate('/system-design'); setDropdownOpen(false); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
                    color: '#c2c6d6', fontSize: '13.5px', fontWeight: 500,
                    fontFamily: 'Inter, sans-serif', textAlign: 'left', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#e4e1ea'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#c2c6d6'; }}
                >
                  📐 System Design
                </button>
                {dropdownItems.map(item => (
                  <button key={item.label}
                    onClick={() => { item.action(); setDropdownOpen(false); }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
                      color: '#c2c6d6', fontSize: '13.5px', fontWeight: 500,
                      fontFamily: 'Inter, sans-serif', textAlign: 'left', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#e4e1ea'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#c2c6d6'; }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#8c909f' }}>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>

              <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '2px 0' }} />

              {/* Logout */}
              <button onClick={handleLogout}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
                  color: '#c2c6d6', fontSize: '13.5px', fontWeight: 500,
                  fontFamily: 'Inter, sans-serif', textAlign: 'left', transition: 'all 0.15s',
                  marginBottom: '4px',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,180,171,0.06)'; e.currentTarget.style.color = '#ffb4ab'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#c2c6d6'; }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#8c909f' }}>logout</span>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

// ── Small icon button ──────────────────────────────────────
function IconBtn({ icon, onClick, badge }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', width: '34px', height: '34px', borderRadius: '8px',
        background: hovered ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: hovered ? '#adc6ff' : '#c2c6d6',
        transition: 'all 0.15s',
      }}>
      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{icon}</span>
      {badge != null && (
        <span style={{
          position: 'absolute', top: '-4px', right: '-4px',
          width: '17px', height: '17px', borderRadius: '50%',
          background: '#ffb4ab', color: '#690005',
          fontSize: '10px', fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2px solid #131319',
        }}>{badge}</span>
      )}
    </button>
  );
}

export default Navbar;