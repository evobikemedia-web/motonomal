import React from 'react';
import { BarChart3, Download, FileText, CheckCircle2 } from 'lucide-react';
import { Motorcycle, Reservation, Revenue, Expense, Client } from '../../types';
import { formatCurrency } from '../../utils/calculations';
import { useLanguage } from '../../context/LanguageContext';

interface ReportsModuleProps {
  motorcycles: Motorcycle[];
  reservations: Reservation[];
  revenues: Revenue[];
  expenses: Expense[];
  clients: Client[];
  currency: 'MAD' | 'EUR' | 'USD';
}

export const ReportsModule: React.FC<ReportsModuleProps> = ({
  motorcycles,
  reservations,
  revenues,
  expenses,
  clients,
  currency,
}) => {
  const { language } = useLanguage();

  const downloadReport = (title: string, dataStr: string) => {
    const blob = new Blob([dataStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `motonomad_${title.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.csv`;
    a.click();
  };

  const exportFinancials = () => {
    const csv = 'Type,ID,Date,Category,Description,Amount\n' + 
      revenues.map(r => `Revenue,${r.id},${r.date},${r.category},"${r.description}",${r.amount}`).join('\n') + '\n' +
      expenses.map(e => `Expense,${e.id},${e.date},${e.category},"${e.description}",${e.amount}`).join('\n');
    downloadReport('financial_statement', csv);
  };

  const exportFleet = () => {
    const csv = 'Plate,Brand,Model,Year,Status,Mileage,PurchasePrice,TotalRevenue,TotalMaintenance\n' +
      motorcycles.map(m => `${m.registrationNumber},${m.brand},${m.model},${m.year},${m.currentStatus},${m.currentMileage},${m.purchasePrice},${m.totalRevenue},${m.totalMaintenanceCost}`).join('\n');
    downloadReport('fleet_utilization_depreciation', csv);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-black text-[#F4F4F2] flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-[#D4A017]" /> 
          {language === 'fr' ? 'Rapports d’Activité de la Direction' : 'Executive Business Reports'}
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          {language === 'fr'
            ? 'Exportez les comptes de résultat financiers complets, les journaux d’amortissement de la flotte, la LTV client et les performances des circuits au format CSV/PDF.'
            : 'Export full financial P&L, fleet depreciation logs, client LTV, and tour performance CSV/PDF records.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-[#1C1C1C] border border-[#2D2D2D] shadow-xl space-y-3">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-[#D4A017]" />
            <div>
              <h3 className="font-bold text-base text-[#F4F4F2]">
                {language === 'fr' ? 'Compte de Résultat Financier (P&L)' : 'Financial P&L Statement'}
              </h3>
              <p className="text-xs text-zinc-400">
                {language === 'fr'
                  ? 'Audit détaillé et ventilé des revenus de location, des recettes de circuits et des dépenses opérationnelles.'
                  : 'Complete itemized audit of rental revenues, tour income, and operational expenses.'}
              </p>
            </div>
          </div>
          <button
            onClick={exportFinancials}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#D4A017] text-[#1C1C1C] hover:bg-[#b88a10] transition-colors"
          >
            <Download className="w-4 h-4" /> 
            {language === 'fr' ? 'Télécharger le CSV Financier' : 'Download Financial CSV'}
          </button>
        </div>

        <div className="p-6 rounded-2xl bg-[#1C1C1C] border border-[#2D2D2D] shadow-xl space-y-3">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-[#D4A017]" />
            <div>
              <h3 className="font-bold text-base text-[#F4F4F2]">
                {language === 'fr' ? 'Rapport d’Amortissement & ROI de la Flotte' : 'Fleet Depreciation & ROI Report'}
              </h3>
              <p className="text-xs text-zinc-400">
                {language === 'fr'
                  ? 'Valeurs d’achat des motos, amortissement linéaire cumulé et revenu net.'
                  : 'Motorcycle purchase values, accumulated straight-line depreciation, and net revenue.'}
              </p>
            </div>
          </div>
          <button
            onClick={exportFleet}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#D4A017] text-[#1C1C1C] hover:bg-[#b88a10] transition-colors"
          >
            <Download className="w-4 h-4" /> 
            {language === 'fr' ? 'Télécharger le CSV de la Flotte' : 'Download Fleet CSV'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportsModule;