// ============================================================
// SIGDA v2.0 — Journal d'Audit des Déverrouillages
// ============================================================
window.SIGDA_PAGES = window.SIGDA_PAGES || {};

window.SIGDA_PAGES.audit = function() {
  const s = window.SIGDA_STATE;

  const rows = s.audit.map((a, i) => {
    const isPair = i % 2 === 1;
    return `
      <tr class="${isPair ? 'bg-[#EEF3FB]/50' : ''} hover:bg-slate-50/80 transition-colors">
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm font-bold text-[#002451]">${a.datetime.split('\n')[0]}</div>
          <div class="text-[11px] text-slate-400 font-mono">${a.datetime.split('\n')[1]||''}</div>
        </td>
        <td class="px-6 py-4">
          <span class="px-2 py-1 bg-[#d1e4ff] text-[#00497e] text-[11px] font-bold rounded-md">${a.site}</span>
        </td>
        <td class="px-6 py-4">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">${a.initiales}</div>
            <span class="text-sm font-semibold text-slate-800">${a.admin}</span>
          </div>
        </td>
        <td class="px-6 py-4" style="max-width:300px">
          <p class="text-xs text-slate-500 leading-relaxed italic line-clamp-2">"${a.motif}"</p>
        </td>
        <td class="px-6 py-4 text-center">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
            <span class="material-symbols-outlined text-[10px]" style="font-variation-settings:'FILL' 1">check_circle</span>
            <span class="text-[11px] font-bold">Action Tracée</span>
          </div>
        </td>
      </tr>`;
  }).join('');

  return `
    <div class="page-canvas fade-in-up" style="padding:2rem;background:#FFF9F0;min-height:calc(100vh - 4rem)">
      <!-- Header -->
      <div class="flex justify-between items-start mb-10">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <div class="w-2 h-7 bg-[#C9A227] rounded-full"></div>
            <h2 class="text-2xl font-extrabold tracking-tight text-[#002451]">Journal d'Audit des Interventions Exceptionnelles</h2>
          </div>
          <p class="text-slate-500 text-sm max-w-2xl leading-relaxed">
            Registre immuable des ouvertures de caisse et ajustements hors procédure standard. Chaque entrée est horodatée et signée cryptographiquement.
          </p>
        </div>
        <div class="bg-[#002451] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3">
          <div class="relative">
            <span class="material-symbols-outlined text-3xl text-[#ffe08e]" style="font-variation-settings:'FILL' 1">verified_user</span>
            <div class="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#002451]"></div>
          </div>
          <div>
            <p class="text-[10px] uppercase tracking-tight opacity-70 font-bold">Security Standard</p>
            <p class="text-sm font-bold">Audit Blockchain</p>
          </div>
        </div>
      </div>

      <!-- Main Layout -->
      <div class="grid grid-cols-12 gap-6">
        <!-- Left: Metrics -->
        <div class="col-span-12 lg:col-span-3 flex flex-col gap-5">
          <div class="kpi-card border-b-2 border-[#002451]">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Alertes 24h</p>
            <h3 class="text-4xl font-extrabold text-[#002451]">14</h3>
            <div class="mt-3 flex items-center gap-1 text-red-600 text-xs font-bold">
              <span class="material-symbols-outlined text-xs">trending_up</span>
              <span>+12% vs hier</span>
            </div>
          </div>
          <div class="kpi-card">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Dernier Déverrouillage</p>
            <p class="text-sm font-semibold text-slate-800">Il y a 14 min</p>
            <div class="mt-3 flex items-center gap-2">
              <div class="w-9 h-9 rounded-xl bg-[#ffe08e] flex items-center justify-center">
                <span class="material-symbols-outlined text-[#4f3d00] text-base">key</span>
              </div>
              <span class="text-xs text-slate-500 font-medium">Entrepôt Sud-Est</span>
            </div>
          </div>

          <!-- Metrics -->
          <div class="flex flex-col gap-4">
            <div class="kpi-card border-l-4 border-[#C9A227]">
              <div class="flex justify-between items-start mb-3">
                <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Sûreté du Journal</p>
                <span class="material-symbols-outlined text-[#C9A227]">shield_lock</span>
              </div>
              <div class="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden mb-2">
                <div class="h-full bg-[#C9A227] rounded-full" style="width:98%"></div>
              </div>
              <p class="text-[11px] text-slate-500">Score d'intégrité : 99.8%</p>
            </div>
            <div class="kpi-card border-l-4 border-[#1A3A6B]">
              <div class="flex justify-between items-start mb-2">
                <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Blockchain Sync</p>
                <span class="material-symbols-outlined text-[#1A3A6B]">dataset</span>
              </div>
              <p class="text-xs font-mono text-slate-500">0x4F2A...99C1</p>
              <p class="text-[11px] text-slate-400">Validé par 8 nœuds</p>
            </div>
          </div>
        </div>

        <!-- Right: Table -->
        <div class="col-span-12 lg:col-span-9 sigda-card overflow-hidden flex flex-col">
          <div class="sigda-card-header bg-slate-50">
            <span class="text-xs font-bold uppercase tracking-widest text-slate-500">Flux d'Audit en Temps Réel</span>
            <div class="flex gap-2">
              <button onclick="audit_addEntry()" class="btn-secondary text-xs py-2 px-3" ${['CLOTUREE','VERROUILLEE'].includes(s.periode.statut)?'disabled':''}>
                <span class="material-symbols-outlined text-sm">add</span>Nouvelle Entrée
              </button>
              <button class="p-2 hover:bg-slate-100 rounded-lg">
                <span class="material-symbols-outlined text-base text-slate-400">download</span>
              </button>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="dense-table">
              <thead><tr class="bg-slate-50 border-b border-slate-100">
                <th>Date/Heure</th><th>Site</th><th>Administrateur</th>
                <th>Motif d'Exception</th><th class="text-center">Statut</th>
              </tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
          <div class="mt-auto p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
            <p class="text-[11px] font-bold text-slate-400 uppercase">Affichage 1-${s.audit.length} sur ${s.audit.length} entrées</p>
            <div class="flex gap-1">
              <button class="w-8 h-8 rounded-lg flex items-center justify-center bg-white text-[#002451] shadow-sm border border-slate-100">
                <span class="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <button class="w-8 h-8 rounded-lg flex items-center justify-center bg-[#002451] text-white shadow-sm font-bold text-xs">1</button>
              <button class="w-8 h-8 rounded-lg flex items-center justify-center bg-white text-slate-400 shadow-sm border border-slate-100 font-bold text-xs hover:text-[#002451]">2</button>
              <button class="w-8 h-8 rounded-lg flex items-center justify-center bg-white text-[#002451] shadow-sm border border-slate-100">
                <span class="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom action -->
      <div class="mt-8 flex gap-4">
        <div class="flex-[2] kpi-card border-l-4 border-[#C9A227] flex items-start justify-between">
          <div>
            <h4 class="text-sm font-bold text-[#002451] mb-2">Générer Rapport de Conformité</h4>
            <p class="text-xs text-slate-500 mb-4">Prêt pour l'audit annuel ISO-27001. Contient toutes les exceptions cryptées.</p>
            <button onclick="rapports_simulerPDF()" class="btn-secondary text-xs py-2 px-4">
              <span class="material-symbols-outlined text-sm">picture_as_pdf</span>Exporter PDF
            </button>
          </div>
          <span class="material-symbols-outlined text-[#C9A227] text-3xl opacity-30">analytics</span>
        </div>
        <div class="flex-1 kpi-card border-l-4 border-emerald-500">
          <p class="text-[10px] font-bold text-slate-400 uppercase mb-2">Rapport Prêt</p>
          <p class="text-sm font-bold text-[#002451]">Conformité ISO-27001</p>
          <p class="text-xs text-slate-400 mt-2">Dernière génération : ${s.periode.date}</p>
        </div>
      </div>
    </div>`;
};

window.audit_addEntry = function() {
  const content = `
    <div class="space-y-4">
      <div>
        <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Site</label>
        <input id="audit-site" type="text" placeholder="Ex: KN-01" class="input-underline" />
      </div>
      <div>
        <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Motif d'exception <span class="text-red-500">*</span></label>
        <textarea id="audit-motif" rows="3" class="input-underline resize-none" placeholder="Décrivez l'intervention exceptionnelle..."></textarea>
      </div>
    </div>`;
  const footer = `
    <button onclick="closeModal('audit-modal')" class="btn-secondary">Annuler</button>
    <button onclick="audit_confirmEntry()" class="btn-primary">
      <span class="material-symbols-outlined text-sm">add</span>Enregistrer
    </button>`;
  window.SIGDA_UTILS.openModal(window.SIGDA_UTILS.renderModal('audit-modal', 'Nouvelle Entrée d\'Audit', 'rule', content, footer));
};

window.audit_confirmEntry = function() {
  const site = document.getElementById('audit-site')?.value?.trim();
  const motif = document.getElementById('audit-motif')?.value?.trim();
  if (!site || !motif) {
    window.SIGDA_UTILS.showToast('Remplissez tous les champs.', 'error'); return;
  }
  const now = new Date();
  const date = `${now.getDate().toString().padStart(2,'0')} ${['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'][now.getMonth()]} ${now.getFullYear()}`;
  const time = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`;
  window.SIGDA_STATE.audit.unshift({
    id: 'AU'+Date.now(), datetime: `${date}\n${time}`,
    site, admin: window.SIGDA_STATE.periode.admin,
    initiales: window.SIGDA_STATE.periode.admin.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase(),
    motif, statut: 'TRACE'
  });
  window.SIGDA.save();
  closeModal('audit-modal');
  window.SIGDA_UTILS.showToast('Entrée d\'audit enregistrée.', 'success');
  SIGDA_APP.navigateTo('#audit');
};
