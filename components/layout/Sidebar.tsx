'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  Receipt,
  Truck,
  Calculator,
  ShieldCheck,
  User,
  ChevronRight
} from 'lucide-react';

export type UserRole = 'admin' | 'accountant' | 'sales';

interface SidebarProps {
  currentRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'accountant', 'sales'],
  },
  {
    name: 'POS Register',
    href: '/pos',
    icon: ShoppingCart,
    roles: ['admin', 'sales'],
  },
  {
    name: 'Quotations',
    href: '/sales/quotations',
    icon: FileText,
    roles: ['admin', 'sales', 'accountant'],
  },
  {
    name: 'Invoices',
    href: '/accounting/invoices',
    icon: Receipt,
    roles: ['admin', 'accountant', 'sales'],
  },
  {
    name: 'Delivery Slips',
    href: '/sales/delivery-slips',
    icon: Truck,
    roles: ['admin', 'sales', 'accountant'],
  },
  {
    name: 'Accounting',
    href: '/accounting',
    icon: Calculator,
    roles: ['admin', 'accountant'],
  },
  {
    name: 'Admin Panel',
    href: '/admin',
    icon: ShieldCheck,
    roles: ['admin'],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole = 'admin',
  onRoleChange,
}) => {
  const pathname = usePathname();

  const filteredNav = navItems.filter((item) =>
    item.roles.includes(currentRole)
  );

  return (
    <aside className="w-64 min-h-screen bg-[#0F172A] text-slate-200 flex flex-col justify-between p-4 shadow-xl border-r border-slate-800">
      <div>
        {/* Logo / Header */}
        <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-slate-800">
          <div className="w-9 h-9 rounded-lg bg-[#2563EB] flex items-center justify-center font-bold text-white shadow-md">
            ERP
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-wide">Enterprise ERP</h1>
            <p className="text-xs text-slate-400 capitalize">{currentRole} Workspace</p>
          </div>
        </div>

        {/* Role Switcher for Interactive Verification */}
        {onRoleChange && (
          <div className="mb-6 p-3 bg-slate-900/80 rounded-lg border border-slate-800">
            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              Simulate User Role:
            </label>
            <div className="grid grid-cols-3 gap-1">
              {(['admin', 'accountant', 'sales'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => onRoleChange(r)}
                  className={`text-xs py-1.5 px-2 rounded font-medium transition-all ${
                    currentRole === r
                      ? 'bg-[#2563EB] text-white shadow'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1, 5)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="space-y-1">
          {filteredNav.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname?.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-900/30 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-white/80" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer */}
      <div className="pt-4 border-t border-slate-800 flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
            <User className="w-4 h-4 text-slate-300" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-200">User Session</p>
            <p className="text-[10px] text-slate-400 capitalize">{currentRole} Account</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
