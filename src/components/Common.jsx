import React from 'react';

/* ── Statut Badge ── */
export const StatutBadge = ({ statut, className = "" }) => {
  const conf = {
    OUVERTE:    { cls: 'badge-open',    label: '⬤ Journée OUVERTE' },
    EN_CLOTURE: { cls: 'badge-closing', label: '⏳ EN CLÔTURE' },
    CLOTUREE:   { cls: 'badge-closed',  label: '🔓 CLÔTURÉE' },
    VERROUILLEE:{ cls: 'badge-locked',  label: '🔒 VERROUILLÉE' },
  };
  const c = conf[statut] || conf['OUVERTE'];
  return (
    <span className={`status-badge ${c.cls} ${className}`}>
      {c.label}
    </span>
  );
};

/* ── Icon ── */
export const Icon = ({ name, className = "", fill = false, style }) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{ fontVariationSettings: `'FILL' ${fill ? 1 : 0}`, ...style }}
  >
    {name}
  </span>
);

/* ── Vendeur Badge ── */
export const VendeurBadge = ({ initiales, colorClass, size = "md" }) => {
  const colorMap = {
    blue:    { bg: 'rgba(79,142,247,0.18)',  text: '#4f8ef7'  },
    amber:   { bg: 'rgba(201,162,39,0.18)', text: '#C9A227'  },
    emerald: { bg: 'rgba(0,208,156,0.15)',  text: '#00d09c'  },
    slate:   { bg: 'rgba(126,132,163,0.2)', text: '#7e84a3'  },
    purple:  { bg: 'rgba(124,110,245,0.18)',text: '#7c6ef5'  },
  };
  const c = colorMap[colorClass] || colorMap.slate;
  const sizeClasses = size === "sm" ? "w-6 h-6 text-[8px]" : "w-8 h-8 text-[10px]";

  return (
    <div
      className={`${sizeClasses} rounded-full flex items-center justify-center font-bold`}
      style={{ background: c.bg, color: c.text }}
    >
      {initiales}
    </div>
  );
};

/* ── Circular Gauge ── */
export const CircularGauge = ({ pct, size = 64, strokeWidth = 4, color = '#00d09c' }) => {
  const radius = (size / 2) - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={cx} cy={cy} r={radius} fill="transparent" stroke="#2d3148" strokeWidth={strokeWidth}/>
        <circle cx={cx} cy={cy} r={radius} fill="transparent" stroke={color}
          strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference.toFixed(1)}
          strokeDashoffset={offset.toFixed(1)}/>
      </svg>
      <span className="absolute text-[10px] font-bold" style={{ color }}>{pct}%</span>
    </div>
  );
};

/* ── Checklist Icon ── */
export const ChecklistIcon = ({ statut }) => {
  if (statut === 'OK')           return <Icon name="check_circle" className="text-[#00d09c]" fill={true} />;
  if (statut === 'BLOQUANT')     return <Icon name="cancel"       className="text-[#f65160]" fill={true} />;
  if (statut === 'AVERTISSEMENT')return <Icon name="warning"      className="text-[#C9A227]" fill={true} />;
  return null;
};

/* ── Dark Card ── */
export const DasherCard = ({ children, className = "", style = {} }) => (
  <div
    className={`rounded-2xl ${className}`}
    style={{ background: '#252838', border: '1px solid #2d3148', boxShadow: '0 4px 24px rgba(0,0,0,0.35)', ...style }}
  >
    {children}
  </div>
);
