import React, { useState } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, Plus, Filter, Search, 
  ArrowUpRight, Calendar, FileText, PieChart, Tag, Building 
} from 'lucide-react';
import { Revenue, Expense, Motorcycle, Tour } from '../../types';
import { dbStore } from '../../services/db';
import { Modal } from '../common/Modal';
import { formatCurrency } from '../../utils/calculations';

interface FinanceModuleProps {
  revenues: Revenue[];
  expenses: Expense[];
  motorcycles: Motorcycle[];
  tours: Tour[];
  currency: 'MAD' | 'EUR' | 'USD';
  onUpdate: () => void;
}

export const FinanceModule: React.FC<FinanceModuleProps> = ({
  revenues,
  expenses,
  motorcycles,
  tours,
  currency,
  onUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<'revenues' | 'expenses' | 'profitability'>('revenues');
  const [isAddRevenueOpen, setIsAddRevenueOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  // Revenue Form
  const [revForm, setRevForm] = useState<Partial<Revenue>>({
    date: new Date().toISOString().split('T')[0],
    category: 'Rental',
    amount: 5000,
    currency: 'MAD',
    description: '',
    paymentMethod: 'Card',
  });

  // Expense Form
  const [expForm, setExpForm] = useState<Partial<Expense>>({
    date: new Date().toISOString().split('T')[0],
    category: 'Maintenance',
    amount: 1500,
    currency: 'MAD',
    description: '',
    supplier: '',
    paymentMethod: 'Company Card',
  });

  const handleSaveRevenue = (e: React.FormEvent) => {
    e.preventDefault();
    const newRev: Revenue = {
      id: `rev-${Date.now()}`,
      date: revForm.date || new Date().toISOString().split('T')[0],
      category: revForm.category || 'Rental',
      amount: Number(revForm.amount) || 0,
      currency: 'MAD',
      description: revForm.description || '',
      relatedMotorcycleId: revForm.relatedMotorcycleId,
      relatedTourId: revForm.relatedTourId,
      paymentMethod: revForm.paymentMethod || 'Card',
      createdBy: 'Admin',
      createdAt: new Date().toISOString(),
    };
    dbStore.addItem<Revenue>('revenues', newRev);
    setIsAddRevenueOpen(false);
    onUpdate();
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const newExp: Expense = {
      id: `exp-${Date.now()}`,
      date: expForm.date || new Date().toISOString().split('T')[0],
      category: expForm.category || 'Maintenance',
      amount: Number(expForm.amount) || 0,
      currency: 'MAD',
      description: expForm.description || '',
      relatedMotorcycleId: expForm.relatedMotorcycleId,
      supplier: expForm.supplier || '',
      paymentMethod: expForm.paymentMethod || 'Company Card',
      createdBy: 'Admin',
      createdAt: new Date().toISOString(),
    };
    dbStore.addItem<Expense>('expenses', newExp);
    setIsAddExpenseOpen(false);
    onUpdate();
  };

  const totalRev = revenues.reduce((a, b) => a + b.amount, 0);
  const totalExp = expenses.reduce((a, b) => a + b.amount, 0);
  const netProfit = totalRev - totalExp;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Financial Summary KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#1C1C1C] border border-[#2D2D2D]">
          <span className="text-[10px] uppercase font-bold text-zinc-400 block">Total Revenue Recorded</span>
          <span className="text-2xl font-black text-emerald-400">{formatCurrency(totalRev, currency)}</span>
        </div>
        <div className="p-5 rounded-2xl bg-[#1C1C1C] border border-[#2D2D2D]">
          <span className="text-[10px] uppercase font-bold text-zinc-400 block">Total Expenses Recorded</span>
          <span className="text-2xl font-black text-rose-400">{formatCurrency(totalExp, currency)}</span>
        </div>
        <div className="p-5 rounded-2xl bg-[#1C1C1C] border border-[#2D2D2D]">
          <span className="text-[10px] uppercase font-bold text-zinc-400 block">Net Company Profit</span>
          <span className="text-2xl font-black text-[#D4A017]">{formatCurrency(netProfit, currency)}</span>
        </div>
      </div>

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-[#262626] border border-[#333333] p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('revenues')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'revenues' ? 'bg-[#D4A017] text-[#1C1C1C]' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Revenues ({revenues.length})
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'expenses' ? 'bg-[#D4A017] text-[#1C1C1C]' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Expenses ({expenses.length})
          </button>
          <button
            onClick={() => setActiveTab('profitability')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'profitability' ? 'bg-[#D4A017] text-[#1C1C1C]' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Per-Bike Profitability
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'revenues' && (
            <button
              onClick={() => setIsAddRevenueOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#D4A017] text-[#1C1C1C] hover:bg-[#b88a10]"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Add Revenue
            </button>
          )}
          {activeTab === 'expenses' && (
            <button
              onClick={() => setIsAddExpenseOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-500"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Add Expense
            </button>
          )}
        </div>
      </div>

      {/* Revenues List */}
      {activeTab === 'revenues' && (
        <div className="rounded-2xl border border-[#2D2D2D] bg-[#1C1C1C] overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-[#F4F4F2]">
            <thead className="bg-[#222222] border-b border-[#2D2D2D] text-zinc-400 font-bold uppercase">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Category</th>
                <th className="p-4">Description</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4 font-bold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2A]">
              {revenues.map((rev) => (
                <tr key={rev.id} className="hover:bg-[#252525]">
                  <td className="p-4 font-mono text-zinc-400">{rev.date}</td>
                  <td className="p-4 font-bold text-[#D4A017]">{rev.category}</td>
                  <td className="p-4 font-semibold">{rev.description}</td>
                  <td className="p-4 text-zinc-300">{rev.paymentMethod}</td>
                  <td className="p-4 font-bold text-emerald-400">{formatCurrency(rev.amount, currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Expenses List */}
      {activeTab === 'expenses' && (
        <div className="rounded-2xl border border-[#2D2D2D] bg-[#1C1C1C] overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-[#F4F4F2]">
            <thead className="bg-[#222222] border-b border-[#2D2D2D] text-zinc-400 font-bold uppercase">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Category</th>
                <th className="p-4">Description & Supplier</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4 font-bold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2A]">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-[#252525]">
                  <td className="p-4 font-mono text-zinc-400">{exp.date}</td>
                  <td className="p-4 font-bold text-rose-400">{exp.category}</td>
                  <td className="p-4 font-semibold">
                    {exp.description}
                    {exp.supplier && <span className="text-zinc-400 block text-[10px]">Supplier: {exp.supplier}</span>}
                  </td>
                  <td className="p-4 text-zinc-300">{exp.paymentMethod}</td>
                  <td className="p-4 font-bold text-rose-400">-{formatCurrency(exp.amount, currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Per-Bike Profitability */}
      {activeTab === 'profitability' && (
        <div className="rounded-2xl border border-[#2D2D2D] bg-[#1C1C1C] p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-lg text-[#F4F4F2]">Motorcycle Fleet Net Profit Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {motorcycles.map((m) => {
              const netBikeProfit = m.totalRevenue - m.totalMaintenanceCost;
              return (
                <div key={m.id} className="p-4 rounded-xl bg-[#222222] border border-[#333333] space-y-2 text-xs">
                  <div className="flex justify-between font-bold text-sm text-[#F4F4F2]">
                    <span>{m.brand} {m.model} ({m.registrationNumber})</span>
                    <span className="text-[#D4A017]">{formatCurrency(netBikeProfit, currency)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-[#333333]">
                    <div><span className="text-zinc-400">Total Rental Rev:</span> <span className="font-bold text-emerald-400 block">{formatCurrency(m.totalRevenue, currency)}</span></div>
                    <div><span className="text-zinc-400">Maintenance Costs:</span> <span className="font-bold text-rose-400 block">{formatCurrency(m.totalMaintenanceCost, currency)}</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Revenue Modal */}
      {isAddRevenueOpen && (
        <Modal isOpen={isAddRevenueOpen} onClose={() => setIsAddRevenueOpen(false)} title="Record Revenue Entry">
          <form onSubmit={handleSaveRevenue} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-zinc-300 block mb-1">Category</label>
              <select
                value={revForm.category}
                onChange={(e) => setRevForm({ ...revForm, category: e.target.value as any })}
                className="w-full p-2.5 rounded-xl bg-[#262626] border border-[#333333] text-[#F4F4F2]"
              >
                <option value="Rental">Rental</option>
                <option value="Tour">Tour</option>
                <option value="Equipment">Equipment</option>
                <option value="Delivery">Delivery</option>
                <option value="Damage">Damage Charge</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-zinc-300 block mb-1">Amount (MAD)</label>
              <input
                type="number"
                required
                value={revForm.amount || ''}
                onChange={(e) => setRevForm({ ...revForm, amount: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-[#262626] border border-[#333333] text-[#F4F4F2]"
              />
            </div>
            <div>
              <label className="font-bold text-zinc-300 block mb-1">Description</label>
              <input
                type="text"
                required
                value={revForm.description || ''}
                onChange={(e) => setRevForm({ ...revForm, description: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#262626] border border-[#333333] text-[#F4F4F2]"
              />
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <button type="submit" className="px-5 py-2 rounded-xl font-bold bg-[#D4A017] text-[#1C1C1C]">Save Revenue</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Expense Modal */}
      {isAddExpenseOpen && (
        <Modal isOpen={isAddExpenseOpen} onClose={() => setIsAddExpenseOpen(false)} title="Record Expense Entry">
          <form onSubmit={handleSaveExpense} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-zinc-300 block mb-1">Category</label>
              <select
                value={expForm.category}
                onChange={(e) => setExpForm({ ...expForm, category: e.target.value as any })}
                className="w-full p-2.5 rounded-xl bg-[#262626] border border-[#333333] text-[#F4F4F2]"
              >
                <option value="Maintenance">Maintenance</option>
                <option value="Fuel">Fuel</option>
                <option value="Insurance">Insurance</option>
                <option value="Hotels">Hotels</option>
                <option value="Guides">Guides</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-zinc-300 block mb-1">Amount (MAD)</label>
              <input
                type="number"
                required
                value={expForm.amount || ''}
                onChange={(e) => setExpForm({ ...expForm, amount: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-[#262626] border border-[#333333] text-[#F4F4F2]"
              />
            </div>
            <div>
              <label className="font-bold text-zinc-300 block mb-1">Description</label>
              <input
                type="text"
                required
                value={expForm.description || ''}
                onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#262626] border border-[#333333] text-[#F4F4F2]"
              />
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <button type="submit" className="px-5 py-2 rounded-xl font-bold bg-rose-600 text-white">Save Expense</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
