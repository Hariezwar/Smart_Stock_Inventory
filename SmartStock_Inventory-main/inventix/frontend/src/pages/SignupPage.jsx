import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function SignupPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '', securityQuestion: '', securityAnswer: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password.length < 8) {
      toast('Password must be at least 8 characters long.', 'error');
      return;
    }

    if (form.password !== form.confirm) {
      toast('Passwords do not match.', 'error');
      return;
    }

    // Security question is optional
    if (form.securityQuestion && !form.securityAnswer) {
      toast('Security answer is required if you provide a question.', 'error');
      return;
    }

    if (!form.securityQuestion && form.securityAnswer) {
      toast('Security question is required if you provide an answer.', 'error');
      return;
    }

    setLoading(true);
    try {
      await register(form.username, form.email, form.password, form.securityQuestion || null, form.securityAnswer || null);
      toast('Account created. Please sign in.', 'success');
      navigate('/login');
    } catch (err) {
      toast(err?.response?.data?.detail || 'Registration failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const change = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="min-h-screen app-shell flex items-center justify-center p-6">
      <div className="surface-strong w-full max-w-xl rounded-[2.5rem] p-6 sm:p-8 lg:p-10">
        <Logo className="w-14 h-14" textColor="text-[color:var(--text)]" />
        <div className="eyebrow mt-8">Create Workspace Access</div>
        <h1 className="mt-3 text-3xl font-bold text-[color:var(--text)]">Create your Inventix account</h1>
        <p className="mt-2 text-sm text-[color:var(--muted)]">Set up your workspace and optionally enable 2FA for added security.</p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-[color:var(--text)] mb-2">Username</label>
            <input
              type="text"
              required
              value={form.username}
              onChange={change('username')}
              className="input-shell w-full rounded-2xl px-4 py-3 text-sm"
              placeholder="Choose a username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[color:var(--text)] mb-2">Email address</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={change('email')}
              className="input-shell w-full rounded-2xl px-4 py-3 text-sm"
              placeholder="you@example.com"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-[color:var(--text)] mb-2">Password</label>
              <input
                type={showPass ? 'text' : 'password'}
                required
                minLength={8}
                value={form.password}
                onChange={change('password')}
                className="input-shell w-full rounded-2xl px-4 py-3 text-sm"
                placeholder="Minimum 8 characters"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[color:var(--text)] mb-2">Confirm password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={form.confirm}
                  onChange={change('confirm')}
                  className="input-shell w-full rounded-2xl px-4 py-3 pr-12 text-sm"
                  placeholder="Repeat your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-[color:var(--muted)] hover:text-[color:var(--text)]"
                >
                  {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[color:var(--text)] mb-2">Security Question (Optional)</label>
            <input
              type="text"
              value={form.securityQuestion}
              onChange={change('securityQuestion')}
              className="input-shell w-full rounded-2xl px-4 py-3 text-sm"
              placeholder="e.g., What is your favorite color?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[color:var(--text)] mb-2">Security Answer (Optional)</label>
            <input
              type="password"
              value={form.securityAnswer}
              onChange={change('securityAnswer')}
              className="input-shell w-full rounded-2xl px-4 py-3 text-sm"
              placeholder="Your answer (case insensitive)"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-medium disabled:opacity-70">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : 'Create account'}
          </button>
        </form>

        <div className="mt-8 border-t border-[color:var(--line)] pt-6 text-sm text-[color:var(--muted)]">
          Already have an account? <Link to="/login" className="font-medium text-[#1A3D63] hover:text-[#0A1931]">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
