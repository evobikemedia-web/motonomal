import React, { useState } from 'react';
import { 
  Calendar, Search, Plus, Filter, LayoutGrid, List, CheckCircle2, 
  XCircle, Clock, AlertTriangle, FileText, User, Bike, DollarSign, Edit, Trash2, ShieldCheck, Key 
} from 'lucide-react';
import { Reservation, Motorcycle, Client, ReservationStatus, PaymentStatus } from '../../types';
import { dbStore } from '../../services/db';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { CheckInOutModal } from '../handover/CheckInOutModal';
import { 
  formatCurrency, calculateRentalDays, calculateRentalPrice, isMotorcycleAvailable 
} from '../../utils/calculations';

interface ReservationsModuleProps {
  reservations: Reservation[];
  motorcycles: Motorcycle[];
  clients: Client[];
  currency: 'MAD' | 'EUR' | 'USD';
  onUpdate: () => void;
  initialOpenAddModal?: boolean;
}

export const ReservationsModule: React.FC<ReservationsModuleProps> = ({
  reservations,
  motorcycles,
  clients,
  currency,
  onUpdate,
  initialOpenAddModal = false,
}) => {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(initialOpenAddModal);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteResId, setDeleteResId] = useState<string | null>(null);
  const [doubleBookingError, setDoubleBookingError] = useState<string | null>(null);

  // Handover (Check-in / Check-out) Modal state
  const [handoverRes, setHandoverRes] = useState<{ res: Reservation; mode: 'checkout' | 'checkin' } | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Reservation>>({
    clientId: clients[0]?.id || '',
    motorcycleId: motorcycles[0]?.id || '',
    startDate: '2026-08-15',
    endDate: '2026-08-20',
    pickupLocation: 'Marrakech Airport (RAK)',
    dropoffLocation: 'Marrakech HQ',
    basePrice: 5000,
    extrasPrice: 400,
    discountAmount: 0,
    depositAmount: 10000,
    amountPaid: 2000,
    paymentStatus: 'Partial',
    bookingSource: 'Direct',
    responsibleEmployee: 'Tarik Ouhssain',
    status: 'Confirmed',
    notes: '',
  });

  const handleOpenAdd = () => {
    setDoubleBookingError(null);
    const start = '2026-08-15';
    const end = '2026-08-20';
    const days = calculateRentalDays(start, end);
    const defaultBike = motorcycles[0];
    const base = defaultBike ? calculateRentalPrice(defaultBike, days) : 5000;

    setFormData({
      clientId: clients[0]?.id || '',
      motorcycleId: defaultBike?.id || '',
      startDate: start,
      endDate: end,
      pickupLocation: 'Marrakech HQ',
      dropoffLocation: 'Marrakech HQ',
      basePrice: base,
      extrasPrice: 300,
      discountAmount: 0,
      depositAmount: defaultBike?.depositAmount || 10000,
      amountPaid: Math.round(base * 0.3),
      paymentStatus: 'Partial',
      bookingSource: 'Website',
      responsibleEmployee: 'Tarik Ouhssain',
      status: 'Confirmed',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setDoubleBookingError(null);

    const client = clients.find((c) => c.id === formData.clientId);
    const bike = motorcycles.find((m) => m.id === formData.motorcycleId);

    if (!client || !bike) return;

    const startDate = formData.startDate || '2026-08-15';
    const endDate = formData.endDate || '2026-08-20';

    // DOUBLE BOOKING CHECK
    const availCheck = isMotorcycleAvailable(
      bike.id,
      startDate,
      endDate,
      reservations,
      isEditModalOpen ? selectedRes?.id : undefined
    );

    if (!availCheck.available && availCheck.conflictingReservation) {
      const conf = availCheck.conflictingReservation;
      setDoubleBookingError(
        `CONFLICT DETECTED: Motorcycle ${bike.brand} ${bike.model} (${bike.registrationNumber}) is already booked from ${conf.startDate} to ${conf.endDate} by ${conf.clientName} (Booking ID: ${conf.id}). Double booking prevented!`
      );
      return;
    }

    const days = calculateRentalDays(startDate, endDate);
    const basePrice = formData.basePrice || calculateRentalPrice(bike, days);
    const extras = formData.extrasPrice || 0;
    const discount = formData.discountAmount || 0;
    const totalPrice = Math.max(0, basePrice + extras - discount);
    const amountPaid = formData.amountPaid || 0;
    const remainingBalance = Math.max(0, totalPrice - amountPaid);

    let payStatus: PaymentStatus = 'Pending';
    if (amountPaid >= totalPrice && totalPrice > 0) payStatus = 'Paid';
    else if (amountPaid > 0) payStatus = 'Partial';

    if (isEditModalOpen && selectedRes) {
      dbStore.updateItem<Reservation>('reservations', selectedRes.id, {
        ...formData,
        clientName: client.fullName,
        clientEmail: client.email,
        clientPhone: client.phone,
        motorcycleName: `${bike.brand} ${bike.model} (${bike.registrationNumber})`,
        regNumber: bike.registrationNumber,
        rentalDays: days,
        totalPrice,
        remainingBalance,
        paymentStatus: payStatus,
      });
      setIsEditModalOpen(false);
    } else {
      const newRes: Reservation = {
        id: `res-${Math.floor(100 + Math.random() * 900)}`,
        clientId: client.id,
        clientName: client.fullName,
        clientEmail: client.email,
        clientPhone: client.phone,
        motorcycleId: bike.id,
        motorcycleName: `${bike.brand} ${bike.model} (${bike.registrationNumber})`,
        regNumber: bike.registrationNumber,
        startDate,
        endDate,
        rentalDays: days,
        pickupLocation: formData.pickupLocation || 'Marrakech HQ',
        dropoffLocation: formData.dropoffLocation || 'Marrakech HQ',
        basePrice,
        extrasPrice: extras,
        discountAmount: discount,
        taxAmount: 0,
        totalPrice,
        depositAmount: formData.depositAmount || bike.depositAmount,
        amountPaid,
        remainingBalance,
        paymentStatus: payStatus,
        bookingSource: formData.bookingSource || 'Direct',
        responsibleEmployee: formData.responsibleEmployee || 'Tarik Ouhssain',
        status: (formData.status as ReservationStatus) || 'Confirmed',
        notes: formData.notes || '',
        createdAt: new Date().toISOString(),
      };

      dbStore.addItem<Reservation>('reservations', newRes);

      // AUTOMATIC FLEET STATUS UPDATE
      if (newRes.status === 'Confirmed') {
        dbStore.updateItem<Motorcycle>('motorcycles', bike.id, { currentStatus: 'Reserved' });
      } else if (newRes.status === 'Active') {
        dbStore.updateItem<Motorcycle>('motorcycles', bike.id, { currentStatus: 'Rented' });
      }

      setIsAddModalOpen(false);
    }
    onUpdate();
  };

  const handleDelete = () => {
    if (deleteResId) {
      dbStore.deleteItem<Reservation>('reservations', deleteResId);
      setDeleteResId(null);
      setSelectedRes(null);
      onUpdate();
    }
  };

  const filteredReservations = reservations.filter((r) => {
    const matchesSearch = 
      r.clientName.toLowerCase().includes(search.toLowerCase()) ||
      r.motorcycleName.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.regNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#F4F4F2] flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#D4A017]" /> Reservation & Rental Management
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Automatic availability validation, rental contract tracking, check-in/out handovers, and double booking prevention.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#262626] border border-[#333333] rounded-xl p-1 text-xs">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-colors ${
                viewMode === 'list' ? 'bg-[#D4A017] text-[#1C1C1C]' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" /> Booking List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-colors ${
                viewMode === 'calendar' ? 'bg-[#D4A017] text-[#1C1C1C]' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" /> Calendar View
            </button>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#D4A017] text-[#1C1C1C] hover:bg-[#b88a10] transition-colors shadow-lg shadow-[#D4A017]/10"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> New Reservation
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3 p-4 rounded-2xl bg-[#1C1C1C] border border-[#2D2D2D]">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 w-4 h-4 text-zinc-400 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search booking ID, rider name, bike, or registration..."
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
            <option value="Confirmed">Confirmed</option>
            <option value="Active">Active (Rented)</option>
            <option value="Pending">Pending</option>
            <option value="Returned">Returned</option>
            <option value="Closed">Closed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* List View */}
      {viewMode === 'list' ? (
        filteredReservations.length === 0 ? (
          <EmptyState
            title="No reservations found"
            description="No bookings match your selected criteria."
            actionLabel="New Reservation"
            onAction={handleOpenAdd}
          />
        ) : (
          <div className="rounded-2xl border border-[#2D2D2D] bg-[#1C1C1C] overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#F4F4F2]">
                <thead className="bg-[#222222] border-b border-[#2D2D2D] text-zinc-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Booking ID / Status</th>
                    <th className="p-4">Rider / Customer</th>
                    <th className="p-4">Motorcycle Assigned</th>
                    <th className="p-4">Dates & Duration</th>
                    <th className="p-4">Financial Summary</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4 text-right">Handover & Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2A2A]">
                  {filteredReservations.map((res) => (
                    <tr
                      key={res.id}
                      className="hover:bg-[#252525] transition-colors cursor-pointer"
                      onClick={() => setSelectedRes(res)}
                    >
                      <td className="p-4">
                        <span className="font-bold text-sm text-[#D4A017] block">{res.id}</span>
                        <div className="mt-1"><Badge status={res.status} /></div>
                      </td>
                      <td className="p-4 font-bold text-sm text-[#F4F4F2]">
                        {res.clientName}
                        <span className="text-[10px] text-zinc-400 block font-normal">{res.clientPhone}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold">{res.motorcycleName}</span>
                        <span className="text-[10px] text-[#D4A017] block font-mono">Reg: {res.regNumber}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold block">{res.startDate} → {res.endDate}</span>
                        <span className="text-[10px] text-zinc-400 font-bold">{res.rentalDays} Rental Days</span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-sm text-[#F4F4F2]">{formatCurrency(res.totalPrice, currency)}</span>
                        {res.remainingBalance > 0 && (
                          <span className="text-[10px] text-rose-400 block font-bold">
                            Due: {formatCurrency(res.remainingBalance, currency)}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge status={res.paymentStatus} size="sm" />
                      </td>
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          {res.status === 'Confirmed' && (
                            <button
                              onClick={() => setHandoverRes({ res, mode: 'checkout' })}
                              className="px-2.5 py-1 rounded-lg bg-[#D4A017] text-[#1C1C1C] font-bold text-[11px] hover:bg-[#b88a10] flex items-center gap-1"
                              title="Perform Handover Check-out"
                            >
                              <Key className="w-3 h-3" /> Check-Out
                            </button>
                          )}
                          {res.status === 'Active' && (
                            <button
                              onClick={() => setHandoverRes({ res, mode: 'checkin' })}
                              className="px-2.5 py-1 rounded-lg bg-sky-600 text-white font-bold text-[11px] hover:bg-sky-500 flex items-center gap-1"
                              title="Perform Return Check-in"
                            >
                              <CheckCircle2 className="w-3 h-3" /> Check-In
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedRes(res);
                              setFormData(res);
                              setIsEditModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteResId(res.id)}
                            className="p-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        /* Calendar View */
        <div className="p-6 rounded-2xl bg-[#1C1C1C] border border-[#2D2D2D] shadow-xl space-y-4">
          <h3 className="font-bold text-lg text-[#F4F4F2] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#D4A017]" /> August 2026 Fleet Schedule
          </h3>
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-zinc-400 border-b border-[#2D2D2D] pb-2">
            <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div>
          </div>
          <div className="grid grid-cols-7 gap-2 text-xs">
            {Array.from({ length: 31 }, (_, i) => {
              const dayNum = i + 1;
              const dateStr = `2026-08-${dayNum < 10 ? '0' + dayNum : dayNum}`;
              const dayBookings = reservations.filter((r) => r.startDate <= dateStr && r.endDate >= dateStr);

              return (
                <div key={dayNum} className="min-h-24 p-2 rounded-xl bg-[#222222] border border-[#2D2D2D] space-y-1">
                  <span className="font-bold text-zinc-400 text-[11px]">{dayNum}</span>
                  {dayBookings.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => setSelectedRes(b)}
                      className="p-1 rounded bg-[#D4A017]/20 border border-[#D4A017]/40 text-[#D4A017] text-[10px] font-semibold truncate cursor-pointer hover:bg-[#D4A017] hover:text-[#1C1C1C] transition-colors"
                      title={`${b.clientName} - ${b.motorcycleName}`}
                    >
                      {b.clientName.split(' ')[0]} ({b.regNumber})
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reservation Details Modal */}
      {selectedRes && !isEditModalOpen && (
        <Modal
          isOpen={!!selectedRes}
          onClose={() => setSelectedRes(null)}
          title={`Booking Details: ${selectedRes.id}`}
          subtitle={`Status: ${selectedRes.status} | Source: ${selectedRes.bookingSource}`}
          maxWidth="3xl"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#222222] border border-[#333333]">
              <div>
                <span className="text-zinc-400 block">Rider / Client</span>
                <span className="font-bold text-sm text-[#F4F4F2]">{selectedRes.clientName}</span>
                <span className="text-zinc-400 block">{selectedRes.clientPhone} · {selectedRes.clientEmail}</span>
              </div>
              <div>
                <span className="text-zinc-400 block">Assigned Motorcycle</span>
                <span className="font-bold text-sm text-[#D4A017]">{selectedRes.motorcycleName}</span>
                <span className="text-zinc-400 block font-mono">Reg: {selectedRes.regNumber}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 rounded-xl bg-[#252525] border border-[#333333]">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Dates</span>
                <span className="font-bold text-[#F4F4F2]">{selectedRes.startDate} → {selectedRes.endDate}</span>
                <span className="text-zinc-400 block text-[10px]">{selectedRes.rentalDays} days</span>
              </div>
              <div className="p-3 rounded-xl bg-[#252525] border border-[#333333]">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Total Price</span>
                <span className="font-bold text-[#F4F4F2] text-sm">{formatCurrency(selectedRes.totalPrice, currency)}</span>
                <span className="text-emerald-400 block text-[10px] font-bold">Paid: {formatCurrency(selectedRes.amountPaid, currency)}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#252525] border border-[#333333]">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Remaining Balance</span>
                <span className="font-bold text-rose-400 text-sm">{formatCurrency(selectedRes.remainingBalance, currency)}</span>
              </div>
            </div>

            {selectedRes.checkoutInfo && (
              <div className="p-4 rounded-xl bg-[#1E293B] border border-sky-800 text-sky-200 space-y-1">
                <span className="font-bold block text-sky-400">Handover Check-out Record:</span>
                <p>Checked out at {selectedRes.checkoutInfo.mileage} km | Condition: {selectedRes.checkoutInfo.conditionNotes}</p>
                <p className="text-[11px] text-sky-300">Customer Sig: {selectedRes.checkoutInfo.customerSignature}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Add / Edit Reservation Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <Modal
          isOpen={isAddModalOpen || isEditModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
          }}
          title={isEditModalOpen ? 'Edit Reservation' : 'Create New Reservation'}
          maxWidth="3xl"
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            {/* Error Alert for Double Booking */}
            {doubleBookingError && (
              <div className="p-3 rounded-xl bg-rose-950 border border-rose-800 text-rose-200 flex items-start gap-2 leading-relaxed">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <span>{doubleBookingError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-zinc-300 block mb-1">Select Rider / Client *</label>
                <select
                  required
                  value={formData.clientId || ''}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#262626] border border-[#333333] text-[#F4F4F2]"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.fullName} ({c.nationality})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-zinc-300 block mb-1">Select Motorcycle *</label>
                <select
                  required
                  value={formData.motorcycleId || ''}
                  onChange={(e) => setFormData({ ...formData, motorcycleId: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#262626] border border-[#333333] text-[#F4F4F2]"
                >
                  {motorcycles.map((m) => (
                    <option key={m.id} value={m.id}>{m.brand} {m.model} ({m.registrationNumber}) - {formatCurrency(m.dailyPrice, currency)}/day</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-zinc-300 block mb-1">Start Date *</label>
                <input
                  type="date"
                  required
                  value={formData.startDate || ''}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#262626] border border-[#333333] text-[#F4F4F2]"
                />
              </div>
              <div>
                <label className="font-bold text-zinc-300 block mb-1">End Date *</label>
                <input
                  type="date"
                  required
                  value={formData.endDate || ''}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#262626] border border-[#333333] text-[#F4F4F2]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-zinc-300 block mb-1">Base Rental Price (MAD)</label>
                <input
                  type="number"
                  value={formData.basePrice || ''}
                  onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl bg-[#262626] border border-[#333333] text-[#F4F4F2]"
                />
              </div>
              <div>
                <label className="font-bold text-zinc-300 block mb-1">Amount Paid Deposit (MAD)</label>
                <input
                  type="number"
                  value={formData.amountPaid || ''}
                  onChange={(e) => setFormData({ ...formData, amountPaid: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl bg-[#262626] border border-[#333333] text-[#F4F4F2]"
                />
              </div>
              <div>
                <label className="font-bold text-zinc-300 block mb-1">Booking Status</label>
                <select
                  value={formData.status || 'Confirmed'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl bg-[#262626] border border-[#333333] text-[#F4F4F2]"
                >
                  <option value="Confirmed">Confirmed</option>
                  <option value="Active">Active (Rented)</option>
                  <option value="Pending">Pending</option>
                  <option value="Returned">Returned</option>
                  <option value="Closed">Closed</option>
                  <option value="Cancelled">Cancelled</option>
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
                Save Reservation
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Handover Check-In / Check-Out Modal */}
      {handoverRes && (
        <CheckInOutModal
          isOpen={!!handoverRes}
          onClose={() => setHandoverRes(null)}
          reservation={handoverRes.res}
          mode={handoverRes.mode}
          onComplete={onUpdate}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteResId}
        onClose={() => setDeleteResId(null)}
        onConfirm={handleDelete}
        title="Cancel & Delete Reservation?"
        message="Are you sure you want to delete this reservation record?"
        isDestructive
      />
    </div>
  );
};
