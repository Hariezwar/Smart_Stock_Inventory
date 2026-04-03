import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, ShieldCheck, ArrowLeft } from 'lucide-react';

import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const [showLogin, setShowLogin] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [rememberMe, setRememberMe] = useState(() => {
    const saved = localStorage.getItem('inventix_remember_me');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [showPass, setShowPass] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [needsSecurityQuestion, setNeedsSecurityQuestion] = useState(false);

  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('inventix_remember_me', JSON.stringify(rememberMe));
  }, [rememberMe]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(identifier, password, securityAnswer || undefined, rememberMe);

      if (result?.requires_security_question) {
        setNeedsSecurityQuestion(true);
        setSecurityQuestion(result.security_question || '');
        toast('Answer your security question to continue.', 'info');
      } else {
        toast('Welcome back to Inventix.', 'success');
        navigate('/dashboard');
      }
    } catch (err) {
      const isNetworkError = !err?.response;
      toast(
        isNetworkError
          ? 'Backend is not reachable. Start the API server and try again.'
          : (err?.response?.data?.detail || 'Invalid credentials. Please try again.'),
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  if (showLogin) {
    return (
      <div className="min-h-screen app-shell flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <button
            onClick={() => { setShowLogin(false); setNeedsSecurityQuestion(false); setSecurityAnswer(''); setSecurityQuestion(''); }}
            className="flex items-center gap-2 text-[color:var(--muted)] hover:text-[color:var(--text)] mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h2 className="mt-3 text-3xl font-bold text-[color:var(--text)] text-center">
            {needsSecurityQuestion ? 'Verify your access' : 'Sign in to continue'}
          </h2>
          <p className="mt-2 text-sm text-[color:var(--muted)] text-center">
            {needsSecurityQuestion ? 'Answer the question you saved for your account.' : 'Use your workspace username or email to open Inventix.'}
          </p>
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            {!needsSecurityQuestion ? (
              <>
                <div>
                  <label htmlFor="identifier" className="block text-sm font-medium text-[color:var(--text)] mb-2">Username or email</label>
                  <input
                    id="identifier"
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="input-shell w-full rounded-2xl px-4 py-3 text-sm"
                    placeholder="Enter your username or email"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-[color:var(--text)] mb-2">Password</label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPass ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-shell w-full rounded-2xl px-4 py-3 pr-12 text-sm"
                      placeholder="Enter your password"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute inset-y-0 right-0 flex items-center pr-4 text-[color:var(--muted)] hover:text-[color:var(--text)]">
                      {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-[color:var(--muted)]">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-[color:var(--line-strong)] bg-transparent"
                    />
                    Remember me
                  </label>
                  <Link to="/reset-password" className="font-medium text-[#1A3D63] hover:text-[#0A1931]">Forgot password?</Link>
                </div>
              </>
            ) : (
              <div>
                <label htmlFor="security-answer" className="block text-sm font-medium text-[color:var(--text)] mb-2">Security answer</label>
                <p className="mb-3 text-sm text-[color:var(--muted)]">{securityQuestion}</p>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1A3D63]" />
                  <input
                    id="security-answer"
                    type={showAnswer ? 'text' : 'password'}
                    required
                    autoFocus
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                    className="input-shell w-full rounded-2xl px-12 py-3 pr-12 text-sm"
                    placeholder="Enter your saved answer"
                  />
                  <button type="button" onClick={() => setShowAnswer(!showAnswer)} className="absolute inset-y-0 right-0 flex items-center pr-4 text-[color:var(--muted)] hover:text-[color:var(--text)]">
                    {showAnswer ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <button type="button" onClick={() => { setNeedsSecurityQuestion(false); setSecurityAnswer(''); setSecurityQuestion(''); }} className="mt-4 text-sm text-[color:var(--muted)] hover:text-[color:var(--text)]">
                  Return to login
                </button>
              </div>
            )}

            <button type="submit" disabled={loading || (needsSecurityQuestion && !securityAnswer.trim())} className="btn-primary flex w-full justify-center items-center gap-2 rounded-2xl py-3 text-sm font-medium disabled:opacity-70">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> {needsSecurityQuestion ? 'Verifying...' : 'Signing in...'}</> : (needsSecurityQuestion ? 'Verify answer' : 'Sign in')}
            </button>
          </form>
          {!needsSecurityQuestion && (
            <div className="mt-8 border-t border-[color:var(--line)] pt-6 text-sm text-[color:var(--muted)] text-center">
              New here? <Link to="/signup" className="font-medium text-[#1A3D63] hover:text-[#0A1931]">Create an account</Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen app-shell flex flex-col">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl">
          <div className="text-center">
            <Logo className="w-20 h-20 mx-auto" textColor="text-[color:var(--text)]" withText={false} />
            <h1 className="mt-8 text-6xl leading-[1.02] font-bold text-[color:var(--text)]">Inventix</h1>
            <div className="eyebrow mt-4">Smart Inventory OS</div>
            <p className="mt-6 max-w-2xl mx-auto text-lg leading-7 text-[color:var(--muted)]">
              Track product pressure, alerts, and reorder intent with Inventix - one interface designed to feel operational instead of generic.
            </p>
            <button
              onClick={() => setShowLogin(true)}
              className="btn-primary mt-8 px-8 py-4 text-lg font-medium rounded-2xl"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
