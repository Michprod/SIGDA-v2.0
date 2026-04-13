export const fmt = (amount, decimals = 2) => {
  return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(amount);
};

export const fmtUSD = (amount, decimals = 2) => {
  return '$' + fmt(Math.abs(amount), decimals);
};

export const fmtUSDSigned = (amount) => {
  const sign = amount >= 0 ? '+' : '-';
  return sign + fmtUSD(amount);
};

export const fmtQty = (n) => {
  return new Intl.NumberFormat('fr-FR').format(n);
};

export const pct = (value, total) => {
  if (!total) return 0;
  return Math.min(100, Math.round((value / total) * 100));
};

export const getStatutConfig = (statut) => {
  const configs = {
    'OUVERTE':      { label: 'OUVERTE',      bg: 'bg-emerald-50',  text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', pulse: true  },
    'EN_CLOTURE':   { label: 'EN CLÔTURE',   bg: 'bg-orange-50',   text: 'text-orange-700',  border: 'border-orange-200',  dot: 'bg-orange-500',  pulse: false },
    'CLOTUREE':     { label: 'CLÔTURÉE',      bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300', dot: 'bg-emerald-600', pulse: false },
    'VERROUILLEE':  { label: 'VERROUILLÉE',   bg: 'bg-slate-100',   text: 'text-slate-600',   border: 'border-slate-300',   dot: 'bg-slate-500',   pulse: false },
    'RECONCILIEE':  { label: 'Réconcilié',    bg: 'bg-emerald-50',  text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', pulse: false },
    'EN_ATTENTE':   { label: 'En attente',    bg: 'bg-amber-50',    text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-500',   pulse: true  },
    'EN_RETARD':    { label: 'EN RETARD',     bg: 'bg-red-50',      text: 'text-red-700',     border: 'border-red-200',     dot: 'bg-red-500',     pulse: false },
    'VALIDE':       { label: 'Validé',        bg: 'bg-emerald-50',  text: 'text-emerald-700', border: 'border-emerald-100', dot: 'bg-emerald-500', pulse: false },
    'EN_COURS':     { label: 'En cours',      bg: 'bg-blue-50',     text: 'text-blue-700',    border: 'border-blue-100',    dot: 'bg-blue-500',    pulse: true  },
    'SIGNE':        { label: 'Signé',         bg: 'bg-emerald-50',  text: 'text-emerald-700', border: 'border-emerald-100', dot: 'bg-emerald-500', pulse: false },
    'TRACE':        { label: 'Tracé',         bg: 'bg-slate-50',    text: 'text-slate-700',   border: 'border-slate-100',   dot: 'bg-slate-400',   pulse: false },
  };
  return configs[statut] || configs['OUVERTE'];
};
