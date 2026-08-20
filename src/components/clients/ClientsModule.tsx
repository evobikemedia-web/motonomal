import React, { useState } from 'react';
import { 
  Users, Search, Plus, Filter, Download, Mail, Phone, MapPin, 
  FileText, Shield, Calendar, DollarSign, Edit, Trash2, ExternalLink, MessageSquare
} from 'lucide-react';
import { Client, Reservation } from '../../types';
import { dbStore } from '../../services/db';
import { Modal } from '../common/Modal';
import { EmptyState } from '../common/EmptyState';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { formatCurrency } from '../../utils/calculations';
import { useLanguage } from '../../context/LanguageContext';

interface ClientsModuleProps {
  clients: Client[];
  reservations: Reservation[];
  currency: 'MAD' | 'EUR' | 'USD';
  onUpdate: () => void;
  initialOpenAddModal?: boolean;
}

export const ClientsModule: React.FC<ClientsModuleProps> = ({
  clients,
  reservations,
  currency,
  onUpdate,
  initialOpenAddModal = false,
}) => {
  const { t, formatCurrencyVal } = useLanguage();
  const [search, setSearch] = useState('');
  const [nationalityFilter, setNationalityFilter] = useState('ALL');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(initialOpenAddModal);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteClientId, setDeleteClientId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Client>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    whatsapp: '',
    nationality: 'French',
    country: 'France',
    passportNumber: '',
    passportExpiry: '',
    licenseNumber: '',
    licenseIssueDate: '',
    licenseExpiry: '',
    licenseCategory: 'A',
    emergencyContact: '',
    notes: '',
  });

  const handleOpenAdd = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      whatsapp: '',
      nationality: 'French',
      country: 'France',
      passportNumber: '',
      passportExpiry: '',
      licenseNumber: '',
      licenseIssueDate: '',
      licenseExpiry: '',
      licenseCategory: 'A',
      emergencyContact: '',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = `${formData.firstName} ${formData.lastName}`.trim();

    if (isEditModalOpen && selectedClient) {
      dbStore.updateItem<Client>('clients', selectedClient.id, {
        ...formData,
        fullName,
      });
      setIsEditModalOpen(false);
    } else {
      const newClient: Client = {
        id: `cli-${Date.now()}`,
        firstName: formData.firstName || '',
        lastName: formData.lastName || '',
        fullName,
        nationality: formData.nationality || 'Other',
        dateOfBirth: formData.dateOfBirth || '1990-01-01',
        phone: formData.phone || '',
        whatsapp: formData.whatsapp || formData.phone || '',
        email: formData.email || '',
        address: formData.address || '',
        country: formData.country || 'France',
        passportNumber: formData.passportNumber || '',
        passportExpiry: formData.passportExpiry || '',
        licenseNumber: formData.licenseNumber || '',
        licenseIssueDate: formData.licenseIssueDate || '',
        licenseExpiry: formData.licenseExpiry || '',
        licenseCategory: formData.licenseCategory || 'A',
        emergencyContact: formData.emergencyContact || '',
        notes: formData.notes || '',
        totalSpent: 0,
        bookingsCount: 0,
        avgBookingValue: 0,
        lifetimeValue: 0,
        createdAt: new Date().toISOString(),
        createdBy: 'Admin',
      };
      dbStore.addItem<Client>('clients', newClient);
      setIsAddModalOpen(false);
    }
    onUpdate();
  };

  const handleDelete = () => {
    if (deleteClientId) {
      dbStore.deleteItem<Client>('clients', deleteClientId);
      setDeleteClientId(null);
      setSelectedClient(null);
      onUpdate();
    }
  };

  // Filter clients
  const filteredClients = clients.filter((c) => {
    const matchesSearch = 
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.passportNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.licenseNumber.toLowerCase().includes(search.toLowerCase());
    
    const matchesNat = nationalityFilter === 'ALL' || c.nationality === nationalityFilter;
    return matchesSearch && matchesNat;
  });

  const exportCSV = () => {
    const headers = 'ID,Name,Email,Phone,Nationality,Passport,License,TotalSpent\n';
    const rows = filteredClients.map(c => `"${c.id}","${c.fullName}","${c.email}","${c.phone}","${c.nationality}","${c.passportNumber}","${c.licenseNumber}",${c.totalSpent}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `motonomad_clients_${Date.now()}.csv`;
    a.click();
  };

  const nationalities = Array.from(new Set(clients.map((c) => c.nationality)));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#F4F4F2] flex items-center gap-2">
            <Users className="w-6 h-6 text-[#D4A017]" /> Client Management Directory
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Manage rider profiles, international passports, motorcycle licenses, and booking histories.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#262626] border border-[#333333] text-zinc-300 hover:text-white transition-colors"
          >
            <Download className="w-4 h-4 text-[#D4A017]" /> Export CSV
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#D4A017] text-[#1C1C1C] hover:bg-[#b88a10] transition-colors shadow-lg shadow-[#D4A017]/10"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Add New Client
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 p-4 rounded-2xl bg-[#1C1C1C] border border-[#2D2D2D]">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 w-4 h-4 text-zinc-400 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client name, email, phone, passport, or license #..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#262626] border border-[#333333] text-xs text-[#F4F4F2] focus:outline-none focus:border-[#D4A017]"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#D4A017]" />
          <select
            value={nationalityFilter}
            onChange={(e) => setNationalityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#262626] border border-[#333333] text-xs text-[#F4F4F2] focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Nationalities</option>
            {nationalities.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Clients List / Cards */}
      {filteredClients.length === 0 ? (
        <EmptyState
          title={t('no_clients_found')}
          description={t('no_clients_desc')}
          actionLabel={t('add_client')}
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="space-y-4">
          {/* Mobile Card Layout */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className="p-4 rounded-2xl bg-[#1C1C1C] border border-[#2D2D2D] hover:border-[#D4A017]/50 transition-colors shadow-lg space-y-3 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#282828] text-[#D4A017] font-black border border-[#383838]">
                      {client.firstName.charAt(0)}{client.lastName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-white">{client.fullName}</h4>
                      <span className="text-[11px] text-zinc-400">{client.nationality} • {client.country}</span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-800/40">
                    {formatCurrencyVal(client.totalSpent || 0, currency)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-zinc-300 pt-1 border-t border-[#2A2A2A]">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block">{t('passport')}</span>
                    <span className="font-mono text-zinc-200">{client.passportNumber || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block">{t('license_no')}</span>
                    <span className="font-mono text-amber-400">{client.licenseNumber || 'N/A'}</span>
                  </div>
                </div>

                {/* Quick Touch Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    {client.phone && (
                      <a
                        href={`tel:${client.phone}`}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-950/50 text-emerald-400 border border-emerald-800/50 text-xs font-bold active:scale-95 transition-transform"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{t('call')}</span>
                      </a>
                    )}
                    {(client.whatsapp || client.phone) && (
                      <a
                        href={`https://wa.me/${(client.whatsapp || client.phone).replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold active:scale-95 transition-transform"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setSelectedClient(client);
                        setFormData(client);
                        setIsEditModalOpen(true);
                      }}
                      className="p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteClientId(client.id)}
                      className="p-2 rounded-lg bg-rose-950/50 text-rose-400 hover:bg-rose-900/50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden md:block rounded-2xl border border-[#2D2D2D] bg-[#1C1C1C] overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#F4F4F2]">
                <thead className="bg-[#222222] border-b border-[#2D2D2D] text-zinc-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">{t('client')}</th>
                    <th className="p-4">{t('contact_details')}</th>
                    <th className="p-4">{t('nationality_country')}</th>
                    <th className="p-4">{t('passport_license')}</th>
                    <th className="p-4">{t('bookings')}</th>
                    <th className="p-4">{t('total_spent')}</th>
                    <th className="p-4 text-right">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2A2A]">
                  {filteredClients.map((client) => (
                    <tr
                      key={client.id}
                      className="hover:bg-[#252525] transition-colors cursor-pointer"
                      onClick={() => setSelectedClient(client)}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#282828] text-[#D4A017] font-bold border border-[#383838]">
                            {client.firstName.charAt(0)}{client.lastName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-sm text-[#F4F4F2] block">{client.fullName}</span>
                            <span className="text-[10px] text-zinc-400">ID: {client.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1 text-zinc-300">
                          <div className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-[#D4A017]" /> {client.email}</div>
                          <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-[#D4A017]" /> {client.phone}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold">{client.nationality}</span>
                        <span className="text-zinc-400 block text-[10px]">{client.country}</span>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[11px] block w-fit">
                            Pass: {client.passportNumber || 'N/A'}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-amber-950/40 text-amber-400 font-mono text-[11px] block w-fit">
                            Lic ({client.licenseCategory}): {client.licenseNumber || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-[#D4A017]">{client.bookingsCount}</span> {t('reservations')}
                      </td>
                      <td className="p-4 font-bold text-emerald-400">
                        {formatCurrencyVal(client.totalSpent, currency)}
                      </td>
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedClient(client);
                              setFormData(client);
                              setIsEditModalOpen(true);
                            }}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                          title="Edit Client"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteClientId(client.id)}
                          className="p-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900 text-rose-400 transition-colors"
                          title="Delete Client"
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
      </div>
      )}

      {/* View Client Profile Modal */}
      {selectedClient && !isEditModalOpen && (
        <Modal
          isOpen={!!selectedClient}
          onClose={() => setSelectedClient(null)}
          title={`Rider Profile: ${selectedClient.fullName}`}
          subtitle={`Client ID: ${selectedClient.id}`}
          maxWidth="4xl"
        >
          <div className="space-y-6">
            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#252525] border border-[#333333]">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Total Spent</span>
                <span className="text-lg font-black text-emerald-400">{formatCurrency(selectedClient.totalSpent, currency)}</span>
              </div>
              <div className="p-4 rounded-xl bg-[#252525] border border-[#333333]">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Total Bookings</span>
                <span className="text-lg font-black text-[#D4A017]">{selectedClient.bookingsCount} rentals</span>
              </div>
              <div className="p-4 rounded-xl bg-[#252525] border border-[#333333]">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Avg Booking Value</span>
                <span className="text-lg font-black text-[#F4F4F2]">{formatCurrency(selectedClient.avgBookingValue, currency)}</span>
              </div>
              <div className="p-4 rounded-xl bg-[#252525] border border-[#333333]">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Lifetime Value (LTV)</span>
                <span className="text-lg font-black text-[#F4F4F2]">{formatCurrency(selectedClient.lifetimeValue, currency)}</span>
              </div>
            </div>

            {/* Client Personal & Legal Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-[#222222] border border-[#333333] space-y-3 text-xs">
                <h4 className="font-bold text-sm text-[#D4A017] border-b border-[#333333] pb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Personal & Emergency Contact
                </h4>
                <div><span className="text-zinc-400">Email:</span> <span className="font-semibold text-[#F4F4F2]">{selectedClient.email}</span></div>
                <div><span className="text-zinc-400">Phone:</span> <span className="font-semibold text-[#F4F4F2]">{selectedClient.phone}</span></div>
                <div><span className="text-zinc-400">WhatsApp:</span> <span className="font-semibold text-[#F4F4F2]">{selectedClient.whatsapp}</span></div>
                <div><span className="text-zinc-400">Nationality:</span> <span className="font-semibold text-[#F4F4F2]">{selectedClient.nationality} ({selectedClient.country})</span></div>
                <div><span className="text-zinc-400">Emergency Contact:</span> <span className="font-bold text-rose-400">{selectedClient.emergencyContact || 'None listed'}</span></div>
              </div>

              <div className="p-5 rounded-2xl bg-[#222222] border border-[#333333] space-y-3 text-xs">
                <h4 className="font-bold text-sm text-[#D4A017] border-b border-[#333333] pb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Passport & License Credentials
                </h4>
                <div><span className="text-zinc-400">Passport Number:</span> <span className="font-mono font-bold text-[#F4F4F2]">{selectedClient.passportNumber}</span></div>
                <div><span className="text-zinc-400">Passport Expiry:</span> <span className="font-semibold text-emerald-400">{selectedClient.passportExpiry}</span></div>
                <div><span className="text-zinc-400">License Number:</span> <span className="font-mono font-bold text-[#F4F4F2]">{selectedClient.licenseNumber} (Cat: {selectedClient.licenseCategory})</span></div>
                <div><span className="text-zinc-400">License Expiry:</span> <span className="font-semibold text-emerald-400">{selectedClient.licenseExpiry}</span></div>
              </div>
            </div>

            {/* Notes */}
            {selectedClient.notes && (
              <div className="p-4 rounded-xl bg-[#222222] border border-[#333333] text-xs">
                <span className="font-bold text-[#D4A017] block mb-1">Rider Notes:</span>
                <p className="text-zinc-300 leading-relaxed">{selectedClient.notes}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Add / Edit Client Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <Modal
          isOpen={isAddModalOpen || isEditModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
          }}
          title={isEditModalOpen ? 'Edit Rider Profile' : 'Add New Client Profile'}
          maxWidth="3xl"
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-zinc-300 block mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  value={formData.firstName || ''}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#262626] border border-[#333333] text-[#F4F4F2] focus:border-[#D4A017]"
                />
              </div>
              <div>
                <label className="font-bold text-zinc-300 block mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  value={formData.lastName || ''}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#262626] border border-[#333333] text-[#F4F4F2] focus:border-[#D4A017]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-zinc-300 block mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#262626] border border-[#333333] text-[#F4F4F2] focus:border-[#D4A017]"
                />
              </div>
              <div>
                <label className="font-bold text-zinc-300 block mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#262626] border border-[#333333] text-[#F4F4F2] focus:border-[#D4A017]"
                />
              </div>
              <div>
                <label className="font-bold text-zinc-300 block mb-1">WhatsApp</label>
                <input
                  type="text"
                  value={formData.whatsapp || ''}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#262626] border border-[#333333] text-[#F4F4F2] focus:border-[#D4A017]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-zinc-300 block mb-1">Nationality</label>
                <input
                  type="text"
                  value={formData.nationality || ''}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#262626] border border-[#333333] text-[#F4F4F2] focus:border-[#D4A017]"
                />
              </div>
              <div>
                <label className="font-bold text-zinc-300 block mb-1">Country of Residence</label>
                <input
                  type="text"
                  value={formData.country || ''}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#262626] border border-[#333333] text-[#F4F4F2] focus:border-[#D4A017]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#2D2D2D] pt-3">
              <div>
                <label className="font-bold text-zinc-300 block mb-1">Passport Number</label>
                <input
                  type="text"
                  value={formData.passportNumber || ''}
                  onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#262626] border border-[#333333] text-[#F4F4F2] focus:border-[#D4A017]"
                />
              </div>
              <div>
                <label className="font-bold text-zinc-300 block mb-1">Passport Expiry</label>
                <input
                  type="date"
                  value={formData.passportExpiry || ''}
                  onChange={(e) => setFormData({ ...formData, passportExpiry: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#262626] border border-[#333333] text-[#F4F4F2] focus:border-[#D4A017]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-zinc-300 block mb-1">License Number</label>
                <input
                  type="text"
                  value={formData.licenseNumber || ''}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#262626] border border-[#333333] text-[#F4F4F2] focus:border-[#D4A017]"
                />
              </div>
              <div>
                <label className="font-bold text-zinc-300 block mb-1">License Category</label>
                <input
                  type="text"
                  value={formData.licenseCategory || 'A'}
                  onChange={(e) => setFormData({ ...formData, licenseCategory: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#262626] border border-[#333333] text-[#F4F4F2] focus:border-[#D4A017]"
                />
              </div>
              <div>
                <label className="font-bold text-zinc-300 block mb-1">License Expiry</label>
                <input
                  type="date"
                  value={formData.licenseExpiry || ''}
                  onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#262626] border border-[#333333] text-[#F4F4F2] focus:border-[#D4A017]"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-zinc-300 block mb-1">Emergency Contact Details</label>
              <input
                type="text"
                placeholder="Name, relationship and phone number..."
                value={formData.emergencyContact || ''}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#262626] border border-[#333333] text-[#F4F4F2] focus:border-[#D4A017]"
              />
            </div>

            <div>
              <label className="font-bold text-zinc-300 block mb-1">Notes / Preferences</label>
              <textarea
                rows={2}
                placeholder="Riding experience, bike height preference, equipment sizes..."
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#262626] border border-[#333333] text-[#F4F4F2] focus:border-[#D4A017]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#2D2D2D]">
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl font-bold bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl font-bold bg-[#D4A017] text-[#1C1C1C] hover:bg-[#b88a10]"
              >
                Save Client Profile
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteClientId}
        onClose={() => setDeleteClientId(null)}
        onConfirm={handleDelete}
        title="Delete Client Profile?"
        message="Are you sure you want to delete this client record? This action will remove their profile and history."
        isDestructive
      />
    </div>
  );
};
