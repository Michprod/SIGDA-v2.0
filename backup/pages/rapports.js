// ============================================================
// SIGDA v2.0 — Module Rapports
// ============================================================
window.SIGDA_PAGES = window.SIGDA_PAGES || {};

window.SIGDA_PAGES.rapports = function() {
  const s = window.SIGDA_STATE;
  const { fmtUSD } = window.SIGDA_UTILS;

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

  const reportCards = s.rapports.map(r => {
    const tc = typeConfig[r.type] || typeConfig['CLOTURE'];
    const sc = statutConfig[r.statut] || statutConfig['EN_COURS'];
    const isSigned = r.statut === 'SIGNE';
    return `
      <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow group">
        <div class="w-12 h-12 rounded-xl ${tc.color} flex items-center justify-center flex-shrink-0">
          <span class="material-symbols-outlined text-2xl" style="font-variation-settings:'FILL' 1">${tc.icon}</span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <p class="font-bold text-[#002451] truncate">${r.titre}</p>
            <span class="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}">${sc.label}</span>
          </div>
          <div class="flex items-center gap-4 text-xs text-slate-400">
            <span class="flex items-center gap-1">
              <span class="material-symbols-outlined text-xs">calendar_today</span>${r.date}
            </span>
            <span class="flex items-center gap-1">
              <span class="material-symbols-outlined text-xs">folder</span>${tc.label}
            </span>
            ${r.taille !== '--' ? `<span class="flex items-center gap-1"><span class="material-symbols-outlined text-xs">storage</span>${r.taille}</span>` : ''}
          </div>
        </div>
        <div class="flex gap-2 flex-shrink-0">
          ${isSigned ? `
            <button onclick="rapports_simulerPDF()" class="p-2 hover:bg-emerald-50 rounded-lg transition-colors text-emerald-600" title="Télécharger PDF">
              <span class="material-symbols-outlined text-lg">download</span>
            </button>` : ''}
          <button onclick="rapports_simulerPDF()" class="p-2 hover:bg-blue-50 rounded-lg transition-colors text-[#1A3A6B]" title="Voir">
            <span class="material-symbols-outlined text-lg">visibility</span>
          </button>
        </div>
      </div>`;
  }).join('');

  // Stats summary
  const totalCloture = s.rapports.filter(r=>r.type==='CLOTURE' && r.statut==='SIGNE').length;
  const CA = window.SIGDA.getCAJour();

  return `
    <div class="page-canvas fade-in-up" style="padding:2rem">
      <div class="mb-8">
        <h2 class="text-3xl font-black tracking-tight text-[#002451]">Rapports & Archives</h2>
        <p class="text-slate-500 font-medium mt-1">Documents certifiés de la gestion journalière</p>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <div class="kpi-card border-b-4 border-[#1A3A6B]">
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Rapports Totaux</p>
          <p class="text-3xl font-black text-[#002451]">${s.rapports.length}</p>
        </div>
        <div class="kpi-card border-b-4 border-emerald-500">
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Journées Clôturées</p>
          <p class="text-3xl font-black text-emerald-700">${totalCloture}</p>
        </div>
        <div class="kpi-card border-b-4 border-[#C9A227]">
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">CA Cumulé (30j)</p>
          <p class="text-2xl font-black text-[#002451]">${fmtUSD(totalCloture * 4170)}</p>
        </div>
        <div class="kpi-card border-b-4 border-purple-400">
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Journée Actuelle</p>
          <p class="text-sm font-black ${s.periode.statut==='CLOTUREE'?'text-emerald-600':'text-amber-600'}">${s.periode.statut}</p>
          ${s.periode.statut !== 'CLOTUREE' ? `<p class="text-xs text-slate-400 mt-1">En cours...</p>` : `<p class="text-xs text-emerald-600 mt-1">✓ Scellée</p>`}
        </div>
      </div>

      <!-- Rapport actuel si clôturé -->
      ${s.periode.statut === 'CLOTUREE' ? `
        <div class="mb-6 p-5 rounded-xl border-l-4 border-emerald-500 bg-emerald-50 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-emerald-600 text-2xl" style="font-variation-settings:'FILL' 1">verified</span>
            <div>
              <p class="font-bold text-emerald-800">Journée du ${s.periode.date} clôturée et scellée</p>
              <p class="text-xs text-emerald-600">Le rapport est disponible ci-dessous.</p>
            </div>
          </div>
          <button onclick="rapports_simulerPDF()" class="btn-success text-xs py-2 px-4">
            <span class="material-symbols-outlined text-sm">download</span>Télécharger PDF
          </button>
        </div>` : ''}

      <!-- Reports list -->
      <div class="space-y-3">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-[#002451]">Historique des Rapports</h3>
          <div class="flex gap-2">
            <button class="btn-secondary text-xs py-2 px-3">
              <span class="material-symbols-outlined text-sm">filter_list</span>Filtrer
            </button>
          </div>
        </div>
        ${reportCards}
      </div>

      <!-- Encryption note -->
      <div class="mt-8 p-5 rounded-xl" style="background:#EEF3FB">
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-[#1A3A6B]" style="font-variation-settings:'FILL' 1">security</span>
          <div>
            <p class="text-sm font-bold text-[#002451]">Intégrité des Archives Garantie</p>
            <p class="text-xs text-slate-500">Tous les rapports signés sont horodatés et chiffrés via le protocole SIGDA-Vault (256-bit). Hash Blockchain : <span class="font-mono">0x4F2A...99C1</span></p>
          </div>
        </div>
      </div>
    </div>`;
};
