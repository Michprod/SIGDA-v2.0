;(function() {
// ============================================================
// SIGDA v2.0 — SPA Router + Shared Layout Components
// ============================================================

var PAGES = {
  '#dashboard': function() { return window.SIGDA_PAGES.dashboard(); },
  '#stocks':    function() { return window.SIGDA_PAGES.stocks(); },
  '#vendeurs':  function() { return window.SIGDA_PAGES.vendeurs(); },
  '#caisse':    function() { return window.SIGDA_PAGES.caisse(); },
  '#rapports':  function() { return window.SIGDA_PAGES.rapports(); },
  '#network':   function() { return window.SIGDA_PAGES.network(); },
  '#audit':     function() { return window.SIGDA_PAGES.audit(); },
};

var NAV_ITEMS = [
  { hash: '#dashboard', icon: 'dashboard',              label: 'Dashboard'  },
  { hash: '#stocks',    icon: 'inventory_2',             label: 'Stocks'     },
  { hash: '#vendeurs',  icon: 'groups',                  label: 'Vendeurs'   },
  { hash: '#caisse',    icon: 'account_balance_wallet',  label: 'Caisse'     },
  { hash: '#rapports',  icon: 'assessment',              label: 'Rapports'   },
  { hash: '#network',   icon: 'hub',                     label: 'Réseau'     },
  { hash: '#audit',     icon: 'rule',                    label: 'Audit'      },
];

// ---- Sidebar ----
function renderSidebar(activeHash) {
  var s = window.SIGDA_STATE;
  var clotureBloquee = window.SIGDA.isClotureBloquee();
  var isCloture = s.periode.statut !== 'OUVERTE';

  var navItems = NAV_ITEMS.map(function(item) {
    var isActive = activeHash === item.hash;
    var baseClass = 'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 text-sm font-medium cursor-pointer select-none';
    var activeClass = 'bg-white text-[#002451] font-bold shadow-sm';
    var inactiveClass = 'text-slate-500 hover:text-[#002451] hover:bg-slate-200/50';
    var fill = isActive ? "style=\"font-variation-settings:'FILL' 1\"" : '';
    return '<a href="' + item.hash + '" class="' + baseClass + ' ' + (isActive ? activeClass : inactiveClass) + '">' +
      '<span class="material-symbols-outlined" ' + fill + '>' + item.icon + '</span>' +
      '<span>' + item.label + '</span>' +
      '</a>';
  }).join('');

  var clotureBtn = (!isCloture)
    ? '<button onclick="SIGDA_APP.openWizard()" class="w-full mt-2 py-3 px-4 bg-gradient-to-br from-[#1A3A6B] to-[#002451] text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2' + (clotureBloquee ? ' opacity-50 cursor-not-allowed' : '') + '">' +
        '<span class="material-symbols-outlined text-sm">lock_clock</span>Clôture Journalière</button>'
    : '';

  return '<aside class="h-screen w-64 fixed left-0 top-0 bg-slate-50 flex flex-col p-4 gap-2 z-50 border-r border-slate-100">' +
    '<div class="mb-6 px-2 flex items-center gap-3">' +
      '<div class="h-10 w-10 bg-[#1A3A6B] rounded-xl flex items-center justify-center text-white">' +
        '<span class="material-symbols-outlined" style="font-variation-settings:\'FILL\' 1">inventory</span>' +
      '</div>' +
      '<div>' +
        '<h1 class="text-xl font-black tracking-tighter text-[#002451]">SIGDA v2.0</h1>' +
        '<p class="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Distribution Mgmt</p>' +
      '</div>' +
    '</div>' +
    '<nav class="flex-1 space-y-1">' + navItems + '</nav>' +
    '<div class="pt-4 border-t border-slate-200 space-y-1">' +
      '<button onclick="SIGDA_APP.navigateTo(\'#audit\')" class="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-slate-500 hover:text-[#002451] hover:bg-slate-200/50 transition-colors text-sm">' +
        '<span class="material-symbols-outlined text-lg">settings</span><span>Paramètres</span>' +
      '</button>' +
      clotureBtn +
    '</div>' +
    '<div class="mt-3 p-3 bg-slate-100/80 rounded-xl flex items-center gap-3">' +
      '<div class="w-10 h-10 rounded-full bg-[#1A3A6B] flex items-center justify-center text-white text-sm font-bold">JB</div>' +
      '<div class="overflow-hidden">' +
        '<p class="text-sm font-bold truncate text-slate-800">' + s.periode.admin + '</p>' +
        '<p class="text-[10px] text-slate-500 uppercase tracking-tight">' + s.periode.adminRole + '</p>' +
      '</div>' +
    '</div>' +
    '</aside>';
}

// ---- TopBar ----
function renderTopBar() {
  var s = window.SIGDA_STATE;
  var isLocked = s.periode.statut === 'CLOTUREE' || s.periode.statut === 'VERROUILLEE';
  var badge = window.SIGDA_UTILS.renderStatutBadge(s.periode.statut);
  var dlBtn = isLocked
    ? '<button onclick="SIGDA_APP.navigateTo(\'#rapports\')" class="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow hover:bg-emerald-700 transition-colors"><span class="material-symbols-outlined text-sm">download</span> Télécharger PDF</button>'
    : '';
  return '<header class="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 z-40 shadow-sm">' +
    '<div class="flex items-center gap-6">' +
      '<div class="flex items-center gap-2 text-slate-600">' +
        '<span class="material-symbols-outlined text-[#1A3A6B] text-xl">calendar_month</span>' +
        '<span class="font-semibold text-sm text-slate-700">' + s.periode.date + '</span>' +
      '</div>' +
      badge +
      '<div class="h-5 w-px bg-slate-200"></div>' +
      '<div class="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-sm text-slate-600">' +
        '<span class="material-symbols-outlined text-sm">location_on</span>' +
        '<span class="font-semibold text-xs">' + s.periode.site + '</span>' +
      '</div>' +
    '</div>' +
    '<div class="flex items-center gap-3">' +
      dlBtn +
      '<button onclick="SIGDA_APP.showResetConfirm()" class="relative p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-all" title="Réinitialiser la démo">' +
        '<span class="material-symbols-outlined text-sm">restart_alt</span>' +
      '</button>' +
      '<button class="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-all">' +
        '<span class="material-symbols-outlined">notifications</span>' +
        '<span class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>' +
      '</button>' +
      '<div class="flex items-center gap-2 pl-3 border-l border-slate-200">' +
        '<div class="w-9 h-9 rounded-full bg-[#1A3A6B] flex items-center justify-center text-white text-sm font-bold">JB</div>' +
      '</div>' +
    '</div>' +
    '</header>';
}

// ---- Layout wrapper ----
function renderLayout(activeHash, pageContent) {
  return renderSidebar(activeHash) + renderTopBar() +
    '<main class="ml-64 mt-16 min-h-screen bg-[#F3F4F6]">' + pageContent + '</main>';
}

// ---- Router ----
function navigate(hash) {
  if (!PAGES[hash]) hash = '#dashboard';
  if (hash === '#wizard') { openWizardOverlay(); return; }
  window.location.hash = hash;
  renderPage(hash);
}

function renderPage(hash) {
  var app = document.getElementById('sigda-app');
  if (!app) { console.warn('SIGDA: #sigda-app not found'); return; }
  if (!PAGES[hash]) hash = '#dashboard';
  try {
    var content = PAGES[hash]();
    app.innerHTML = renderLayout(hash, content);
    var initFn = window['init_' + hash.replace('#', '')];
    if (typeof initFn === 'function') initFn();
  } catch(e) {
    console.error('SIGDA renderPage error on', hash, e);
    app.innerHTML = renderLayout(hash,
      '<div class="p-10 text-center">' +
        '<p class="font-bold text-red-600 text-lg mb-2">Erreur de rendu : ' + hash + '</p>' +
        '<pre class="text-xs text-left bg-red-50 p-4 rounded-xl overflow-auto max-h-40">' + e.message + '\n' + e.stack + '</pre>' +
      '</div>');
  }
}

function openWizardOverlay() {
  if (window.SIGDA.isClotureBloquee() && window.SIGDA_STATE.periode.statut === 'OUVERTE') {
    window.SIGDA_UTILS.showToast('La clôture est bloquée. Corrigez les points rouges.', 'error');
    return;
  }
  if (window.SIGDA_STATE.periode.statut === 'OUVERTE') {
    window.SIGDA.setStatutPeriode('EN_CLOTURE');
    window.SIGDA_STATE.wizard.etapeActuelle = 1;
    window.SIGDA_STATE.wizard.etapesValidees = [];
    window.SIGDA.save();
  }
  var existing = document.getElementById('wizard-overlay');
  if (existing) existing.remove();
  var overlay = document.createElement('div');
  overlay.id = 'wizard-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:5000;display:flex;align-items:center;justify-content:center;background:rgba(0,36,81,0.92);backdrop-filter:blur(8px);padding:1.5rem';
  overlay.innerHTML = window.SIGDA_PAGES.wizard();
  document.body.appendChild(overlay);
  var initFn = window['init_wizard'];
  if (typeof initFn === 'function') initFn();
  var currentHash = window.location.hash || '#dashboard';
  renderPage(currentHash);
}

function showResetConfirm() {
  window.SIGDA_UTILS.openModal(window.SIGDA_UTILS.renderModal(
    'reset-modal', 'Réinitialiser la démo', 'restart_alt',
    '<p class="text-slate-600 text-sm">Cette action réinitialisera toutes les données SIGDA à leur état initial.<br><strong class="text-red-600">Cela supprimera toutes les modifications.</strong></p>',
    '<button onclick="closeModal(\'reset-modal\')" class="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">Annuler</button>' +
    '<button onclick="window.SIGDA.reset();window.location.reload();" class="px-6 py-2.5 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700">Réinitialiser</button>'
  ));
}

// ---- Global exports (always set, never blocked) ----
window.SIGDA_PAGES = window.SIGDA_PAGES || {};
window.SIGDA_APP = {
  navigateTo: navigate,
  openWizard: openWizardOverlay,
  showResetConfirm: showResetConfirm,
};
window.closeModal = function(id) {
  var el = document.getElementById(id);
  if (el) el.remove();
};

// ---- Boot ----
document.addEventListener('DOMContentLoaded', function() {
  var hash = window.location.hash || '#dashboard';
  window.addEventListener('hashchange', function() {
    var h = window.location.hash || '#dashboard';
    if (!document.getElementById('wizard-overlay')) renderPage(h);
  });
  renderPage(hash);
});

console.log('SIGDA App.js loaded. SIGDA_APP assigned:', typeof window.SIGDA_APP);
})();
