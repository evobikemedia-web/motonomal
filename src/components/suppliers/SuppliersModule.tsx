import React from 'react';
import { Truck, Mail, Phone, DollarSign } from 'lucide-react';
import { Supplier } from '../../types';
import { formatCurrency } from '../../utils/calculations';

interface SuppliersModuleProps {
  suppliers: Supplier[];
  currency: 'MAD' | 'EUR' | 'USD';
  onUpdate: () => void;
}

export const SuppliersModule: React.FC<SuppliersModuleProps> = ({ suppliers, currency }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#F4F4F2] flex items-center gap-2">
            <Truck className="w-6 h-6 text-[#D4A017]" /> Suppliers & Vendor Directory
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Official BMW, Yamaha & KTM importer accounts, hotel partners (Kasbah Xaluca), and tire suppliers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {suppliers.map((sup) => (
          <div key={sup.id} className="p-6 rounded-2xl bg-[#1C1C1C] border border-[#2D2D2D] shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-[#F4F4F2]">{sup.supplierName}</h3>
              <span className="px-2.5 py-1 rounded-full bg-sky-950 text-sky-400 font-bold text-xs border border-sky-800">
                {sup.category}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#222222] border border-[#333333] space-y-2 text-xs">
              <div><span className="text-zinc-400">Contact Person:</span> <span className="font-semibold text-[#F4F4F2]">{sup.contactPerson}</span></div>
              <div><span className="text-zinc-400">Products / Services:</span> <span className="font-semibold text-[#F4F4F2]">{sup.productsServices}</span></div>
              <div><span className="text-zinc-400">Total Purchases:</span> <span className="font-bold text-emerald-400">{formatCurrency(sup.totalPurchases, currency)}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
