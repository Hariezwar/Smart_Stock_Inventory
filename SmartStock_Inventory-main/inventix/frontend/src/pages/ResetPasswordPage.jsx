import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import * as authService from '../services/authService';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import Logo from '../components/Logo';
import { useToast } from '../context/ToastContext';
export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const isConfirmMode = Boolean(token);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const successMessage = useMemo(() => (
    isConfirmMode
      ? 'Your password has been updated. You can sign in with the new password.'
      : `If an account exists for ${email}, a reset link will arrive shortly.`
  ), [email, isConfirmMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isConfirmMode) {
      if (password.length < 8) {
        toast('Password must be at least 8 characters long', 'error');
        return;
      }
      if (password !== confirmPassword) {
        toast('Passwords do not match', 'error');
        return;
      }
    }

    setLoading(true);
    try {
      if (isConfirmMode) {
        await authService.resetPasswordConfirm({ token, new_password: password });
      } else {
        await authService.resetPassword({ email: email.trim().toLowerCase() });
      }
      setSent(true);
    } catch (error) {
      if (isConfirmMode) {
        toast(error.response?.data?.detail || 'Reset link is invalid or expired', 'error');
      } else {
        toast(error.response?.data?.detail || 'Could not send reset email', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen app-shell flex items-center justify-center p-6">
      <div className="surface-strong w-full max-w-lg rounded-[2.5rem] p-6 sm:p-8 lg:p-10">
        <Logo className="w-14 h-14" textColor="text-[color:var(--text)]" />
        <div className="eyebrow mt-8">Recovery</div>
        <h1 className="mt-3 text-3xl font-bold text-[color:var(--text)]">
          {isConfirmMode ? 'Choose a new password' : 'Reset your password'}
        </h1>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          {isConfirmMode ? 'Enter a new password for your account.' : 'We will send a reset link if the email exists in the workspace.'}
        </p>

        {sent ? (
          <div className="mt-8 surface rounded-[2rem] p-6 text-center">
            <CheckCircle className="w-12 h-12 text-[#1A3D63] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[color:var(--text)]">{isConfirmMode ? 'Password updated' : 'Check your email'}</h2>
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              {isConfirmMode ? successMessage : <>If an account exists for <strong className="text-[color:var(--text)]">{email}</strong>, a reset link will arrive shortly.</>}
            </p>
            <Link to="/login" className="btn-secondary mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-medium">
              <ArrowLeft className="w-4 h-4" /> Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <Link to="/login" className="mt-8 inline-flex items-center gap-2 text-sm text-[color:var(--muted)] hover:text-[color:var(--text)]">
              <ArrowLeft className="w-4 h-4" /> Back to sign in
            </Link>
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              {isConfirmMode ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[color:var(--text)] mb-2">New password</label>
                    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input-shell w-full rounded-2xl px-4 py-3 text-sm" placeholder="Minimum 8 characters" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[color:var(--text)] mb-2">Confirm password</label>
                    <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-shell w-full rounded-2xl px-4 py-3 text-sm" placeholder="Repeat your new password" />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-[color:var(--text)] mb-2">Email address</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-shell w-full rounded-2xl px-4 py-3 text-sm" placeholder="you@example.com" />
                </div>
              )}
              <button type="submit" disabled={loading} className="btn-primary flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-medium disabled:opacity-70">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> {isConfirmMode ? 'Updating...' : 'Sending...'}</> : (isConfirmMode ? 'Update password' : 'Send reset link')}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
