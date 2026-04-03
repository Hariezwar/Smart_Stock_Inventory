import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import * as authService from '../services/authService';
import api, { getStoredToken } from '../services/api';
import API_BASE from '../config/api';
const AuthContext = createContext();
const TOKEN_KEY = 'inventix_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => getStoredToken());
  const [loading, setLoading] = useState(true);

  // Axios interceptor to always send the token
  useEffect(() => {
    const attachToken = (config) => {
      const t = getStoredToken();
      if (t) config.headers.Authorization = `Bearer ${t}`;
      return config;
    };

    const apiInterceptor = api.interceptors.request.use(attachToken);
    const axiosInterceptor = axios.interceptors.request.use(attachToken);

    return () => {
      api.interceptors.request.eject(apiInterceptor);
      axios.interceptors.request.eject(axiosInterceptor);
    };
  }, []);

  // Load current user on mount
  useEffect(() => {
    const t = getStoredToken();
    if (t) {
      authService.getMe()
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.removeItem(TOKEN_KEY);
          sessionStorage.removeItem(TOKEN_KEY);
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password, securityAnswer = null, rememberMe = true) => {
    const form = new URLSearchParams();
    form.append('username', username.trim());
    form.append('password', password);
    
    if (securityAnswer) {
      form.append('security_answer', securityAnswer);
    }
    
    // We slightly refactor to just pass the `data` depending on how authService handles it or directly use the api instance locally, but we defined `authService.login(data, headers)`
    const res = await authService.login(form, { 'Content-Type': 'application/x-www-form-urlencoded' });
    
    if (res.data.requires_security_question) {
      return res.data;
    }
    
    const { access_token } = res.data;
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(TOKEN_KEY, access_token);
    setToken(access_token);
    
    const me = await authService.getMe();
    setUser(me.data);
    return me.data;
  };

  const register = async (username, email, password, securityQuestion = null, securityAnswer = null) => {
    const data = {
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password,
    };
    if (securityQuestion && securityAnswer) {
      data.security_question = securityQuestion.trim();
      data.security_answer = securityAnswer;
    }
    const res = await authService.register(data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (updates) => {
    const res = await authService.updateProfile(updates);
    setUser(res.data);
    return res.data;
  };

  const uploadAvatar = async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await authService.uploadAvatar(formData, { 'Content-Type': 'multipart/form-data' });
    setUser(res.data);
    return res.data;
  };

  const setupSecurityQuestion = async (question, answer) => {
    const res = await authService.setupSecurityQuestion({
      question: question.trim(),
      answer,
    });
    setUser(res.data);
    return res.data;
  };

  const disableSecurityQuestion = async (answer) => {
    const res = await authService.disableSecurityQuestion({ answer });
    setUser(res.data);
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile, uploadAvatar, setupSecurityQuestion, disableSecurityQuestion, API_BASE }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
