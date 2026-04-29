import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppState } from '../context/StateContext';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import WizardOverlay from './WizardOverlay';

const BNAV = [
  { path: '/dashboard',  icon: 'dashboard',             label: 'Accueil'   },
  { path: '/stocks',     icon: 'inventory_2',            label: 'Stocks'    },
  { path: '/vendeurs',   icon: 'groups',                 label: 'Vendeurs'  },
  { path: '/caisse',     icon: 'account_balance_wallet', label: 'Caisse'    },
  { path: '/historique', icon: 'history',                label: 'Historique'},
];

const Layout = ({ children }) => {
  const { state, dispatch } = useAppState();

  /* ── Écran de chargement initial ── */
  if (state.isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p style={{ fontSize: 13, color: '#6B7280' }}>Connexion au serveur SIGDA...</p>
      </div>
    );
  }

  const isWizardOpen = state.periode?.statut === 'EN_CLOTURE';
  const handleCloseWizard = () => dispatch({ type: 'SET_STATUT_PERIODE', payload: 'OUVERTE' });

  const vendeursBloques = (state.vendeurs || []).filter(v => v.statut === 'EN_ATTENTE').length;

  return (
    <div className="app-shell">
      {/* ── Sidebar desktop ── */}
      <Sidebar />

      {/* ── Colonne principale ── */}
      <div className="main-col">
        <TopBar />
        <main className="content-area">
          {children}
        </main>
      </div>

      {/* ── Bottom nav mobile ── */}
      <nav className="bottom-nav">
        {BNAV.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `bnav-item${isActive ? ' active' : ''}`}
          >
            <div style={{ position: 'relative', display: 'inline-flex' }}>
              <span className="material-symbols-outlined nav-icon">{item.icon}</span>
              {item.path === '/vendeurs' && vendeursBloques > 0 && (
                <span style={{
                  position: 'absolute', top: 0, right: -2,
                  width: 7, height: 7, borderRadius: '50%', background: '#C0392B',
                  border: '1px solid #fff',
                }} />
              )}
            </div>
            <span className="bnav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ── Wizard Clôture ── */}
      {isWizardOpen && <WizardOverlay onClose={handleCloseWizard} />}
    </div>
  );
};

export default Layout;
