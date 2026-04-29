import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAppState } from '../context/StateContext';

const PAGE_TITLES = {
  '/dashboard':  'Dashboard',
  '/periode':    'Période en cours',
  '/stocks':     'Stocks',
  '/vendeurs':   'Vendeurs',
  '/caisse':     'Caisse',
  '/historique': 'Historique des périodes',
  '/sites':      'Tous les sites',
  '/audit':      'Journal d\'audit',
};

const STATUT_CONF = {
  OUVERTE:     { bg: '#DCFCE7', color: '#166534', label: '⬤ Journée OUVERTE' },
  EN_CLOTURE:  { bg: '#FEF3C7', color: '#92400E', label: '⏳ EN CLÔTURE'      },
  CLOTUREE:    { bg: '#DBEAFE', color: '#1E40AF', label: '🔓 CLÔTURÉE'         },
  VERROUILLEE: { bg: '#F3F4F6', color: '#374151', label: '🔒 VERROUILLÉE'      },
};

const TopBar = () => {
  const { state } = useAppState();
  const location  = useLocation();

  const title  = PAGE_TITLES[location.pathname] || 'SIGDA';
  const admin  = state.periode?.admin || 'Admin';
  const inits  = admin.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const sc     = STATUT_CONF[state.periode?.statut] || STATUT_CONF.OUVERTE;

  const dateLabel = state.periode?.date
    ? new Date(state.periode.date + 'T00:00:00').toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      })
    : '—';

  return (
    <header style={{
      height: 52, background: '#fff', borderBottom: '1px solid #E5E7EB',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 20px', flexShrink: 0, gap: 12,
    }}>
      {/* Gauche */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Mobile : nom appli */}
        <span style={{ fontWeight: 800, fontSize: 15, color: '#1F2937', display: 'block' }}
          className="lg-hide-if-sidebar">
          SIGDA
        </span>

        {/* Desktop : titre + date + statut */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} className="topbar-desktop">
          <span style={{ fontSize: 15, fontWeight: 600, color: '#1F2937' }}>{title}</span>
          <span style={{ width: 1, height: 16, background: '#E5E7EB', display: 'inline-block' }} />
          <span style={{ fontSize: 12, color: '#6B7280' }}>{dateLabel}</span>
        </div>

        {/* Statut — toujours visible */}
        {state.periode && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', padding: '3px 10px',
            borderRadius: 20, fontSize: 11, fontWeight: 500,
            background: sc.bg, color: sc.color,
          }}>
            {sc.label}
          </span>
        )}
      </div>

      {/* Droite */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {/* Notifications */}
        <button style={{
          width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E7EB',
          background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#6B7280',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 17 }}>notifications</span>
        </button>

        {/* Aide */}
        <button style={{
          width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E7EB',
          background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#6B7280',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 17 }}>help_outline</span>
        </button>

        <div style={{ width: 1, height: 22, background: '#E5E7EB', margin: '0 4px' }} />

        {/* Logout */}
        <button 
          onClick={() => {
            localStorage.removeItem('sigda_token');
            window.location.href = '/login';
          }}
          style={{
            width: 32, height: 32, borderRadius: 8, border: '1px solid #FEE2E2',
            background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#C0392B',
          }}
          title="Déconnexion"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 17 }}>logout</span>
        </button>

        <div style={{
          width: 32, height: 32, borderRadius: '50%', background: '#1A3A6B',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0,
          cursor: 'default',
        }}
          title={admin}
        >
          {inits}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
