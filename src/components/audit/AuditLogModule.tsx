import React from 'react';
import { ShieldCheck, Clock, User, Activity } from 'lucide-react';
import { AuditLog } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface AuditLogModuleProps {
  auditLogs: AuditLog[];
}

export const AuditLogModule: React.FC<AuditLogModuleProps> = ({ auditLogs }) => {
  const { language } = useLanguage();

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-black text-[#F4F4F2] flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-[#D4A017]" /> 
          {language === 'fr' ? 'Journal d’Audit de Sécurité & Système' : 'Security & System Audit Trail'}
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          {language === 'fr'
            ? 'Suivi complet de la conformité des enregistrements professionnels créés, modifiés, supprimés et exportés.'
            : 'Full compliance log tracking created, edited, deleted, and exported business records.'}
        </p>
      </div>

      <div className="rounded-2xl border border-[#2D2D2D] bg-[#1C1C1C] overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-[#F4F4F2]">
          <thead className="bg-[#222222] border-b border-[#2D2D2D] text-zinc-400 font-bold uppercase">
            <tr>
              <th className="p-4">{language === 'fr' ? 'Horodatage' : 'Timestamp'}</th>
              <th className="p-4">{language === 'fr' ? 'Utilisateur' : 'User'}</th>
              <th className="p-4">{language === 'fr' ? 'Action' : 'Action'}</th>
              <th className="p-4">{language === 'fr' ? 'Module Cible' : 'Module Target'}</th>
              <th className="p-4">{language === 'fr' ? 'Détails' : 'Details'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A2A2A]">
            {auditLogs.map((log) => (
              <tr key={log.id} className="hover:bg-[#252525]">
                <td className="p-4 font-mono text-zinc-400">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="p-4 font-bold text-[#D4A017]">{log.userName} ({log.userRole})</td>
                <td className="p-4 font-bold text-sky-400">{log.action}</td>
                <td className="p-4 font-semibold text-zinc-300">{log.module}</td>
                <td className="p-4 text-zinc-300">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogModule;