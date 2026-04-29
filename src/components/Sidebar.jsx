import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppState } from '../context/StateContext';

const NAV = [
  {
    section: 'Principal',
    items: [
      { path: '/dashboard', icon: 'dashboard',    label: 'Dashboard'       },
      { path: '/periode',   icon: 'calendar_today',label: 'Période en cours' },
    ]
  },
  {
    section: 'Opérations',
    items: [
      { path: '/stocks',   icon: 'inventory_2',           label: 'Stocks'   },
      { path: '/vendeurs', icon: 'groups',                 label: 'Vendeurs' },
      { path: '/caisse',   icon: 'account_balance_wallet', label: 'Caisse'   },
    ]
  },
  {
    section: 'Administration',
    items: [
      { path: '/historique', icon: 'history',  label: 'Historique'      },
      { path: '/sites',      icon: 'hub',      label: 'Tous les sites'  },
      { path: '/audit',      icon: 'security', label: 'Journal audit'   },
      { path: '/configuration', icon: 'settings', label: 'Configuration' },
    ]
  },
];

const Sidebar = () => {
  const { state, dispatch, isClotureBloquee } = useAppState();
  const bloquee = isClotureBloquee();
  const isCloture = state.periode?.statut !== 'OUVERTE';
  const vendeursBloques = (state.vendeurs || []).filter(v => v.statut === 'EN_ATTENTE').length;

  const site = state.periode?.site || '—';
  const admin = state.periode?.admin || 'Admin';
  const initials = admin.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-name">SIGDA</div>
        <div className="logo-sub">Gestion Distribution Ambulante</div>
      </div>

      {/* Site */}
      <div className="sidebar-site">
        <div className="site-label">Point de vente</div>
        <div className="site-name">{site}</div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV.map((group, gi) => (
          <div key={gi}>
            <div className="nav-section-label">{group.section}</div>
            {group.items.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <span className="material-symbols-outlined nav-icon">{item.icon}</span>
                {item.label}
                {item.path === '/vendeurs' && vendeursBloques > 0 && (
                  <span className="nav-badge">{vendeursBloques}</span>
                )}
              </NavLink>
            ))}
            {gi < NAV.length - 1 && <div className="nav-sep" />}
          </div>
        ))}

        {/* Clôture — nav item spécial */}
        {!isCloture && (
          <>
            <div className="nav-sep" />
            <button
              onClick={() => dispatch({ type: 'SET_STATUT_PERIODE', payload: 'EN_CLOTURE' })}
              disabled={bloquee}
              className="nav-item"
              style={{
                width: '100%',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                opacity: bloquee ? 0.4 : 1,
                cursor: bloquee ? 'not-allowed' : 'pointer',
                color: bloquee ? 'rgba(255,255,255,0.35)' : 'rgba(201,162,39,0.9)',
                borderLeft: '3px solid transparent',
              }}
            >
              <span className="material-symbols-outlined nav-icon">lock_clock</span>
              Clôture journalière
            </button>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="user-row">
          <div className="user-avatar">{initials}</div>
          <div>
            <div className="user-name">{admin}</div>
            <div className="user-role">Administrateur local</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
