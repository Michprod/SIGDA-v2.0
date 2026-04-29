import React from 'react';
import { useAppState } from '../context/StateContext';
import { fmtUSD, pct } from '../utils/formatters';
import { Icon, CircularGauge, DasherCard } from '../components/Common';

/* ── Status badge (dark version) ── */
const StatusBadge = ({ statut }) => {
  const cfg = {
    'CLOTUREE':   { color: '#00d09c', label: 'CLÔTURÉE',           dot: true  },
    'EN_CLOTURE': { color: '#C9A227', label: 'EN CLÔTURE',          dot: false },
    'EN_RETARD':  { color: '#f65160', label: 'EN RETARD — J-1',     dot: false },
    'OUVERTE':    { color: '#4f8ef7', label: 'OUVERTE',             dot: true  },
  }[statut] || { color: '#7e84a3', label: statut, dot: false };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
      style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}35`, color: cfg.color }}>
      <span className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: cfg.color, animation: cfg.dot ? 'pulse 2s infinite' : 'none' }} />
      <span className="text-[10px] font-black uppercase whitespace-nowrap">{cfg.label}</span>
    </div>
  );
};

/* ── Left border accent per status ── */
const borderAccent = {
  'CLOTUREE':   '#00d09c',
  'EN_CLOTURE': '#C9A227',
  'EN_RETARD':  '#f65160',
  'OUVERTE':    '#4f8ef7',
};

const Network = () => {
  const { state } = useAppState();

  const caPercent   = pct(state.network.caAnnuelAtteint, state.network.objectifAnnuel);
  const tauxCloture = 92;

  const logsReseau = [
    { site: 'Goma',         msg: 'Clôture validée par Super-Admin',       heure: '14:32', color: '#00d09c' },
    { site: 'Kinshasa Sud', msg: 'Alerte retard J-1 générée',             heure: '08:00', color: '#f65160' },
    { site: 'Lubumbashi',   msg: 'Lancement procédure de fin de mois',    heure: '07:15', color: '#C9A227' },
    { site: 'Kinshasa Nord',msg: 'Clôture journalière scellée',           heure: '06:50', color: '#00d09c' },
  ];

  return (
    <div className="animate-fade-slide-up">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight" style={{ color: '#e2e4ef' }}>
            Réseau SIGDA — <span style={{ color: '#00d09c' }}>Vue Globale</span>
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-8 h-1 rounded-full" style={{ background: '#C9A227' }} />
            <p className="text-sm font-medium" style={{ color: '#7e84a3' }}>Supervision multidimensionnelle des flux</p>
          </div>
        </div>
        <div className="flex flex-col gap-1 items-end">
          <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#7e84a3' }}>Période Active</label>
          <div className="px-4 py-2 rounded-xl flex items-center gap-3"
            style={{ background: '#252838', border: '1px solid #2d3148' }}>
            <Icon name="calendar_month" className="text-sm" style={{ color: '#4f8ef7' }} />
            <span className="text-sm font-bold" style={{ color: '#e2e4ef' }}>Année 2026</span>
          </div>
        </div>
      </div>

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-8">

        {/* Gauge CA Annuel */}
        <DasherCard className="md:col-span-4 p-8 flex flex-col items-center justify-center text-center">
          <CircularGauge pct={caPercent} size={160} strokeWidth={10} color="#C9A227" />
          <h3 className="text-xs font-bold uppercase tracking-widest mt-4 mb-1" style={{ color: '#7e84a3' }}>CA Annuel Global</h3>
          <div className="text-2xl font-extrabold" style={{ color: '#e2e4ef' }}>{fmtUSD(state.network.caAnnuelAtteint)}</div>
          <div className="text-xs font-medium mt-1" style={{ color: '#4a4f6b' }}>Objectif : {fmtUSD(state.network.objectifAnnuel)}</div>
        </DasherCard>

        {/* Stats 2×2 */}
        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5">

          {/* Taux de clôture */}
          <DasherCard className="p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(79,142,247,0.12)' }}>
                <Icon name="assignment_turned_in" style={{ color: '#4f8ef7' }} />
              </div>
              <span className="text-[10px] font-black px-2 py-1 rounded-lg uppercase"
                style={{ background: 'rgba(0,208,156,0.12)', color: '#00d09c' }}>Performant</span>
            </div>
            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#7e84a3' }}>Taux de Clôture Réseau</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black" style={{ color: '#e2e4ef' }}>{tauxCloture}%</span>
                <span className="text-sm font-bold flex items-center" style={{ color: '#00d09c' }}>
                  +4.2% <Icon name="trending_up" className="text-xs" />
                </span>
              </div>
            </div>
            <div className="mt-4 h-1.5 rounded-full overflow-hidden" style={{ background: '#2d3148' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${tauxCloture}%`, background: '#00d09c' }} />
            </div>
          </DasherCard>

          {/* Sites en retard */}
          <DasherCard className="p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(246,81,96,0.12)' }}>
                <Icon name="priority_high" style={{ color: '#f65160' }} />
              </div>
              <span className="text-[10px] font-black px-2 py-1 rounded-lg uppercase"
                style={{ background: 'rgba(246,81,96,0.12)', color: '#f65160' }}>Alerte</span>
            </div>
            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#7e84a3' }}>Sites en Retard</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black" style={{ color: '#f65160' }}>
                  {state.network.sites.filter(x => x.statut === 'EN_RETARD').length}
                </span>
                <span className="text-xs" style={{ color: '#4a4f6b' }}>
                  sur {state.network.sites.length} sites actifs
                </span>
              </div>
            </div>
            <p className="mt-4 text-xs italic" style={{ color: '#7e84a3' }}>
              Intervention requise : {state.network.sites.filter(x => x.statut === 'EN_RETARD').map(x => x.nom).join(', ') || 'Aucun'}
            </p>
          </DasherCard>

          {/* Stabilité réseau — full width */}
          <div className="sm:col-span-2 p-6 rounded-2xl flex items-center justify-between relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg,#1c2a4a,#0e1a30)', border: '1px solid rgba(79,142,247,0.25)', boxShadow: '0 4px 24px rgba(0,0,0,0.35)' }}>
            <div className="relative z-10">
              <h4 className="text-lg font-bold mb-1" style={{ color: '#e2e4ef' }}>Stabilité du Réseau</h4>
              <p className="text-sm opacity-70" style={{ color: '#7e84a3' }}>Synchronisation temps réel sur 100% des terminaux</p>
            </div>
            <div className="relative z-10 flex gap-6">
              <div className="text-center" style={{ color: '#e2e4ef' }}>
                <div className="text-2xl font-black" style={{ color: '#00d09c' }}>99.9%</div>
                <div className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#4a4f6b' }}>Uptime</div>
              </div>
              <div className="w-px h-10 self-center" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <div className="text-center">
                <div className="text-2xl font-black" style={{ color: '#4f8ef7' }}>1.2s</div>
                <div className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#4a4f6b' }}>Latency</div>
              </div>
            </div>
            {/* Glow bg */}
            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full pointer-events-none"
              style={{ background: 'rgba(79,142,247,0.07)', filter: 'blur(30px)' }} />
          </div>
        </div>
      </div>

      {/* ── Carte des Clôtures ── */}
      <div className="p-6 rounded-2xl" style={{ background: '#1a1c2b', border: '1px solid #2d3148' }}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: '#e2e4ef' }}>
              <Icon name="map" style={{ color: '#C9A227' }} />
              Carte des Clôtures
            </h3>
            <p className="text-sm mt-0.5" style={{ color: '#7e84a3' }}>Statut opérationnel en direct par région</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Site cards */}
          <div className="lg:col-span-2 space-y-4">
            {state.network.sites.map(site => {
              const accent = borderAccent[site.statut] || '#2d3148';
              return (
                <div key={site.id}
                  className="p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all"
                  style={{
                    background: '#252838',
                    border: '1px solid #2d3148',
                    borderLeft: `4px solid ${accent}`,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background='#2d3045'}
                  onMouseLeave={e => e.currentTarget.style.background='#252838'}>

                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl flex flex-col items-center justify-center"
                      style={{ background: `${accent}12`, border: `1px solid ${accent}25` }}>
                      <span className="text-[10px] font-black leading-none" style={{ color: accent }}>{site.id}</span>
                      <Icon name="location_on" className="text-lg mt-0.5" style={{ color: accent }} />
                    </div>
                    <div>
                      <h4 className="font-bold" style={{ color: '#e2e4ef' }}>{site.nom}</h4>
                      <p className="text-xs" style={{ color: '#7e84a3' }}>Responsable : {site.responsable}</p>
                    </div>
                  </div>

                  <div className="flex flex-row items-center justify-between md:justify-end gap-4 md:gap-8 w-full md:w-auto">
                    <div className="text-left md:text-right">
                      <div className="text-[10px] font-bold uppercase tracking-tight mb-0.5" style={{ color: '#4a4f6b' }}>
                        {site.statut === 'EN_RETARD' ? 'Retard Cumulé' : site.statut === 'EN_CLOTURE' ? 'Progression' : 'Volume Jour'}
                      </div>
                      {site.statut === 'EN_RETARD' ? (
                        <span className="text-lg font-black" style={{ color: '#f65160' }}>{site.retard} Jour(s)</span>
                      ) : site.statut === 'EN_CLOTURE' ? (
                        <span className="text-lg font-black" style={{ color: '#C9A227' }}>{site.progression}%</span>
                      ) : (
                        <span className="text-lg font-black" style={{ color: '#4f8ef7' }}>{fmtUSD(site.volumeJour)}</span>
                      )}
                    </div>
                    <StatusBadge statut={site.statut} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Focus régional */}
            <div className="p-6 rounded-2xl text-white relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg,#1c2a4a,#0e1a30)', border: '1px solid rgba(79,142,247,0.2)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
              <h4 className="text-base font-bold mb-1" style={{ color: '#e2e4ef' }}>Focus Régional</h4>
              <p className="text-sm mb-5" style={{ color: '#7e84a3' }}>Kinshasa représente 64% du CA global.</p>
              <div className="space-y-4">
                {[
                  { label: 'Kinshasa', pct: '64%', color: '#C9A227'  },
                  { label: 'Katanga',  pct: '22%', color: '#4f8ef7'  },
                  { label: 'Kivu',     pct: '14%', color: '#7c6ef5'  },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span style={{ color: '#7e84a3' }}>{item.label}</span>
                      <span className="font-bold" style={{ color: item.color }}>{item.pct}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: item.pct, background: item.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Logs réseau */}
            <DasherCard className="p-6">
              <h4 className="font-bold mb-5 flex items-center gap-2 text-sm" style={{ color: '#e2e4ef' }}>
                <Icon name="history" className="text-sm" style={{ color: '#C9A227' }} />
                Logs Réseau Récents
              </h4>
              <div className="space-y-4">
                {logsReseau.map((l, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                      style={{ background: l.color }} />
                    <div>
                      <p className="text-xs font-bold" style={{ color: '#e2e4ef' }}>{l.site}</p>
                      <p className="text-[10px] leading-tight" style={{ color: '#4a4f6b' }}>{l.msg} • {l.heure}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="w-full mt-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all"
                style={{ border: '1px solid #2d3148', color: '#7e84a3' }}
                onMouseEnter={e => { e.currentTarget.style.background='#2d3148'; e.currentTarget.style.color='#e2e4ef'; }}
                onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#7e84a3'; }}>
                Voir tout le réseau
              </button>
            </DasherCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Network;
