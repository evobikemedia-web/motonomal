import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, Bell, Plus, Calendar, X, WifiOff, Globe, ChevronDown, Bike, Users, DollarSign, FileText
} from 'lucide-react';
import { DateFilterRange, NotificationItem } from '../../types';
import { dbStore } from '../../services/db';
import { useLanguage } from '../../context/LanguageContext';
import { MountainLogoSVG } from '../common/Logo';
import { DateRangePicker } from '../common/DateRangePicker';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  currency: 'MAD' | 'EUR' | 'USD';
  setCurrency: (c: 'MAD' | 'EUR' | 'USD') => void;
  dateRange: DateFilterRange;
  setDateRange: (d: DateFilterRange) => void;
  customStartDate: string;
  setCustomStartDate: (d: string) => void;
  customEndDate: string;
  setCustomEndDate: (d: string) => void;
  onQuickAction: (actionType: 'reservation' | 'client' | 'motorcycle') => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  currency,
  setCurrency,
  dateRange,
  setDateRange,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  onQuickAction,
}) => {
  const { t, language, setLanguage } = useLanguage();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const dateFilterRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    dbStore.getCollection<NotificationItem>('notifications') || []
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dateFilterRef.current && !dateFilterRef.current.contains(e.target as Node)) {
        setShowDateFilter(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const dateOptions: { value: DateFilterRange; labelKey: string }[] = [
    { value: 'today', labelKey: 'common.today' },
    { value: 'this_week', labelKey: 'common.this_week' },
    { value: 'this_month', labelKey: 'common.this_month' },
    { value: 'last_month', labelKey: 'common.last_month' },
    { value: 'this_quarter', labelKey: 'common.this_quarter' },
    { value: 'this_year', labelKey: 'common.this_year' },
    { value: 'all', labelKey: 'common.all_time' },
  ];

  const customRangeLabel = useMemo(() => {
    const parse = (s: string) => {
      const [y, m, d] = s.split('-').map(Number);
      return new Date(y, m - 1, d);
    };
    const months = language === 'fr'
      ? ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    try {
      const sd = parse(customStartDate);
      const ed = parse(customEndDate);
      const sameMonth = sd.getMonth() === ed.getMonth() && sd.getFullYear() === ed.getFullYear();
      const sameYear = sd.getFullYear() === ed.getFullYear();
      const sStr = `${sd.getDate()} ${months[sd.getMonth()]}${!sameYear ? ' ' + sd.getFullYear() : ''}`;
      const eStr = `${ed.getDate()} ${months[ed.getMonth()]}${!sameYear ? ' ' + ed.getFullYear() : !sameMonth ? '' : ''}`;
      return `${sStr} - ${eStr}`;
    } catch {
      return t('common.custom_range');
    }
  }, [customStartDate, customEndDate, language, t]);

  const dateButtonLabel =
    dateRange === 'custom'
      ? customRangeLabel
      : dateOptions.find((o) => o.value === dateRange)
      ? t(dateOptions.find((o) => o.value === dateRange)!.labelKey)
      : dateRange;

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

  // Mock Search Results - will be filtered by searchQuery
  const mockSearchResults = useMemo(() => {
    const allResults: { 
      vehicles: Array<{ id: string; name: string; icon: React.FC<any> }>;
      clients: Array<{ id: string; name: string; icon: React.FC<any> }>;
      expenses: Array<{ id: string; name: string; icon: React.FC<any> }>;
      reports: Array<{ id: string; name: string; icon: React.FC<any> }>;
    } = {
      vehicles: [
        { id: '1', name: 'BMW R 1250 GS', icon: Bike },
        { id: '2', name: 'Yamaha Ténéré 700', icon: Bike },
        { id: '3', name: 'SYM Fiddle 50cc', icon: Bike },
        { id: '4', name: 'Honda CB500F', icon: Bike },
        { id: '5', name: 'KTM 390 Duke', icon: Bike },
      ],
      clients: [
        { id: '101', name: 'Ahmed Hassan', icon: Users },
        { id: '102', name: 'Marie Dubois', icon: Users },
        { id: '103', name: 'Carlos Rodriguez', icon: Users },
      ],
      expenses: [
        { id: '201', name: 'Fuel - May 2026', icon: DollarSign },
        { id: '202', name: 'Maintenance - April', icon: DollarSign },
        { id: '203', name: 'Insurance Premium', icon: DollarSign },
      ],
      reports: [
        { id: '301', name: 'Revenue Summary Q2', icon: FileText },
        { id: '302', name: 'Fleet Utilization Report', icon: FileText },
      ],
    };

    if (!searchQuery.trim()) return null;

    const query = searchQuery.toLowerCase();
    const filtered: { [key: string]: Array<{ id: string; name: string; icon: React.FC<any> }> } = {};

    Object.entries(allResults).forEach(([category, items]) => {
      const matches = items.filter((item) => item.name.toLowerCase().includes(query));
      if (matches.length > 0) {
        filtered[category] = matches;
      }
    });

    return Object.keys(filtered).length > 0 ? filtered : null;
  }, [searchQuery]);

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
          <Search className="absolute left-3.5 w-4 h-4 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('common.search_placeholder')}
            className="w-full pl-10 pr-10 py-2 md:py-2.5 rounded-xl bg-[#262626] border border-[#333333] text-xs md:text-sm text-[#F4F4F2] placeholder-zinc-500 focus:outline-none focus:border-[#D4A017] focus:bg-[#2A2A2A] transition-all"
            autoFocus={showMobileSearch}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-zinc-400 hover:text-white hover:bg-zinc-700/30 p-1 rounded transition-all duration-200 ease-out"
              title="Clear search"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Search Results Dropdown */}
          {mockSearchResults && (
            <div className="absolute top-full mt-2 w-full bg-[#1C1C1C] border border-zinc-800 rounded-xl shadow-2xl shadow-black/50 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="max-h-96 overflow-y-auto custom-scrollbar">
                {Object.entries(mockSearchResults).map(([category, items]: [string, any]) => (
                  <div key={category}>
                    {/* Category Header */}
                    <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#D4A017] bg-[#0F0F0F]/50">
                      {category === 'vehicles' && '🏍️ Vehicles'}
                      {category === 'clients' && '👥 Clients'}
                      {category === 'expenses' && '💰 Expenses'}
                      {category === 'reports' && '📄 Reports'}
                    </div>

                    {/* Category Items */}
                    {(items as Array<{ id: string; name: string; icon: React.FC<any> }>).map((item, idx) => {
                      const IconComponent = item.icon;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setSearchQuery('')}
                          className={`p-3 flex items-center gap-3 cursor-pointer text-gray-300 hover:bg-white/5 transition-colors ${
                            idx < items.length - 1 ? 'border-b border-zinc-800/50' : ''
                          }`}
                        >
                          <IconComponent className="w-4 h-4 text-[#D4A017] shrink-0" />
                          <span className="text-xs md:text-sm text-zinc-200">{item.name}</span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
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

          {/* Language Switcher Pill */}
          <div className="flex items-center bg-[#1C1C1C] rounded-full px-1 py-1 text-xs">
            <button
              onClick={() => setLanguage('fr')}
              className={`px-3 py-1 rounded-full transition-all ${
                language === 'fr'
                  ? 'bg-[#D4A017] text-black font-semibold shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              title="Français"
            >
              FR
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded-full transition-all ${
                language === 'en'
                  ? 'bg-[#D4A017] text-black font-semibold shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              title="English"
            >
              EN
            </button>
          </div>

          {/* Vertical Separator */}
          <div className="hidden sm:block w-px h-6 bg-white/10" />

          {/* Currency Switcher Pill */}
          <div className="shrink-0 flex items-center gap-0.5 bg-[#1C1C1C] rounded-full px-1 py-1 text-xs">
            {(['MAD', 'EUR', 'USD'] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`shrink-0 whitespace-nowrap px-2.5 py-1 rounded-full transition-all ${
                  currency === c 
                    ? 'bg-[#D4A017] text-black font-semibold shadow-sm' 
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Vertical Separator */}
          <div className="hidden lg:block w-px h-6 bg-white/10" />

          {/* Date Filter (Desktop) */}
          <div className="hidden lg:flex relative items-center" ref={dateFilterRef}>
            <button
              onClick={() => setShowDateFilter(!showDateFilter)}
              className="flex items-center gap-2 bg-[#1C1C1C] border border-zinc-700 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:border-[#D4A017]"
            >
              <Calendar className="w-3.5 h-3.5 text-[#D4A017]" />
              <span className="text-[#D4A017] whitespace-nowrap">{dateButtonLabel}</span>
              <ChevronDown className={`w-3 h-3 text-[#D4A017] transition-transform ${showDateFilter ? 'rotate-180' : ''}`} />
            </button>

            {showDateFilter && (
              <div className="absolute top-full right-0 mt-2 z-[60] w-fit shrink-0 origin-top-right animate-fadeIn">
                {dateRange !== 'custom' && (
                  <div className="w-56 bg-[#1A1A1A] border border-[#2D2D2D] rounded-xl shadow-2xl p-1.5">
                    {dateOptions.map((opt) => {
                      const isSelected = dateRange === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setDateRange(opt.value);
                            setShowDateFilter(false);
                          }}
                          className={`flex items-center w-full px-3 py-2 text-xs rounded-lg transition-colors ${
                            isSelected
                              ? 'bg-[#D4A017]/15 text-[#D4A017] font-semibold'
                              : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          {t(opt.labelKey)}
                        </button>
                      );
                    })}

                    <div className="border-t border-white/10 pt-1.5 mt-1.5">
                      <button
                        onClick={() => {
                          setDateRange('custom');
                        }}
                        className={`flex items-center gap-2 w-full px-3 py-2 text-xs rounded-lg transition-colors ${
                          dateRange === 'custom'
                            ? 'bg-[#D4A017]/15 text-[#D4A017] font-semibold'
                            : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5 text-[#D4A017] shrink-0" />
                        {t('common.custom_range')}
                      </button>
                    </div>
                  </div>
                )}

                {dateRange === 'custom' && (
                  <DateRangePicker
                    startDate={customStartDate}
                    endDate={customEndDate}
                    onChange={({ startDate, endDate }) => {
                      setCustomStartDate(startDate);
                      setCustomEndDate(endDate);
                    }}
                    className="shrink-0"
                  />
                )}
              </div>
            )}
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
