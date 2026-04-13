// ============================================================
// SIGDA v2.0 — Utility Functions
// ============================================================

function fmt(amount, decimals = 2) {
  return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(amount);
}

function fmtUSD(amount, decimals = 2) {
  return '$' + fmt(Math.abs(amount), decimals);
}

function fmtUSDSigned(amount) {
  const sign = amount >= 0 ? '+' : '-';
  return sign + fmtUSD(amount);
}

function fmtQty(n) {
  return new Intl.NumberFormat('fr-FR').format(n);
}

function pct(value, total) {
  if (!total) return 0;
  return Math.min(100, Math.round((value / total) * 100));
}

function getStatutConfig(statut) {
  const configs = {
    'OUVERTE':      { label: 'OUVERTE',      bg: 'bg-emerald-50',  text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', pulse: true  },
    'EN_CLOTURE':   { label: 'EN CLÔTURE',   bg: 'bg-orange-50',   text: 'text-orange-700',  border: 'border-orange-200',  dot: 'bg-orange-500',  pulse: false },
    'CLOTUREE':     { label: 'CLÔTURÉE',      bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300', dot: 'bg-emerald-600', pulse: false },
    'VERROUILLEE':  { label: 'VERROUILLÉE',   bg: 'bg-slate-100',   text: 'text-slate-600',   border: 'border-slate-300',   dot: 'bg-slate-500',   pulse: false },
    'RECONCILIEE':  { label: 'Réconcilié',    bg: 'bg-emerald-50',  text: 'text-emerald-700', border: '',                   dot: 'bg-emerald-500', pulse: false },
    'EN_ATTENTE':   { label: 'En attente',    bg: 'bg-amber-50',    text: 'text-amber-700',   border: '',                   dot: 'bg-amber-500',   pulse: true  },
    'EN_RETARD':    { label: 'EN RETARD',     bg: 'bg-red-50',      text: 'text-red-700',     border: 'border-red-200',     dot: 'bg-red-500',     pulse: false },
    'VALIDE':       { label: 'Validé',        bg: 'bg-emerald-50',  text: 'text-emerald-700', border: '',                   dot: 'bg-emerald-500', pulse: false },
    'EN_COURS':     { label: 'En cours',      bg: 'bg-blue-50',     text: 'text-blue-700',    border: '',                   dot: 'bg-blue-500',    pulse: true  },
    'SIGNE':        { label: 'Signé',         bg: 'bg-emerald-50',  text: 'text-emerald-700', border: '',                   dot: 'bg-emerald-500', pulse: false },
  };
  return configs[statut] || configs['OUVERTE'];
}

function renderStatutBadge(statut, size = 'sm') {
  const cfg = getStatutConfig(statut);
  const dotAnimation = cfg.pulse ? 'animate-pulse' : '';
  return `
    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text} border ${cfg.border} text-[10px] font-black uppercase tracking-widest">
      <span class="w-1.5 h-1.5 rounded-full ${cfg.dot} ${dotAnimation}"></span>
      ${cfg.label}
    </span>`;
}

function renderChecklistIcon(statut) {
  if (statut === 'OK') return `<span class="material-symbols-outlined text-emerald-500" style="font-variation-settings:'FILL' 1">check_circle</span>`;
  if (statut === 'BLOQUANT') return `<span class="material-symbols-outlined text-red-500" style="font-variation-settings:'FILL' 1">cancel</span>`;
  if (statut === 'AVERTISSEMENT') return `<span class="material-symbols-outlined text-amber-500" style="font-variation-settings:'FILL' 1">warning</span>`;
  return '';
}

function renderVendeurBadge(v) {
  const colorMap = {
    blue:    { bg: 'bg-blue-100',    text: 'text-blue-700'    },
    amber:   { bg: 'bg-amber-100',   text: 'text-amber-700'   },
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    slate:   { bg: 'bg-slate-200',   text: 'text-slate-700'   },
    purple:  { bg: 'bg-purple-100',  text: 'text-purple-700'  },
  };
  const c = colorMap[v.colorClass] || colorMap.slate;
  return `<div class="w-8 h-8 rounded-full ${c.bg} ${c.text} flex items-center justify-center text-[10px] font-bold">${v.initiales}</div>`;
}

// SVG Circular Gauge
function renderCircularGauge(pctValue, size = 64, strokeWidth = 4, color = '#C9A227') {
  const radius = (size / 2) - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pctValue / 100) * circumference;
  const cx = size / 2, cy = size / 2;
  return `
    <svg width="${size}" height="${size}" class="transform -rotate-90">
      <circle cx="${cx}" cy="${cy}" r="${radius}" fill="transparent" stroke="#e2e8f0" stroke-width="${strokeWidth}"/>
      <circle cx="${cx}" cy="${cy}" r="${radius}" fill="transparent" stroke="${color}"
        stroke-width="${strokeWidth}" stroke-linecap="round"
        stroke-dasharray="${circumference.toFixed(1)}"
        stroke-dashoffset="${offset.toFixed(1)}"/>
    </svg>
    <span class="absolute text-[10px] font-bold" style="color:${color}">${pctValue}%</span>`;
}

// Toast notification
function showToast(message, type = 'success') {
  const existing = document.getElementById('sigda-toast');
  if (existing) existing.remove();

  const colors = {
    success: 'bg-emerald-600',
    error:   'bg-red-600',
    info:    'bg-blue-600',
    warning: 'bg-amber-600',
  };
  const icons = { success: 'check_circle', error: 'error', info: 'info', warning: 'warning' };

  const toast = document.createElement('div');
  toast.id = 'sigda-toast';
  toast.className = `fixed top-20 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-xl text-white text-sm font-semibold shadow-2xl transition-all duration-300 translate-x-full ${colors[type] || colors.info}`;
  toast.innerHTML = `<span class="material-symbols-outlined text-lg" style="font-variation-settings:'FILL' 1">${icons[type]}</span>${message}`;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(0)';
    setTimeout(() => {
      toast.style.transform = 'translateX(calc(100% + 24px))';
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  });
}

function renderModal(id, title, icon, content, footerHTML = '') {
  return `
    <div id="${id}" class="fixed inset-0 z-[8000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onclick="if(event.target===this)closeModal('${id}')">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onclick="event.stopPropagation()">
        <div class="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary-fixed-dim flex items-center justify-center">
              <span class="material-symbols-outlined text-primary">${icon}</span>
            </div>
            <h3 class="font-bold text-primary text-lg">${title}</h3>
          </div>
          <button onclick="closeModal('${id}')" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
            <span class="material-symbols-outlined text-slate-400">close</span>
          </button>
        </div>
        <div class="px-6 py-5">${content}</div>
        ${footerHTML ? `<div class="px-6 py-4 bg-slate-50 rounded-b-2xl border-t border-slate-100 flex justify-end gap-3">${footerHTML}</div>` : ''}
      </div>
    </div>`;
}

function openModal(html) {
  const el = document.createElement('div');
  el.innerHTML = html;
  document.body.appendChild(el.firstElementChild);
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

// Export to global scope
window.SIGDA_UTILS = {
  fmt, fmtUSD, fmtUSDSigned, fmtQty, pct,
  getStatutConfig, renderStatutBadge, renderChecklistIcon,
  renderVendeurBadge, renderCircularGauge,
  showToast, renderModal, openModal, closeModal,
};
