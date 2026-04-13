import React from 'react';
import { getStatutConfig } from '../utils/formatters';

export const StatutBadge = ({ statut, className = "" }) => {
  const cfg = getStatutConfig(statut);
  const dotAnimation = cfg.pulse ? 'animate-pulse' : '';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text} border ${cfg.border} text-[10px] font-black uppercase tracking-widest ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${dotAnimation}`}></span>
      {cfg.label}
    </span>
  );
};

export const Icon = ({ name, className = "", fill = false }) => (
  <span 
    className={`material-symbols-outlined ${className}`} 
    style={{ fontVariationSettings: `'FILL' ${fill ? 1 : 0}` }}
  >
    {name}
  </span>
);

export const VendeurBadge = ({ initiales, colorClass, size = "md" }) => {
  const colorMap = {
    blue:    { bg: 'bg-blue-100',    text: 'text-blue-700'    },
    amber:   { bg: 'bg-amber-100',   text: 'text-amber-700'   },
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    slate:   { bg: 'bg-slate-200',   text: 'text-slate-700'   },
    purple:  { bg: 'bg-purple-100',  text: 'text-purple-700'  },
  };
  const c = colorMap[colorClass] || colorMap.slate;
  const sizeClasses = size === "sm" ? "w-6 h-6 text-[8px]" : "w-8 h-8 text-[10px]";
  
  return (
    <div className={`${sizeClasses} rounded-full ${c.bg} ${c.text} flex items-center justify-center font-bold`}>
      {initiales}
    </div>
  );
};

export const CircularGauge = ({ pct, size = 64, strokeWidth = 4, color = '#C9A227' }) => {
  const radius = (size / 2) - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={cx} cy={cy} r={radius} fill="transparent" stroke="#e2e8f0" strokeWidth={strokeWidth}/>
        <circle cx={cx} cy={cy} r={radius} fill="transparent" stroke={color}
          strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference.toFixed(1)}
          strokeDashoffset={offset.toFixed(1)}/>
      </svg>
      <span className="absolute text-[10px] font-bold" style={{ color }}>{pct}%</span>
    </div>
  );
};

export const ChecklistIcon = ({ statut }) => {
  if (statut === 'OK') return <Icon name="check_circle" className="text-emerald-500" fill={true} />;
  if (statut === 'BLOQUANT') return <Icon name="cancel" className="text-red-500" fill={true} />;
  if (statut === 'AVERTISSEMENT') return <Icon name="warning" className="text-amber-500" fill={true} />;
  return null;
};
