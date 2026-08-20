import React, { useState, useEffect } from 'react';
import { 
  Search, Bell, Plus, Calendar, X, WifiOff, Globe
} from 'lucide-react';
import { DateFilterRange, NotificationItem } from '../../types';
import { dbStore } from '../../services/db';
import { useLanguage } from '../../context/LanguageContext';
import { MountainLogoSVG } from '../common/Logo';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  currency: 'MAD' | 'EUR' | 'USD';
  setCurrency: (c: 'MAD' | 'EUR' | 'USD') => void;
  dateRange: DateFilterRange;
  setDateRange: (d: DateFilterRange) => void;
  onQuickAction: (actionType: 'reservation' | 'client' | 'motorcycle') => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  currency,
  setCurrency,
  dateRange,
  setDateRange,
  onQuickAction,
}) => {
  const { t, language, setLanguage } = useLanguage();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    dbStore.getCollection<NotificationItem>('notifications') || []
  );

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const safeNotifications = notifications || [];
  const unreadCount = safeNotifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    const updated = safeNotifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    dbStore.saveCollection('notifications', updated);
  };

  return (
    <div className="sticky top-0 z-30 flex flex-col w-full">
      {/* Offline Alert Banner */}
      {isOffline && (
        <div className="bg-amber-600/90 text-amber-95 px-4 py-1.5 text-xs font-bold text-center flex items-center justify-center gap-2 border-b border-amber-500/50 backdrop-blur-md animate-pulse">
          <WifiOff className="w-4 h-4 shrink-0 text-white" />
          <span>{t('common.offline_notice')}</span>
        </div>
      )}

      <header className="flex items-center justify-between h-16 md:h-20 px-3 md:px-6 bg-[#1C1C1C]/95 border-b border-[#2D2D2D] backdrop-blur-md">
        {/* Mobile Logo Brand Header (Visible only on mobile) */}
        <div className="flex md:hidden items-center gap-2 shrink-0 mr-1">
          <MountainLogoSVG className="w-8 h-7 text-[#D4A017]" />
          <span className="font-black text-sm tracking-wider text-white">
            MOTO<span className="text-[#D4A017]">NOMAD</span>
          </span>
        </div>

        {/* Global Search Bar (Desktop Always, Mobile Toggle) */}
        <div className={`${showMobileSearch ? 'flex absolute inset-x-2 z-50 bg-[#1C1C1C] p-2 rounded-xl border border-[#3D3D3D]' : 'hidden md:flex'} relative items-center w-full max-w-md`}>
          <Search className="absolute left-3.5 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('common.search_placeholder')}
            className="w-full pl-10 pr-8 py-2 md:py-2.5 rounded-xl bg-[#262626] border border-[#333333] text-xs md:text-sm text-[#F4F4F2] placeholder-zinc-500 focus:outline-none focus:border-[#D4A017] transition-all"
            autoFocus={showMobileSearch}
          />
          {(searchQuery || showMobileSearch) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setShowMobileSearch(false);
              }}
              className="absolute right-3 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Controls: Language Switcher, Currency, Date Filter, Quick Add, Notifications */}
        <div className="flex items-center gap-1.5 md:gap-3 ml-auto">
          {/* Mobile Search Button */}
          <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="md:hidden p-2 rounded-xl bg-[#262626] border border-[#333333] text-zinc-300 hover:text-white"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Bilingual Language Switcher Button [ 🇫🇷 FR | 🇬🇧 EN ] */}
          <div className="flex items-center bg-[#262626] border border-[#333333] rounded-xl p-0.5 md:p-1 text-[11px] md:text-xs font-bold">
            <button
              onClick={() => setLanguage('fr')}
              className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 ${
                language === 'fr'
                  ? 'bg-[#D4A017] text-[#1C1C1C] font-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Français"
            >
              <span>🇫🇷</span>
              <span className="hidden sm:inline">FR</span>
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 ${
                language === 'en'
                  ? 'bg-[#D4A017] text-[#1C1C1C] font-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="English"
            >
              <span>🇬🇧</span>
              <span className="hidden sm:inline">EN</span>
            </button>
          </div>

          {/* Currency Switcher */}
          <div className="flex items-center bg-[#262626] border border-[#333333] rounded-xl p-0.5 md:p-1 text-[11px] md:text-xs font-bold">
            {(['MAD', 'EUR', 'USD'] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`px-1.5 sm:px-2.5 py-1 rounded-lg transition-colors ${
                  currency === c 
                    ? 'bg-[#D4A017] text-[#1C1C1C]' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Date Filter (Desktop) */}
          <div className="hidden lg:flex items-center gap-2 bg-[#262626] border border-[#333333] px-3 py-1.5 rounded-xl text-xs font-semibold text-[#F4F4F2]">
            <Calendar className="w-3.5 h-3.5 text-[#D4A017]" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateFilterRange)}
              className="bg-transparent text-[#F4F4F2] focus:outline-none cursor-pointer font-semibold"
            >
              <option value="today" className="bg-[#1C1C1C]">{t('common.today')}</option>
              <option value="this_week" className="bg-[#1C1C1C]">{t('common.this_week')}</option>
              <option value="this_month" className="bg-[#1C1C1C]">{t('common.this_month')}</option>
              <option value="last_month" className="bg-[#1C1C1C]">{t('common.last_month')}</option>
              <option value="this_quarter" className="bg-[#1C1C1C]">{t('common.this_quarter')}</option>
              <option value="this_year" className="bg-[#1C1C1C]">{t('common.this_year')}</option>
              <option value="all" className="bg-[#1C1C1C]">{t('common.all_time')}</option>
            </select>
          </div>

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 md:p-2.5 rounded-xl bg-[#262626] border border-[#333333] text-zinc-300 hover:text-white hover:border-[#D4A017] transition-all"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#D4A017] text-[10px] font-black text-[#1C1C1C]">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Panel */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-72 sm:w-96 bg-[#1C1C1C] border border-[#2D2D2D] rounded-2xl shadow-2xl p-4 z-50 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-[#2D2D2D] mb-3">
                  <h4 className="font-bold text-sm text-[#F4F4F2] flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#D4A017]" /> Notifications ({unreadCount})
                  </h4>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-[#D4A017] hover:underline font-semibold"
                    >
                      Tout lire
                    </button>
                  )}
                </div>
                <div className="space-y-2.5 max-h-80 overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-zinc-500 text-center py-4">Aucune notification.</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 rounded-xl border text-xs leading-relaxed transition-colors ${
                          !n.read
                            ? 'bg-[#252525] border-[#3D3D3D] text-[#F4F4F2]'
                            : 'bg-[#181818] border-[#222222] text-zinc-400'
                        }`}
                      >
                        <div className="flex items-start justify-between font-bold mb-1">
                          <span className="text-[#D4A017]">{n.title}</span>
                          <span className="text-[10px] text-zinc-500">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p>{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Action Button */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-2.5 md:px-4 py-2 md:py-2.5 rounded-xl font-bold text-xs md:text-sm bg-[#D4A017] text-[#1C1C1C] hover:bg-[#b88a10] transition-all shadow-lg shadow-[#D4A017]/10">
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">{t('common.quick_add')}</span>
            </button>
            <div className="absolute right-0 mt-2 w-52 bg-[#1C1C1C] border border-[#2D2D2D] rounded-xl shadow-2xl p-1.5 hidden group-hover:block z-50">
              <button
                onClick={() => onQuickAction('reservation')}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-semibold text-[#F4F4F2] hover:bg-[#2A2A2A] rounded-lg transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-[#D4A017]" /> {t('common.new_reservation')}
              </button>
              <button
                onClick={() => onQuickAction('client')}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-semibold text-[#F4F4F2] hover:bg-[#2A2A2A] rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-[#D4A017]" /> {t('common.add_client')}
              </button>
              <button
                onClick={() => onQuickAction('motorcycle')}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-semibold text-[#F4F4F2] hover:bg-[#2A2A2A] rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-[#D4A017]" /> {t('common.add_motorcycle')}
              </button>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};
