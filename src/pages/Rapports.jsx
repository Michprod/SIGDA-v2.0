import React from 'react';
import { useAppState } from '../context/StateContext';
import { fmtUSD } from '../utils/formatters';
import { Icon } from '../components/Common';

const Rapports = () => {
  const { state } = useAppState();

  const typeConfig = {
    'CLOTURE':    { icon: 'lock_clock',   label: 'Clôture Journalière', color: 'bg-blue-50 text-blue-700'       },
    'HEBDO':      { icon: 'date_range',   label: 'Rapport Hebdomadaire', color: 'bg-purple-50 text-purple-700'  },
    'AUDIT':      { icon: 'rule',         label: 'Rapport d\'Audit',     color: 'bg-amber-50 text-amber-700'    },
    'CONFORMITE': { icon: 'verified_user',label: 'Conformité',           color: 'bg-emerald-50 text-emerald-700'},
  };

  const statutConfig = {
    'SIGNE':    { label: 'Signé',    bg: 'bg-emerald-100', text: 'text-emerald-700' },
    'EN_COURS': { label: 'En cours', bg: 'bg-amber-100',   text: 'text-amber-700'   },
  };

  const totalCloture = state.rapports.filter(r => r.type === 'CLOTURE' && r.statut === 'SIGNE').length;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-black tracking-tight text-[#002451]">Rapports & Archives</h2>
        <p className="text-slate-500 font-medium mt-1">Documents certifiés de la gestion journalière</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <div className="bg-white p-5 rounded-2xl shadow-sm border-b-4 border-[#1A3A6B]">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Rapports Totaux</p>
          <p className="text-3xl font-black text-[#002451]">{state.rapports.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border-b-4 border-emerald-500">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Journées Clôturées</p>
          <p className="text-3xl font-black text-emerald-700">{totalCloture}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border-b-4 border-[#C9A227]">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">CA Cumulé (30j)</p>
          <p className="text-2xl font-black text-[#002451]">{fmtUSD(totalCloture * 4170)}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border-b-4 border-purple-400">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Journée Actuelle</p>
          <p className={`text-sm font-black ${state.periode.statut === 'CLOTUREE' ? 'text-emerald-600' : 'text-amber-600'}`}>
            {state.periode.statut}
          </p>
          {state.periode.statut !== 'CLOTUREE' ? (
            <p className="text-xs text-slate-400 mt-1">En cours...</p>
          ) : (
            <p className="text-xs text-emerald-600 mt-1">✓ Scellée</p>
          )}
        </div>
      </div>

      {/* Rapport actuel si clôturé */}
      {state.periode.statut === 'CLOTUREE' && (
        <div className="mb-6 p-5 rounded-xl border-l-4 border-emerald-500 bg-emerald-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="verified" className="text-emerald-600 text-2xl" fill={true} />
            <div>
              <p className="font-bold text-emerald-800">Journée du {state.periode.date} clôturée et scellée</p>
              <p className="text-xs text-emerald-600">Le rapport est disponible ci-dessous.</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow transition-colors">
            <Icon name="download" className="text-sm" /> Télécharger PDF
          </button>
        </div>
      )}

      {/* Reports list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-[#002451]">Historique des Rapports</h3>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-600 border border-slate-200 transition-colors">
            <Icon name="filter_list" className="text-sm" /> Filtrer
          </button>
        </div>
        
        <div className="grid gap-3">
          {state.rapports.map((r) => {
            const tc = typeConfig[r.type] || typeConfig['CLOTURE'];
            const sc = statutConfig[r.statut] || statutConfig['EN_COURS'];
            const isSigned = r.statut === 'SIGNE';
            return (
              <div key={r.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-50 flex items-center gap-5 hover:shadow-md transition-shadow group">
                <div className={`w-12 h-12 rounded-xl ${tc.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon name={tc.icon} className="text-2xl" fill={true} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-[#002451] truncate">{r.titre}</p>
                    <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>
                      {sc.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Icon name="calendar_today" className="text-xs" /> {r.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="folder" className="text-xs" /> {tc.label}
                    </span>
                    {r.taille !== '--' && (
                      <span className="flex items-center gap-1">
                        <Icon name="storage" className="text-xs" /> {r.taille}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {isSigned && (
                    <button className="p-2 hover:bg-emerald-50 rounded-lg transition-colors text-emerald-600">
                      <Icon name="download" className="text-lg" />
                    </button>
                  )}
                  <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-[#1A3A6B]">
                    <Icon name="visibility" className="text-lg" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Encryption note */}
      <div className="mt-8 p-6 rounded-2xl bg-[#EEF3FB] border border-blue-100/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/50 flex items-center justify-center text-[#1A3A6B]">
            <Icon name="security" className="text-2xl" fill={true} />
          </div>
          <div>
            <p className="text-sm font-bold text-[#002451]">Intégrité des Archives Garantie</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tous les rapports signés sont horodatés et chiffrés via le protocole SIGDA-Vault (256-bit). Hash Blockchain : <span className="font-mono bg-white/50 px-1 rounded">0x4F2A...99C1</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rapports;
