import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppState } from '../context/StateContext';
import { Icon } from './Common';

const NAV_ITEMS = [
  { path: '/dashboard',  icon: 'dashboard',              label: 'Dashboard'  },
  { path: '/stocks',     icon: 'inventory_2',             label: 'Stocks'     },
  { path: '/vendeurs',   icon: 'groups',                  label: 'Vendeurs'   },
  { path: '/caisse',     icon: 'account_balance_wallet',  label: 'Caisse'     },
  { path: '/rapports',   icon: 'assessment',              label: 'Rapports'   },
  { path: '/network',    icon: 'hub',                     label: 'Réseau'     },
  { path: '/audit',      icon: 'rule',                    label: 'Audit'      },
];

const Sidebar = () => {
  const { state, dispatch, isClotureBloquee } = useAppState();
  const clotureBloquee = isClotureBloquee();
  const isCloture = state.periode.statut !== 'OUVERTE';

  const handleOpenWizard = () => {
    dispatch({
      type: 'SET_STATUT_PERIODE',
      payload: 'EN_CLOTURE'
    });
  };

  return (
    <div className="h-full flex flex-col p-4 gap-2">
      <div className="mb-6 px-2 flex items-center gap-3">
        <div className="h-10 w-10 bg-[#1A3A6B] rounded-xl flex items-center justify-center text-white">
          <Icon name="inventory" fill={true} />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tighter text-[#002451]">SIGDA v2.0</h1>
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Distribution Mgmt</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 text-sm font-medium select-none ${
                isActive 
                  ? 'bg-white text-[#002451] font-bold shadow-sm' 
                  : 'text-slate-500 hover:text-[#002451] hover:bg-slate-200/50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon name={item.icon} fill={isActive} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="pt-4 border-t border-slate-200 space-y-1">
        <NavLink
          to="/audit"
          className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-slate-500 hover:text-[#002451] hover:bg-slate-200/50 transition-colors text-sm"
        >
          <Icon name="settings" className="text-lg" />
          <span>Paramètres</span>
        </NavLink>
        
        {!isCloture && (
          <button
            onClick={handleOpenWizard}
            disabled={clotureBloquee}
            className={`w-full mt-2 py-3 px-4 bg-gradient-to-br from-[#1A3A6B] to-[#002451] text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2 ${
              clotureBloquee ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Icon name="lock_clock" className="text-sm" />
            Clôture Journalière
          </button>
        )}
      </div>

      <div className="mt-3 p-3 bg-slate-100/80 rounded-xl flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#1A3A6B] flex items-center justify-center text-white text-sm font-bold">
          {state.periode.admin.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-bold truncate text-slate-800">{state.periode.admin}</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-tight">{state.periode.adminRole}</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
