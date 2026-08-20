import React from 'react';
import {
  CalendarPlus, UserPlus, Bike, ArrowUpRight, ArrowDownLeft,
  Wrench, Receipt, CreditCard
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface QuickActionsBarProps {
  onAction: (actionKey: string) => void;
}

export const QuickActionsBar: React.FC<QuickActionsBarProps> = ({ onAction }) => {
  const { t } = useLanguage();

  const actions = [
    { key: 'new_reservation', label: t('quick_actions.new_res'), icon: CalendarPlus, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    { key: 'add_client', label: t('quick_actions.new_client'), icon: UserPlus, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { key: 'add_motorcycle', label: t('quick_actions.new_bike'), icon: Bike, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    { key: 'check_out', label: t('quick_actions.checkout'), icon: ArrowUpRight, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    { key: 'check_in', label: t('quick_actions.checkin'), icon: ArrowDownLeft, color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
    { key: 'maintenance', label: t('quick_actions.maint'), icon: Wrench, color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
    { key: 'record_payment', label: t('quick_actions.record_pay'), icon: CreditCard, color: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
    { key: 'log_expense', label: t('quick_actions.expense'), icon: Receipt, color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  ];

  return (
    <div className="w-full bg-[#1A1A1A] border border-[#2D2D2D] rounded-2xl p-3 shadow-lg">
      <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center justify-between">
        <span>{t('quick_actions.title')}</span>
        <span className="text-[10px] text-zinc-500">1-Tap Shortcuts</span>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.key}
              onClick={() => onAction(act.key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold shrink-0 transition-transform active:scale-95 ${act.color}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">{act.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
