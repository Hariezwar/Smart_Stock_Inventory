import React, { useState, useRef, useEffect } from 'react';
import { Menu, Search, Bell, Sun, Moon, LogOut, Settings, ChevronDown, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate, Link } from 'react-router-dom';
import * as alertService from '../services/alertService';
import * as searchService from '../services/searchService';
import Logo from './Logo';
import { getProfileImageUrl } from '../utils/profileImage';

export default function Header({ toggleSidebar }) {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const profileRef = useRef(null);
  const alertsRef = useRef(null);

  const fetchAlerts = () => {
    alertService.getAlerts()
      .then((r) => setAlerts(r.data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchAlerts();

    const intervalId = window.setInterval(fetchAlerts, 30000);
    const handleFocus = () => fetchAlerts();

    window.addEventListener('focus', handleFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  useEffect(() => {
    if (!search || search.length < 2) {
      setSearchResults(null);
      return;
    }

    const t = setTimeout(() => {
      searchService.globalSearch(search)
        .then((r) => {
          setSearchResults(r.data);
          setSearchOpen(true);
        })
        .catch(() => {});
    }, 300);

    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (alertsRef.current && !alertsRef.current.contains(e.target)) setAlertsOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    toast('Signed out successfully.', 'info');
    navigate('/login');
  };

  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : 'U';
  const profileImageUrl = getProfileImageUrl(user?.profile_image_url);

  return (
    <header className="px-4 sm:px-6 pt-4 z-40 shrink-0">
      <div className="surface-strong flex h-20 items-center justify-between rounded-[2rem] px-4 sm:px-6">
        <div className="flex items-center gap-3 mr-2 shrink-0">
          <button onClick={toggleSidebar} className="text-[color:var(--muted)] hover:text-[color:var(--text)]">
            <Menu className="w-6 h-6" />
          </button>
          <Logo className="w-10 h-10" withText={false} />
        </div>

        <div className="hidden xl:block mr-6">
        </div>

        <div className="flex-1 max-w-xl relative" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-shell w-full h-12 pl-11 pr-10 rounded-full text-sm"
              placeholder="Search products, SKUs, suppliers..."
            />
            {search && (
              <button onClick={() => { setSearch(''); setSearchResults(null); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--muted)] hover:text-[color:var(--text)]">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {searchOpen && searchResults && (
            <div className="surface-strong absolute top-14 left-0 right-0 rounded-3xl overflow-hidden z-50">
              {searchResults.products?.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold uppercase text-[color:var(--muted)] bg-white/30 dark:bg-white/5">Products</div>
                  {searchResults.products.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => { navigate('/products'); setSearchOpen(false); setSearch(''); }}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/30 dark:hover:bg-white/5 text-left transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-[color:var(--text)]">{p.name}</p>
                        <p className="text-xs text-[color:var(--muted)]">{p.sku} · {p.category}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.status === 'Optimal' ? 'bg-[#1A3D63] text-[#F6FAFD] dark:bg-[#1A3D63]/80 dark:text-[#F6FAFD]' : p.status === 'Critical' ? 'bg-[#0A1931] text-[#F6FAFD] dark:bg-[#081225] dark:text-[#F6FAFD]' : p.status === 'Overstock' ? 'bg-[#4A7FA7] text-[#F6FAFD] dark:bg-[#1A3D63] dark:text-[#F6FAFD]' : 'bg-[#1A3D63] text-[#F6FAFD] dark:bg-[#4A7FA7]/70 dark:text-[#F6FAFD]'}`}>{p.status}</span>
                    </button>
                  ))}
                </div>
              )}
              {searchResults.suppliers?.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold uppercase text-[color:var(--muted)] bg-white/30 dark:bg-white/5">Suppliers</div>
                  {searchResults.suppliers.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => { navigate('/suppliers'); setSearchOpen(false); setSearch(''); }}
                      className="w-full flex items-center px-4 py-3 hover:bg-white/30 dark:hover:bg-white/5 text-left transition-colors"
                    >
                      <p className="text-sm font-medium text-[color:var(--text)]">{s.name}</p>
                    </button>
                  ))}
                </div>
              )}
              {!searchResults.products?.length && !searchResults.suppliers?.length && (
                <div className="px-4 py-6 text-center text-sm text-[color:var(--muted)]">No results found for "{search}"</div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 ml-4">
          <button onClick={toggleTheme} className="surface-muted p-2.5 text-[color:var(--muted)] hover:text-[color:var(--text)] rounded-full transition-colors">
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="relative" ref={alertsRef}>
            <button onClick={() => setAlertsOpen(!alertsOpen)} className="surface-muted relative p-2.5 text-[color:var(--muted)] hover:text-[color:var(--text)] rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              {alerts.length > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {alerts.length > 9 ? '9+' : alerts.length}
                </span>
              )}
            </button>
            {alertsOpen && (
              <div className="surface-strong absolute right-0 top-14 w-80 rounded-3xl overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-[color:var(--line)] flex items-center justify-between">
                  <span className="font-semibold text-[color:var(--text)] text-sm">Notifications</span>
                  <span className="text-xs text-[color:var(--muted)]">{alerts.length} alerts</span>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {alerts.length === 0 ? (
                    <p className="text-center text-sm py-6 text-[color:var(--muted)]">All clear. No alerts.</p>
                  ) : alerts.map((a, i) => (
                    <div key={i} className="px-4 py-3 hover:bg-white/30 dark:hover:bg-white/5 border-b border-[color:var(--line)] last:border-0">
                      <p className="text-sm font-medium text-[color:var(--text)]">{a.severity === 'Critical' ? 'Critical' : 'Low stock'} · {a.product_name}</p>
                      <p className="text-xs mt-0.5 text-[color:var(--muted)]">{a.message}</p>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-[color:var(--line)]">
                  <Link to="/alerts" onClick={() => setAlertsOpen(false)} className="text-xs text-[#1A3D63] hover:text-[#0A1931] font-medium">View all alerts →</Link>
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={profileRef}>
            <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-3 pl-2 hover:opacity-80 transition-opacity">
              <div className="hidden md:block text-right">
                <div className="text-sm font-medium text-[color:var(--text)]">{user?.username}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-[linear-gradient(135deg,#4a7fa7_0%,#1a3d63_55%,#0a1931_100%)] flex items-center justify-center text-white text-xs font-bold shadow overflow-hidden">
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt={`${user?.username || 'User'} profile`} className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <ChevronDown className="w-4 h-4 text-[color:var(--muted)] hidden sm:block" />
            </button>
            {profileOpen && (
              <div className="surface-strong absolute right-0 top-14 w-56 rounded-3xl overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-[color:var(--line)]">
                  <p className="font-semibold text-[color:var(--text)] text-sm">{user?.username}</p>
                  <p className="text-xs truncate text-[color:var(--muted)]">{user?.email}</p>
                </div>
                <Link to="/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-[color:var(--text)] hover:bg-white/30 dark:hover:bg-white/5 transition-colors">
                  <Settings className="w-4 h-4" /> Settings
                </Link>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50/70 dark:hover:bg-red-900/10 transition-colors">
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
