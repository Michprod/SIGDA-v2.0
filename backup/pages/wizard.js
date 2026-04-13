// ============================================================
// SIGDA v2.0 — Wizard de Clôture (5 étapes)
// ============================================================
window.SIGDA_PAGES = window.SIGDA_PAGES || {};

window.SIGDA_PAGES.wizard = function() {
  const s = window.SIGDA_STATE;
  const etape = s.wizard.etapeActuelle || 1;

  const steps = [
    { n:1, label:'Validation Stocks',   icon:'inventory_2'         },
    { n:2, label:'Validation Vendeurs', icon:'groups'              },
    { n:3, label:'Arrêté de Caisse',    icon:'account_balance_wallet'},
    { n:4, label:'Rapport Final',       icon:'assessment'          },
    { n:5, label:'Signature',           icon:'history_edu'         },
  ];

  const stepperItems = steps.map((st, i) => {
    const done    = st.n < etape;
    const active  = st.n === etape;
    const pending = st.n > etape;
    const nodeClass = done ? 'step-node done' : active ? 'step-node active' : 'step-node pending';
    const labelClass = done ? 'text-[#18619e]' : active ? 'text-[#002451] font-black' : 'text-slate-400';
    const icon = done ? 'check' : st.icon;
    const fill = done ? "style=\"font-variation-settings:'FILL' 1\"" : '';
    const connRight = i < steps.length-1 ? `<div class="step-connector ${done||active?'done':''}"></div>` : '';
    return `
      <div class="flex items-center flex-1 ${i===0?'':''}">
        <div class="flex flex-col items-center gap-2 flex-shrink-0">
          <div class="${nodeClass}">
            <span class="material-symbols-outlined text-lg" ${fill}>${icon}</span>
          </div>
          <span class="text-[10px] uppercase tracking-wider ${labelClass}" style="max-width:80px;text-align:center">${st.label}</span>
        </div>
        ${connRight}
      </div>`;
  }).join('');

  const content = {
    1: renderStep1(),
    2: renderStep2(),
    3: renderStep3(),
    4: renderStep4(),
    5: renderStep5(),
  }[etape] || renderStep1();

  const prevBtn = etape > 1
    ? `<button onclick="wizard_prev()" class="flex items-center gap-2 px-5 py-3 text-[#18619e] font-bold text-sm hover:bg-blue-50 rounded-xl transition-all">
         <span class="material-symbols-outlined text-base">arrow_back</span>Précédent
       </button>`
    : `<button onclick="wizard_close()" class="flex items-center gap-2 px-5 py-3 text-slate-500 font-semibold text-sm hover:bg-slate-100 rounded-xl transition-all">
         <span class="material-symbols-outlined text-base">close</span>Annuler
       </button>`;

  const nextBtn = etape < 5
    ? `<button onclick="wizard_next()" class="btn-primary flex items-center gap-2">
         Suivant <span class="material-symbols-outlined text-base">arrow_forward</span>
       </button>`
    : `<button onclick="wizard_sceller()" id="wizard-sceller-btn" class="btn-danger flex items-center gap-2">
         <span class="material-symbols-outlined text-base" style="font-variation-settings:'FILL' 1">history_edu</span>SCELLER LA JOURNÉE
       </button>`;

  return `
    <div class="focus-overlay" id="wizard-overlay-inner" style="display:flex;align-items:center;justify-content:center;padding:1.5rem">
      <div class="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col" style="max-height:90vh">

        <!-- Header -->
        <div class="px-8 py-5 flex items-center justify-between" style="background:#002451">
          <div class="flex items-center gap-4">
            <div class="p-2 bg-white/10 rounded-xl">
              <span class="material-symbols-outlined text-white text-xl">lock_clock</span>
            </div>
            <div>
              <h2 class="text-white font-bold text-lg">Processus de Clôture Journalière — ${window.SIGDA_STATE.periode.date}</h2>
              <p class="text-blue-300 text-xs font-bold uppercase tracking-widest">SIGDA v2.0 • Session Sécurisée</p>
            </div>
          </div>
          <button onclick="wizard_close()" class="text-white/60 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Stepper -->
        <div class="px-8 py-6 border-b border-slate-100 bg-slate-50">
          <div class="flex items-start gap-2 max-w-3xl mx-auto">${stepperItems}</div>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto px-8 py-8" id="wizard-content">
          ${content}
        </div>

        <!-- Footer -->
        <div class="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          ${prevBtn}
          <div class="flex items-center gap-4">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden md:block">Étape ${etape} sur 5</span>
            ${nextBtn}
          </div>
        </div>
      </div>

      <!-- Security badge -->
      <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full border border-white/20">
        <span class="material-symbols-outlined text-white text-sm" style="font-variation-settings:'FILL' 1">security</span>
        <span class="text-white text-[10px] font-bold uppercase tracking-widest">Session Sécurisée · Chiffrement 256-bit</span>
      </div>
    </div>`;
};

// ---- Step renderers ----
function renderStep1() {
  const s = window.SIGDA_STATE;
  const { fmtQty, fmtUSD } = window.SIGDA_UTILS;

  const rows = s.produits.map(p => {
    const totalDote = Object.values(s.dotations[p.id]||{}).reduce((a,b)=>a+(parseInt(b)||0),0);
    const totalRetours = s.retours.filter(r=>r.produitId===p.id).reduce((a,r)=>a+r.quantite,0);
    const soldEstime = totalDote - totalRetours;
    return `
      <tr>
        <td class="px-6 py-4">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[#1A3A6B] text-sm">${p.icon}</span>
            <span class="font-semibold">${p.nom}</span>
          </div>
        </td>
        <td class="px-6 py-4 text-center font-bold text-[#002451]">${fmtQty(p.stockDepot)}</td>
        <td class="px-6 py-4 text-center font-bold">${fmtQty(totalDote)}</td>
        <td class="px-6 py-4 text-center font-bold text-emerald-700">${fmtQty(totalRetours)}</td>
        <td class="px-6 py-4 text-center font-black text-[#002451]">${fmtQty(soldEstime)}</td>
        <td class="px-6 py-4 text-center">
          <span class="font-bold text-[#C9A227]">${fmtUSD(soldEstime * p.prixUnitaire)}</span>
        </td>
      </tr>`;
  }).join('');

  return `
    <div>
      <h3 class="text-xl font-black text-[#002451] mb-2">Validation du Bilan de Stock</h3>
      <p class="text-slate-500 text-sm mb-6">Vérifiez que les chiffres correspondent aux registres physiques.</p>
      <div class="sigda-card overflow-hidden">
        <table class="dense-table zebra-table">
          <thead><tr>
            <th>Produit</th>
            <th class="text-center">Stock Initial</th>
            <th class="text-center">Doté</th>
            <th class="text-center">Retours</th>
            <th class="text-center">Vendu Estimé</th>
            <th class="text-center">Valeur Théo.</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div class="mt-5 p-4 bg-blue-50 rounded-xl flex items-center gap-3">
        <span class="material-symbols-outlined text-blue-600">info</span>
        <p class="text-sm text-blue-700">Ce tableau est figé. Aucune modification n'est possible à ce stade.</p>
      </div>
    </div>`;
}

function renderStep2() {
  const s = window.SIGDA_STATE;
  const { fmtUSD, renderVendeurBadge, renderStatutBadge } = window.SIGDA_UTILS;
  const allReconcilies = s.vendeurs.every(v=>v.statut==='RECONCILIEE');

  const rows = s.vendeurs.map(v => {
    const isOk = v.statut === 'RECONCILIEE';
    const ecartClass = !isOk ? 'text-slate-300' : v.ecart < -0.01 ? 'text-red-600' : 'text-emerald-600';
    return `
      <tr>
        <td class="px-6 py-4">
          <div class="flex items-center gap-3">
            ${renderVendeurBadge(v)}
            <span class="font-semibold">${v.nom}</span>
          </div>
        </td>
        <td class="px-6 py-4 text-center font-bold text-[#002451]">${fmtUSD(v.caisseTheorique)}</td>
        <td class="px-6 py-4 text-center font-bold ${isOk?'text-emerald-700':'text-slate-300'}">${isOk?fmtUSD(v.caisseSaisie):'--'}</td>
        <td class="px-6 py-4 text-center font-bold ${ecartClass}">${isOk?(v.ecart>=0?'+':'')+fmtUSD(v.ecart):'--'}</td>
        <td class="px-6 py-4 text-center">${renderStatutBadge(v.statut)}</td>
      </tr>`;
  }).join('');

  return `
    <div>
      <h3 class="text-xl font-black text-[#002451] mb-2">Validation des Vendeurs</h3>
      <p class="text-slate-500 text-sm mb-6">Confirmez que tous les vendeurs sont au statut RÉCONCILIÉE.</p>
      ${!allReconcilies ? `
        <div class="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
          <span class="material-symbols-outlined text-amber-600" style="font-variation-settings:'FILL' 1">warning</span>
          <p class="text-sm text-amber-800 font-semibold">
            ${s.vendeurs.filter(v=>v.statut==='EN_ATTENTE').length} vendeur(s) non réconcilié(s).
            <button onclick="wizard_close();SIGDA_APP.navigateTo('#vendeurs')" class="underline ml-1">Retour vers Vendeurs</button>
          </p>
        </div>` : `
        <div class="mb-5 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
          <span class="material-symbols-outlined text-emerald-600" style="font-variation-settings:'FILL' 1">check_circle</span>
          <p class="text-sm text-emerald-800 font-semibold">Tous les vendeurs sont réconciliés. ✓</p>
        </div>`}
      <div class="sigda-card overflow-hidden">
        <table class="dense-table zebra-table">
          <thead><tr>
            <th>Vendeur</th>
            <th class="text-center">Théorique</th>
            <th class="text-center">Réel</th>
            <th class="text-center">Écart</th>
            <th class="text-center">Statut</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
}

function renderStep3() {
  const s = window.SIGDA_STATE;
  const { fmtUSD } = window.SIGDA_UTILS;
  const soldeTheorique = window.SIGDA.getSoldeActuelCaisse();
  const soldeSaisi = s.wizard.soldeFisique;
  const ecart = soldeSaisi !== null ? soldeSaisi - soldeTheorique : 0;
  const ecartColor = soldeSaisi===null ? 'text-slate-300' : Math.abs(ecart)<0.01 ? 'text-[#C9A227]' : ecart>0?'text-emerald-600':'text-red-600';

  return `
    <div>
      <h3 class="text-xl font-black text-[#002451] mb-2">Arrêté de Caisse</h3>
      <p class="text-slate-500 text-sm mb-6">Entrez le solde physique compté manuellement en coffre.</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Left -->
        <div class="space-y-5">
          <div class="p-5 bg-slate-50 rounded-xl">
            <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Solde Théorique Calculé</label>
            <p class="text-3xl font-black text-[#002451]">${fmtUSD(soldeTheorique)}</p>
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-bold text-slate-700" for="solde-physique">Solde Physique (Compté)</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input id="solde-physique" type="number" step="0.01" min="0"
                value="${soldeSaisi !== null ? soldeSaisi : soldeTheorique}"
                oninput="wizard_updateEcart(${soldeTheorique})"
                class="input-underline pl-7 text-xl font-black text-[#002451]" />
            </div>
            <p class="text-[10px] text-slate-400 italic">Montant total compté physiquement en coffre.</p>
          </div>
        </div>

        <!-- Right: Écart monolith -->
        <div class="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-6 min-h-[200px] relative overflow-hidden" id="ecart-monolith" style="background:linear-gradient(135deg,#fffbf0,#fff)">
          <label class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Calcul de l'Écart</label>
          <div id="wizard-ecart-value" class="text-6xl font-black ${ecartColor} tracking-tighter">${soldeSaisi!==null?((ecart>=0?'+':'')+fmtUSD(ecart)):'--'}</div>
          <div id="wizard-ecart-badge" class="mt-4 px-5 py-1.5 rounded-full text-xs font-bold border ${Math.abs(ecart)<0.01?'bg-[#ffe08e]/20 text-[#755b00] border-[#C9A227]/30':'bg-red-50 text-red-700 border-red-200'}">
            ${Math.abs(ecart)<0.01?'⚖ ÉQUILIBRE PARFAIT':'⚠ ÉCART DÉTECTÉ'}
          </div>
        </div>
      </div>

      <!-- Justification -->
      <div class="mt-6 p-5 rounded-xl border border-slate-200 bg-white" id="justif-section">
        <div class="flex items-center justify-between mb-3">
          <label class="flex items-center gap-2 text-sm font-bold text-slate-700">
            <span class="material-symbols-outlined text-slate-400">description</span>
            Justification de l'écart
          </label>
          <span id="justif-badge" class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500 uppercase">
            ${Math.abs(ecart)<0.01 ? 'Optionnel' : 'Obligatoire'}
          </span>
        </div>
        <textarea id="justif-ecart" rows="3"
          class="input-underline resize-none text-sm"
          placeholder="Si un écart est constaté, merci de détailler les raisons (erreur de saisie, perte, etc.)..."
        >${s.wizard.justificationEcart||''}</textarea>
      </div>
    </div>`;
}

function renderStep4() {
  const s = window.SIGDA_STATE;
  const { fmtUSD, fmtQty } = window.SIGDA_UTILS;
  const CA = window.SIGDA.getCAJour();
  const solde = window.SIGDA.getSoldeActuelCaisse();
  const reconcilies = window.SIGDA.getVendeursReconcilies();

  return `
    <div>
      <h3 class="text-xl font-black text-[#002451] mb-2">Rapport Final de Clôture</h3>
      <p class="text-slate-500 text-sm mb-6">Résumé de la journée du ${s.periode.date} — ${s.periode.site}</p>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="p-4 rounded-xl bg-[#EEF3FB] text-center">
          <p class="text-[10px] font-bold text-slate-500 uppercase mb-1">CA Journée</p>
          <p class="text-xl font-black text-[#002451]">${fmtUSD(CA)}</p>
        </div>
        <div class="p-4 rounded-xl bg-emerald-50 text-center">
          <p class="text-[10px] font-bold text-slate-500 uppercase mb-1">Vendeurs Réconciliés</p>
          <p class="text-xl font-black text-emerald-700">${reconcilies}/${s.vendeurs.length}</p>
        </div>
        <div class="p-4 rounded-xl bg-blue-50 text-center">
          <p class="text-[10px] font-bold text-slate-500 uppercase mb-1">Solde Caisse</p>
          <p class="text-xl font-black text-[#002451]">${fmtUSD(solde)}</p>
        </div>
        <div class="p-4 rounded-xl bg-amber-50 text-center">
          <p class="text-[10px] font-bold text-slate-500 uppercase mb-1">Retours Enregistrés</p>
          <p class="text-xl font-black text-[#755b00]">${s.retours.length}</p>
        </div>
      </div>

      <div class="sigda-card p-5">
        <div class="flex items-center gap-3 mb-4">
          <span class="material-symbols-outlined text-[#C9A227]" style="font-variation-settings:'FILL' 1">description</span>
          <h4 class="font-bold text-[#002451]">Rapport de Clôture — Référence: RPT-${new Date().toISOString().slice(0,10).replace(/-/g,'')}</h4>
        </div>
        <div class="space-y-2 text-sm text-slate-600">
          <div class="flex justify-between py-2 border-b border-slate-100">
            <span class="font-semibold">Site</span><span>${s.periode.site}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-slate-100">
            <span class="font-semibold">Date Comptable</span><span>${s.periode.date}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-slate-100">
            <span class="font-semibold">Administrateur</span><span>${s.periode.admin}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-slate-100">
            <span class="font-semibold">Chiffre d'Affaires</span><span class="font-black text-[#002451]">${fmtUSD(CA)}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-slate-100">
            <span class="font-semibold">Solde Final de Caisse</span><span class="font-black text-[#002451]">${fmtUSD(solde)}</span>
          </div>
          <div class="flex justify-between py-2">
            <span class="font-semibold">Écart de Caisse</span><span class="font-black text-emerald-600">$0.00</span>
          </div>
        </div>
        <button onclick="rapports_simulerPDF()" class="btn-secondary mt-4 text-xs w-full justify-center">
          <span class="material-symbols-outlined text-sm">picture_as_pdf</span>
          Prévisualiser le PDF
        </button>
      </div>
    </div>`;
}

function renderStep5() {
  const s = window.SIGDA_STATE;
  return `
    <div class="text-center space-y-6 max-w-md mx-auto">
      <div class="p-6 rounded-full bg-[#C9A227]/10 border-4 border-[#C9A227]/20 inline-flex">
        <span class="material-symbols-outlined text-6xl text-[#C9A227]" style="font-variation-settings:'FILL' 1">lock</span>
      </div>
      <div>
        <h3 class="text-2xl font-extrabold text-[#002451] mb-2">Signature & Scellement</h3>
        <p class="text-slate-500 text-sm">
          Vous allez sceller la journée comptable du <strong class="text-[#002451]">${s.periode.date}</strong>.<br>
          Cette action est <strong class="text-red-600">irréversible</strong>.
        </p>
      </div>
      <div class="p-5 bg-red-50 border-l-4 border-red-500 rounded-xl text-left">
        <div class="flex items-start gap-3">
          <span class="material-symbols-outlined text-red-600 mt-0.5" style="font-variation-settings:'FILL' 1">warning</span>
          <p class="text-sm text-red-800">
            <strong>Avertissement :</strong> Toutes les écritures seront verrouillées. Aucune modification ne sera possible sans audit système.
          </p>
        </div>
      </div>
      <div class="space-y-4 text-left">
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Administrateur</label>
          <input type="text" readonly value="${s.periode.admin}"
            class="input-underline cursor-not-allowed opacity-70" />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Mot de passe de scellement</label>
          <div class="relative">
            <input id="wizard-password" type="password" placeholder="••••••••"
              class="input-underline pr-12"
              onkeydown="if(event.key==='Enter')wizard_sceller()" />
            <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">key</span>
          </div>
          <p class="text-[10px] text-slate-400 mt-1">Mot de passe démo : <strong>admin123</strong></p>
        </div>
      </div>
    </div>`;
}

// ---- Wizard navigation ----
window.wizard_next = function() {
  const s = window.SIGDA_STATE;
  const etape = s.wizard.etapeActuelle;

  // Validation avant passage
  if (etape === 3) {
    const soldeSaisi = parseFloat(document.getElementById('solde-physique')?.value);
    if (isNaN(soldeSaisi)) {
      window.SIGDA_UTILS.showToast('Entrez le solde physique avant de continuer.', 'error'); return;
    }
    s.wizard.soldeFisique = soldeSaisi;
    s.wizard.justificationEcart = document.getElementById('justif-ecart')?.value || '';
    window.SIGDA.save();
  }

  if (etape === 2) {
    const nonReconcilies = s.vendeurs.filter(v=>v.statut==='EN_ATTENTE');
    if (nonReconcilies.length > 0) {
      if (!confirm(`${nonReconcilies.length} vendeur(s) non réconcilié(s). Continuer quand même ?`)) return;
    }
  }

  if (etape < 5) {
    s.wizard.etapeActuelle = etape + 1;
    if (!s.wizard.etapesValidees.includes(etape)) s.wizard.etapesValidees.push(etape);
    window.SIGDA.save();
    reRenderWizard();
  }
};

window.wizard_prev = function() {
  const s = window.SIGDA_STATE;
  if (s.wizard.etapeActuelle > 1) {
    s.wizard.etapeActuelle--;
    window.SIGDA.save();
    reRenderWizard();
  }
};

window.wizard_close = function() {
  const overlay = document.getElementById('wizard-overlay');
  if (overlay) overlay.remove();
  // Revert to OUVERTE if not yet sealed
  if (window.SIGDA_STATE.periode.statut === 'EN_CLOTURE') {
    window.SIGDA.setStatutPeriode('OUVERTE');
    window.SIGDA_STATE.wizard.etapeActuelle = 1;
    window.SIGDA.save();
  }
  const hash = window.location.hash || '#dashboard';
  SIGDA_APP.navigateTo(hash);
};

window.wizard_sceller = function() {
  const password = document.getElementById('wizard-password')?.value;
  if (!password) {
    window.SIGDA_UTILS.showToast('Entrez le mot de passe de scellement.', 'error'); return;
  }
  if (password !== 'admin123') {
    window.SIGDA_UTILS.showToast('Mot de passe incorrect.', 'error');
    document.getElementById('wizard-password').style.borderBottomColor = '#e53e3e';
    return;
  }
  const soldePhys = window.SIGDA_STATE.wizard.soldeFisique ?? window.SIGDA.getSoldeActuelCaisse();
  const justif = window.SIGDA_STATE.wizard.justificationEcart || '';
  window.SIGDA.signerCloture(soldePhys, justif);

  const overlay = document.getElementById('wizard-overlay');
  if (overlay) overlay.remove();
  window.SIGDA_UTILS.showToast('Journée scellée avec succès ! Statut : CLÔTURÉE.', 'success');
  SIGDA_APP.navigateTo('#dashboard');
};

window.wizard_updateEcart = function(theorique) {
  const soldeSaisi = parseFloat(document.getElementById('solde-physique')?.value);
  if (isNaN(soldeSaisi)) return;
  const ecart = soldeSaisi - theorique;
  const { fmtUSD } = window.SIGDA_UTILS;
  const ecartEl = document.getElementById('wizard-ecart-value');
  const badgeEl = document.getElementById('wizard-ecart-badge');
  if (!ecartEl) return;
  const sign = ecart >= 0 ? '+' : '';
  ecartEl.textContent = sign + fmtUSD(ecart);
  ecartEl.className = `text-6xl font-black tracking-tighter ${Math.abs(ecart)<0.01?'text-[#C9A227]':ecart>0?'text-emerald-600':'text-red-600'}`;
  if (badgeEl) {
    const isOk = Math.abs(ecart)<0.01;
    badgeEl.textContent = isOk ? '⚖ ÉQUILIBRE PARFAIT' : '⚠ ÉCART DÉTECTÉ';
    badgeEl.className = `mt-4 px-5 py-1.5 rounded-full text-xs font-bold border ${isOk?'bg-[#ffe08e]/20 text-[#755b00] border-[#C9A227]/30':'bg-red-50 text-red-700 border-red-200'}`;
  }
  const justifBadge = document.getElementById('justif-badge');
  if (justifBadge) justifBadge.textContent = Math.abs(ecart)<0.01 ? 'Optionnel' : 'Obligatoire';
};

function reRenderWizard() {
  const overlay = document.getElementById('wizard-overlay');
  if (overlay) {
    overlay.innerHTML = window.SIGDA_PAGES.wizard();
  }
}

window.init_wizard = function() {
  // Auto-focus password on step 5
  setTimeout(() => {
    const pw = document.getElementById('wizard-password');
    if (pw) pw.focus();
  }, 100);
};

window.rapports_simulerPDF = function() {
  window.SIGDA_UTILS.showToast('Génération du PDF... (simulation)', 'info');
};
