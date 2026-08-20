import React from 'react';
import { Settings, RefreshCw, Database, Shield, Globe, DollarSign } from 'lucide-react';
import { dbStore } from '../../services/db';

interface SettingsModuleProps {
  currency: 'MAD' | 'EUR' | 'USD';
  onCurrencyChange: (c: 'MAD' | 'EUR' | 'USD') => void;
  onResetDemoData: () => void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({
  currency,
  onCurrencyChange,
  onResetDemoData,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl">
      <div>
        <h2 className="text-2xl font-black text-[#F4F4F2] flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#D4A017]" /> System & Enterprise Settings
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Configure Motonomad system parameters, default currency display, and database state.
        </p>
      </div>

      <div className="space-y-6">
        {/* Currency Display Settings */}
        <div className="p-6 rounded-2xl bg-[#1C1C1C] border border-[#2D2D2D] shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-[#D4A017]" />
            <div>
              <h3 className="font-bold text-base text-[#F4F4F2]">Display Currency & Exchange Rates</h3>
              <p className="text-xs text-zinc-400">All internal database values are stored in MAD (Moroccan Dirham).</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {(['MAD', 'EUR', 'USD'] as const).map((curr) => (
              <button
                key={curr}
                onClick={() => onCurrencyChange(curr)}
                className={`px-5 py-2.5 rounded-xl font-bold border transition-all ${
                  currency === curr
                    ? 'bg-[#D4A017] text-[#1C1C1C] border-[#D4A017]'
                    : 'bg-[#262626] text-zinc-400 border-[#333333] hover:text-white'
                }`}
              >
                {curr} {curr === 'MAD' ? '(1.0x Base)' : curr === 'EUR' ? '(10.8 MAD/EUR)' : '(10.0 MAD/USD)'}
              </button>
            ))}
          </div>
        </div>

        {/* Database Control */}
        <div className="p-6 rounded-2xl bg-[#1C1C1C] border border-[#2D2D2D] shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-rose-400" />
            <div>
              <h3 className="font-bold text-base text-[#F4F4F2]">Database State & Demo Reset</h3>
              <p className="text-xs text-zinc-400">Reset local dataset to original Motonomad Morocco sample records.</p>
            </div>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Reset database to initial demo dataset?')) {
                onResetDemoData();
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-950 border border-rose-800 text-rose-300 hover:bg-rose-900 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Reset Demo Dataset
          </button>
        </div>
      </div>
    </div>
  );
};
