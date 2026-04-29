import React, { useState, useEffect } from 'react';
import { fmtUSD } from '../utils/formatters';
import { apiService } from '../services/api';

const STATUT_SITE = {
  CLOTUREE:   { cls: 'badge-closed',  label: '🔓 Clôturée'   },
  EN_CLOTURE: { cls: 'badge-closing', label: '⏳ En clôture'  },
  EN_RETARD:  { cls: 'badge-locked',  label: '⚠ En retard'   },
  OUVERTE:    { cls: 'badge-open',    label: '⬤ Ouverte'     },
};

const Sites = () => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.getSites().then(data => {
      setSites(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const totalCA = sites.reduce((s, x) => s + (x.periode_actuelle?.solde_cloture_physique || 0), 0);

  if (loading) return <div style={{ padding: 20 }}>Chargement des sites...</div>;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
         <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1A3A6B', margin: 0 }}>Réseau de Distribution</h1>
         <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0' }}>État consolidé de tous les points de vente actifs</p>
      </div>

      {/* KPIs réseau */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        <div className="kpi-card">
          <div className="kpi-label">Sites clôturés</div>
          <div className="kpi-value">{sites.filter(s => s.periode_actuelle?.statut === 'CLOTUREE').length} <span style={{ fontSize: 14, color: '#6B7280', fontWeight: 400 }}>/ {sites.length}</span></div>
          <div className="kpi-sub">Journée scellée</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">CA réseau consolidé</div>
          <div className="kpi-value">{fmtUSD(totalCA)}</div>
          <div className="kpi-sub up">Volume global (FC)</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Sites en retard</div>
          <div className="kpi-value" style={{ color: '#C0392B' }}>{sites.filter(s => s.periode_actuelle?.statut === 'EN_RETARD').length}</div>
          <div className="kpi-sub">Alerte supervision</div>
        </div>
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <div className="card-head"><div className="card-title">Vue réseau — tous les sites</div></div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Site</th>
              <th>Responsable</th>
              <th>Statut</th>
              <th style={{ textAlign: 'right' }}>Volume jour</th>
            </tr>
          </thead>
          <tbody>
            {sites.map(s => {
              const statut = s.periode_actuelle?.statut || 'OUVERTE';
              const ca = s.periode_actuelle?.solde_cloture_physique || 0;
              const b = STATUT_SITE[statut] || STATUT_SITE.OUVERTE;
              return (
                <tr key={s.id}>
                  <td><strong>{s.nom}</strong></td>
                  <td style={{ color: '#6B7280' }}>{s.responsable || '—'}</td>
                  <td><span className={`status-badge ${b.cls}`}>{b.label}</span></td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: ca > 0 ? '#1A3A6B' : '#9CA3AF' }}>
                    {ca > 0 ? fmtUSD(ca) : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Sites;
