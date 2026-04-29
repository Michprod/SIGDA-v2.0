import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const BADGE = {
  CLOTUREE:    { cls: 'badge-closed',  label: '🔓 Clôturée' },
  VERROUILLEE: { cls: 'badge-locked',  label: '🔒 Verrouillée' },
  OUVERTE:     { cls: 'badge-open',    label: '⬤ Ouverte' },
};

const Historique = () => {
  const [rapports, setRapports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.getPeriodes().then(data => {
      setRapports(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const handleDownload = async (periodeId, date) => {
    const loadId = toast.loading(`Génération du rapport (${date})...`);
    try {
      const blob = await apiService.exportPeriode(periodeId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Rapport_SIGDA_${date}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Rapport téléchargé !', { id: loadId });
    } catch (err) {
      toast.error('Erreur lors du téléchargement.', { id: loadId });
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Chargement de l'historique...</div>;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
         <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1A3A6B', margin: 0 }}>Historique des Périodes</h1>
         <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0' }}>Consultation des journées passées et rapports archivés</p>
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <div className="card-head">
          <div className="card-title">Flux d'exploitation</div>
          <div className="card-sub">{rapports.length} période(s) archivée(s)</div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date d'exploitation</th>
              <th>Statut</th>
              <th style={{ textAlign: 'right' }}>CA Réconcilié</th>
              <th>Signataire</th>
              <th style={{ textAlign: 'right' }}>Rapport PDF</th>
            </tr>
          </thead>
          <tbody>
            {rapports.map((r, i) => {
              const b = BADGE[r.statut] || BADGE.CLOTUREE;
              return (
                <tr key={r.id || i}>
                  <td style={{ fontWeight: 600 }}>{r.date_exploitation}</td>
                  <td><span className={`status-badge ${b.cls}`}>{b.label}</span></td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#1A3A6B' }}>
                    {r.solde_cloture_physique ? `${new Intl.NumberFormat('fr-FR').format(r.solde_cloture_physique)} FC` : '—'}
                  </td>
                  <td style={{ color: '#6B7280' }}>{r.admin?.name || '—'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => handleDownload(r.id, r.date_exploitation)}
                        style={{ fontSize: 11, color: '#2D6FAD', border: '1px solid #E5E7EB', padding: '4px 8px', borderRadius: 6, background: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 15 }}>download</span>
                        CSV
                      </button>
                      <button 
                        onClick={() => window.open(`/print/periode/${r.id}`, '_blank')}
                        style={{ fontSize: 11, color: '#DC2626', border: '1px solid #FCA5A5', padding: '4px 8px', borderRadius: 6, background: '#FEF2F2', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 15 }}>picture_as_pdf</span>
                        PDF
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, background: '#F9FAFB', border: '1px solid #E5E7EB', fontSize: 12, color: '#6B7280' }}>
        Les périodes <strong>VERROUILLÉES</strong> sont en lecture définitive. Aucune modification possible, même par le Super Admin. Accessibles uniquement pour export PDF et audit.
      </div>
    </div>
  );
};

export default Historique;
