import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Users, BarChart2, BellRing, ClipboardList, Settings } from 'lucide-react';
import clsx from 'clsx';
import Logo from './Logo';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Products', path: '/products', icon: Package },
  { name: 'Suppliers', path: '/suppliers', icon: Users },
  { name: 'Analytics', path: '/analytics', icon: BarChart2 },
  { name: 'Alerts', path: '/alerts', icon: BellRing },
  { name: 'Purchase History', path: '/purchase-history', icon: ClipboardList },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar({ isOpen, closeSidebar }) {
  return (
    <div className={clsx(
      "surface-strong fixed inset-y-0 left-0 z-50 w-72 border-r transform transition-transform duration-300 ease-in-out text-[color:var(--text)]",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )} onClick={closeSidebar}>
      <div className="px-6 py-6 border-b border-[color:var(--line)]">
        <div className="flex items-center gap-3">
          <Logo className="w-11 h-11" textColor="text-[color:var(--text)]" />
        </div>
      </div>
      <nav className="p-4 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  "group flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-[linear-gradient(135deg,rgba(74,127,167,0.16),rgba(26,61,99,0.12))] text-[color:var(--text)] border border-[rgba(74,127,167,0.28)] shadow-sm"
                    : "text-[color:var(--muted)] hover:text-[color:var(--text)] hover:bg-white/40 dark:hover:bg-white/5"
                )
              }
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/50 dark:bg-white/5 border border-[color:var(--line)] group-hover:border-[color:var(--line-strong)]">
                <Icon className="w-4 h-4" />
              </span>
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
