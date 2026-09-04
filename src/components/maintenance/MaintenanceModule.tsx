import React, { useState } from 'react';
import { Wrench, Plus, Search, Filter, AlertTriangle, CheckCircle, Calendar, DollarSign } from 'lucide-react';
import { MaintenanceRecord, Motorcycle } from '../../types';
import { dbStore } from '../../services/db';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { formatCurrency } from '../../utils/calculations';
import { useLanguage } from '../../context/LanguageContext';

interface MaintenanceModuleProps {
  maintenance: MaintenanceRecord[];
  motorcycles: Motorcycle[];
  currency: 'MAD' | 'EUR' | 'USD';
  onUpdate: () => void;
}

export const MaintenanceModule: React.FC<MaintenanceModuleProps> = ({
  maintenance,
  motorcycles,
  currency,
  onUpdate,
}) => {
  const { t, formatCurrencyVal, language } = useLanguage();
  const [isOpenAdd, setIsOpenAdd] = useState(false);
  const [form, setForm] = useState<Partial<MaintenanceRecord>>({
    motorcycleId: motorcycles[0]?.id || '',
    serviceDate: new Date().toISOString().split('T')[0],
    mileage: 10000,
    serviceType: 'Oil Service',
    description: '',
    partsCost: 1000,
    laborCost: 500,
    workshopSupplier: 'KTM Workshop',
    status: 'In Progress',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const bike = motorcycles.find((m) => m.id === form.motorcycleId);
    if (!bike) return;

    const parts = Number(form.partsCost) || 0;
    const labor = Number(form.laborCost) || 0;
    const totalCost = parts + labor;

    const newRec: MaintenanceRecord = {
      id: `maint-${Date.now()}`,
      motorcycleId: bike.id,
      motorcycleName: `${bike.brand} ${bike.model} (${bike.registrationNumber})`,
      regNumber: bike.registrationNumber,
      serviceDate: form.serviceDate || new Date().toISOString().split('T')[0],
      mileage: Number(form.mileage) || bike.currentMileage,
      serviceType: form.serviceType || 'Oil Service',
      description: form.description || '',
      partsCost: parts,
      laborCost: labor,
      totalCost,
      workshopSupplier: form.workshopSupplier || 'Marrakech Workshop',
      nextServiceDate: '2027-02-01',
      nextServiceMileage: (Number(form.mileage) || bike.currentMileage) + 5000,
      status: form.status || 'Scheduled',
      createdAt: new Date().toISOString(),
    };

    dbStore.addItem<MaintenanceRecord>('maintenance', newRec);

    // Update motorcycle maintenance total and status
    dbStore.updateItem<Motorcycle>('motorcycles', bike.id, {
      totalMaintenanceCost: bike.totalMaintenanceCost + totalCost,
      currentStatus: form.status === 'In Progress' ? 'Maintenance' : bike.currentStatus,
    });

    setIsOpenAdd(false);
    onUpdate();
  };

  return (
    <div className="space-y-6 animate-fadeIn text-[#F4F4F2]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#F4F4F2] flex items-center gap-2">
            <Wrench className="w-6 h-6 text-[#D4A017]" /> 
            {language === 'fr' ? 'Maintenance de l’Atelier & Réparations' : 'Workshop Maintenance & Repairs'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {language === 'fr'
              ? 'Planning des services, vidanges, usure des pneus, réparations suite à accidents et factures fournisseurs.'
              : 'Service schedules, oil changes, tire wear, accident repairs, and supplier invoices.'}
          </p>
        </div>
        <button
          onClick={() => setIsOpenAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#D4A017] text-[#1C1C1C] hover:bg-[#b88a10] cursor-pointer transition-colors shadow-lg shadow-[#D4A017]/10"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> 
          {language === 'fr' ? 'Enregistrer une Maintenance' : 'Log Maintenance'}
        </button>
      </div>

      {/* Maintenance Table */}
      <div className="rounded-2xl border border-[#2D2D2D] bg-[#1C1C1C] overflow-hidden shadow-xl">
        <div className="w-full overflow-x-auto custom-scrollbar pb-2">
          <table className="w-full text-left text-xs text-[#F4F4F2] min-w-[900px]">
            <thead className="bg-[#222222] border-b border-[#2D2D2D] text-zinc-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">{language === 'fr' ? 'MOTO' : 'MOTORCYCLE'}</th>
                <th className="p-4">{language === 'fr' ? 'TYPE DE SERVICE' : 'SERVICE TYPE'}</th>
                <th className="p-4">{language === 'fr' ? 'DATE / KILOMÉTRAGE' : 'DATE / ODOMETER'}</th>
                <th className="p-4">{language === 'fr' ? 'ATELIER & DÉTAILS' : 'WORKSHOP & DETAILS'}</th>
                <th className="p-4">{language === 'fr' ? 'COÛT TOTAL' : 'TOTAL COST'}</th>
                <th className="p-4">{language === 'fr' ? 'STATUT' : 'STATUS'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2A]">
              {maintenance.map((m) => (
                <tr key={m.id} className="hover:bg-[#252525] transition-colors">
                  <td className="p-4 font-bold text-sm text-[#F4F4F2]">
                    {m.motorcycleName}
                  </td>
                  <td className="p-4 font-bold text-[#D4A017]">{m.serviceType}</td>
                  <td className="p-4">
                    <span className="font-mono block">{m.serviceDate}</span>
                    <span className="text-[10px] text-zinc-400">{m.mileage.toLocaleString()} km</span>
                  </td>
                  <td className="p-4">
                    <span className="font-semibold">{m.description}</span>
                    <span className="text-[10px] text-zinc-400 block">
                      {language === 'fr' ? 'Atelier : ' : 'Workshop: '}{m.workshopSupplier}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-rose-400">{formatCurrency(m.totalCost, currency)}</td>
                  <td className="p-4"><Badge status={m.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isOpenAdd && (
        <Modal 
          isOpen={isOpenAdd} 
          onClose={() => setIsOpenAdd(false)} 
          title={language === 'fr' ? 'Enregistrer un Service d’Atelier' : 'Log Workshop Service Record'}
          maxWidth="2xl"
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-zinc-300 block mb-1">
                {language === 'fr' ? 'Sélectionner une Moto *' : 'Select Motorcycle *'}
              </label>
              <select
                required
                value={form.motorcycleId}
                onChange={(e) => setForm({ ...form, motorcycleId: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#262626] border border-[#333333] text-[#F4F4F2] cursor-pointer"
              >
                {motorcycles.map((bike) => (
                  <option key={bike.id} value={bike.id}>{bike.brand} {bike.model} ({bike.registrationNumber})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-zinc-300 block mb-1">
                  {language === 'fr' ? 'Type de Service' : 'Service Type'}
                </label>
                <select
                  value={form.serviceType}
                  onChange={(e) => setForm({ ...form, serviceType: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl bg-[#262626] border border-[#333333] text-[#F4F4F2] cursor-pointer"
                >
                  <option value="Oil Service">{language === 'fr' ? 'Vidange / Huile' : 'Oil Service'}</option>
                  <option value="Tires">{language === 'fr' ? 'Remplacement Pneus' : 'Tires Replacement'}</option>
                  <option value="Brakes">{language === 'fr' ? 'Freins & Disques' : 'Brakes & Discs'}</option>
                  <option value="Chain">{language === 'fr' ? 'Chaîne & Pignons' : 'Chain & Sprockets'}</option>
                  <option value="Major Service">{language === 'fr' ? 'Révision Majeure' : 'Major Service'}</option>
                  <option value="Repair">{language === 'fr' ? 'Accident / Réparation' : 'Accident / Repair'}</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-zinc-300 block mb-1">
                  {language === 'fr' ? 'Coût des Pièces (MAD)' : 'Parts Cost (MAD)'}
                </label>
                <input
                  type="number"
                  value={form.partsCost || ''}
                  onChange={(e) => setForm({ ...form, partsCost: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl bg-[#262626] border border-[#333333] text-[#F4F4F2]"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-zinc-300 block mb-1">
                {language === 'fr' ? 'Description / Notes' : 'Description / Notes'}
              </label>
              <input
                type="text"
                required
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#262626] border border-[#333333] text-[#F4F4F2]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#2D2D2D]">
              <button 
                type="button" 
                onClick={() => setIsOpenAdd(false)} 
                className="px-4 py-2 rounded-xl font-bold bg-zinc-800 text-zinc-300 cursor-pointer"
              >
                {language === 'fr' ? 'Annuler' : 'Cancel'}
              </button>
              <button 
                type="submit" 
                className="px-5 py-2 rounded-xl font-bold bg-[#D4A017] text-[#1C1C1C] cursor-pointer"
              >
                {language === 'fr' ? 'Enregistrer la Maintenance' : 'Save Maintenance Record'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default MaintenanceModule;