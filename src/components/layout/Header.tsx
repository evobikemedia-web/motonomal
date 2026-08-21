import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Bell, Plus, Calendar, X, WifiOff, Bike, Users, ChevronDown 
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

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
      {isOffline && (
        <div className="bg-amber-600/90 text-amber-95 px-4 py-1.5 text-xs font-bold text-center flex items-center justify-center gap-2 border-b border-amber-500/50 backdrop-blur-md animate-pulse">
          <WifiOff className="w-4 h-4 shrink-0 text-white" />
          <span>{t('common.offline_notice')}</span>
        </div>
      )}

      <header className="flex items-center justify-between h-16 md:h-20 px-3 md:px-6 bg-[#1C1C1C]/95 border-b border-[#2D2D2D] backdrop-blur-md">
        <div className="flex md:hidden items-center gap-2 shrink-0 mr-1">
          <MountainLogoSVG className="w-8 h-7 text-[#D4A017]" />
          <span className="font-black text-sm tracking-wider text-white">
            MOTO<span className="text-[#D4A017]">NOMAD</span>
          </span>
        </div>

        {/* Barre de recherche */}
        <div className="hidden md:flex relative items-center w-full max-w-md">
          <Search className="absolute left-3.5 w-4 h-4 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('common.search_placeholder')}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#262626] border border-[#333333] text-sm text-[#F4F4F2] placeholder-zinc-500 focus:outline-none focus:border-[#D4A017] transition-all"
          />
        </div>

        <div className="flex items-center gap-2 md:gap-3 ml-auto">
          {/* Sélecteur de date avec le DateRangePicker interactif */}
          <div className="relative" ref={dropdownRef}>
            <button 
              type="button"
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#262626] border border-[#333333] text-xs font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#D4A017]" />
              <span>{customStartDate && customEndDate ? `${customStartDate} - ${customEndDate}` : dateRange.replace('_', ' ')}</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            {showDatePicker && (
              <div className="absolute right-0 mt-2 z-50 bg-[#1A1A1A] border border-[#333333] rounded-2xl shadow-2xl p-4">
                <DateRangePicker 
                  startDate={customStartDate}
                  endDate={customEndDate}
                  onChange={(range) => {
                    setCustomStartDate(range.startDate);
                    setCustomEndDate(range.endDate);
                    setDateRange('custom' as DateFilterRange);
                  }}
                />
              </div>
            )}
          </div>

          {/* Groupe de contrôles professionnel : Devises & Langues unifiés */}
          <div className="flex items-center bg-[#181818] border border-[#333333] rounded-xl p-1 gap-1 shadow-sm">
            {/* Sélecteur de Devise */}
            <div className="flex items-center bg-[#262626] rounded-lg p-0.5">
              {(['MAD', 'EUR', 'USD'] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                    currency === c 
                      ? 'bg-[#D4A017] text-[#111111] shadow-md' 
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Séparateur vertical */}
            <div className="w-[1px] h-4 bg-[#333333]" />

            {/* Sélecteur de Langue */}
            <div className="flex items-center px-1">
              <button 
                type="button" 
                onClick={() => setLanguage('fr')} 
                className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                  language === 'fr' ? 'text-[#D4A017] bg-white/5' : 'text-zinc-400 hover:text-white'
                }`}
              >
                FR
              </button>
              <button 
                type="button" 
                onClick={() => setLanguage('en')} 
                className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                  language === 'en' ? 'text-[#D4A017] bg-white/5' : 'text-zinc-400 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>
          </div>

          {/* Bouton Action Rapide & Modale Centrée */}
          <div className="relative">
            <button 
              type="button"
              onClick={() => setShowQuickAction(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm bg-[#D4A017] text-[#1C1C1C] hover:bg-[#b88a10] transition-all shadow-lg shadow-[#D4A017]/10 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">{t('common.quick_add')}</span>
            </button>

            {showQuickAction && (
              <div className="fixed inset-0 w-screen h-screen z-[99999] flex items-center justify-center p-4">
                <div 
                  onClick={() => setShowQuickAction(false)} 
                  className="absolute inset-0 bg-black/70 backdrop-blur-md animate-in fade-in duration-200" 
                />
                
                <div className="relative w-full max-w-sm bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-[#D4A017]">
                      {t('common.quick_add')}
                    </h3>
                    <button 
                      type="button"
                      onClick={() => setShowQuickAction(false)} 
                      className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <button 
                      type="button"
                      onClick={() => { onQuickAction('reservation'); setShowQuickAction(false); }} 
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-left group cursor-pointer"
                    >
                      <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#D4A017]/10 shrink-0"><Calendar className="w-5 h-5 text-[#D4A017]" /></span>
                      <span className="text-sm font-semibold text-white">{t('common.new_reservation')}</span>
                    </button>

                    <button 
                      type="button"
                      onClick={() => { onQuickAction('client'); setShowQuickAction(false); }} 
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-left group cursor-pointer"
                    >
                      <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 shrink-0"><Users className="w-5 h-5 text-blue-400" /></span>
                      <span className="text-sm font-semibold text-white">{t('common.add_client')}</span>
                    </button>

                    <button 
                      type="button"
                      onClick={() => { onQuickAction('motorcycle'); setShowQuickAction(false); }} 
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-left group cursor-pointer"
                    >
                      <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 shrink-0"><Bike className="w-5 h-5 text-emerald-400" /></span>
                      <span className="text-sm font-semibold text-white">{t('common.add_motorcycle')}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
};