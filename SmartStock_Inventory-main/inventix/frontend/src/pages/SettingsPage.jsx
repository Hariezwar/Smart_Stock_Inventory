import React, { useEffect, useMemo, useState } from 'react';
import { Camera, Loader2, Lock, Save, Shield, User } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getProfileImageUrl } from '../utils/profileImage';

export default function SettingsPage() {
  const {
    user,
    updateProfile,
    uploadAvatar,
    setupSecurityQuestion,
    disableSecurityQuestion,
  } = useAuth();
  const { toast } = useToast();

  const [profileForm, setProfileForm] = useState({
    username: '',
    email: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [securityForm, setSecurityForm] = useState({
    question: '',
    answer: '',
    confirmAnswer: '',
    disableAnswer: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [securityLoading, setSecurityLoading] = useState(false);
  const [disableLoading, setDisableLoading] = useState(false);

  useEffect(() => {
    setProfileForm({
      username: user?.username || '',
      email: user?.email || '',
    });
    setSecurityForm((form) => ({
      ...form,
      question: user?.security_question || '',
    }));
  }, [user?.username, user?.email, user?.security_question]);

  const profileImageUrl = useMemo(
    () => getProfileImageUrl(user?.profile_image_url),
    [user?.profile_image_url]
  );

  const handleProfileSave = async (event) => {
    event.preventDefault();
    setProfileLoading(true);
    try {
      await updateProfile({
        username: profileForm.username,
        email: profileForm.email,
      });
      toast('Profile updated successfully!', 'success');
    } catch (err) {
      toast(err?.response?.data?.detail || 'Update failed.', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSave = async (event) => {
    event.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast('New passwords do not match.', 'error');
      return;
    }

    setPassLoading(true);
    try {
      await updateProfile({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      toast('Password changed successfully!', 'success');
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (err) {
      toast(err?.response?.data?.detail || 'Password update failed.', 'error');
    } finally {
      setPassLoading(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast('Please choose an image file.', 'error');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast('Profile image must be 5 MB or smaller.', 'error');
      event.target.value = '';
      return;
    }

    setAvatarLoading(true);
    try {
      await uploadAvatar(file);
      toast('Profile picture updated successfully!', 'success');
    } catch (err) {
      toast(err?.response?.data?.detail || 'Profile picture upload failed.', 'error');
    } finally {
      setAvatarLoading(false);
      event.target.value = '';
    }
  };

  const handleSecurityQuestionSave = async (event) => {
    event.preventDefault();
    if (securityForm.answer !== securityForm.confirmAnswer) {
      toast('Security answers do not match.', 'error');
      return;
    }

    setSecurityLoading(true);
    try {
      await setupSecurityQuestion(securityForm.question, securityForm.answer);
      toast('Security question saved successfully!', 'success');
      setSecurityForm((form) => ({
        ...form,
        answer: '',
        confirmAnswer: '',
        disableAnswer: '',
      }));
    } catch (err) {
      toast(err?.response?.data?.detail || 'Failed to save security question.', 'error');
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleDisableSecurityQuestion = async (event) => {
    event.preventDefault();
    if (!securityForm.disableAnswer.trim()) {
      toast('Enter your current security answer to disable it.', 'error');
      return;
    }

    setDisableLoading(true);
    try {
      await disableSecurityQuestion(securityForm.disableAnswer);
      toast('Security question verification disabled.', 'success');
      setSecurityForm({
        question: '',
        answer: '',
        confirmAnswer: '',
        disableAnswer: '',
      });
    } catch (err) {
      toast(err?.response?.data?.detail || 'Failed to disable security question.', 'error');
    } finally {
      setDisableLoading(false);
    }
  };

  const renderField = (label, value, onChange, type = 'text', placeholder = '') => (
    <div key={label}>
      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none transition-all"
      />
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl mx-auto relative">
      <div>
        <div className="eyebrow">Profile</div>
        <h1 className="mt-2 text-3xl font-bold text-[color:var(--text)] mb-1">Settings</h1>
        <p className="text-sm text-[color:var(--muted)]">
          Manage your account, security question, password, and profile picture.
        </p>
      </div>

      <div className="surface rounded-[2rem] p-6 flex flex-col sm:flex-row sm:items-center gap-5 text-center">
        <div className="w-20 h-20 rounded-full bg-[linear-gradient(135deg,#4a7fa7_0%,#1a3d63_55%,#0a1931_100%)] flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary-500/20 overflow-hidden shrink-0">
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              alt={`${user?.username || 'User'} profile`}
              className="w-full h-full object-cover"
            />
          ) : (
            user?.username?.slice(0, 2).toUpperCase() || 'U'
          )}
        </div>

        <div className="min-w-0">
          <p className="text-lg font-semibold text-slate-900 dark:text-white">{user?.username}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 break-all">{user?.email}</p>
        </div>

        <div className="sm:ml-auto">
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-dark-border text-sm font-medium text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-50 dark:hover:bg-dark-bg transition-colors">
            {avatarLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
            {avatarLoading ? 'Uploading...' : 'Upload photo'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
              disabled={avatarLoading}
            />
          </label>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            JPG, PNG, or WebP up to 5 MB.
          </p>
        </div>
      </div>

      <form onSubmit={handleProfileSave} className="surface rounded-[2rem] p-6 space-y-4 text-center">
        <div className="flex items-center gap-2 mb-2">
          <User className="w-4 h-4 text-[#1A3D63]" />
          <h3 className="font-semibold text-slate-900 dark:text-white">Profile Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderField('Username', profileForm.username, (value) => setProfileForm((form) => ({ ...form, username: value })), 'text', 'Your username')}
          {renderField('Email Address', profileForm.email, (value) => setProfileForm((form) => ({ ...form, email: value })), 'email', 'your@email.com')}
        </div>
        <button
          type="submit"
          disabled={profileLoading}
          className="btn-primary flex items-center gap-2 disabled:opacity-60 text-white font-medium text-sm px-5 py-2 rounded-lg transition-colors"
        >
          {profileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </form>

      <form onSubmit={handlePasswordSave} className="surface rounded-[2rem] p-6 space-y-4 text-center">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-4 h-4 text-[#1A3D63]" />
          <h3 className="font-semibold text-slate-900 dark:text-white">Change Password</h3>
        </div>
        {renderField('Current Password', passwordForm.current_password, (value) => setPasswordForm((form) => ({ ...form, current_password: value })), 'password', '********')}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderField('New Password', passwordForm.new_password, (value) => setPasswordForm((form) => ({ ...form, new_password: value })), 'password', '********')}
          {renderField('Confirm New Password', passwordForm.confirm_password, (value) => setPasswordForm((form) => ({ ...form, confirm_password: value })), 'password', '********')}
        </div>
        <button
          type="submit"
          disabled={passLoading}
          className="btn-primary flex items-center gap-2 disabled:opacity-60 text-white font-medium text-sm px-5 py-2 rounded-lg transition-colors"
        >
          {passLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
          Update Password
        </button>
      </form>

      <div className="surface rounded-[2rem] p-6 space-y-5 text-center">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#1A3D63]" />
          <h3 className="font-semibold text-slate-900 dark:text-white">Security Question Verification</h3>
        </div>

        <div className="bg-slate-50 dark:bg-dark-bg/50 p-4 rounded-xl border border-slate-100 dark:border-dark-border">
          <p className="text-sm font-medium text-slate-900 dark:text-white">
            Status: <span className={user?.two_factor_enabled ? 'text-[#1A3D63]' : 'text-slate-400'}>{user?.two_factor_enabled ? 'Enabled' : 'Disabled'}</span>
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            When enabled, users will answer their saved question after entering the correct password.
          </p>
        </div>

        <form onSubmit={handleSecurityQuestionSave} className="space-y-4">
          {renderField('Security Question', securityForm.question, (value) => setSecurityForm((form) => ({ ...form, question: value })), 'text', 'Example: What is your favorite snack?')}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField('Answer', securityForm.answer, (value) => setSecurityForm((form) => ({ ...form, answer: value })), 'password', 'Enter answer')}
            {renderField('Confirm Answer', securityForm.confirmAnswer, (value) => setSecurityForm((form) => ({ ...form, confirmAnswer: value })), 'password', 'Repeat answer')}
          </div>
          <button
            type="submit"
            disabled={securityLoading}
            className="btn-primary flex items-center gap-2 disabled:opacity-60 text-white font-medium text-sm px-5 py-2 rounded-lg transition-colors"
          >
            {securityLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            {user?.two_factor_enabled ? 'Update Security Question' : 'Enable Security Question'}
          </button>
        </form>

        {user?.two_factor_enabled && (
          <form onSubmit={handleDisableSecurityQuestion} className="pt-4 border-t border-slate-100 dark:border-dark-border space-y-4">
            {renderField('Current Answer to Disable', securityForm.disableAnswer, (value) => setSecurityForm((form) => ({ ...form, disableAnswer: value })), 'password', 'Enter current answer')}
            <button
              type="submit"
              disabled={disableLoading}
              className="px-5 py-2 rounded-lg text-sm font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
            >
              {disableLoading ? 'Disabling...' : 'Disable Security Question'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
