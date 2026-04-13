import React from 'react';
import { Link } from 'react-router-dom';
import { useAppState } from '../context/StateContext';
import { Icon, StatutBadge } from './Common';

const TopBar = () => {
  const { state, dispatch } = useAppState();
  const isLocked = state.periode.statut === 'CLOTUREE' || state.periode.statut === 'VERROUILLEE';

  const handleReset = () => {
    if (window.confirm("Cette action réinitialisera toutes les données SIGDA. Continuer ?")) {
      dispatch({ type: 'RESET_STATE' });
      window.location.reload();
    }
  };

  return (
    <header className="w-full h-16 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 z-40 shadow-sm border-b border-slate-100 flex-shrink-0">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-slate-600">
          <Icon name="calendar_month" className="text-[#1A3A6B] text-xl" />
          <span className="font-semibold text-sm text-slate-700">{state.periode.date}</span>
        </div>
        <StatutBadge statut={state.periode.statut} />
        <div className="h-5 w-px bg-slate-200"></div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-sm text-slate-600">
          <Icon name="location_on" className="text-sm" />
          <span className="font-semibold text-xs">{state.periode.site}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isLocked && (
          <Link
            to="/rapports"
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow hover:bg-emerald-700 transition-colors"
          >
            <Icon name="download" className="text-sm" />
            <span>Télécharger PDF</span>
          </Link>
        )}
        
        <button
          onClick={handleReset}
          className="relative p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
          title="Réinitialiser la démo"
        >
          <Icon name="restart_alt" className="text-sm" />
        </button>

        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-all">
          <Icon name="notifications" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="w-9 h-9 rounded-full bg-[#1A3A6B] flex items-center justify-center text-white text-sm font-bold">
            {state.periode.admin.split(' ').map(n => n[0]).join('')}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
