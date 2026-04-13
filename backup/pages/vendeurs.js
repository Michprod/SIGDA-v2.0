// ============================================================
// SIGDA v2.0 — Module Vendeurs & Paie
// ============================================================
window.SIGDA_PAGES = window.SIGDA_PAGES || {};

window.SIGDA_PAGES.vendeurs = function() {
  const s = window.SIGDA_STATE;
  const { fmtUSD, fmtQty, renderVendeurBadge, renderStatutBadge } = window.SIGDA_UTILS;
  const isCloture = ['CLOTUREE','VERROUILLEE','EN_CLOTURE'].includes(s.periode.statut);

  function calcRemuneration(v) {
    const commission = v.caisseSaisie * v.commission;
    const ecartAbs = Math.abs(v.ecart || 0);
    return commission - ecartAbs;
  }

  const vendeurRows = s.vendeurs.map(v => {
    const isReconcilie = v.statut === 'RECONCILIEE';
    const remunet = isReconcilie ? calcRemuneration(v) : null;
    const ecartClass = v.ecart > 0 ? 'text-emerald-600' : v.ecart < 0 ? 'text-red-600' : 'text-slate-500';

    return `
      <tr class="${isReconcilie ? '' : 'bg-amber-50/40'}">
        <td class="px-6 py-4">
          <div class="flex items-center gap-3">
            ${renderVendeurBadge(v)}
            <div>
              <p class="font-bold text-slate-800">${v.nom}</p>
              <p class="text-xs text-slate-400">${v.id}</p>
            </div>
          </div>
        </td>
        <td class="px-6 py-4 text-center font-semibold">${fmtQty(v.stockDepart)}</td>
        <td class="px-6 py-4 text-center font-semibold">${fmtQty(v.retours)}</td>
        <td class="px-6 py-4 text-center font-bold text-[#002451]">${fmtUSD(v.caisseTheorique)}</td>
        <td class="px-6 py-4 text-center font-bold ${isReconcilie ? 'text-[#2E7D52]' : 'text-slate-300'}">${isReconcilie ? fmtUSD(v.caisseSaisie) : '--'}</td>
        <td class="px-6 py-4 text-center font-bold ${ecartClass}">${isReconcilie ? (v.ecart>=0?'+':'')+fmtUSD(v.ecart) : '--'}</td>
        <td class="px-6 py-4 text-center">
          ${renderStatutBadge(v.statut)}
        </td>
        <td class="px-6 py-4 text-center">
          ${isReconcilie
            ? `<span class="font-black text-[#002451]">${fmtUSD(remunet)}</span>`
            : !isCloture
            ? `<button onclick="vendeurs_openReconciliation('${v.id}')" class="btn-primary text-xs py-2 px-3">
                 <span class="material-symbols-outlined text-sm">payments</span>Réconcilier
               </button>`
            : '<span class="text-slate-300 text-sm">En attente</span>'}
        </td>
      </tr>`;
  }).join('');

  // Summary cards
  const totalCA = s.vendeurs.filter(v=>v.statut==='RECONCILIEE').reduce((s,v)=>s+v.caisseSaisie,0);
  const totalRemunet = s.vendeurs.filter(v=>v.statut==='RECONCILIEE').reduce((s,v)=>s+calcRemuneration(v),0);
  const totalEcart = s.vendeurs.filter(v=>v.statut==='RECONCILIEE').reduce((s,v)=>s+(v.ecart||0),0);

  return `
    <div class="page-canvas fade-in-up" style="padding:2rem">
      <div class="mb-8">
        <h2 class="text-3xl font-black tracking-tight text-[#002451]">Vendeurs & Réconciliation</h2>
        <p class="text-slate-500 font-medium">Rapprochement des encaissements et calcul des rémunérations</p>
      </div>

      <!-- KPI Summary -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <div class="kpi-card border-b-4 border-[#C9A227]">
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">CA Total Réconcilié</p>
          <p class="text-2xl font-black text-[#002451]">${fmtUSD(totalCA)}</p>
          <p class="text-xs text-slate-400 mt-1">Encaissements validés</p>
        </div>
        <div class="kpi-card border-b-4 border-emerald-500">
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Réconciliés</p>
          <p class="text-2xl font-black text-[#002451]">${window.SIGDA.getVendeursReconcilies()} <span class="text-sm text-slate-400">/ ${window.SIGDA.getTotalVendeurs()}</span></p>
          <p class="text-xs text-slate-400 mt-1">Vendeurs traités</p>
        </div>
        <div class="kpi-card border-b-4 border-${totalEcart<0?'red':'slate'}-400">
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Écart Total</p>
          <p class="text-2xl font-black ${totalEcart<0?'text-red-600':totalEcart>0?'text-emerald-600':'text-slate-600'}">${totalEcart>=0?'+':''}${fmtUSD(totalEcart)}</p>
          <p class="text-xs text-slate-400 mt-1">Différence cumulée</p>
        </div>
        <div class="kpi-card border-b-4 border-[#1A3A6B]">
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Rémunérations</p>
          <p class="text-2xl font-black text-[#002451]">${fmtUSD(totalRemunet)}</p>
          <p class="text-xs text-slate-400 mt-1">Net à distribuer</p>
        </div>
      </div>

      <!-- Table principale -->
      <div class="sigda-card overflow-hidden">
        <div class="sigda-card-header">
          <h4 class="font-bold text-[#002451] flex items-center gap-2">
            <span class="w-1.5 h-5 bg-[#2D6FAD] rounded-full"></span>
            Sessions de Vente — ${s.periode.date}
          </h4>
          <div class="flex gap-2">
            <button onclick="vendeurs_exportFiche()" class="btn-secondary text-xs py-2 px-3">
              <span class="material-symbols-outlined text-sm">download</span>Exporter
            </button>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="dense-table zebra-table">
            <thead><tr>
              <th style="padding-left:1.5rem">Vendeur</th>
              <th class="text-center">Stock Départ</th>
              <th class="text-center">Retours</th>
              <th class="text-center">Encaissement Théo.</th>
              <th class="text-center">Encaissement Réel</th>
              <th class="text-center">Écart</th>
              <th class="text-center">Statut</th>
              <th class="text-center">Rémunération</th>
            </tr></thead>
            <tbody id="vendeurs-tbody">${vendeurRows}</tbody>
          </table>
        </div>
      </div>

      <!-- Formule de calcul -->
      <div class="mt-6 p-6 rounded-xl border-l-4 border-[#1A3A6B]" style="background:#EEF3FB">
        <p class="text-xs font-black text-[#1A3A6B] uppercase tracking-wider mb-3">Formule de Rémunération</p>
        <div class="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-700">
          <span class="px-3 py-2 bg-white rounded-lg shadow-sm">Encaissement Réel</span>
          <span class="text-2xl text-slate-300">×</span>
          <span class="px-3 py-2 bg-white rounded-lg shadow-sm">Commission (5%)</span>
          <span class="text-2xl text-slate-300">−</span>
          <span class="px-3 py-2 bg-white rounded-lg shadow-sm border-b-2 border-red-400">|Écart de Caisse|</span>
          <span class="text-2xl text-[#1A3A6B]">=</span>
          <span class="px-4 py-2 bg-[#1A3A6B] text-white rounded-lg shadow-md font-bold">Net à Payer</span>
        </div>
      </div>
    </div>`;
};

// ---- Reconciliation Modal ----
window.vendeurs_openReconciliation = function(vendeurId) {
  const s = window.SIGDA_STATE;
  const v = s.vendeurs.find(x=>x.id===vendeurId);
  if (!v) return;
  const { fmtUSD } = window.SIGDA_UTILS;
  const commission = 0.05;

  const content = `
    <div class="space-y-5">
      <div class="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
        ${window.SIGDA_UTILS.renderVendeurBadge(v)}
        <div>
          <p class="font-bold text-[#002451]">${v.nom}</p>
          <p class="text-xs text-slate-500">Stock départ: ${window.SIGDA_UTILS.fmtQty(v.stockDepart)} unités • Retours: ${v.retours}</p>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="p-4 bg-blue-50 rounded-xl">
          <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Encaissement Théorique</p>
          <p class="text-2xl font-black text-[#002451]">${fmtUSD(v.caisseTheorique)}</p>
        </div>
        <div class="p-4 bg-slate-50 rounded-xl">
          <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Argent Remis Réel</label>
          <input id="recon-montant" type="number" step="0.01"
            value="${v.caisseTheorique}"
            oninput="vendeurs_updateEcartPreview(${v.caisseTheorique})"
            class="w-full bg-white border-0 border-b-2 border-slate-300 focus:border-[#002451] focus:ring-0 font-black text-xl text-[#002451] rounded-t-lg py-2 px-1" />
        </div>
      </div>
      <div id="ecart-preview" class="p-4 rounded-xl text-center border-2 border-dashed border-slate-200">
        <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Écart Calculé</p>
        <p id="ecart-value" class="text-3xl font-black text-emerald-600">$0.00</p>
        <p id="remunet-preview" class="text-xs text-slate-500 mt-1">Rémunération nette: ${fmtUSD(v.caisseTheorique*commission)}</p>
      </div>
    </div>`;

  const footer = `
    <button onclick="closeModal('recon-modal')" class="btn-secondary">Annuler</button>
    <button onclick="vendeurs_confirmerReconciliation('${vendeurId}')" class="btn-primary">
      <span class="material-symbols-outlined text-sm" style="font-variation-settings:'FILL' 1">task_alt</span>
      Valider & Clôturer Session
    </button>`;

  window.SIGDA_UTILS.openModal(window.SIGDA_UTILS.renderModal('recon-modal', `Réconciliation — ${v.nom}`, 'payments', content, footer));
  // Initialize ecart preview
  setTimeout(() => window.vendeurs_updateEcartPreview(v.caisseTheorique), 50);
};

window.vendeurs_updateEcartPreview = function(theorique) {
  const montantInput = document.getElementById('recon-montant');
  if (!montantInput) return;
  const reel = parseFloat(montantInput.value) || 0;
  const ecart = reel - theorique;
  const ecartEl = document.getElementById('ecart-value');
  const remunetEl = document.getElementById('remunet-preview');
  const previewEl = document.getElementById('ecart-preview');
  if (!ecartEl) return;

  const { fmtUSD } = window.SIGDA_UTILS;
  const sign = ecart >= 0 ? '+' : '';
  ecartEl.textContent = sign + fmtUSD(ecart);
  ecartEl.className = `text-3xl font-black ${ecart < -0.01 ? 'text-red-600' : ecart > 0.01 ? 'text-emerald-600' : 'text-emerald-600'}`;
  previewEl.className = `p-4 rounded-xl text-center border-2 border-dashed ${ecart < -0.01 ? 'border-red-300 bg-red-50' : 'border-emerald-300 bg-emerald-50'}`;

  const commission = reel * 0.05;
  const ecartAbs = Math.abs(ecart);
  const net = commission - ecartAbs;
  if (remunetEl) remunetEl.textContent = `Rémunération nette: ${fmtUSD(net)} (${fmtUSD(commission)} commission − ${fmtUSD(ecartAbs)} écart)`;
};

window.vendeurs_confirmerReconciliation = function(vendeurId) {
  const montantInput = document.getElementById('recon-montant');
  if (!montantInput) return;
  const reel = parseFloat(montantInput.value);
  if (isNaN(reel) || reel < 0) {
    window.SIGDA_UTILS.showToast('Entrez un montant valide.', 'error'); return;
  }
  window.SIGDA.reconcilierVendeur(vendeurId, reel);
  closeModal('recon-modal');
  window.SIGDA_UTILS.showToast('Réconciliation validée !', 'success');
  // Re-render page
  SIGDA_APP.navigateTo('#vendeurs');
};

window.vendeurs_exportFiche = function() {
  window.SIGDA_UTILS.showToast('Export de la fiche en cours...', 'info');
};
