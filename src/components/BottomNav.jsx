import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAppState } from '../context/StateContext';
import { Icon } from './Common';

const NAV_ITEMS = [
  { path: '/dashboard', icon: 'dashboard',             label: 'Accueil'   },
  { path: '/stocks',    icon: 'inventory_2',            label: 'Stocks'    },
  { path: '/vendeurs',  icon: 'groups',                 label: 'Vendeurs'  },
  { path: '/caisse',    icon: 'account_balance_wallet', label: 'Caisse'    },
  { path: '/rapports',  icon: 'assessment',             label: 'Rapports'  },
];

const BottomNav = () => {
  const { state, dispatch, isClotureBloquee } = useAppState();
  const isCloture = state.periode.statut !== 'OUVERTE';
  const clotureBloquee = isClotureBloquee();

  const handleOpenWizard = () => {
    dispatch({ type: 'SET_STATUT_PERIODE', payload: 'EN_CLOTURE' });
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 shadow-lg lg:hidden safe-bottom">
      <div className="flex items-stretch h-16">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-0.5 text-[9px] font-bold uppercase tracking-widest transition-colors ${
                isActive
                  ? 'text-[#002451] bg-blue-50/50'
                  : 'text-slate-400 hover:text-slate-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon name={item.icon} className={`text-xl ${isActive ? 'text-[#002451]' : ''}`} fill={isActive} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}

        {/* Closure Button */}
        {!isCloture ? (
          <button
            onClick={handleOpenWizard}
            disabled={clotureBloquee}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[9px] font-bold uppercase tracking-widest transition-colors ${
              clotureBloquee
                ? 'text-slate-300 bg-slate-50'
                : 'text-[#C9A227] bg-amber-50/50 hover:bg-amber-50'
            }`}
          >
            <Icon name="lock_clock" className={`text-xl ${clotureBloquee ? 'text-slate-300' : 'text-[#C9A227]'}`} />
            <span>Clôture</span>
          </button>
        ) : (
          <NavLink
            to="/audit"
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-0.5 text-[9px] font-bold uppercase tracking-widest transition-colors ${
                isActive ? 'text-[#002451] bg-blue-50/50' : 'text-slate-400 hover:text-slate-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon name="rule" className={`text-xl ${isActive ? 'text-[#002451]' : ''}`} fill={isActive} />
                <span>Audit</span>
              </>
            )}
          </NavLink>
        )}
      </div>
    </nav>
  );
};

export default BottomNav;
