import React from 'react';
import { useAppState } from '../context/StateContext';
import { fmtUSD, pct } from '../utils/formatters';
import { Icon, CircularGauge } from '../components/Common';

const Network = () => {
  const { state } = useAppState();

  const caPercent = pct(state.network.caAnnuelAtteint, state.network.objectifAnnuel);
  const tauxCloture = 92;

  const logsReseau = [
    { site: 'Goma', msg: 'Clôture validée par Super-Admin', heure: '14:32', dot: 'bg-emerald-500' },
    { site: 'Kinshasa Sud', msg: 'Alerte retard J-1 générée', heure: '08:00', dot: 'bg-red-500' },
    { site: 'Lubumbashi', msg: 'Lancement procédure de fin de mois', heure: '07:15', dot: 'bg-amber-400' },
    { site: 'Kinshasa Nord', msg: 'Clôture journalière scellée', heure: '06:50', dot: 'bg-emerald-500' },
  ];

  const statusBadge = {
    'CLOTUREE':   (
      <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full border border-emerald-100">
        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
        <span className="text-[10px] font-black uppercase">CLÔTURÉE</span>
      </div>
    ),
    'EN_CLOTURE': (
      <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full border border-amber-100">
        <span className="w-2.5 h-2.5 bg-[#C9A227] rounded-full"></span>
        <span className="text-[10px] font-black uppercase">EN CLÔTURE</span>
      </div>
    ),
    'EN_RETARD':  (
      <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-full border border-red-100">
        <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
        <span className="text-[10px] font-black uppercase text-xs">EN RETARD — J-1 non fermée</span>
      </div>
    ),
    'OUVERTE':    (
      <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full border border-blue-100">
        <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></span>
        <span className="text-[10px] font-black uppercase">OUVERTE</span>
      </div>
    ),
  };

  const statusColors = {
    'CLOTUREE':   'border-l-4 border-emerald-500',
    'EN_CLOTURE': 'border-l-4 border-[#C9A227]',
    'EN_RETARD':  'border-l-4 border-red-500',
    'OUVERTE':    'border-l-4 border-blue-400',
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#002451]">Réseau SIGDA — Vue Globale</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-8 h-1 bg-[#C9A227] rounded-full"></div>
            <p className="text-sm text-slate-500 font-medium">Supervision multidimensionnelle des flux</p>
          </div>
        </div>
        <div className="flex flex-col gap-1 items-end">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Période Active</label>
          <div className="bg-white px-4 py-2 rounded-xl flex items-center gap-3 border border-slate-200 shadow-sm">
            <Icon name="calendar_month" className="text-[#1A3A6B] text-sm" />
            <span className="text-sm font-bold text-[#002451]">Année 2026</span>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10">
        {/* Annual CA Gauge */}
        <div className="md:col-span-4 bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center relative">
          <CircularGauge pct={caPercent} size={160} strokeWidth={10} />
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-4 mb-1">CA Annuel Global</h3>
          <div className="text-2xl font-extrabold text-[#002451]">{fmtUSD(state.network.caAnnuelAtteint)}</div>
          <div className="text-xs text-slate-400 font-medium mt-1">Objectif : {fmtUSD(state.network.objectifAnnuel)}</div>
        </div>

        {/* Stats 2x2 */}
        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Taux Cloture */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#18619e]">
                <Icon name="assignment_turned_in" />
              </div>
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-1 rounded-lg uppercase">Performant</span>
            </div>
            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Taux de Clôture Réseau</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-[#002451]">{tauxCloture}%</span>
                <span className="text-emerald-600 text-sm font-bold flex items-center">+4.2% <Icon name="trending_up" className="text-xs" /></span>
              </div>
            </div>
            <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${tauxCloture}%` }}></div>
            </div>
          </div>

          {/* Sites en Retard */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600">
                <Icon name="priority_high" />
              </div>
              <span className="bg-red-100 text-red-700 text-[10px] font-black px-2 py-1 rounded-lg uppercase">Alerte</span>
            </div>
            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Sites en Retard</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-red-600">
                  {state.network.sites.filter(x => x.statut === 'EN_RETARD').length}
                </span>
                <span className="text-slate-400 text-xs">sur {state.network.sites.length} sites actifs</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500 italic">
              Intervention requise sur : {state.network.sites.filter(x => x.statut === 'EN_RETARD').map(x => x.nom).join(', ') || 'Aucun'}
            </p>
          </div>

          {/* Stabilité réseau */}
          <div className="sm:col-span-2 p-6 rounded-2xl shadow-lg border border-transparent bg-gradient-to-br from-[#1A3A6B] to-[#002451] flex items-center justify-between relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="text-lg font-bold text-white mb-1">Stabilité du Réseau</h4>
              <p className="text-blue-300 text-sm opacity-80">Synchronisation temps réel sur 100% des terminaux</p>
            </div>
            <div className="relative z-10 flex gap-6">
              <div className="text-center text-white">
                <div className="text-2xl font-black">99.9%</div>
                <div className="text-[10px] uppercase tracking-widest opacity-60 font-bold">Uptime</div>
              </div>
              <div className="w-px h-10 bg-white/20 self-center"></div>
              <div className="text-center text-white">
                <div className="text-2xl font-black">1.2s</div>
                <div className="text-[10px] uppercase tracking-widest opacity-60 font-bold">Latency</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Carte des Clôtures */}
      <div className="p-7 rounded-2xl bg-slate-100/80 border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-[#002451] flex items-center gap-2">
              <Icon name="map" className="text-[#C9A227]" />
              Carte des Clôtures
            </h3>
            <p className="text-sm text-slate-500">Statut opérationnel en direct par région</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {state.network.sites.map(site => (
              <div key={site.id} className={`bg-white p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow ${statusColors[site.statut] || 'border-l-4 border-slate-200'}`}>
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-slate-50 rounded-xl flex flex-col items-center justify-center text-[#002451] border border-slate-100">
                    <span className="text-[10px] font-black leading-none">{site.id}</span>
                    <Icon name="location_on" className="text-lg mt-0.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#002451]">{site.nom}</h4>
                    <p className="text-xs text-slate-400">Responsable : {site.responsable}</p>
                  </div>
                </div>
                <div className="flex flex-row md:flex-row items-center justify-between md:justify-end gap-4 md:gap-10 w-full md:w-auto">
                  <div className="text-left md:text-right">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                      {site.statut === 'EN_RETARD' ? 'Retard Cumulé' : site.statut === 'EN_CLOTURE' ? 'Progression' : 'Volume Jour'}
                    </div>
                    {site.statut === 'EN_RETARD' ? (
                      <span className="text-lg font-black text-red-600">{site.retard} Jour(s)</span>
                    ) : site.statut === 'EN_CLOTURE' ? (
                      <span className="text-lg font-black text-[#755b00]">{site.progression}%</span>
                    ) : (
                      <span className="text-lg font-black text-[#002451]">{fmtUSD(site.volumeJour)}</span>
                    )}
                  </div>
                  {statusBadge[site.statut]}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-5">
            <div className="p-7 rounded-3xl text-white shadow-xl relative overflow-hidden bg-gradient-to-br from-[#1A3A6B] to-[#002451]">
              <h4 className="text-lg font-bold mb-3">Focus Régional</h4>
              <p className="text-sm text-blue-200 mb-6">Kinshasa représente 64% du CA global.</p>
              <div className="space-y-4">
                {[
                  { label: 'Kinshasa', pct: '64%', color: '#C9A227' },
                  { label: 'Katanga', pct: '22%', color: '#9ecaff' },
                  { label: 'Kivu', pct: '14%', color: '#60a5fa' }
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span>{item.label}</span>
                      <span className="font-bold">{item.pct}</span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: item.pct, backgroundColor: item.color }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h4 className="font-bold text-[#002451] mb-5 flex items-center gap-2 text-sm">
                <Icon name="history" className="text-sm text-[#C9A227]" />
                Logs Réseau Récents
              </h4>
              <div className="space-y-5">
                {logsReseau.map((l, i) => (
                  <div key={i} className="flex gap-3">
                    <div className={`w-1.5 h-1.5 ${l.dot} rounded-full mt-1.5 flex-shrink-0`}></div>
                    <div>
                      <p className="text-xs font-bold text-[#002451]">{l.site}</p>
                      <p className="text-[10px] text-slate-400 leading-tight">{l.msg} • {l.heure}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-2.5 border border-slate-100 rounded-xl text-[11px] font-bold text-slate-400 hover:bg-slate-50 transition-all uppercase tracking-widest">
                Voir tout le réseau
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Network;
