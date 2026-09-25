import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, setCredentials } from '../slices/authSlice';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import toast from 'react-hot-toast';
import './AuthPage.css';

// ── Validation schemas ────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// ── Left-panel stats ─────────────────────────────────────────────────────────
const stats = [
  { icon: '🛡️', label: 'Bank-grade security & ID verification' },
  { icon: '⭐', label: '4.9 avg rating from 2M+ bookings' },
  { icon: '✅', label: 'Insured work & punctuality guarantee' },
];

// ── Component ────────────────────────────────────────────────────────────────
export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector(state => state.auth);

  // 'customer' | 'worker'
  const [role, setRole] = useState('customer');
  // 'login' | 'register'
  const [mode, setMode] = useState(searchParams.get('mode') === 'register' ? 'register' : 'login');
  const [showPassword, setShowPassword] = useState(false);

  const schema = mode === 'login' ? loginSchema : registerSchema;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const switchMode = (newMode) => {
    setMode(newMode);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      if (mode === 'login') {
        const result = await dispatch(login({ ...data, role })).unwrap();
        toast.success('Welcome back!');
        navigate(role === 'worker' ? '/worker/dashboard' : '/customer/search');
      } else {
        // Register
        const res = await axios.post('http://localhost:5000/api/v1/auth/register', { ...data, role });
        dispatch(setCredentials(res.data.data));
        toast.success('Account created! Welcome to TrustNest 🎉');
        navigate(role === 'worker' ? '/worker/dashboard' : '/customer/search');
      }
    } catch (err) {
      toast.error(err?.message || err || 'Something went wrong');
    }
  };

  return (
    <div className="auth-root">
      {/* ── LEFT PANEL ── */}
      <div className="auth-left">
        {/* Overlay gradient */}
        <div className="auth-left-overlay" />

        {/* Logo */}
        <Link to="/" className="auth-logo">
          <div className="auth-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
              <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z"
                fill="#F59E0B" stroke="#F59E0B" strokeWidth="0.5" strokeLinejoin="round" />
              <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="auth-logo-text">TrustNest</span>
        </Link>

        {/* Hero copy */}
        <div className="auth-left-content">
          <h2 className="auth-hero-heading">
            Help at home,<br />
            <span className="auth-hero-highlight">people you can trust.</span>
          </h2>
          <p className="auth-hero-sub">
            Join millions who book verified professionals with upfront pricing and total peace of mind.
          </p>

          <div className="auth-stats-list">
            {stats.map((s, i) => (
              <div key={i} className="auth-stat-item">
                <span className="auth-stat-icon">{s.icon}</span>
                <span className="auth-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Floating trust card */}
        <div className="auth-float-card">
          <div className="auth-float-avatars">
            <img src="https://i.pravatar.cc/40?img=47" alt="User" className="auth-float-av" />
            <img src="https://i.pravatar.cc/40?img=32" alt="User" className="auth-float-av" />
            <img src="https://i.pravatar.cc/40?img=12" alt="User" className="auth-float-av" />
          </div>
          <div className="auth-float-text">
            <span className="auth-float-stars">★★★★★</span>
            <span className="auth-float-label">2M+ happy customers</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="auth-right">
        <div className="auth-form-card">
          {/* Header */}
          <div className="auth-form-header">
            <h1 className="auth-form-title">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="auth-form-subtitle">
              {mode === 'login'
                ? 'Log in to manage your bookings.'
                : 'Sign up to book trusted pros near you.'}
            </p>
          </div>

          {/* Role toggle */}
          <div className="auth-role-toggle">
            <button
              type="button"
              className={`auth-role-btn ${role === 'customer' ? 'active' : ''}`}
              onClick={() => setRole('customer')}
              id="role-customer"
            >
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
                <path d="M4 20c0-3.31 3.58-6 8-6s8 2.69 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              I need a service
            </button>
            <button
              type="button"
              className={`auth-role-btn ${role === 'worker' ? 'active' : ''}`}
              onClick={() => setRole('worker')}
              id="role-worker"
            >
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              I am a pro
            </button>
          </div>

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
            {mode === 'register' && (
              <div className="auth-field-wrap">
                <div className="auth-input-wrap">
                  <svg className="auth-input-icon" viewBox="0 0 24 24" fill="none" width="17" height="17">
                    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
                    <path d="M4 20c0-3.31 3.58-6 8-6s8 2.69 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <input
                    id="auth-name"
                    type="text"
                    className={`auth-input ${errors.name ? 'error' : ''}`}
                    placeholder="Full name"
                    autoComplete="name"
                    {...register('name')}
                  />
                </div>
                {errors.name && <p className="auth-error">{errors.name.message}</p>}
              </div>
            )}

            <div className="auth-field-wrap">
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" viewBox="0 0 24 24" fill="none" width="17" height="17">
                  <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                  <path d="M2 8l10 6 10-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                  id="auth-email"
                  type="email"
                  className={`auth-input ${errors.email ? 'error' : ''}`}
                  placeholder="Email address"
                  autoComplete="email"
                  {...register('email')}
                />
              </div>
              {errors.email && <p className="auth-error">{errors.email.message}</p>}
            </div>

            <div className="auth-field-wrap">
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" viewBox="0 0 24 24" fill="none" width="17" height="17">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.36 11.5 19.79 19.79 0 011.3 2.88 2 2 0 013.28 1h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L7.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0121 16.92z"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <input
                  id="auth-phone"
                  type="tel"
                  className={`auth-input ${errors.phone ? 'error' : ''}`}
                  placeholder="Phone number"
                  autoComplete="tel"
                  {...register('phone')}
                />
              </div>
              {errors.phone && <p className="auth-error">{errors.phone.message}</p>}
            </div>

            <div className="auth-field-wrap">
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" viewBox="0 0 24 24" fill="none" width="17" height="17">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  className={`auth-input ${errors.password ? 'error' : ''}`}
                  placeholder="Password"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  {...register('password')}
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword(p => !p)}
                  aria-label="Toggle password"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                      <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" strokeWidth="2" />
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="auth-error">{errors.password.message}</p>}
            </div>

            {mode === 'register' && (
              <div className="auth-field-wrap">
                <div className="auth-input-wrap">
                  <svg className="auth-input-icon" viewBox="0 0 24 24" fill="none" width="17" height="17">
                    <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <input
                    id="auth-confirm-password"
                    type="password"
                    className={`auth-input ${errors.confirmPassword ? 'error' : ''}`}
                    placeholder="Confirm password"
                    autoComplete="new-password"
                    {...register('confirmPassword')}
                  />
                </div>
                {errors.confirmPassword && <p className="auth-error">{errors.confirmPassword.message}</p>}
              </div>
            )}

            {mode === 'login' && (
              <div className="auth-forgot-row">
                <Link to="/forgot-password" className="auth-forgot-link">Forgot password?</Link>
              </div>
            )}

            <button
              type="submit"
              id="auth-submit-btn"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="auth-spinner" />
              ) : (
                <>
                  {mode === 'login' ? 'Continue' : 'Create Account'}
                  <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Switch mode */}
          <p className="auth-switch-text">
            {mode === 'login' ? (
              <>Don't have an account?{' '}
                <button type="button" className="auth-switch-link" onClick={() => switchMode('register')}>Sign up</button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button type="button" className="auth-switch-link" onClick={() => switchMode('login')}>Log in</button>
              </>
            )}
          </p>

          {/* Divider + social */}
          <div className="auth-divider">
            <span />
            <span className="auth-divider-text">or continue with</span>
            <span />
          </div>

          <div className="auth-social-row">
            <button type="button" className="auth-social-btn" id="auth-google-btn">
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              Google
            </button>
            <button type="button" className="auth-social-btn" id="auth-apple-btn">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              Apple
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
