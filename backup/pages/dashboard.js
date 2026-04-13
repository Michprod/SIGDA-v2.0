// ============================================================
// SIGDA v2.0 — Dashboard Gestionnaire Local
// ============================================================
window.SIGDA_PAGES = window.SIGDA_PAGES || {};

window.SIGDA_PAGES.dashboard = function() {
  const s = window.SIGDA_STATE;
  const { fmtUSD, fmtQty, pct, renderChecklistIcon, renderVendeurBadge, renderStatutBadge, renderCircularGauge } = window.SIGDA_UTILS;

  const CA = window.SIGDA.getCAJour();
  const caPercent = pct(CA, s.periode.objectifCA);
  const reconcilies = window.SIGDA.getVendeursReconcilies();
  const totalV = window.SIGDA.getTotalVendeurs();
  const stockTotal = window.SIGDA.getStockTotalDispo();
  const bloquants = window.SIGDA.getChecklistBloquants();
  const clotureBloquee = window.SIGDA.isClotureBloquee();
  const isCloture = ['CLOTUREE','VERROUILLEE'].includes(s.periode.statut);

  // Vendeur rows
  const vendeurRows = s.vendeurs.map(v => {
    const isReconcilie = v.statut === 'RECONCILIEE';
    const statutHtml = isReconcilie
      ? `<span class="flex items-center gap-1.5 text-emerald-700 font-semibold text-sm"><span class="material-symbols-outlined text-base" style="font-variation-settings:'FILL' 1">check_circle</span>Réconcilié</span>`
      : `<span class="flex items-center gap-1.5 text-amber-600 font-semibold text-sm"><span class="material-symbols-outlined text-base">schedule</span>En attente</span>`;
    return `
      <tr>
        <td class="px-6 py-4">
          <div class="flex items-center gap-3">
            ${renderVendeurBadge(v)}
            <span class="font-semibold text-slate-700">${v.nom}</span>
          </div>
        </td>
        <td class="px-6 py-4 text-slate-600">${fmtQty(v.stockDepart)} unités</td>
        <td class="px-6 py-4 text-slate-600">${v.retours > 0 ? fmtQty(v.retours)+' unités' : '<span class="text-slate-300">--</span>'}</td>
        <td class="px-6 py-4 font-bold text-[#002451]">${fmtUSD(v.caisseTheorique)}</td>
        <td class="px-6 py-4">${statutHtml}</td>
        ${!isCloture && !isReconcilie ? `<td class="px-6 py-4"><button onclick="SIGDA_APP.navigateTo('#vendeurs')" class="text-xs font-bold text-[#2D6FAD] hover:underline flex items-center gap-1"><span class="material-symbols-outlined text-sm">arrow_forward</span>Réconcilier</button></td>` : '<td></td>'}
      </tr>`;
  }).join('');

  // Checklist
  const checklistItems = s.checklist.map(c => {
    const blocking = c.statut === 'BLOQUANT';
    const warning = c.statut === 'AVERTISSEMENT';
    const extraClass = blocking ? 'bg-red-50 rounded-lg px-2 py-1 -mx-2' : warning ? 'bg-amber-50 rounded-lg px-2 py-1 -mx-2' : '';
    return `
      <div class="flex items-start gap-3 ${extraClass}">
        ${renderChecklistIcon(c.statut)}
        <span class="text-sm font-medium ${blocking ? 'font-bold text-red-800' : ''}">${c.label}</span>
      </div>`;
  }).join('');

  const clotureBtn = clotureBloquee && !isCloture
    ? `<button disabled class="w-full py-4 bg-slate-200 text-slate-400 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed uppercase tracking-wider">
         <span class="material-symbols-outlined">lock</span>Initier la Clôture Journalière
       </button>
       <p class="text-[10px] text-center text-slate-400 mt-2 italic">${bloquants} point(s) bloquant(s) à corriger.</p>`
    : isCloture
    ? `<div class="w-full py-4 bg-emerald-100 text-emerald-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2 uppercase tracking-wider">
         <span class="material-symbols-outlined">verified</span>Journée Clôturée
       </div>`
    : `<button onclick="SIGDA_APP.openWizard()" class="w-full py-4 bg-gradient-to-br from-[#1A3A6B] to-[#002451] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 uppercase tracking-wider shadow-lg hover:scale-[1.01] transition-all">
         <span class="material-symbols-outlined">lock_clock</span>Initier la Clôture Journalière
       </button>`;

  return `
    <div class="page-canvas fade-in-up" style="padding:2rem">
      <div class="mb-8">
        <h2 class="text-3xl font-extrabold tracking-tight text-[#002451]">Tableau de Bord Journalier</h2>
        <p class="text-slate-500 font-medium mt-1">Aperçu de la gestion du site — ${s.periode.site}</p>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        <!-- CA Card -->
        <div class="kpi-card border-b-4 border-[#C9A227] flex items-center justify-between">
          <div>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Chiffre d'Affaires</p>
            <h3 class="text-2xl font-black text-[#002451]">${fmtUSD(CA)} <span class="text-sm font-medium text-slate-400">USD</span></h3>
            <p class="text-xs font-semibold text-[#755b00] mt-2 flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">trending_up</span>
              ${caPercent}% de l'objectif (${fmtUSD(s.periode.objectifCA)})
            </p>
          </div>
          <div class="gauge-wrap" style="width:64px;height:64px;">
            ${renderCircularGauge(caPercent, 64, 5, '#C9A227')}
          </div>
        </div>

        <!-- Vendeurs Card -->
        <div class="kpi-card border-b-4 border-emerald-500 flex items-center justify-between">
          <div>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Vendeurs Réconciliés</p>
            <h3 class="text-2xl font-black text-[#002451]">${reconcilies} <span class="text-sm font-medium text-slate-400">/ ${totalV}</span></h3>
            <span class="inline-flex items-center px-2 py-0.5 mt-2 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">
              ${reconcilies < totalV ? `${totalV-reconcilies} EN ATTENTE` : '✓ TOUS RÉCONCILIÉS'}
            </span>
          </div>
          <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
            <span class="material-symbols-outlined text-2xl" style="font-variation-settings:'FILL' 1">how_to_reg</span>
          </div>
        </div>

        <!-- Stock Card -->
        <div class="kpi-card border-b-4 border-[#2D6FAD] flex items-center justify-between">
          <div>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Stock Total Dispo</p>
            <h3 class="text-2xl font-black text-[#002451]">${fmtQty(stockTotal)} <span class="text-sm font-medium text-slate-400">unités</span></h3>
            <p class="text-xs font-semibold text-slate-500 mt-2">Inventaire centralisé</p>
          </div>
          <div class="w-12 h-12 bg-blue-50 text-[#2D6FAD] rounded-full flex items-center justify-center">
            <span class="material-symbols-outlined text-2xl" style="font-variation-settings:'FILL' 1">inventory_2</span>
          </div>
        </div>
      </div>

      <!-- Two column layout -->
      <div class="grid grid-cols-12 gap-8 items-start">

        <!-- Vendeurs Table -->
        <div class="col-span-12 lg:col-span-8 sigda-card">
          <div class="sigda-card-header">
            <h4 class="font-bold text-[#002451] flex items-center gap-2">
              <span class="w-1.5 h-5 bg-[#C9A227] rounded-full"></span>
              Activité des Vendeurs
            </h4>
            <div class="flex gap-2">
              <button onclick="SIGDA_APP.navigateTo('#vendeurs')" class="p-2 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200 text-slate-500 hover:text-[#002451]" title="Voir module Vendeurs">
                <span class="material-symbols-outlined text-sm">open_in_new</span>
              </button>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="dense-table zebra-table">
              <thead>
                <tr>
                  <th style="padding-left:1.5rem">Nom Vendeur</th>
                  <th>Stock Départ</th>
                  <th>Retours</th>
                  <th>Caisse Théo.</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>${vendeurRows}</tbody>
            </table>
          </div>
        </div>

        <!-- Right column -->
        <div class="col-span-12 lg:col-span-4 space-y-5">

          <!-- Checklist -->
          <div class="sigda-card p-6">
            <h4 class="font-bold text-[#002451] mb-5 flex items-center gap-2 text-base">
              <span class="material-symbols-outlined text-[#C9A227]">fact_check</span>
              Checklist de Clôture
            </h4>
            <div class="space-y-3">${checklistItems}</div>
            <div class="mt-6 pt-5 border-t border-slate-100">
              ${clotureBtn}
            </div>
          </div>

          <!-- Alert card -->
          <div class="rounded-xl p-6 text-white relative overflow-hidden" style="background:linear-gradient(135deg,#C9A227,#a07d18)">
            <div class="absolute -right-4 -top-4 opacity-10">
              <span class="material-symbols-outlined" style="font-size:6rem;font-variation-settings:'FILL' 1">stars</span>
            </div>
            <p class="text-[10px] font-black uppercase tracking-widest mb-3 opacity-70">Alerte Prioritaire</p>
            <h5 class="text-lg font-black mb-2 leading-tight">Vérification de Stock Requise</h5>
            <p class="text-xs opacity-90 mb-4">L'entrepôt signale un décalage sur le Jus d'Ananas 1L.</p>
            <button onclick="SIGDA_APP.navigateTo('#stocks')" class="px-4 py-2 bg-white/20 text-white border border-white/30 rounded-lg text-xs font-bold hover:bg-white/30 transition-all">
              Vérifier maintenant
            </button>
          </div>
        </div>
      </div>

      <!-- Floating status bar -->
      <div class="fixed bottom-6 left-72 z-30 status-pill">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot"></span>
        Sync Cloud · OK · Il y a 2 min
      </div>
    </div>`;
};
