// ============================================================
// SIGDA v2.0 — Module Caisse
// ============================================================
window.SIGDA_PAGES = window.SIGDA_PAGES || {};

window.SIGDA_PAGES.caisse = function() {
  const s = window.SIGDA_STATE;
  const { fmtUSD, fmtQty } = window.SIGDA_UTILS;
  const isCloture = ['CLOTUREE','VERROUILLEE','EN_CLOTURE'].includes(s.periode.statut);

  const soldeActuel = window.SIGDA.getSoldeActuelCaisse();
  const totalEntrees = window.SIGDA.getTotalEntreesCaisse();
  const totalSorties = window.SIGDA.getTotalSortiesCaisse();

  const typeColors = {
    'VENTE':'bg-blue-100 text-blue-700',
    'FRAIS':'bg-orange-100 text-orange-700',
    'PROVISION':'bg-purple-100 text-purple-700',
    'TRANSFERT':'bg-slate-100 text-slate-600',
  };

  const txRows = s.caisse.transactions.map(t => {
    const isEntree = t.montant > 0;
    const isEnAttente = t.statut === 'EN_ATTENTE';
    const statut = isEnAttente
      ? `<span class="inline-flex items-center gap-1 text-amber-600 text-xs font-bold"><span class="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>En attente</span>`
      : `<span class="inline-flex items-center gap-1 text-emerald-700 text-xs font-bold"><span class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>Validé</span>`;

    return `
      <tr>
        <td class="px-6 py-4 text-slate-500 text-sm whitespace-nowrap">${t.datetime}</td>
        <td class="px-6 py-4 font-semibold text-[#002451]">${t.libelle}</td>
        <td class="px-6 py-4">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${typeColors[t.type]||'bg-slate-100 text-slate-600'}">${t.type}</span>
        </td>
        <td class="px-6 py-4 font-black text-base ${isEntree?'text-emerald-700':'text-red-600'}">
          ${isEntree?'+':''}${fmtUSD(t.montant)}
        </td>
        <td class="px-6 py-4">${statut}</td>
      </tr>`;
  }).join('');

  const provisionItems = s.caisse.provisions.map(p => {
    const pctUtil = Math.round((p.utilise/p.montant)*100);
    return `
      <div class="p-4 bg-white/10 rounded-xl border border-white/10">
        <div class="flex justify-between items-center mb-2">
          <span class="text-[10px] uppercase font-bold text-blue-200">${p.libelle}</span>
          <span class="text-sm font-bold text-white">${fmtUSD(p.montant)}</span>
        </div>
        <div class="w-full bg-white/20 h-1.5 rounded-full overflow-hidden mb-1">
          <div class="bg-[#ffe08e] h-full rounded-full transition-all" style="width:${pctUtil}%"></div>
        </div>
        ${p.utilise < p.montant ? `<p class="text-[10px] text-blue-200 text-right">Reste: ${fmtUSD(p.montant-p.utilise)}</p>` : ''}
      </div>`;
  }).join('');

  return `
    <div class="page-canvas fade-in-up" style="padding:2rem">
      <!-- Header -->
      <div class="flex justify-between items-end mb-8">
        <div>
          <p class="text-[10px] uppercase font-black tracking-[0.2em] text-[#C9A227] mb-1">Module Trésorerie</p>
          <h2 class="text-3xl font-extrabold tracking-tight text-[#002451]">Journal de Caisse</h2>
          <p class="text-slate-500 text-sm mt-1">Gestion des flux en temps réel — ${s.periode.date}</p>
        </div>
        ${!isCloture ? `
        <div class="flex gap-3">
          <button onclick="caisse_openModal('entree')" class="btn-success">
            <span class="material-symbols-outlined text-sm">add_circle</span>Nouvelle Entrée
          </button>
          <button onclick="caisse_openModal('sortie')" class="btn-danger">
            <span class="material-symbols-outlined text-sm">remove_circle</span>Sortie de Caisse
          </button>
        </div>` : ''}
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <div class="kpi-card border-b-4 border-slate-300">
          <p class="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">Solde Initial</p>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-black text-[#002451]">${fmtUSD(s.caisse.soldeInitial)}</span>
            <span class="text-xs font-bold text-slate-400">USD</span>
          </div>
          <div class="mt-3 flex items-center text-[10px] text-slate-500 font-semibold gap-1">
            <span class="material-symbols-outlined text-xs">history</span>Report de la veille
          </div>
        </div>
        <div class="kpi-card border-b-4 border-emerald-500">
          <p class="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">Total Entrées</p>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-black text-emerald-700">+${fmtUSD(totalEntrees)}</span>
            <span class="text-xs font-bold text-slate-400">USD</span>
          </div>
          <div class="mt-3 flex items-center text-[10px] text-emerald-600 font-semibold gap-1">
            <span class="material-symbols-outlined text-xs">trending_up</span>
            ${s.caisse.transactions.filter(t=>t.montant>0).length} transactions
          </div>
        </div>
        <div class="kpi-card border-b-4 border-red-500">
          <p class="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">Total Sorties</p>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-black text-red-600">${fmtUSD(totalSorties)}</span>
            <span class="text-xs font-bold text-slate-400">USD</span>
          </div>
          <div class="mt-3 flex items-center text-[10px] text-red-500 font-semibold gap-1">
            <span class="material-symbols-outlined text-xs">trending_down</span>
            ${s.caisse.transactions.filter(t=>t.montant<0).length} opérations
          </div>
        </div>
        <div class="kpi-card border-b-4 border-[#1A3A6B]" style="background:linear-gradient(135deg,#1A3A6B,#002451)">
          <p class="text-[10px] uppercase font-bold tracking-wider text-blue-300 mb-2">Solde Actuel</p>
          <div class="flex items-baseline gap-2">
            <span class="text-3xl font-black text-white">${fmtUSD(soldeActuel)}</span>
            <span class="text-xs font-bold text-blue-300">USD</span>
          </div>
          <div class="mt-3 flex items-center text-[10px] text-blue-200 font-semibold gap-1">
            <span class="material-symbols-outlined text-xs">account_balance</span>En caisse physique
          </div>
        </div>
      </div>

      <!-- Split layout -->
      <div class="grid grid-cols-12 gap-6">
        <!-- Journal Table -->
        <div class="col-span-12 lg:col-span-8 sigda-card overflow-hidden">
          <div class="sigda-card-header">
            <h3 class="font-bold text-[#002451] flex items-center gap-2">
              <span class="material-symbols-outlined text-[#C9A227]">list_alt</span>
              Transactions Récentes
            </h3>
          </div>
          <div class="overflow-x-auto">
            <table class="dense-table zebra-table" id="caisse-table">
              <thead><tr>
                <th>Date/Heure</th><th>Libellé</th><th>Type</th>
                <th>Montant USD</th><th>Statut</th>
              </tr></thead>
              <tbody>${txRows.length ? txRows : '<tr><td colspan="5" class="px-6 py-8 text-center text-slate-400">Aucune transaction</td></tr>'}</tbody>
            </table>
          </div>
        </div>

        <!-- Right sidebar -->
        <div class="col-span-12 lg:col-span-4 space-y-5">
          <!-- Provisions -->
          <div class="p-6 rounded-xl text-white relative overflow-hidden" style="background:linear-gradient(135deg,#1A3A6B,#002451)">
            <div class="flex justify-between items-start mb-5">
              <h4 class="font-bold tracking-tight">Provisions Gelées</h4>
              <span class="material-symbols-outlined opacity-60">lock</span>
            </div>
            <div class="space-y-3">${provisionItems}</div>
            ${!isCloture ? `
            <button onclick="caisse_openProvision()" class="w-full mt-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-bold text-xs transition-all">
              Gérer les Provisions
            </button>` : ''}
          </div>

          <!-- Conformité -->
          <div class="sigda-card p-5">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <span class="material-symbols-outlined text-[#1A3A6B]" style="font-variation-settings:'FILL' 1">shield</span>
              </div>
              <h4 class="font-bold text-[#002451] text-sm">Contrôle de Conformité</h4>
            </div>
            <p class="text-xs text-slate-500 leading-relaxed mb-4">
              Toutes les transactions supérieures à <strong>$500</strong> nécessitent une validation du Responsable Financier.
            </p>
            <div class="flex flex-col gap-2">
              <div class="flex justify-between text-[10px] font-bold py-2 border-b border-slate-100">
                <span class="text-slate-500 uppercase">Dernier Inventaire</span>
                <span class="text-[#002451]">Aujourd'hui, 08:00</span>
              </div>
              <div class="flex justify-between text-[10px] font-bold py-2 border-b border-slate-100">
                <span class="text-slate-500 uppercase">Écart de Caisse</span>
                <span class="text-emerald-600">0.00 USD (OK)</span>
              </div>
              <div class="flex justify-between text-[10px] font-bold py-2">
                <span class="text-slate-500 uppercase">Solde Théorique</span>
                <span class="text-[#002451] font-black">${fmtUSD(soldeActuel)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
};

// ---- Transaction Modal ----
window.caisse_openModal = function(type) {
  const isEntree = type === 'entree';
  const s = window.SIGDA_STATE;
  const content = `
    <div class="space-y-4">
      <div class="p-3 rounded-lg ${isEntree?'bg-emerald-50 text-emerald-700':'bg-red-50 text-red-700'} flex items-center gap-2">
        <span class="material-symbols-outlined text-lg">${isEntree?'add_circle':'remove_circle'}</span>
        <span class="text-sm font-bold">${isEntree?'Nouvelle entrée de fonds':'Sortie de caisse'}</span>
      </div>
      <div>
        <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Libellé</label>
        <input id="tx-libelle" type="text" placeholder="${isEntree?'Ex: Versement Vendeur X':'Ex: Carburant véhicule'}" class="input-underline" />
      </div>
      <div>
        <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Type</label>
        <select id="tx-type" class="input-underline">
          ${isEntree
            ? '<option>VENTE</option><option>TRANSFERT</option>'
            : '<option>FRAIS</option><option>PROVISION</option><option>TRANSFERT</option>'}
        </select>
      </div>
      <div>
        <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Montant (USD)</label>
        <input id="tx-montant" type="number" min="0.01" step="0.01" placeholder="0.00" class="input-underline" />
      </div>
    </div>`;
  const footer = `
    <button onclick="closeModal('tx-modal')" class="btn-secondary">Annuler</button>
    <button onclick="caisse_confirmTx('${type}')" class="btn-${isEntree?'success':'danger'}">
      <span class="material-symbols-outlined text-sm">${isEntree?'add_circle':'remove_circle'}</span>
      Enregistrer
    </button>`;
  window.SIGDA_UTILS.openModal(window.SIGDA_UTILS.renderModal('tx-modal', isEntree?'Nouvelle Entrée':'Sortie de Caisse', isEntree?'payments':'money_off', content, footer));
};

window.caisse_confirmTx = function(type) {
  const libelle = document.getElementById('tx-libelle')?.value?.trim();
  const txType = document.getElementById('tx-type')?.value;
  const montant = parseFloat(document.getElementById('tx-montant')?.value);
  if (!libelle || !montant || montant <= 0) {
    window.SIGDA_UTILS.showToast('Remplissez tous les champs correctement.', 'error'); return;
  }
  const finalMontant = type === 'entree' ? montant : -montant;
  window.SIGDA.addTransaction(libelle, txType, finalMontant);
  closeModal('tx-modal');
  window.SIGDA_UTILS.showToast(`Transaction de ${window.SIGDA_UTILS.fmtUSD(montant)} enregistrée.`, 'success');
  SIGDA_APP.navigateTo('#caisse');
};

window.caisse_openProvision = function() {
  window.SIGDA_UTILS.showToast('Gestion des provisions : fonctionnalité en cours de déploiement.', 'info');
};
