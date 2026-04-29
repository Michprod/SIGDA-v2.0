import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const Audit = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.getAuditLogs().then(data => {
      setEntries(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{ padding: 20 }}>Chargement du journal d'audit...</div>;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
         <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1A3A6B', margin: 0 }}>Journal d'Audit & Sécurité</h1>
         <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0' }}>Traçabilité des actions critiques et déverrouillages</p>
      </div>

      {/* Info */}
      <div className="alert-strip alert-info" style={{ marginBottom: 16 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>info</span>
        Chaque déverrouillage Super Admin est tracé ici de manière <strong>indélébile</strong>. La justification est obligatoire avant toute action.
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <div className="card-head">
          <div className="card-title">Journal d'audit — Déverrouillages</div>
          <div className="card-sub">{entries.length} entrée(s)</div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Horodatage</th>
              <th>Site</th>
              <th>Administrateur</th>
              <th>Motif / Justification</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((a, i) => {
              const dateObj = new Date(a.created_at);
              const formattedDate = dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) + '\n' + dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
              const siteName = a.site?.nom || '—';
              const adminName = a.user?.name || 'Système';
              const initiales = adminName.substring(0, 2).toUpperCase();
              
              return (
                <tr key={a.id || i}>
                  <td style={{ whiteSpace: 'pre-line', fontSize: 11, color: '#6B7280' }}>{formattedDate}</td>
                  <td>
                    <span style={{ background: '#F3F4F6', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, color: '#374151' }}>
                      {siteName}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#EEF3FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#1A3A6B', flexShrink: 0 }}>
                        {initiales}
                      </div>
                      <span style={{ fontWeight: 500, fontSize: 13 }}>{adminName}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: '#374151', maxWidth: 320 }}>{a.description || a.action_motif}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, background: '#FEF3C7', border: '1px solid #FDE68A', fontSize: 12, color: '#92400E' }}>
        <strong>Règle :</strong> Seul le Super Admin peut déverrouiller une période CLÔTURÉE. Chaque opération incrémente le compteur <code>unlock_count</code> sur la période concernée.
      </div>
    </div>
  );
};

export default Audit;
