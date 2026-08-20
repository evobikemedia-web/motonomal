import React, { useState } from 'react';
import { 
  Bike, Search, Plus, Filter, LayoutGrid, List, Wrench, Shield, 
  TrendingUp, Calendar, AlertTriangle, Edit, Trash2, DollarSign, Activity, Eye 
} from 'lucide-react';
import { Motorcycle, MotorcycleStatus, Reservation, MaintenanceRecord } from '../../types';
import { dbStore } from '../../services/db';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { formatCurrency, calculateDepreciation } from '../../utils/calculations';
import { useLanguage } from '../../context/LanguageContext';

interface FleetModuleProps {
  motorcycles: Motorcycle[];
  reservations: Reservation[];
  maintenance: MaintenanceRecord[];
  currency: 'MAD' | 'EUR' | 'USD';
  onUpdate: () => void;
  initialOpenAddModal?: boolean;
}

export const FleetModule: React.FC<FleetModuleProps> = ({
  motorcycles,
  reservations,
  maintenance,
  currency,
  onUpdate,
  initialOpenAddModal = false,
}) => {
  const { t, formatCurrencyVal } = useLanguage();
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedBike, setSelectedBike] = useState<Motorcycle | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(initialOpenAddModal);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteBikeId, setDeleteBikeId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Motorcycle>>({
    brand: 'BMW',
    model: 'R 1250 GS Adventure',
    version: 'Triple Black',
    year: 2024,
    registrationNumber: '',
    vin: '',
    color: 'Black',
    category: 'Adventure',
    engineSize: 1254,
    purchaseDate: '2024-01-01',
    purchasePrice: 200000,
    residualValue: 100000,
    usefulLifeYears: 5,
    depreciationMethod: 'Straight-line',
    currentMileage: 10000,
    currentStatus: 'Available',
    currentLocation: 'Marrakech HQ',
    supplier: 'SMEIA BMW Morocco',
    insuranceCompany: 'AXA Assurance',
    insurancePolicyNumber: '',
    insuranceExpiry: '2026-12-31',
    techInspectionExpiry: '2026-11-30',
    dailyPrice: 1200,
    weeklyPrice: 7200,
    monthlyPrice: 24000,
    depositAmount: 15000,
    photos: ['https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80'],
  });

  const handleOpenAdd = () => {
    setFormData({
      brand: 'Yamaha',
      model: 'Ténéré 700',
      version: 'Rally',
      year: 2024,
      registrationNumber: '',
      vin: '',
      color: 'Blue',
      category: 'Adventure',
      engineSize: 689,
      purchaseDate: new Date().toISOString().split('T')[0],
      purchasePrice: 130000,
      residualValue: 65000,
      usefulLifeYears: 5,
      depreciationMethod: 'Straight-line',
      currentMileage: 5000,
      currentStatus: 'Available',
      currentLocation: 'Marrakech HQ',
      supplier: 'Yamaha Morocco',
      insuranceCompany: 'AXA Assurance',
      insurancePolicyNumber: '',
      insuranceExpiry: '2027-01-01',
      techInspectionExpiry: '2026-12-31',
      dailyPrice: 950,
      weeklyPrice: 5700,
      monthlyPrice: 19000,
      depositAmount: 10000,
      photos: ['https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80'],
    });
    setIsAddModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditModalOpen && selectedBike) {
      dbStore.updateItem<Motorcycle>('motorcycles', selectedBike.id, formData);
      setIsEditModalOpen(false);
    } else {
      const dep = calculateDepreciation(
        Number(formData.purchasePrice) || 150000,
        Number(formData.residualValue) || 75000,
        Number(formData.usefulLifeYears) || 5,
        formData.purchaseDate || '2024-01-01'
      );

      const newBike: Motorcycle = {
        id: `moto-${Date.now()}`,
        brand: formData.brand || 'BMW',
        model: formData.model || 'GS',
        version: formData.version || '',
        year: Number(formData.year) || 2024,
        registrationNumber: formData.registrationNumber || `${Math.floor(10000 + Math.random() * 90000)}-A-26`,
        vin: formData.vin || `VIN${Date.now()}`,
        color: formData.color || 'Black',
        category: formData.category || 'Adventure',
        engineSize: Number(formData.engineSize) || 1200,
        purchaseDate: formData.purchaseDate || '2024-01-01',
        purchasePrice: Number(formData.purchasePrice) || 150000,
        residualValue: Number(formData.residualValue) || 75000,
        usefulLifeYears: Number(formData.usefulLifeYears) || 5,
        depreciationMethod: 'Straight-line',
        currentMileage: Number(formData.currentMileage) || 0,
        currentStatus: (formData.currentStatus as MotorcycleStatus) || 'Available',
        currentLocation: formData.currentLocation || 'Marrakech HQ',
        supplier: formData.supplier || 'Morocco Dealer',
        insuranceCompany: formData.insuranceCompany || 'AXA',
        insurancePolicyNumber: formData.insurancePolicyNumber || 'POL-99128',
        insuranceExpiry: formData.insuranceExpiry || '2026-12-31',
        techInspectionExpiry: formData.techInspectionExpiry || '2026-11-30',
        dailyPrice: Number(formData.dailyPrice) || 1000,
        weeklyPrice: Number(formData.weeklyPrice) || 6000,
        monthlyPrice: Number(formData.monthlyPrice) || 20000,
        depositAmount: Number(formData.depositAmount) || 10000,
        photos: formData.photos || ['https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80'],
        totalRevenue: 0,
        totalMaintenanceCost: 0,
        currentBookValue: dep.currentBookValue,
        estimatedMarketValue: Number(formData.purchasePrice) * 0.9,
        createdAt: new Date().toISOString(),
      };
      dbStore.addItem<Motorcycle>('motorcycles', newBike);
      setIsAddModalOpen(false);
    }
    onUpdate();
  };

  const handleDelete = () => {
    if (deleteBikeId) {
      dbStore.deleteItem<Motorcycle>('motorcycles', deleteBikeId);
      setDeleteBikeId(null);
      setSelectedBike(null);
      onUpdate();
    }
  };

  // Filter bikes
  const filteredBikes = motorcycles.filter((m) => {
    const matchesSearch = 
      `${m.brand} ${m.model} ${m.registrationNumber} ${m.vin} ${m.category}`
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || m.currentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Dedicated Fleet Metrics
  const totalFleetInvestment = motorcycles.reduce((acc, m) => acc + m.purchasePrice, 0);
  const totalFleetRevenue = motorcycles.reduce((acc, m) => acc + m.totalRevenue, 0);
  const totalFleetMaintenance = motorcycles.reduce((acc, m) => acc + m.totalMaintenanceCost, 0);
  const netFleetProfit = totalFleetRevenue - totalFleetMaintenance;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Fleet Dashboard KPI Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#1C1C1C] border border-[#2D2D2D]">
          <span className="text-[10px] uppercase font-bold text-zinc-400 block">Total Fleet Investment</span>
          <span className="text-xl font-black text-[#F4F4F2]">{formatCurrency(totalFleetInvestment, currency)}</span>
        </div>
        <div className="p-4 rounded-2xl bg-[#1C1C1C] border border-[#2D2D2D]">
          <span className="text-[10px] uppercase font-bold text-zinc-400 block">Total Rental Revenue</span>
          <span className="text-xl font-black text-emerald-400">{formatCurrency(totalFleetRevenue, currency)}</span>
        </div>
        <div className="p-4 rounded-2xl bg-[#1C1C1C] border border-[#2D2D2D]">
          <span className="text-[10px] uppercase font-bold text-zinc-400 block">Total Maintenance Costs</span>
          <span className="text-xl font-black text-rose-400">{formatCurrency(totalFleetMaintenance, currency)}</span>
        </div>
        <div className="p-4 rounded-2xl bg-[#1C1C1C] border border-[#2D2D2D]">
          <span className="text-[10px] uppercase font-bold text-zinc-400 block">Net Fleet Profit</span>
          <span className="text-xl font-black text-[#D4A017]">{formatCurrency(netFleetProfit, currency)}</span>
        </div>
      </div>

      {/* Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#F4F4F2] flex items-center gap-2">
            <Bike className="w-6 h-6 text-[#D4A017]" /> Motorcycle Fleet Management
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time status board, mileage logs, insurance expirations, and profitability per bike.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#262626] border border-[#333333] rounded-xl p-1 text-xs">
            <button
              onClick={() => setViewMode('board')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-colors ${
                viewMode === 'board' ? 'bg-[#D4A017] text-[#1C1C1C]' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Visual Board
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-colors ${
                viewMode === 'list' ? 'bg-[#D4A017] text-[#1C1C1C]' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" /> Table List
            </button>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#D4A017] text-[#1C1C1C] hover:bg-[#b88a10] transition-colors shadow-lg shadow-[#D4A017]/10"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Add Motorcycle
          </button>
        </div>
      </div>

      {/* Search & Status Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3 p-4 rounded-2xl bg-[#1C1C1C] border border-[#2D2D2D]">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 w-4 h-4 text-zinc-400 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search brand, model, plate, VIN or category..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#262626] border border-[#333333] text-xs text-[#F4F4F2] focus:outline-none focus:border-[#D4A017]"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#D4A017]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#262626] border border-[#333333] text-xs text-[#F4F4F2] focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="Available">Available (Green)</option>
            <option value="Reserved">Reserved (Yellow)</option>
            <option value="Rented">Rented (Blue)</option>
            <option value="Maintenance">Maintenance (Orange)</option>
            <option value="Damaged">Damaged (Red)</option>
            <option value="Out of service">Out of Service (Gray)</option>
          </select>
        </div>
      </div>

      {/* Visual Board View */}
      {viewMode === 'board' ? (
        filteredBikes.length === 0 ? (
          <EmptyState
            title="No motorcycles found"
            description="No bikes match the current filter or search criteria."
            actionLabel="Add Motorcycle"
            onAction={handleOpenAdd}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBikes.map((bike) => {
              const bikePhoto = bike.photos?.[0] || 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80';
              const bikeProfit = bike.totalRevenue - bike.totalMaintenanceCost;

              return (
                <div
                  key={bike.id}
                  onClick={() => setSelectedBike(bike)}
                  className="group relative rounded-2xl bg-[#1C1C1C] border border-[#2D2D2D] hover:border-[#D4A017] transition-all overflow-hidden shadow-xl cursor-pointer flex flex-col justify-between"
                >
                  {/* Photo Header */}
                  <div className="relative h-44 w-full bg-[#141414] overflow-hidden">
                    <img
                      src={bikePhoto}
                      alt={`${bike.brand} ${bike.model}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge status={bike.currentStatus} />
                    </div>
                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-sm text-xs font-mono font-bold text-[#D4A017] border border-[#D4A017]/30">
                      {bike.registrationNumber}
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 space-y-3 flex-1">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#D4A017] tracking-wider block">
                        {bike.brand} · {bike.category}
                      </span>
                      <h3 className="text-base font-black text-[#F4F4F2] truncate">
                        {bike.model} {bike.version} ({bike.year})
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#2A2A2A]">
                      <div>
                        <span className="text-zinc-500 block text-[10px]">Daily Rate</span>
                        <span className="font-bold text-[#F4F4F2]">{formatCurrency(bike.dailyPrice, currency)}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[10px]">Current Mileage</span>
                        <span className="font-bold text-zinc-300">{bike.currentMileage.toLocaleString()} km</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[10px]">Location</span>
                        <span className="font-semibold text-zinc-300 truncate block">{bike.currentLocation}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[10px]">Net Profit</span>
                        <span className="font-bold text-emerald-400">{formatCurrency(bikeProfit, currency)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="px-5 py-3 bg-[#171717] border-t border-[#2A2A2A] flex items-center justify-between text-xs">
                    <span className="text-zinc-400 flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-[#D4A017]" /> Click to Inspect
                    </span>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          setSelectedBike(bike);
                          setFormData(bike);
                          setIsEditModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                        title="Edit Motorcycle"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteBikeId(bike.id)}
                        className="p-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-400"
                        title="Delete Motorcycle"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* List View */
        <div className="rounded-2xl border border-[#2D2D2D] bg-[#1C1C1C] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#F4F4F2]">
              <thead className="bg-[#222222] border-b border-[#2D2D2D] text-zinc-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Motorcycle Model</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Plate / VIN</th>
                  <th className="p-4">Daily Price</th>
                  <th className="p-4">Mileage</th>
                  <th className="p-4">Insurance Expiry</th>
                  <th className="p-4">Total Revenue</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2A]">
                {filteredBikes.map((bike) => (
                  <tr
                    key={bike.id}
                    className="hover:bg-[#252525] transition-colors cursor-pointer"
                    onClick={() => setSelectedBike(bike)}
                  >
                    <td className="p-4 font-bold text-sm text-[#F4F4F2]">
                      {bike.brand} {bike.model} ({bike.year})
                      <span className="text-[10px] text-zinc-400 block font-normal">{bike.category} · {bike.engineSize}cc</span>
                    </td>
                    <td className="p-4"><Badge status={bike.currentStatus} /></td>
                    <td className="p-4 font-mono font-semibold">{bike.registrationNumber}</td>
                    <td className="p-4 font-bold text-[#D4A017]">{formatCurrency(bike.dailyPrice, currency)}</td>
                    <td className="p-4">{bike.currentMileage.toLocaleString()} km</td>
                    <td className="p-4 text-emerald-400 font-semibold">{bike.insuranceExpiry}</td>
                    <td className="p-4 font-bold text-emerald-400">{formatCurrency(bike.totalRevenue, currency)}</td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          setSelectedBike(bike);
                          setFormData(bike);
                          setIsEditModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 mr-2"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteBikeId(bike.id)}
                        className="p-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Motorcycle Detailed Inspection Profile Modal */}
      {selectedBike && !isEditModalOpen && (
        <Modal
          isOpen={!!selectedBike}
          onClose={() => setSelectedBike(null)}
          title={`${selectedBike.brand} ${selectedBike.model} ${selectedBike.version}`}
          subtitle={`Reg: ${selectedBike.registrationNumber} | VIN: ${selectedBike.vin}`}
          maxWidth="4xl"
        >
          <div className="space-y-6 text-xs">
            {/* Top Status & Financial Badges */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#222222] border border-[#333333]">
              <div className="flex items-center gap-3">
                <Badge status={selectedBike.currentStatus} size="lg" />
                <span className="font-bold text-zinc-300">{selectedBike.currentLocation}</span>
              </div>
              <div className="flex items-center gap-4 text-right">
                <div>
                  <span className="text-[10px] text-zinc-400 block">Daily Rental</span>
                  <span className="font-black text-sm text-[#D4A017]">{formatCurrency(selectedBike.dailyPrice, currency)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block">Total Revenue</span>
                  <span className="font-black text-sm text-emerald-400">{formatCurrency(selectedBike.totalRevenue, currency)}</span>
                </div>
              </div>
            </div>

            {/* Financial & Depreciation Specs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-[#222222] border border-[#333333] space-y-2">
                <h4 className="font-bold text-sm text-[#D4A017] border-b border-[#333333] pb-2">
                  Technical Specifications & Compliance
                </h4>
                <div><span className="text-zinc-400">Category / Engine:</span> <span className="font-bold text-[#F4F4F2]">{selectedBike.category} ({selectedBike.engineSize} cc)</span></div>
                <div><span className="text-zinc-400">Color:</span> <span className="font-semibold text-[#F4F4F2]">{selectedBike.color}</span></div>
                <div><span className="text-zinc-400">Mileage:</span> <span className="font-bold text-[#F4F4F2]">{selectedBike.currentMileage.toLocaleString()} km</span></div>
                <div><span className="text-zinc-400">Insurance Expiry:</span> <span className="font-bold text-emerald-400">{selectedBike.insuranceExpiry} ({selectedBike.insuranceCompany})</span></div>
                <div><span className="text-zinc-400">Technical Inspection Expiry:</span> <span className="font-bold text-emerald-400">{selectedBike.techInspectionExpiry}</span></div>
              </div>

              <div className="p-4 rounded-xl bg-[#222222] border border-[#333333] space-y-2">
                <h4 className="font-bold text-sm text-[#D4A017] border-b border-[#333333] pb-2">
                  Depreciation & Book Value
                </h4>
                {(() => {
                  const dep = calculateDepreciation(selectedBike.purchasePrice, selectedBike.residualValue, selectedBike.usefulLifeYears, selectedBike.purchaseDate);
                  return (
                    <>
                      <div><span className="text-zinc-400">Purchase Price:</span> <span className="font-bold text-[#F4F4F2]">{formatCurrency(selectedBike.purchasePrice, currency)}</span></div>
                      <div><span className="text-zinc-400">Accumulated Depreciation:</span> <span className="font-bold text-rose-400">-{formatCurrency(dep.accumulatedDepreciation, currency)}</span></div>
                      <div><span className="text-zinc-400">Current Book Value:</span> <span className="font-bold text-[#D4A017]">{formatCurrency(dep.currentBookValue, currency)}</span></div>
                      <div><span className="text-zinc-400">Estimated Market Value:</span> <span className="font-bold text-emerald-400">{formatCurrency(selectedBike.estimatedMarketValue, currency)}</span></div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Add / Edit Motorcycle Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <Modal
          isOpen={isAddModalOpen || isEditModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
          }}
          title={isEditModalOpen ? 'Edit Motorcycle' : 'Add New Fleet Motorcycle'}
          maxWidth="3xl"
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-zinc-300 block mb-1">Brand *</label>
                <input
                  type="text"
                  required
                  value={formData.brand || ''}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#262626] border border-[#333333] text-[#F4F4F2]"
                />
              </div>
              <div>
                <label className="font-bold text-zinc-300 block mb-1">Model *</label>
                <input
                  type="text"
                  required
                  value={formData.model || ''}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#262626] border border-[#333333] text-[#F4F4F2]"
                />
              </div>
              <div>
                <label className="font-bold text-zinc-300 block mb-1">Version / Spec</label>
                <input
                  type="text"
                  value={formData.version || ''}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#262626] border border-[#333333] text-[#F4F4F2]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-zinc-300 block mb-1">Registration Plate *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 67890-A-26"
                  value={formData.registrationNumber || ''}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#262626] border border-[#333333] text-[#F4F4F2]"
                />
              </div>
              <div>
                <label className="font-bold text-zinc-300 block mb-1">VIN Number *</label>
                <input
                  type="text"
                  required
                  value={formData.vin || ''}
                  onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#262626] border border-[#333333] text-[#F4F4F2]"
                />
              </div>
              <div>
                <label className="font-bold text-zinc-300 block mb-1">Category</label>
                <select
                  value={formData.category || 'Adventure'}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl bg-[#262626] border border-[#333333] text-[#F4F4F2]"
                >
                  <option value="Adventure">Adventure</option>
                  <option value="Enduro">Enduro</option>
                  <option value="Touring">Touring</option>
                  <option value="Scrambler">Scrambler</option>
                  <option value="Trail">Trail</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-zinc-300 block mb-1">Daily Price (MAD) *</label>
                <input
                  type="number"
                  required
                  value={formData.dailyPrice || ''}
                  onChange={(e) => setFormData({ ...formData, dailyPrice: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl bg-[#262626] border border-[#333333] text-[#F4F4F2]"
                />
              </div>
              <div>
                <label className="font-bold text-zinc-300 block mb-1">Purchase Price (MAD) *</label>
                <input
                  type="number"
                  required
                  value={formData.purchasePrice || ''}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl bg-[#262626] border border-[#333333] text-[#F4F4F2]"
                />
              </div>
              <div>
                <label className="font-bold text-zinc-300 block mb-1">Status</label>
                <select
                  value={formData.currentStatus || 'Available'}
                  onChange={(e) => setFormData({ ...formData, currentStatus: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl bg-[#262626] border border-[#333333] text-[#F4F4F2]"
                >
                  <option value="Available">Available (Green)</option>
                  <option value="Reserved">Reserved (Yellow)</option>
                  <option value="Rented">Rented (Blue)</option>
                  <option value="Maintenance">Maintenance (Orange)</option>
                  <option value="Damaged">Damaged (Red)</option>
                  <option value="Out of service">Out of Service (Gray)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#2D2D2D]">
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl font-bold bg-zinc-800 text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl font-bold bg-[#D4A017] text-[#1C1C1C]"
              >
                Save Motorcycle
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteBikeId}
        onClose={() => setDeleteBikeId(null)}
        onConfirm={handleDelete}
        title="Delete Motorcycle?"
        message="Are you sure you want to delete this motorcycle record from the Motonomad fleet?"
        isDestructive
      />
    </div>
  );
};
