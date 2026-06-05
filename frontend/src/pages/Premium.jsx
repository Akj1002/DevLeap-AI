import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';


const S = {
  bg:              '#131319',
  surface:         '#1f1f26',
  surfaceHigh:     '#2a2930',
  surfaceHighest:  '#35343b',
  surfaceLow:      '#1b1b21',
  surfaceLowest:   '#0e0e14',
  primary:         '#adc6ff',
  primaryCont:     '#4d8eff',
  secondary:       '#d0bcff',
  secondaryCont:   '#571bc1',
  tertiary:        '#4ae176',
  error:           '#ffb4ab',
  text:            '#e4e1ea',
  textSub:         '#c2c6d6',
  outline:         '#8c909f',
  outlineVar:      '#424754',
  onPrimary:       '#002e6a',
};

export default function Premium() {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  // Checkout Form State
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0); // 0: connecting, 1: authenticating, 2: finalizing
  const [isSuccess, setIsSuccess] = useState(false);
  const [userBadges, setUserBadges] = useState([]);
  
  const canvasRef = useRef(null);
  const userId = localStorage.getItem('devleap_user_id');

  // Load user data to check if already premium
  useEffect(() => {
    if (!userId) return;
    const fetchUserProgress = async () => {
      try {
        const res = await axios.get(`/api/users/${userId}/progress`);
        if (res.data && res.data.badges) {
          setUserBadges(res.data.badges);
        }
      } catch (err) {
        console.error('Failed to load user progress for premium state', err);
      }
    };
    fetchUserProgress();
  }, [userId]);

  const isAlreadyPremium = userBadges.includes('Premium Pro');

  // Confetti Particle Effect on Canvas
  useEffect(() => {
    if (!isSuccess || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = [S.primary, S.secondary, '#a7f3d0', '#f59e0b', S.error, '#06b6d4'];
    const particles = [];
    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        r: Math.random() * 6 + 4,
        d: Math.random() * canvas.height,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.random() * 10 - 5,
        tiltAngleIncremental: Math.random() * 0.07 + 0.02,
        tiltAngle: 0,
        speed: Math.random() * 3 + 2
      });
    }

    let animationFrameId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, idx) => {
        p.tiltAngle += p.tiltAngleIncremental;
        p.y += p.speed;
        p.x += Math.sin(p.tiltAngle) * 0.5;
        p.tilt = Math.sin(p.tiltAngle - idx/3) * 15;

        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        ctx.stroke();

        // Recycle particles
        if (p.y > canvas.height) {
          particles[idx] = {
            ...p,
            x: Math.random() * canvas.width,
            y: -20,
            tilt: Math.random() * 10 - 5,
            speed: Math.random() * 3 + 2
          };
        }
      });
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isSuccess]);

  const handleCardNumberChange = (e) => {
    // Format card number with spaces every 4 digits
    let val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let matches = val.match(/\d{4,16}/g);
    let match = (matches && matches[0]) || '';
    let parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(' '));
    } else {
      setCardNumber(val);
    }
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (val.length >= 2) {
      setCardExpiry(val.substring(0, 2) + '/' + val.substring(2, 4));
    } else {
      setCardExpiry(val);
    }
  };

  const openCheckout = (plan) => {
    if (plan.id === 'free') {
      toast.info('You are already on the Free tier.');
      return;
    }
    if (isAlreadyPremium) {
      toast.info('You already have a Premium Pro subscription!');
      return;
    }
    if (!userId) {
      toast.error('Please log in to upgrade your subscription.');
      navigate('/auth');
      return;
    }
    setSelectedPlan(plan);
    setShowCheckout(true);
  };

  const submitPayment = async (e) => {
    e.preventDefault();
    if (!cardName.trim()) return toast.error('Enter Cardholder Name');
    if (cardNumber.replace(/\s/g, '').length < 16) return toast.error('Enter valid 16-digit card number');
    if (cardExpiry.length < 5) return toast.error('Enter expiry date (MM/YY)');
    if (cardCvc.length < 3) return toast.error('Enter 3-digit CVC');

    setIsProcessing(true);
    setProcessingStep(0);

    // Simulate payment steps
    const timer1 = setTimeout(() => setProcessingStep(1), 1000);
    const timer2 = setTimeout(() => setProcessingStep(2), 2200);

    const finalizePayment = async () => {
      try {
        const res = await axios.post('/api/users/upgrade', { userId });
        if (res.data) {
          setIsProcessing(false);
          setIsSuccess(true);
          toast.success('Payment accepted! You are now a PRO member! 🎉');
          // Add custom badge to local user storage
          const currentBadges = JSON.parse(localStorage.getItem('devleap_user_badges') || '[]');
          if (!currentBadges.includes('Premium Pro')) {
            currentBadges.push('Premium Pro');
            localStorage.setItem('devleap_user_badges', JSON.stringify(currentBadges));
          }
        }
      } catch (err) {
        setIsProcessing(false);
        console.error(err);
        toast.error('Stripe mock validation failed or network error occurred.');
      }
    };

    const timer3 = setTimeout(finalizePayment, 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  };

  const PLANS = [
    {
      id: 'free',
      name: 'Free Tier',
      price: '$0',
      description: 'Perfect for beginners starting their technical prep coding journey.',
      features: [
        '10 daily coding problem runs',
        'Basic editor workspace & judge compiler',
        'Access to community forum boards',
        'Standard DSA sheet tracker lists'
      ],
      cta: 'Current Plan',
      color: S.outlineVar,
      highlighted: false
    },
    {
      id: 'pro',
      name: 'Pro Premium',
      price: billingCycle === 'monthly' ? '$29' : '$19',
      billing: billingCycle === 'monthly' ? '/mo' : '/mo, billed annually',
      badge: 'MOST POPULAR',
      description: 'Complete suite for candidates targeting elite tech roles.',
      features: [
        '✨ Unlimited AI Mock Interview simulations',
        '🎙️ STAR behavioral methodology evaluators',
        '🤖 Comprehensive voice and video report analytics',
        '💎 Premium Pro Profile badge & achievements',
        '📈 Detailed skills breakdown & radar tracking chart',
        '🔒 Full editorial solutions & optimal complexity tips'
      ],
      cta: isAlreadyPremium ? 'Active Plan ✓' : 'Upgrade to Pro 🚀',
      color: S.secondary,
      highlighted: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$99',
      billing: '/mo',
      description: 'Custom coaching dashboards and premium features for university teams.',
      features: [
        'Everything in Pro Premium included',
        'Custom admin coding problems creator',
        'Collaborative pair-programming workspaces',
        'SSO integration & priority SLAs',
        'Custom candidate evaluation reporting'
      ],
      cta: 'Contact Sales 📞',
      color: '#06b6d4',
      highlighted: false
    }
  ];

  // FAQ Items
  const FAQS = [
    { q: "Is this credit card charge real?", a: "No! This application is running in a mockup development sandbox. The Stripe Checkout modal accepts any simulated credit card inputs and communicates with the mock backend route to grant you free Pro status instantly." },
    { q: "Can I unlock the Admin Console with this?", a: "The Admin Console is reserved for account administrators. Once you upgrade to Pro and become a Premium Member, you can toggle your Admin status in the Settings tab or have another admin update your role via the database table." },
    { q: "What API does the AI Interview feature use?", a: "DevLeap AI utilizes the Google Gemini API with system prompts tailored specifically to conduct realistic frontend, backend, system design, and behavioral evaluations using standard industry rubrics." }
  ];

  const [activeFaq, setActiveFaq] = useState(null);

  const s = {
    wrap: { minHeight: '100vh', background: S.bg, paddingTop: '90px', paddingBottom: '80px', fontFamily: 'Inter, sans-serif', color: S.text, position: 'relative', overflow: 'hidden' },
    container: { maxWidth: '1100px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 },
    title: { fontSize: '2.8rem', fontWeight: 900, background: 'linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textAlign: 'center', marginBottom: '12px' },
    subtitle: { color: S.outline, fontSize: '1.15rem', textAlign: 'center', maxWidth: '640px', margin: '0 auto 40px', lineHeight: 1.6 },
    toggleWrap: { display: 'flex', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '4px', borderRadius: '30px', width: '260px', margin: '0 auto 48px' },
    toggleBtn: (active) => ({ flex: 1, padding: '10px 0', border: 'none', background: active ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'transparent', color: active ? '#fff' : '#64748b', fontSize: '13px', fontWeight: 700, borderRadius: '26px', cursor: 'pointer', transition: 'all 0.25s' }),
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '30px', marginBottom: '80px', alignItems: 'stretch' },
    card: (highlighted) => ({
      background: highlighted ? 'rgba(15,23,42,0.65)' : 'rgba(255,255,255,0.02)',
      border: `2px solid ${highlighted ? S.secondary : 'rgba(255,255,255,0.07)'}`,
      borderRadius: '24px',
      padding: '36px 28px',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      boxShadow: highlighted ? '0 20px 50px rgba(139,92,246,0.15)' : 'none',
      transition: 'transform 0.3s, border-color 0.3s'
    }),
    badge: { position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '6px 16px', borderRadius: '30px', letterSpacing: '1px', boxShadow: '0 4px 15px rgba(139,92,246,0.4)' },
    priceRow: { display: 'flex', alignItems: 'baseline', gap: '4px', margin: '20px 0 16px' },
    price: { fontSize: '3rem', fontWeight: 900, color: S.text },
    billingText: { color: '#64748b', fontSize: '13px', fontWeight: 500 },
    featureList: { display: 'flex', flexDirection: 'column', gap: '14px', margin: '28px 0 36px', flex: 1 },
    feature: { display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '14px', color: '#cbd5e1', lineHeight: 1.5 },
    btn: (highlighted, color) => ({
      width: '100%',
      padding: '14px 0',
      borderRadius: '12px',
      background: highlighted ? `linear-gradient(135deg, #3b82f6, #8b5cf6)` : S.surfaceHigh,
      color: '#fff',
      fontSize: '14.5px',
      fontWeight: 700,
      cursor: 'pointer',
      transition: 'all 0.2s',
      border: highlighted ? 'none' : '1px solid rgba(255,255,255,0.1)'
    }),
    faqCard: { background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden', marginBottom: '12px' },
    faqHeader: { padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.01)' },
    checkoutOverlay: { position: 'fixed', inset: 0, background: 'rgba(5,5,10,0.85)', backdropFilter: 'blur(16px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' },
    checkoutCard: { background: '#0f172a', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '24px', width: '100%', maxWidth: '440px', padding: '32px', position: 'relative', boxShadow: '0 25px 60px rgba(0,0,0,0.8)' },
    stripeInput: { background: 'rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', padding: '12px 14px', color: S.text, outline: 'none', width: '100%', boxSizing: 'border-box', fontSize: '14px', fontFamily: 'Inter, sans-serif' }
  };

  return (
    <div style={s.wrap}>
      {/* Background blobs */}
      <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.12)', filter: 'blur(80px)', top: '-10%', left: '-10%', zIndex: 1 }} />
      <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.12)', filter: 'blur(80px)', bottom: '5%', right: '-10%', zIndex: 1 }} />

      {/* Confetti canvas */}
      {isSuccess && (
        <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1001, width: '100vw', height: '100vh' }} />
      )}

      <div style={s.container}>
        <h1 style={s.title}>Elevate Your Career with DevLeap Pro 💎</h1>
        <p style={s.subtitle}>
          Master non-technical and technical interview rounds alike. Gain access to elite AI roleplay simulations, code breakdowns, and persistent telemetry tracking.
        </p>

        {/* Toggle Option */}
        <div style={s.toggleWrap}>
          <button style={s.toggleBtn(billingCycle === 'monthly')} onClick={() => setBillingCycle('monthly')}>Billed Monthly</button>
          <button style={s.toggleBtn(billingCycle === 'yearly')} onClick={() => setBillingCycle('yearly')}>Billed Annually (-20%)</button>
        </div>

        {/* Plan Grid */}
        <div style={s.grid}>
          {PLANS.map((plan) => (
            <motion.div
              key={plan.id}
              style={s.card(plan.highlighted)}
              whileHover={{ y: -6, borderColor: plan.highlighted ? '#a78bfa' : 'rgba(255,255,255,0.2)' }}
            >
              {plan.highlighted && <div style={s.badge}>{plan.badge}</div>}
              
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: S.text, marginBottom: '8px' }}>{plan.name}</h3>
              <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.5 }}>{plan.description}</p>
              
              <div style={s.priceRow}>
                <span style={s.price}>{plan.price}</span>
                {plan.billing && <span style={s.billingText}>{plan.billing}</span>}
              </div>

              <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '12px 0' }} />

              <div style={s.featureList}>
                {plan.features.map((feature, i) => (
                  <div key={i} style={s.feature}>
                    <span style={{ color: plan.highlighted ? S.secondary : S.tertiary, fontWeight: 'bold' }}>✓</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <button
                style={s.btn(plan.highlighted, plan.color)}
                onClick={() => openCheckout(plan)}
                disabled={plan.id === 'free' || (plan.id === 'pro' && isAlreadyPremium)}
                onMouseEnter={e => {
                  if (plan.highlighted && !(plan.id === 'pro' && isAlreadyPremium)) {
                    e.currentTarget.style.filter = 'brightness(1.15)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(139,92,246,0.3)';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.filter = 'brightness(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>

        {/* FAQs */}
        <div style={{ maxWidth: '700px', margin: '0 auto 40px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, textAlign: 'center', marginBottom: '28px' }}>Frequently Asked Questions ❓</h2>
          {FAQS.map((faq, i) => (
            <div key={i} style={s.faqCard}>
              <div style={s.faqHeader} onClick={() => setActiveFaq(activeFaq === i ? null : i)}>
                <span style={{ fontWeight: 700, fontSize: '0.98rem', color: S.text }}>{faq.q}</span>
                <span style={{ color: S.outlineVar, transition: 'transform 0.2s', transform: activeFaq === i ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
              </div>
              <AnimatePresence>
                {activeFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ padding: '0 24px 20px', color: S.outline, fontSize: '0.9rem', lineHeight: 1.6, borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '16px' }}>
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Stripe checkout modal overlay */}
      <AnimatePresence>
        {showCheckout && (
          <div style={s.checkoutOverlay}>
            <motion.div
              style={s.checkoutCard}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              {/* Close Button */}
              {!isProcessing && !isSuccess && (
                <button
                  onClick={() => setShowCheckout(false)}
                  style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'none', color: S.outlineVar, fontSize: '18px', cursor: 'pointer' }}
                >
                  ✕
                </button>
              )}

              {!isSuccess ? (
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: S.text, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>💳</span> Stripe Mock Checkout
                  </h2>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '24px' }}>
                    Simulating safe transaction for <strong style={{ color: '#cbd5e1' }}>{selectedPlan?.name}</strong>. Enter any placeholder card credentials.
                  </p>

                  <form onSubmit={submitPayment}>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: S.outline, fontWeight: 600, marginBottom: '6px' }}>Cardholder Name</label>
                      <input
                        style={s.stripeInput}
                        type="text"
                        placeholder="e.g. Grace Hopper"
                        value={cardName}
                        onChange={e => setCardName(e.target.value)}
                        disabled={isProcessing}
                        required
                      />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: S.outline, fontWeight: 600, marginBottom: '6px' }}>Card Number</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          style={{ ...s.stripeInput, paddingRight: '48px' }}
                          type="text"
                          maxLength="19"
                          placeholder="4242 4242 4242 4242"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          disabled={isProcessing}
                          required
                        />
                        <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px' }}>💳</span>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: S.outline, fontWeight: 600, marginBottom: '6px' }}>Expiration</label>
                        <input
                          style={s.stripeInput}
                          type="text"
                          maxLength="5"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          disabled={isProcessing}
                          required
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: S.outline, fontWeight: 600, marginBottom: '6px' }}>CVC</label>
                        <input
                          style={s.stripeInput}
                          type="text"
                          maxLength="3"
                          placeholder="123"
                          value={cardCvc}
                          onChange={e => setCardCvc(e.target.value.replace(/[^0-9]/g, ''))}
                          disabled={isProcessing}
                          required
                        />
                      </div>
                    </div>

                    {isProcessing ? (
                      <div style={{ textAlign: 'center', padding: '10px 0' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid rgba(139,92,246,0.2)', borderTopColor: S.secondary, margin: '0 auto 12px', animation: 'spin 0.8s linear infinite' }} />
                        <span style={{ fontSize: '13.5px', color: S.outline, fontWeight: 500 }}>
                          {processingStep === 0 && 'Connecting with Stripe secure gateway...'}
                          {processingStep === 1 && 'Authorizing transaction funds...'}
                          {processingStep === 2 && 'Activating lifetime Pro access...'}
                        </span>
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                      </div>
                    ) : (
                      <button
                        type="submit"
                        style={{
                          width: '100%',
                          padding: '14px 0',
                          border: 'none',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: '#fff',
                          fontSize: '15px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Authorize & Pay {selectedPlan?.price}
                      </button>
                    )}
                  </form>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1.1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                    style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '2px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '32px', color: '#10b981' }}
                  >
                    ✓
                  </motion.div>
                  
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: S.text, marginBottom: '8px' }}>Payment Approved!</h2>
                  <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '24px' }}>
                    Welcome to <strong style={{ color: S.secondary }}>DevLeap Pro</strong>. Your account has been upgraded successfully, and your premium developer dashboard features are now active.
                  </p>

                  <button
                    onClick={() => {
                      setShowCheckout(false);
                      setIsSuccess(false);
                      setCardName('');
                      setCardNumber('');
                      setCardExpiry('');
                      setCardCvc('');
                      // Redirect to profile to see the new badge!
                      navigate('/profile');
                      window.location.reload();
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 0',
                      borderRadius: '10px',
                      background: S.surfaceHigh,
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: S.text,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Go to Profile 👤
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
