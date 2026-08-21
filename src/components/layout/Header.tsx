import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Bell, Plus, Calendar, X, WifiOff, Bike, Users, ChevronDown 
} from 'lucide-react';
import { DateFilterRange } from '../../types';
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
  setActiveTab: (tab: string) => void;
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
  setActiveTab,
  onQuickAction,
}) => {
  const { t, language, setLanguage } = useLanguage();
  const [showQuickAction, setShowQuickAction] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileModalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleClickOutside = (event: MouseEvent) => {
      const isOutsideDropdown = dropdownRef.current && !dropdownRef.current.contains(event.target as Node);
      const isOutsideMobileModal = mobileModalRef.current ? !mobileModalRef.current.contains(event.target as Node) : true;
      
      if (isOutsideDropdown && isOutsideMobileModal) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="sticky top-0 z-30 flex flex-col w-full">
      
      {/* ========================================================= */}
      {/* MODALES GLOBALES (Placées hors du header pour éviter les bugs) */}
      {/* ========================================================= */}

      {/* 1. Modale DatePicker Mobile (centrée et libre du header) */}
      {showDatePicker && (
        <div className="fixed inset-0 w-screen h-[100dvh] z-[99999] flex sm:hidden items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div ref={mobileModalRef} className="relative bg-[#1A1A1A] border border-[#333333] rounded-2xl shadow-2xl p-4 w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D4A017]">
                {language === 'fr' ? 'Période d\'analyse' : 'Analysis Period'}
              </span>
              <button 
                type="button" 
                onClick={() => setShowDatePicker(false)} 
                className="text-gray-400 hover:text-white p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex justify-center overflow-x-auto py-2">
              <DateRangePicker 
                startDate={customStartDate}
                endDate={customEndDate}
                onChange={(range) => {
                  setCustomStartDate(range.startDate);
                  setCustomEndDate(range.endDate);
                  setDateRange('custom' as DateFilterRange);
                  setShowDatePicker(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. Modale Quick Actions */}
      {showQuickAction && (
        <div className="fixed inset-0 w-screen h-[100dvh] z-[99999] flex items-center justify-center p-4">
          <div onClick={() => setShowQuickAction(false)} className="absolute inset-0 bg-black/70 backdrop-blur-md" />
          <div className="relative w-full max-w-sm bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-2xl p-6 z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[#D4A017]">{t('common.quick_add')}</h3>
              <button type="button" onClick={() => setShowQuickAction(false)} className="text-gray-400 hover:text-white p-1 rounded-lg cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-2">
              <button type="button" onClick={() => { onQuickAction('reservation'); setShowQuickAction(false); }} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-left cursor-pointer">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#D4A017]/10 shrink-0"><Calendar className="w-5 h-5 text-[#D4A017]" /></span>
                <span className="text-sm font-semibold text-white">{t('common.new_reservation')}</span>
              </button>
              <button type="button" onClick={() => { onQuickAction('client'); setShowQuickAction(false); }} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-left cursor-pointer">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 shrink-0"><Users className="w-5 h-5 text-blue-400" /></span>
                <span className="text-sm font-semibold text-white">{t('common.add_client')}</span>
              </button>
              <button type="button" onClick={() => { onQuickAction('motorcycle'); setShowQuickAction(false); }} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-left cursor-pointer">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 shrink-0"><Bike className="w-5 h-5 text-emerald-400" /></span>
                <span className="text-sm font-semibold text-white">{t('common.add_motorcycle')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ========================================================= */}


      {isOffline && (
        <div className="bg-amber-600/90 text-amber-95 px-4 py-1.5 text-xs font-bold text-center flex items-center justify-center gap-2 border-b border-amber-500/50 backdrop-blur-md animate-pulse">
          <WifiOff className="w-4 h-4 shrink-0 text-white" />
          <span>{t('common.offline_notice')}</span>
        </div>
      )}

      <header className="flex items-center justify-between h-16 md:h-20 px-2 md:px-6 bg-[#1C1C1C]/95 border-b border-[#2D2D2D] backdrop-blur-md">
        
        {/* Logo */}
        <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
          <MountainLogoSVG className="w-6 h-5 md:w-7 md:h-6 text-[#D4A017]" />
          <span className="hidden sm:inline font-black text-xs md:text-sm tracking-wider text-white">
            MOTO<span className="text-[#D4A017]">NOMAD</span>
          </span>
        </div>

        {/* Search Bar Desktop */}
        <div className="hidden md:flex relative items-center w-full max-w-md mx-4">
          <Search className="absolute left-3.5 w-4 h-4 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('common.search_placeholder')}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#262626] border border-[#333333] text-sm text-[#F4F4F2] placeholder-zinc-500 focus:outline-none focus:border-[#D4A017] transition-all"
          />
        </div>

        {/* Right Section : Date + Settings + Action */}
        <div className="flex items-center gap-1 md:gap-3 ml-auto shrink-0">
          
          {/* Date Picker Button */}
          <div className="relative" ref={dropdownRef}>
            <button 
              type="button"
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3.5 py-1.5 md:py-2 rounded-xl bg-[#262626] border border-[#333333] text-[10px] md:text-xs font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-[#D4A017] shrink-0" />
              <span className="truncate max-w-[65px] sm:max-w-[120px]">
                {customStartDate && customEndDate ? `${customStartDate} - ${customEndDate}` : dateRange.replace('_', ' ')}
              </span>
              <ChevronDown className="w-3 h-3 text-zinc-400 shrink-0 hidden sm:block" />
            </button>

            {/* Version Desktop : Popover déroulant */}
            {showDatePicker && (
              <div className="hidden sm:block absolute right-0 mt-2 z-50 bg-[#1A1A1A] border border-[#333333] rounded-2xl shadow-2xl p-4">
                <DateRangePicker 
                  startDate={customStartDate}
                  endDate={customEndDate}
                  onChange={(range) => {
                    setCustomStartDate(range.startDate);
                    setCustomEndDate(range.endDate);
                    setDateRange('custom' as DateFilterRange);
                    setShowDatePicker(false);
                  }}
                />
              </div>
            )}
          </div>

          {/* Settings : Currency & Language (Rendu visible sur mobile avec ajustement des tailles) */}
          <div className="flex items-center bg-[#181818] border border-[#333333] rounded-lg p-0.5 gap-0.5 md:gap-1 shadow-sm shrink-0">
            <div className="flex items-center bg-[#262626] rounded-md p-0.5">
              {(['MAD', 'EUR', 'USD'] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  className={`px-1.5 md:px-2 py-1 rounded text-[9px] md:text-[10px] font-bold transition-all cursor-pointer ${
                    currency === c ? 'bg-[#D4A017] text-[#111111]' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="w-[1px] h-3 md:h-4 bg-[#333333]" />
            <div className="flex items-center px-0.5 md:px-1">
              <button type="button" onClick={() => setLanguage('fr')} className={`px-1 md:px-1.5 py-1 rounded text-[9px] md:text-[10px] font-bold cursor-pointer ${language === 'fr' ? 'text-[#D4A017]' : 'text-zinc-400'}`}>FR</button>
              <button type="button" onClick={() => setLanguage('en')} className={`px-1 md:px-1.5 py-1 rounded text-[9px] md:text-[10px] font-bold cursor-pointer ${language === 'en' ? 'text-[#D4A017]' : 'text-zinc-400'}`}>EN</button>
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="relative shrink-0">
            <button 
              type="button"
              onClick={() => setShowQuickAction(true)}
              className="flex items-center justify-center w-8 h-8 md:w-auto md:h-auto md:px-4 md:py-2 rounded-xl font-bold text-xs md:text-sm bg-[#D4A017] text-[#1C1C1C] hover:bg-[#b88a10] transition-all shadow-lg cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden md:inline ml-1">{t('common.quick_add')}</span>
            </button>
          </div>
          
        </div>
      </header>
    </div>
  );
};