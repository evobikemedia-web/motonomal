import React from 'react';
import { Building2, Plus, Mail, Phone, DollarSign } from 'lucide-react';
import { Agency } from '../../types';
import { formatCurrency } from '../../utils/calculations';
import { useLanguage } from '../../context/LanguageContext';

interface AgenciesModuleProps {
  agencies: Agency[];
  currency: 'MAD' | 'EUR' | 'USD';
  onUpdate: () => void;
}

export const AgenciesModule: React.FC<AgenciesModuleProps> = ({ agencies, currency }) => {
  const { language } = useLanguage();

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#F4F4F2] flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#D4A017]" /> 
            {language === 'fr' ? 'Agences Partenaires de Circuits & Réservations' : 'Tour & Booking Partner Agencies'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {language === 'fr'
              ? 'Gérez les contrats de référence des agences, les taux de commission (12-15%) et les paiements de réservations.'
              : 'Manage agency referral contracts, commission rates (12-15%), and booking payouts.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {agencies.map((ag) => (
          <div key={ag.id} className="p-6 rounded-2xl bg-[#1C1C1C] border border-[#2D2D2D] shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-[#F4F4F2]">
                {/* Dynamic language support for agency name, falling back to default */}
                {language === 'fr' ? (ag as any).agencyNameFr || ag.agencyName : ag.agencyName}
              </h3>
              <span className="px-2.5 py-1 rounded-full bg-[#D4A017]/20 text-[#D4A017] font-bold text-xs border border-[#D4A017]/40">
                {ag.commissionPercentage}% {language === 'fr' ? 'Commission' : 'Commission'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#222222] border border-[#333333] space-y-2 text-xs">
              <div>
                <span className="text-zinc-400">{language === 'fr' ? 'Personne de contact :' : 'Contact Person:'}</span> 
                <span className="font-semibold text-[#F4F4F2]">{ag.contactPerson} ({ag.country})</span>
              </div>
              <div>
                <span className="text-zinc-400">{language === 'fr' ? 'E-mail :' : 'Email:'}</span> 
                <span className="font-semibold text-[#F4F4F2]">{ag.email}</span>
              </div>
              <div>
                <span className="text-zinc-400">{language === 'fr' ? 'Téléphone / WhatsApp :' : 'Phone / WhatsApp:'}</span> 
                <span className="font-semibold text-[#F4F4F2]">{ag.phone}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-3 rounded-xl bg-[#252525] border border-[#333333]">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                  {language === 'fr' ? 'Total Généré' : 'Total Generated'}
                </span>
                <span className="font-black text-emerald-400 text-sm">{formatCurrency(ag.totalRevenue, currency)}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#252525] border border-[#333333]">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                  {language === 'fr' ? 'Nombre de Réservations' : 'Bookings Count'}
                </span>
                <span className="font-black text-[#D4A017] text-sm">
                  {ag.totalBookings} {language === 'fr' ? 'Circuits' : 'Tours'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgenciesModule;