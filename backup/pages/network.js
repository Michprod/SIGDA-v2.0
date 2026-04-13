// ============================================================
// SIGDA v2.0 — Dashboard Super Admin (Réseau)
// ============================================================
window.SIGDA_PAGES = window.SIGDA_PAGES || {};

window.SIGDA_PAGES.network = function() {
  const s = window.SIGDA_STATE;
  const { fmtUSD, fmtQty, pct, renderCircularGauge, renderStatutBadge } = window.SIGDA_UTILS;

  const caPercent = pct(s.network.caAnnuelAtteint, s.network.objectifAnnuel);
  const tauxCloture = 92;

  const siteRows = s.network.sites.map(site => {
    const statusColors = {
      'CLOTUREE':   'border-l-4 border-emerald-500',
      'EN_CLOTURE': 'border-l-4 border-[#C9A227]',
      'EN_RETARD':  'border-l-4 border-red-500',
      'OUVERTE':    'border-l-4 border-blue-400',
    };
    const statusBadge = {
      'CLOTUREE':   `<div class="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full border border-emerald-100"><span class="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span><span class="text-[10px] font-black uppercase">CLÔTURÉE</span></div>`,
      'EN_CLOTURE': `<div class="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full border border-amber-100"><span class="w-2.5 h-2.5 bg-[#C9A227] rounded-full"></span><span class="text-[10px] font-black uppercase">EN CLÔTURE</span></div>`,
      'EN_RETARD':  `<div class="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-full border border-red-100"><span class="w-2.5 h-2.5 bg-red-500 rounded-full"></span><span class="text-[10px] font-black uppercase">EN RETARD — J-1 non fermée</span></div>`,
      'OUVERTE':    `<div class="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full border border-blue-100"><span class="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></span><span class="text-[10px] font-black uppercase">OUVERTE</span></div>`,
    };
    const volumeLabel = site.statut === 'EN_RETARD' ? 'Retard Cumulé' : site.statut === 'EN_CLOTURE' ? 'Progression' : 'Volume Jour';
    const volumeValue = site.statut === 'EN_RETARD' ? `<span class="text-lg font-black text-red-600">${site.retard} Jour(s)</span>`
                      : site.statut === 'EN_CLOTURE' ? `<span class="text-lg font-black text-[#755b00]">${site.progression}%</span>`
                      : `<span class="text-lg font-black text-[#002451]">${fmtUSD(site.volumeJour)}</span>`;

    return `
      <div class="bg-white p-5 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow ${statusColors[site.statut]||'border-l-4 border-slate-200'}">
        <div class="flex items-center gap-5">
          <div class="w-14 h-14 bg-slate-50 rounded-xl flex flex-col items-center justify-center text-[#002451] border border-slate-100">
            <span class="text-[10px] font-black leading-none">${site.id}</span>
            <span class="material-symbols-outlined text-lg mt-0.5">location_on</span>
          </div>
          <div>
            <h4 class="font-bold text-[#002451]">${site.nom}</h4>
            <p class="text-xs text-slate-400">Responsable : ${site.responsable}</p>
          </div>
        </div>
        <div class="flex items-center gap-10">
          <div class="text-right">
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-tight">${volumeLabel}</div>
            ${volumeValue}
          </div>
          ${statusBadge[site.statut]||''}
        </div>
      </div>`;
  }).join('');

  const logsReseau = [
    { site: 'Goma', msg: 'Clôture validée par Super-Admin', heure: '14:32', dot: 'bg-emerald-500' },
    { site: 'Kinshasa Sud', msg: 'Alerte retard J-1 générée', heure: '08:00', dot: 'bg-red-500' },
    { site: 'Lubumbashi', msg: 'Lancement procédure de fin de mois', heure: '07:15', dot: 'bg-amber-400' },
    { site: 'Kinshasa Nord', msg: 'Clôture journalière scellée', heure: '06:50', dot: 'bg-emerald-500' },
  ];

  const logsHtml = logsReseau.map(l => `
    <div class="flex gap-3">
      <div class="w-1.5 h-1.5 ${l.dot} rounded-full mt-1.5 flex-shrink-0"></div>
      <div>
        <p class="text-xs font-bold text-[#002451]">${l.site}</p>
        <p class="text-[10px] text-slate-400">${l.msg} · ${l.heure}</p>
      </div>
    </div>`).join('');

  return `
    <div class="page-canvas fade-in-up" style="padding:2rem">
      <!-- Header -->
      <div class="flex justify-between items-end mb-8">
        <div>
          <h2 class="text-3xl font-extrabold tracking-tight text-[#002451]">Réseau SIGDA — Vue Globale</h2>
          <div class="flex items-center gap-2 mt-1">
            <div class="w-8 h-1 bg-[#C9A227] rounded-full"></div>
            <p class="text-sm text-slate-500 font-medium">Supervision multidimensionnelle des flux</p>
          </div>
        </div>
        <div class="flex flex-col gap-1 items-end">
          <label class="text-[10px] font-bold uppercase tracking-widest text-slate-500">Période Active</label>
          <div class="bg-white px-4 py-2 rounded-xl flex items-center gap-3 border border-slate-200 shadow-sm">
            <span class="material-symbols-outlined text-[#1A3A6B] text-sm">calendar_month</span>
            <span class="text-sm font-bold text-[#002451]">Année 2026</span>
          </div>
        </div>
      </div>

      <!-- KPI Grid -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10">
        <!-- Annual CA Gauge -->
        <div class="md:col-span-4 kpi-card flex flex-col items-center justify-center text-center relative" style="padding:2rem">
          <div class="gauge-wrap mb-4" style="width:160px;height:160px;">
            ${renderCircularGauge(caPercent, 160, 10, '#C9A227')}
          </div>
          <h3 class="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">CA Annuel Global</h3>
          <div class="text-2xl font-extrabold text-[#002451]">${fmtUSD(s.network.caAnnuelAtteint)}</div>
          <div class="text-xs text-slate-400 font-medium mt-1">Objectif : ${fmtUSD(s.network.objectifAnnuel)}</div>
        </div>

        <!-- Stats 2x2 -->
        <div class="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <!-- Taux Cloture -->
          <div class="kpi-card flex flex-col justify-between">
            <div class="flex justify-between items-start">
              <div class="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#18619e]">
                <span class="material-symbols-outlined">assignment_turned_in</span>
              </div>
              <span class="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-1 rounded-lg uppercase">Performant</span>
            </div>
            <div class="mt-5">
              <p class="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Taux de Clôture Réseau</p>
              <div class="flex items-baseline gap-2">
                <span class="text-4xl font-black text-[#002451]">${tauxCloture}%</span>
                <span class="text-emerald-600 text-sm font-bold flex items-center">+4.2% <span class="material-symbols-outlined text-xs">trending_up</span></span>
              </div>
            </div>
            <div class="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div class="h-full bg-emerald-500 rounded-full" style="width:${tauxCloture}%"></div>
            </div>
          </div>

          <!-- Sites en Retard -->
          <div class="kpi-card flex flex-col justify-between">
            <div class="flex justify-between items-start">
              <div class="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600">
                <span class="material-symbols-outlined">priority_high</span>
              </div>
              <span class="bg-red-100 text-red-700 text-[10px] font-black px-2 py-1 rounded-lg uppercase">Alerte</span>
            </div>
            <div class="mt-5">
              <p class="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Sites en Retard</p>
              <div class="flex items-baseline gap-2">
                <span class="text-4xl font-black text-red-600">${s.network.sites.filter(x=>x.statut==='EN_RETARD').length}</span>
                <span class="text-slate-400 text-xs">sur ${s.network.sites.length} sites actifs</span>
              </div>
            </div>
            <p class="mt-4 text-xs text-slate-500 italic">
              Intervention requise sur : ${s.network.sites.filter(x=>x.statut==='EN_RETARD').map(x=>x.nom).join(', ')||'Aucun'}
            </p>
          </div>

          <!-- Stabilité réseau -->
          <div class="sm:col-span-2 kpi-card flex items-center justify-between relative overflow-hidden" style="background:linear-gradient(135deg,#1A3A6B,#002451)">
            <div class="relative z-10">
              <h4 class="text-lg font-bold text-white mb-1">Stabilité du Réseau</h4>
              <p class="text-blue-300 text-sm opacity-80">Synchronisation temps réel sur 100% des terminaux</p>
            </div>
            <div class="relative z-10 flex gap-6">
              <div class="text-center text-white">
                <div class="text-2xl font-black">99.9%</div>
                <div class="text-[10px] uppercase tracking-widest opacity-60 font-bold">Uptime</div>
              </div>
              <div class="w-px h-10 bg-white/20 self-center"></div>
              <div class="text-center text-white">
                <div class="text-2xl font-black">1.2s</div>
                <div class="text-[10px] uppercase tracking-widest opacity-60 font-bold">Latency</div>
              </div>
            </div>
            <div class="absolute -right-8 -bottom-8 w-36 h-36 bg-white/5 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>

      <!-- Carte des Clôtures -->
      <div class="p-7 rounded-2xl" style="background:#edeef0">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h3 class="text-xl font-bold text-[#002451] flex items-center gap-2">
              <span class="material-symbols-outlined text-[#C9A227]">map</span>
              Carte des Clôtures
            </h3>
            <p class="text-sm text-slate-500">Statut opérationnel en direct par région</p>
          </div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Sites list -->
          <div class="lg:col-span-2 space-y-4">${siteRows}</div>

          <!-- Insights -->
          <div class="space-y-5">
            <div class="p-7 rounded-3xl text-white shadow-xl relative overflow-hidden" style="background:linear-gradient(135deg,#1A3A6B,#002451)">
              <h4 class="text-lg font-bold mb-3">Focus Régional</h4>
              <p class="text-sm text-blue-200 mb-6">Kinshasa représente 64% du CA global.</p>
              <div class="space-y-3">
                ${[['Kinshasa','64%','#C9A227'],['Katanga','22%','#9ecaff'],['Kivu','14%','#60a5fa']].map(([label,pctVal,clr])=>`
                  <div>
                    <div class="flex justify-between text-xs mb-1"><span>${label}</span><span class="font-bold">${pctVal}</span></div>
                    <div class="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div class="h-full rounded-full" style="width:${pctVal};background:${clr}"></div>
                    </div>
                  </div>`).join('')}
              </div>
            </div>
            <div class="bg-white p-5 rounded-2xl shadow-sm">
              <h4 class="font-bold text-[#002451] mb-4 flex items-center gap-2 text-sm">
                <span class="material-symbols-outlined text-sm text-[#C9A227]">history</span>
                Logs Réseau Récents
              </h4>
              <div class="space-y-4">${logsHtml}</div>
              <button onclick="SIGDA_APP.navigateTo('#audit')" class="w-full mt-5 py-2 border border-slate-100 rounded-xl text-[11px] font-bold text-slate-400 hover:bg-slate-50 transition-all">
                VOIR TOUT LE RÉSEAU →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- FAB -->
    <button onclick="rapports_simulerPDF()" class="fixed bottom-8 right-8 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-all group z-30" style="background:linear-gradient(135deg,#C9A227,#a07d18)">
      <span class="material-symbols-outlined text-white text-2xl">description</span>
      <span class="absolute right-full mr-4 bg-[#002451] text-white text-xs font-bold py-2 px-4 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">Générer Rapport Réseau</span>
    </button>`;
};
