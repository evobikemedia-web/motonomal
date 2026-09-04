import React, { useState } from 'react';
import { ShieldCheck, Plus, Search, Filter } from 'lucide-react';
import { EquipmentItem } from '../../types';
import { dbStore } from '../../services/db';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { formatCurrency } from '../../utils/calculations';
import { useLanguage } from '../../context/LanguageContext';

interface EquipmentModuleProps {
  equipment: EquipmentItem[];
  currency: 'MAD' | 'EUR' | 'USD';
  onUpdate: () => void;
}

export const EquipmentModule: React.FC<EquipmentModuleProps> = ({
  equipment,
  currency,
  onUpdate,
}) => {
  const { language } = useLanguage();

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#F4F4F2] flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#D4A017]" /> 
            {language === 'fr' ? 'Équipements & Casques' : 'Riding Gear & Bike Accessories'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {language === 'fr'
              ? 'Suivez les casques Arai, GPS Garmin, combinaisons Klim Gore-Tex, valises latérales et intercoms.'
              : 'Track Arai helmets, Garmin GPS units, Klim Gore-Tex suits, side cases, and intercoms.'}
          </p>
        </div>
      </div>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipment.map((item) => {
          // Dynamic translation for equipment types
          let typeLabel: string = item.type;
          if (language === 'fr') {
            if (typeLabel === 'Helmet') typeLabel = 'Casque';
            if (typeLabel === 'GPS') typeLabel = 'GPS';
            if (typeLabel === 'Riding Jacket') typeLabel = 'Veste de Moto';
            if (typeLabel === 'Side Cases') typeLabel = 'Valises Latérales';
            if (typeLabel === 'Intercom') typeLabel = 'Intercom';
          }

          // Dynamic translation for conditions
          let conditionLabel: string = item.condition;
          if (language === 'fr') {
            if (conditionLabel === 'New') conditionLabel = 'Neuf';
            if (conditionLabel === 'Good') conditionLabel = 'Bon État';
            if (conditionLabel === 'Fair') conditionLabel = 'Passable';
            if (conditionLabel === 'Damaged') conditionLabel = 'Endommagé';
          }

          return (
            <div key={item.id} className="p-5 rounded-2xl bg-[#1C1C1C] border border-[#2D2D2D] space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[#D4A017]">{typeLabel}</span>
                <Badge status={item.status} />
              </div>

              <div>
                <h3 className="font-bold text-base text-[#F4F4F2]">
                  {/* Dynamic language support for equipment name, falling back to default */}
                  {language === 'fr' ? (item as any).nameFr || item.name : item.name}
                </h3>
                <span className="text-xs text-zinc-400">
                  {language === 'fr' ? 'Marque :' : 'Brand:'} {item.brand} {item.model}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#222222] border border-[#333333] space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">{language === 'fr' ? 'État :' : 'Condition:'}</span> 
                  <span className="font-bold text-emerald-400">{conditionLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">{language === 'fr' ? 'Location Journalière :' : 'Daily Rental:'}</span> 
                  <span className="font-bold text-[#D4A017]">{formatCurrency(item.dailyPrice, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">{language === 'fr' ? 'Numéro de Série :' : 'Serial Number:'}</span> 
                  <span className="font-mono text-zinc-300">{item.serialNumber}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EquipmentModule;