// ============================================================
// SIGDA v2.0 — Module Stocks (3 tabs)
// ============================================================
window.SIGDA_PAGES = window.SIGDA_PAGES || {};

window.SIGDA_PAGES.stocks = function(activeTab = 'dotation') {
  const s = window.SIGDA_STATE;
  const { fmtQty, fmtUSD } = window.SIGDA_UTILS;
  const isCloture = ['CLOTUREE','VERROUILLEE','EN_CLOTURE'].includes(s.periode.statut);

  // Compute stock remaining per produit
  function getRestDepot(produit) {
    const dotationsForProd = s.dotations[produit.id] || {};
    const totalDote = Object.values(dotationsForProd).reduce((a,b)=>a+(parseInt(b)||0),0);
    return produit.stockDepot - totalDote;
  }
  function getTotalDoteProduit(produitId) {
    return Object.values(s.dotations[produitId]||{}).reduce((a,b)=>a+(parseInt(b)||0),0);
  }
  function getTotalDoteVendeur(vendeurId) {
    return s.produits.reduce((sum, p) => sum + (parseInt((s.dotations[p.id]||{})[vendeurId])||0), 0);
  }
  const totalCapacite = s.produits.reduce((sum,p)=>sum+p.stockDepot,0);
  const totalRestDepot = s.produits.reduce((sum,p)=>sum+getRestDepot(p),0);

  // --- TAB: DOTATION MATINALE ---
  function renderDotation() {
    const vendeurHeaders = s.vendeurs.map(v => {
      const colorClasses = { blue:'bg-blue-50 text-blue-800', amber:'bg-amber-50 text-amber-800', emerald:'bg-emerald-50 text-emerald-800', slate:'bg-slate-100 text-slate-700', purple:'bg-purple-50 text-purple-800' };
      const cc = colorClasses[v.colorClass] || colorClasses.slate;
      return `<th class="px-5 py-4 text-center text-[11px] font-black uppercase tracking-wider ${cc}" style="min-width:110px">${v.nom}</th>`;
    }).join('');

    const productRows = s.produits.map(p => {
      const inputs = s.vendeurs.map(v => {
        const val = (s.dotations[p.id]||{})[v.id] || 0;
        const colorMap = { blue:'border-blue-200 focus:border-blue-600 text-blue-900', amber:'border-amber-200 focus:border-amber-600 text-amber-900', emerald:'border-emerald-200 focus:border-emerald-600 text-emerald-900', slate:'border-slate-200 focus:border-slate-500 text-slate-800', purple:'border-purple-200 focus:border-purple-600 text-purple-900' };
        const cc = colorMap[v.colorClass] || colorMap.slate;
        return isCloture
          ? `<td class="px-5 py-4 text-center font-bold">${fmtQty(val)}</td>`
          : `<td class="px-5 py-4">
               <input type="number" min="0" max="${p.stockDepot}"
                 value="${val}"
                 data-produit="${p.id}" data-vendeur="${v.id}"
                 onchange="stocks_updateDotation('${p.id}','${v.id}',this.value)"
                 class="w-full bg-white border-0 border-b-2 ${cc} focus:ring-0 text-center font-bold rounded-t-lg h-10 text-sm" />
             </td>`;
      }).join('');

      const rest = getRestDepot(p);
      const restClass = rest < 0 ? 'text-red-600 font-black' : rest === 0 ? 'text-slate-400' : 'text-slate-700 font-black';
      return `
        <tr class="group">
          <td class="px-6 py-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <span class="material-symbols-outlined text-[#1A3A6B]">${p.icon}</span>
              </div>
              <div>
                <p class="text-sm font-bold text-[#002451]">${p.nom}</p>
                <p class="text-[10px] text-slate-400 uppercase font-semibold">${p.categorie}</p>
              </div>
            </div>
          </td>
          <td class="px-5 py-4 text-center">
            <span class="inline-block px-3 py-1 bg-slate-100 rounded text-sm font-bold text-[#002451]">${fmtQty(p.stockDepot)}</span>
          </td>
          ${inputs}
          <td class="px-5 py-4 text-center">
            <span class="text-sm ${restClass}">${fmtQty(rest)}</span>
            ${rest < 0 ? '<br><span class="text-[10px] text-red-500 font-semibold">Dépassement!</span>' : ''}
          </td>
        </tr>`;
    }).join('');

    const vendeurTotals = s.vendeurs.map(v => {
      const colorMap = { blue:'bg-blue-50 text-blue-900', amber:'bg-amber-50 text-amber-900', emerald:'bg-emerald-50 text-emerald-900', slate:'bg-slate-100 text-slate-800', purple:'bg-purple-50 text-purple-900' };
      const cc = colorMap[v.colorClass] || colorMap.slate;
      return `<td class="px-5 py-5 text-center ${cc}">
                <span class="text-lg font-black">${fmtQty(getTotalDoteVendeur(v.id))}</span>
                <p class="text-[9px] font-bold uppercase ${v.colorClass==='blue'?'text-blue-600':v.colorClass==='amber'?'text-amber-600':'text-slate-500'}">Unités</p>
              </td>`;
    }).join('');

    return `
      <div class="sigda-card overflow-hidden">
        <div class="p-5 bg-slate-50 flex justify-between items-center border-b border-slate-100">
          <div class="flex items-center gap-4">
            <div class="flex -space-x-2">
              ${s.vendeurs.slice(0,3).map(v=>`<div class="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-blue-700">${v.initiales}</div>`).join('')}
            </div>
            <span class="text-xs font-bold text-[#1A3A6B] uppercase tracking-widest">Tableau de répartition</span>
          </div>
          ${!isCloture ? `
          <div class="flex gap-2">
            <button onclick="stocks_validerDotations()" class="btn-primary text-xs py-2 px-4">
              <span class="material-symbols-outlined text-sm">inventory</span>Valider les Dotations
            </button>
          </div>` : ''}
        </div>
        <div class="overflow-x-auto">
          <table class="dense-table" id="dotation-table">
            <thead>
              <tr class="bg-slate-50">
                <th class="px-6 py-4 text-left" style="min-width:200px">Produit</th>
                <th class="px-5 py-4 text-center" style="min-width:100px">Stock Dépôt</th>
                ${vendeurHeaders}
                <th class="px-5 py-4 text-center" style="min-width:100px">Reste Dépôt</th>
              </tr>
            </thead>
            <tbody class="zebra-table">${productRows}</tbody>
            <tfoot class="border-t-2 border-slate-200" style="background:#e7e8ea88">
              <tr>
                <td class="px-6 py-5 text-right font-black text-[#002451] text-xs uppercase tracking-wider">Totaux</td>
                <td class="px-5 py-5 text-center">
                  <span class="text-lg font-black text-[#002451]">${fmtQty(totalCapacite)}</span>
                  <p class="text-[9px] font-bold text-slate-500 uppercase">Capacité</p>
                </td>
                ${vendeurTotals}
                <td class="px-5 py-5 text-center">
                  <span class="text-lg font-black ${totalRestDepot<0?'text-red-600':'text-[#002451]'}">${fmtQty(totalRestDepot)}</span>
                  <p class="text-[9px] font-bold text-slate-500 uppercase">Dispo Dépôt</p>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>`;
  }

  // --- TAB: APPROVISIONNEMENT ---
  function renderAppro() {
    const rows = s.approvisionnements.map(a => {
      const prod = s.produits.find(p=>p.id===a.produitId);
      return `
        <tr>
          <td class="px-6 py-4 font-semibold">${a.reference}</td>
          <td class="px-6 py-4">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[#1A3A6B] text-sm">${prod?.icon||'inventory'}</span>
              <span class="font-semibold">${prod?.nom||a.produitId}</span>
            </div>
          </td>
          <td class="px-6 py-4 text-slate-500">${a.fournisseur}</td>
          <td class="px-6 py-4 font-black text-[#002451]">${fmtQty(a.quantite)} unités</td>
          <td class="px-6 py-4 text-slate-400 text-sm">${a.date}</td>
          <td class="px-6 py-4"><span class="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold">✓ Reçu</span></td>
        </tr>`;
    }).join('');

    return `
      <div class="grid grid-cols-12 gap-6">
        <!-- Form -->
        <div class="col-span-12 lg:col-span-4 sigda-card p-6">
          <h4 class="font-bold text-[#002451] mb-5 flex items-center gap-2">
            <span class="material-symbols-outlined text-[#C9A227]">add_circle</span>
            Nouvelle Livraison
          </h4>
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Référence</label>
              <input id="appro-ref" type="text" placeholder="LIV-2026-XXX" class="input-underline" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Produit</label>
              <select id="appro-produit" class="input-underline">
                ${s.produits.map(p=>`<option value="${p.id}">${p.nom}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Quantité</label>
              <input id="appro-qty" type="number" min="1" placeholder="0" class="input-underline" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Fournisseur</label>
              <input id="appro-fournisseur" type="text" placeholder="Nom du fournisseur" value="Usine Centrale" class="input-underline" />
            </div>
            ${!isCloture ? `<button onclick="stocks_addAppro()" class="btn-primary w-full mt-2 justify-center">
              <span class="material-symbols-outlined text-sm">add</span>Enregistrer la Livraison
            </button>` : '<div class="text-center text-xs text-slate-400 italic py-2">Saisies bloquées — journée en clôture</div>'}
          </div>
        </div>

        <!-- Table -->
        <div class="col-span-12 lg:col-span-8 sigda-card overflow-hidden">
          <div class="sigda-card-header">
            <h4 class="font-bold text-[#002451]">Historique des Approvisionnements</h4>
          </div>
          <div class="overflow-x-auto">
            <table class="dense-table zebra-table">
              <thead><tr>
                <th>Référence</th><th>Produit</th><th>Fournisseur</th>
                <th>Quantité</th><th>Date</th><th>Statut</th>
              </tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </div>
      </div>`;
  }

  // --- TAB: RETOURS & DÉMARQUE ---
  function renderRetours() {
    const rows = s.retours.map(r => {
      const prod = s.produits.find(p=>p.id===r.produitId);
      const vend = s.vendeurs.find(v=>v.id===r.vendeurId);
      const isCasse = r.motif === 'Casse';
      return `
        <tr>
          <td class="px-6 py-4 text-slate-500 text-sm">${r.date}</td>
          <td class="px-6 py-4"><span class="font-semibold">${vend?.nom||r.vendeurId}</span></td>
          <td class="px-6 py-4">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[#1A3A6B] text-sm">${prod?.icon||'inventory'}</span>
              <span class="font-semibold">${prod?.nom||r.produitId}</span>
            </div>
          </td>
          <td class="px-6 py-4 font-bold text-[#002451]">${fmtQty(r.quantite)}</td>
          <td class="px-6 py-4">
            <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${isCasse?'bg-red-100 text-red-700':'bg-blue-50 text-blue-700'}">
              ${isCasse?'⚠ ':''}${r.motif}
            </span>
          </td>
        </tr>`;
    }).join('');

    return `
      <div class="grid grid-cols-12 gap-6">
        <!-- Form -->
        <div class="col-span-12 lg:col-span-4 sigda-card p-6">
          <h4 class="font-bold text-[#002451] mb-5 flex items-center gap-2">
            <span class="material-symbols-outlined text-orange-500">undo</span>
            Saisir un Retour
          </h4>
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Vendeur</label>
              <select id="retour-vendeur" class="input-underline">
                ${s.vendeurs.map(v=>`<option value="${v.id}">${v.nom}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Produit</label>
              <select id="retour-produit" class="input-underline">
                ${s.produits.map(p=>`<option value="${p.id}">${p.nom}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Quantité</label>
              <input id="retour-qty" type="number" min="1" placeholder="0" class="input-underline" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Motif <span class="text-red-500">*</span></label>
              <select id="retour-motif" class="input-underline">
                <option>Invendu</option>
                <option>Casse</option>
                <option>Péremption</option>
                <option>Refus client</option>
              </select>
            </div>
            ${!isCloture ? `<button onclick="stocks_addRetour()" class="btn-primary w-full mt-2 justify-center">
              <span class="material-symbols-outlined text-sm">add</span>Enregistrer le Retour
            </button>` : '<div class="text-center text-xs text-slate-400 italic py-2">Saisies bloquées — journée en clôture</div>'}
          </div>
        </div>

        <!-- Table -->
        <div class="col-span-12 lg:col-span-8 sigda-card overflow-hidden">
          <div class="sigda-card-header">
            <h4 class="font-bold text-[#002451]">Retours Enregistrés</h4>
            <span class="text-xs font-bold text-slate-400">${s.retours.length} retour(s)</span>
          </div>
          <div class="overflow-x-auto">
            <table class="dense-table zebra-table">
              <thead><tr>
                <th>Date/Heure</th><th>Vendeur</th><th>Produit</th>
                <th>Quantité</th><th>Motif</th>
              </tr></thead>
              <tbody>${rows.length ? rows : '<tr><td colspan="5" class="px-6 py-8 text-center text-slate-400">Aucun retour enregistré</td></tr>'}</tbody>
            </table>
          </div>
        </div>
      </div>`;
  }

  const tabs = [
    { key:'appro',   label:'Approvisionnement' },
    { key:'dotation',label:'Dotation Matinale'  },
    { key:'retours', label:'Retours & Démarque' },
  ];

  const tabBar = tabs.map(t => `
    <button onclick="stocks_switchTab('${t.key}')" class="tab-item ${activeTab===t.key?'active':''}" id="tab-${t.key}">
      ${t.label}
    </button>`).join('');

  const tabContent = activeTab==='dotation' ? renderDotation()
                   : activeTab==='appro'    ? renderAppro()
                   : renderRetours();

  return `
    <div class="page-canvas fade-in-up" style="padding:2rem">
      <div class="flex flex-col gap-6 mb-8">
        <div>
          <h2 class="text-3xl font-black tracking-tight text-[#002451]">Gestion des Stocks</h2>
          <p class="text-slate-500 font-medium">Cycle Circulaire · Distribution journalière et contrôle des flux</p>
        </div>
        <div class="tab-bar">${tabBar}</div>
      </div>
      <div id="stocks-content">${tabContent}</div>
    </div>`;
};

// ---- Init & interactions ----
window.stocks_switchTab = function(tab) {
  window.SIGDA_PAGES._stocksTab = tab;
  document.getElementById('stocks-content').innerHTML = '';
  // Re-render stocks with new tab
  const app = document.getElementById('sigda-app');
  const current = app ? app.innerHTML : '';
  // Quick re-render approach
  const s = window.SIGDA_STATE;
  const { fmtQty } = window.SIGDA_UTILS;

  // Update active tab button styles
  ['appro','dotation','retours'].forEach(t => {
    const btn = document.getElementById('tab-'+t);
    if (btn) { btn.className = 'tab-item' + (t===tab?' active':''); }
  });

  // Render new content
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = window.SIGDA_PAGES.stocks(tab);
  const newContent = tempDiv.querySelector('#stocks-content');
  if (newContent) document.getElementById('stocks-content').innerHTML = newContent.innerHTML;
};

window.stocks_updateDotation = function(produitId, vendeurId, value) {
  window.SIGDA.updateDotation(produitId, vendeurId, value);
  // Update reste depot in real time
  const s = window.SIGDA_STATE;
  const prod = s.produits.find(p=>p.id===produitId);
  if (!prod) return;
  const totalDote = Object.values(s.dotations[produitId]||{}).reduce((a,b)=>a+(parseInt(b)||0),0);
  const rest = prod.stockDepot - totalDote;
  // Find and update the "Reste Dépôt" cell for this row
  const table = document.getElementById('dotation-table');
  if (table) {
    const rows = table.querySelectorAll('tbody tr');
    const prodIdx = s.produits.findIndex(p=>p.id===produitId);
    if (rows[prodIdx]) {
      const lastCell = rows[prodIdx].querySelector('td:last-child span');
      if (lastCell) {
        lastCell.textContent = window.SIGDA_UTILS.fmtQty(rest);
        lastCell.className = `text-sm ${rest<0?'text-red-600 font-black':rest===0?'text-slate-400':'text-slate-700 font-black'}`;
      }
    }
  }
};

window.stocks_validerDotations = function() {
  window.SIGDA.save();
  window.SIGDA_UTILS.showToast('Dotations validées et enregistrées !', 'success');
  // Update checklist C01
  const c01 = window.SIGDA_STATE.checklist.find(c=>c.id==='C01');
  if (c01) { c01.statut = 'OK'; window.SIGDA.save(); }
};

window.stocks_addAppro = function() {
  const ref = document.getElementById('appro-ref')?.value?.trim();
  const produitId = document.getElementById('appro-produit')?.value;
  const qty = parseInt(document.getElementById('appro-qty')?.value);
  const fournisseur = document.getElementById('appro-fournisseur')?.value?.trim();
  if (!ref || !produitId || !qty || qty<1) {
    window.SIGDA_UTILS.showToast('Remplissez tous les champs obligatoires.', 'error'); return;
  }
  const prod = window.SIGDA_STATE.produits.find(p=>p.id===produitId);
  if (prod) { prod.stockDepot += qty; }
  const date = new Date().toISOString().replace('T',' ').substring(0,16);
  window.SIGDA_STATE.approvisionnements.push({ id:'A'+Date.now(), produitId, quantite:qty, fournisseur, date, reference:ref });
  window.SIGDA.save();
  window.SIGDA_UTILS.showToast(`Livraison de ${qty} unités enregistrée !`, 'success');
  window.stocks_switchTab('appro');
};

window.stocks_addRetour = function() {
  const vendeurId = document.getElementById('retour-vendeur')?.value;
  const produitId = document.getElementById('retour-produit')?.value;
  const qty = parseInt(document.getElementById('retour-qty')?.value);
  const motif = document.getElementById('retour-motif')?.value;
  if (!vendeurId || !produitId || !qty || qty<1) {
    window.SIGDA_UTILS.showToast('Remplissez tous les champs.', 'error'); return;
  }
  window.SIGDA.addRetour(vendeurId, produitId, qty, motif);
  window.SIGDA_UTILS.showToast('Retour enregistré.', 'success');
  window.stocks_switchTab('retours');
};
