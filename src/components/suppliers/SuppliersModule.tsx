import React from 'react';
import { Truck, Mail, Phone, DollarSign } from 'lucide-react';
import { Supplier } from '../../types';
import { formatCurrency } from '../../utils/calculations';
import { useLanguage } from '../../context/LanguageContext';

interface SuppliersModuleProps {
  suppliers: Supplier[];
  currency: 'MAD' | 'EUR' | 'USD';
  onUpdate: () => void;
}

export const SuppliersModule: React.FC<SuppliersModuleProps> = ({ suppliers, currency }) => {
  const { language } = useLanguage();

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#F4F4F2] flex items-center gap-2">
            <Truck className="w-6 h-6 text-[#D4A017]" /> 
            {language === 'fr' ? 'Répertoire des Fournisseurs & Vendeurs' : 'Suppliers & Vendor Directory'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {language === 'fr'
              ? 'Comptes des importateurs officiels BMW, Yamaha & KTM, partenaires hôteliers (Kasbah Xaluca) et fournisseurs de pneus.'
              : 'Official BMW, Yamaha & KTM importer accounts, hotel partners (Kasbah Xaluca), and tire suppliers.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {suppliers.map((sup) => {
          // Dynamic translation for supplier categories
          let categoryLabel: string = sup.category;
          if (language === 'fr') {
            if (categoryLabel === 'Parts & Workshop') categoryLabel = 'Pièces & Atelier';
            if (categoryLabel === 'Hotels & Lodging') categoryLabel = 'Hôtels & Hébergement';
            if (categoryLabel === 'Tires & Consumables') categoryLabel = 'Pneus & Consommables';
          }

          return (
            <div key={sup.id} className="p-6 rounded-2xl bg-[#1C1C1C] border border-[#2D2D2D] shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-[#F4F4F2]">
                  {language === 'fr' ? (sup as any).supplierNameFr || sup.supplierName : sup.supplierName}
                </h3>
                <span className="px-2.5 py-1 rounded-full bg-sky-950 text-sky-400 font-bold text-xs border border-sky-800">
                  {categoryLabel}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#222222] border border-[#333333] space-y-2 text-xs">
                <div>
                  <span className="text-zinc-400">{language === 'fr' ? 'Personne de contact :' : 'Contact Person:'}</span> 
                  <span className="font-semibold text-[#F4F4F2]">{sup.contactPerson}</span>
                </div>
                <div>
                  <span className="text-zinc-400">{language === 'fr' ? 'Produits / Services :' : 'Products / Services:'}</span> 
                  <span className="font-semibold text-[#F4F4F2]">
                    {language === 'fr' ? (sup as any).productsServicesFr || sup.productsServices : sup.productsServices}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400">{language === 'fr' ? 'Total des Achats :' : 'Total Purchases:'}</span> 
                  <span className="font-bold text-emerald-400">{formatCurrency(sup.totalPurchases, currency)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SuppliersModule;