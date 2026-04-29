import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppState } from '../context/StateContext';

const BNAV = [
  { path: '/dashboard', icon: 'dashboard',              label: 'Accueil'  },
  { path: '/stocks',    icon: 'inventory_2',             label: 'Stocks'   },
  { path: '/vendeurs',  icon: 'groups',                  label: 'Vendeurs' },
  { path: '/caisse',    icon: 'account_balance_wallet',  label: 'Caisse'   },
  { path: '/historique',icon: 'history',                 label: 'Historique'},
];

const BottomNav = () => {
  const { state } = useAppState();
  const vendeursBloques = (state.vendeurs || []).filter(v => v.statut === 'EN_ATTENTE').length;

  return (
    <nav className="bottom-nav">
      {BNAV.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => `bnav-item${isActive ? ' active' : ''}`}
        >
          <span className="material-symbols-outlined nav-icon" style={{ position: 'relative' }}>
            {item.icon}
          </span>
          {item.path === '/vendeurs' && vendeursBloques > 0 && (
            <span style={{
              position: 'absolute',
              top: -2,
              right: -2,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#C0392B',
            }} />
          )}
          <span className="bnav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
