import React, { useState } from 'react';
import { 
  Compass, Plus, Users, Calendar, MapPin, DollarSign, Award, CheckCircle, Clock 
} from 'lucide-react';
import { Tour, TourParticipant } from '../../types';
import { dbStore } from '../../services/db';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { formatCurrency } from '../../utils/calculations';
import { useLanguage } from '../../context/LanguageContext';

interface ToursModuleProps {
  tours: Tour[];
  currency: 'MAD' | 'EUR' | 'USD';
  onUpdate: () => void;
}

export const ToursModule: React.FC<ToursModuleProps> = ({
  tours,
  currency,
  onUpdate,
}) => {
  const { t, formatCurrencyVal, language } = useLanguage();
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);

  return (
    <div className="space-y-6 animate-fadeIn text-[#F4F4F2]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#F4F4F2] flex items-center gap-2">
            <Compass className="w-6 h-6 text-[#D4A017]" /> 
            {language === 'fr' ? 'Système de Circuits & Raides Guidés' : 'Guided Adventure Tours System'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {language === 'fr'
              ? 'Gérez les listes d’expéditions dans le désert du Sahara, le Haut Atlas et le Rif, la capacité des pilotes et les guides.'
              : 'Manage Sahara Desert, High Atlas, and Rif mountain expedition rosters, rider capacities, and guides.'}
          </p>
        </div>
      </div>

      {/* Tour Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(tours || []).map((tour) => {
          return (
            <div key={tour.id} className="rounded-2xl bg-[#1C1C1C] border border-[#2D2D2D] overflow-hidden shadow-xl space-y-4 p-6">
              <div className="flex items-center justify-between">
                <Badge status={tour.status} />
                <span className="font-bold text-lg text-[#D4A017]">
                  {formatCurrency(tour.pricePerRider, currency)} / {language === 'fr' ? 'pilote' : 'rider'}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-[#F4F4F2]">
                  {/* Dynamic language support for Tour Name */}
                  {language === 'fr' ? (tour as any).nameFr || tour.name : tour.name}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#D4A017]" /> 
                  {/* Dynamic language support for Tour Route */}
                  {language === 'fr' ? (tour as any).routeFr || tour.route : tour.route}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[#222222] border border-[#333333] text-xs">
                <div>
                  <span className="text-zinc-500 block text-[10px]">{language === 'fr' ? 'Dates' : 'Dates'}</span>
                  <span className="font-bold text-[#F4F4F2]">{tour.startDate}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">{language === 'fr' ? 'Durée' : 'Duration'}</span>
                  <span className="font-bold text-[#F4F4F2]">
                    {tour.durationDays} {language === 'fr' ? 'Jours' : 'Days'}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">{language === 'fr' ? 'Capacité Pilotes' : 'Rider Capacity'}</span>
                  <span className="font-bold text-emerald-400">
                    {language === 'fr' ? 'Min' : 'Min'} {tour.minRiders} / {language === 'fr' ? 'Max' : 'Max'} {tour.maxRiders}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#222222] border border-[#333333] text-xs">
                <span className="text-zinc-400 block mb-1 font-bold">
                  {language === 'fr' ? 'Guide Principal Assigné :' : 'Lead Guide Assigned:'}
                </span>
                <span className="font-semibold text-[#D4A017]">
                  {/* Dynamic language support for Guide Name */}
                  {language === 'fr' ? (tour as any).guideNameFr || tour.guideName : tour.guideName}
                </span>
              </div>

              {tour.itinerary && tour.itinerary.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#2A2A2A] text-xs">
                  <span className="font-bold text-zinc-300 block">
                    {language === 'fr' ? 'Points Forts de l’Itinéraire :' : 'Itinerary Highlights:'}
                  </span>
                  {(tour.itinerary || []).slice(0, 3).map((item) => (
                    <div key={item.day} className="flex items-start justify-between text-[11px] text-zinc-400">
                      <span>
                        {language === 'fr' ? 'Jour' : 'Day'} {item.day}: 
                        {/* Dynamic language support for Itinerary Title */}
                        {language === 'fr' ? (item as any).titleFr || item.title : item.title}
                      </span>
                      <span className="text-zinc-500 font-mono">{item.distanceKm} km</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ToursModule;