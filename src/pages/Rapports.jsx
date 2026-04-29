import React from 'react';
import { useAppState } from '../context/StateContext';
import { fmtUSD } from '../utils/formatters';

const Rapports = () => {
  const { state } = useAppState();

  const typeConfig = {
    'CLOTURE':    { icon: 'lock_clock',    label: 'Clôture Journalière', color: '#1A3A6B' },
    'HEBDO':      { icon: 'date_range',    label: 'Rapport Hebdomadaire', color: '#7c6ef5' },
    'AUDIT':      { icon: 'rule',          label: "Rapport d'Audit",      color: '#C9A227' },
    'CONFORMITE': { icon: 'verified_user', label: 'Conformité',           color: '#2E7D52' },
  };

  const totalCloture = (state.rapports || []).filter(r => r.type === 'CLOTURE' && r.statut === 'SIGNE').length;
  const isCloturee   = state.periode?.statut === 'CLOTUREE';

  const kpis = [
    { label: 'Rapports Totaux',    value: (state.rapports || []).length,        sub: 'Générés à ce jour' },
    { label: 'Journées Clôturées', value: totalCloture,                 sub: 'Toutes scellées' },
    { label: 'CA Cumulé (30j)',    value: fmtUSD(totalCloture * 4170000),  sub: 'Volume total' },
    { label: 'Journée Actuelle',   value: state.periode?.statut || 'OUVERTE',   sub: isCloturee ? 'Scellée' : 'En cours' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
         <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1A3A6B', margin: 0 }}>Rapports & Archives</h1>
         <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0' }}>Documents certifiés de la gestion journalière</p>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        {kpis.map((k, i) => (
          <div key={i} className="kpi-card">
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value" style={{ fontSize: k.label.includes('Journée') ? 16 : 22 }}>{k.value}</div>
            <div className="kpi-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Report list */}
      <div className="card">
        <div className="card-head">
          <div className="card-title">Historique des Rapports</div>
          <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: 11 }}>
             <span className="material-symbols-outlined" style={{ fontSize: 14 }}>filter_list</span>
             Filtrer
          </button>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
            <table className="data-table">
                <thead>
                    <tr>
                        <th style={{ width: 50 }}></th>
                        <th>Titre du document</th>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Statut</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {(state.rapports || []).length === 0 ? (
                        <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>Aucun rapport archivé</td></tr>
                    ) : (state.rapports || []).map((r) => {
                        const tc = typeConfig[r.type] || typeConfig['CLOTURE'];
                        const isSigned = r.statut === 'SIGNE';
                        return (
                            <tr key={r.id}>
                                <td>
                                    <div style={{ 
                                        width: 32, height: 32, borderRadius: 8, background: '#F3F4F6',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: tc.color
                                    }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{tc.icon}</span>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ fontWeight: 600 }}>{r.titre}</div>
                                    <div style={{ fontSize: 10, color: '#9CA3AF' }}>ID: {r.id.slice(0, 8)}...</div>
                                </td>
                                <td>{r.date}</td>
                                <td>{tc.label}</td>
                                <td>
                                    <span style={{ 
                                        padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600,
                                        background: isSigned ? '#DCFCE7' : '#FEF3C7',
                                        color: isSigned ? '#166534' : '#92400E'
                                    }}>
                                        {isSigned ? 'SIGNÉ' : 'BROUILLON'}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                        <button className="icon-btn" title="Voir"><span className="material-symbols-outlined" style={{ fontSize: 16 }}>visibility</span></button>
                                        <button className="icon-btn" title="Télécharger"><span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span></button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
      </div>

      {/* Security Note */}
      <div style={{ 
        marginTop: 20, padding: 16, borderRadius: 12, background: '#fff', border: '1px solid #E5E7EB',
        display: 'flex', gap: 16, alignItems: 'center'
      }}>
          <div style={{ 
            width: 44, height: 44, borderRadius: '50%', background: '#F3F4F6', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1A3A6B'
          }}>
              <span className="material-symbols-outlined" style={{ fontSize: 24 }}>security</span>
          </div>
          <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Intégrité des Archives Garantie</div>
              <p style={{ fontSize: 12, color: '#6B7280', marginTop: 2, margin: 0 }}>
                  Tous les rapports signés sont horodatés et chiffrés. Toute modification ultérieure brisera la signature numérique du document.
              </p>
          </div>
      </div>
    </div>
  );
};

export default Rapports;
