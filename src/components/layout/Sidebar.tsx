import React from 'react';
import { 
  LayoutDashboard, Users, Calendar, Bike, Wrench, Compass, 
  DollarSign, TrendingUp, ShieldCheck, Building2, Truck, 
  BarChart3, FileCode, Settings, ChevronLeft, ChevronRight, LogOut, ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { UserRole } from '../../types';
import { MountainLogoSVG } from '../common/Logo';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
}) => {
  const { user, login, logout, hasPermission } = useAuth();
  const { t } = useLanguage();

  const navItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard, module: 'dashboard' },
    { id: 'clients', label: t('nav.clients'), icon: Users, module: 'clients' },
    { id: 'reservations', label: t('nav.reservations'), icon: Calendar, module: 'reservations' },
    { id: 'fleet', label: t('nav.fleet'), icon: Bike, module: 'fleet' },
    { id: 'maintenance', label: t('nav.maintenance'), icon: Wrench, module: 'maintenance' },
    { id: 'tours', label: t('nav.tours'), icon: Compass, module: 'tours' },
    { id: 'finance', label: t('nav.finance'), icon: DollarSign, module: 'finance' },
    { id: 'investments', label: t('nav.investments'), icon: TrendingUp, module: 'investments' },
    { id: 'equipment', label: t('nav.equipment'), icon: ShieldCheck, module: 'equipment' },
    { id: 'agencies', label: t('nav.agencies'), icon: Building2, module: 'agencies' },
    { id: 'suppliers', label: t('nav.suppliers'), icon: Truck, module: 'suppliers' },
    { id: 'reports', label: t('nav.reports'), icon: BarChart3, module: 'reports' },
    { id: 'audit', label: t('nav.audit'), icon: FileCode, module: 'audit' },
    { id: 'settings', label: t('nav.settings'), icon: Settings, module: 'settings' },
  ];

  return (
    <aside
      className={`hidden md:flex relative z-30 flex-col bg-[#1C1C1C] border-r border-[#2D2D2D] text-[#F4F4F2] transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between min-h-[5.5rem] px-4 py-3 border-b border-[#2D2D2D] bg-[#141414]">
        <div className="flex items-center gap-2.5 overflow-hidden w-full">
          {collapsed ? (
            <div className="w-full flex justify-center py-1">
              <MountainLogoSVG className="w-10 h-8 text-[#D4A017]" />
            </div>
          ) : (
            <div className="flex items-center gap-3 w-full">
              <MountainLogoSVG className="w-11 h-9 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="font-black text-lg tracking-wider text-white leading-tight">
                  MOTO<span className="text-[#D4A017]">NOMAD</span>
                </span>
                <span className="text-[8.5px] font-bold text-zinc-400 tracking-[0.18em] uppercase truncate">
                  PREMIUM MOTORCYCLE RENTAL
                </span>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#2A2A2A] transition-colors shrink-0 ml-1"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 custom-scrollbar">
        {navItems.map((item) => {
          if (!hasPermission(item.module)) return null;
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 w-full px-3.5 py-3 rounded-xl font-medium text-sm transition-all group ${
                isActive
                  ? 'bg-[#D4A017] text-[#1C1C1C] font-bold shadow-md shadow-[#D4A017]/15'
                  : 'text-[#C5C6C7] hover:text-white hover:bg-[#282828]'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#1C1C1C]' : 'text-zinc-400 group-hover:text-[#D4A017]'}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </div>

      {/* Role Switcher & User Profile */}
      <div className="p-3 border-t border-[#2D2D2D] bg-[#161616] space-y-3">
        {!collapsed && user && (
          <div className="bg-[#242424] rounded-xl p-2.5 border border-[#333333]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-[#D4A017]" /> Role Switcher
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-[#D4A017]/20 text-[#D4A017] border border-[#D4A017]/40">
                {user.role}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-[11px]">
              {(['ADMIN', 'MANAGER', 'STAFF', 'ACCOUNTING'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => login(r)}
                  className={`px-2 py-1 rounded font-semibold transition-colors ${
                    user.role === r 
                      ? 'bg-[#D4A017] text-[#1C1C1C]' 
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
              alt="User Avatar"
              className="w-9 h-9 rounded-full object-cover border border-[#D4A017]/60 shrink-0"
            />
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="text-xs font-bold text-white truncate">{user?.displayName}</span>
                <span className="text-[10px] text-zinc-400 truncate">{user?.email}</span>
              </div>
            )}
          </div>
          <button
            onClick={logout}
            className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
