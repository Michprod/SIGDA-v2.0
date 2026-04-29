import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '../services/api';
import { fmtUSD } from '../utils/formatters';

const ReportPrint = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.getPeriodeDetail(id)
      .then(res => {
        setData(res);
        setLoading(false);
        // Attendre que le rendu soit fini avant d'ouvrir la boîte de dialogue d'impression
        setTimeout(() => {
           window.print();
        }, 1000);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div style={{ padding: 40 }}>Génération du rapport PDF...</div>;
  if (!data) return <div style={{ padding: 40 }}>Période non trouvée.</div>;

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Inter, sans-serif', color: '#111', background: '#fff' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #1A3A6B', paddingBottom: '20px', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#1A3A6B', fontSize: '28px', fontWeight: 800 }}>SIGDA v2.0</h1>
          <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>Système Intégré de Gestion de Distribution</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 700, fontSize: '18px' }}>RAPPORT DE CLÔTURE</div>
          <div style={{ fontSize: '14px', color: '#666' }}>Réf: {data.id.substring(0, 8).toUpperCase()}</div>
        </div>
      </div>

      {/* Info Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '30px' }}>
        <div style={{ background: '#F9FAFB', padding: '20px', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '14px', color: '#1A3A6B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Détails Exploitation</h3>
          <table style={{ width: '100%', fontSize: '14px' }}>
            <tbody>
              <tr><td style={{ padding: '4px 0', color: '#666' }}>Date exploitation:</td><td style={{ fontWeight: 600 }}>{data.date_exploitation}</td></tr>
              <tr><td style={{ padding: '4px 0', color: '#666' }}>Site:</td><td style={{ fontWeight: 600 }}>{data.site?.nom}</td></tr>
              <tr><td style={{ padding: '4px 0', color: '#666' }}>Superviseur:</td><td style={{ fontWeight: 600 }}>{data.admin?.name}</td></tr>
            </tbody>
          </table>
        </div>
        <div style={{ background: '#F0F4F8', padding: '20px', borderRadius: '8px', border: '1px solid #D1D5DB' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '14px', color: '#1A3A6B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Résumé Financier</h3>
          <table style={{ width: '100%', fontSize: '14px' }}>
            <tbody>
              <tr><td style={{ padding: '4px 0', color: '#666' }}>Caisse de Clôture:</td><td style={{ fontWeight: 800, fontSize: '18px', color: '#1A3A6B' }}>{fmtUSD(data.solde_cloture_physique)}</td></tr>
              <tr><td style={{ padding: '4px 0', color: '#666' }}>Statut:</td><td><span style={{ fontWeight: 600, color: '#059669' }}>{data.statut}</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Sessions Vendeurs */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ marginBottom: '15px', color: '#1A3A6B', fontSize: '18px' }}>Détail par Vendeur</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#1A3A6B', color: '#fff' }}>
              <th style={{ textAlign: 'left', padding: '12px' }}>Vendeur</th>
              <th style={{ textAlign: 'right', padding: '12px' }}>Caisse Théorique</th>
              <th style={{ textAlign: 'right', padding: '12px' }}>Caisse Réelle</th>
              <th style={{ textAlign: 'right', padding: '12px' }}>Écart</th>
              <th style={{ textAlign: 'right', padding: '12px' }}>Rémunération</th>
            </tr>
          </thead>
          <tbody>
            {data.sessions_vendeurs?.map((s, idx) => (
              <tr key={s.id} style={{ borderBottom: '1px solid #E5E7EB', background: idx % 2 === 0 ? '#fff' : '#F9FAFB' }}>
                <td style={{ padding: '12px', fontWeight: 600 }}>{s.vendeur?.nom}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{fmtUSD(s.caisse_theorique)}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{fmtUSD(s.caisse_saisie_reelle)}</td>
                <td style={{ padding: '12px', textAlign: 'right', color: s.ecart < 0 ? '#DC2626' : '#059669', fontWeight: 700 }}>
                  {s.ecart > 0 ? '+' : ''}{fmtUSD(s.ecart)}
                </td>
                <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>{fmtUSD(s.remuneration_nette)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer / Signature */}
      <div style={{ marginTop: '60px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ borderBottom: '1px solid #000', marginBottom: '8px', height: '60px' }}></div>
          <div style={{ fontSize: '12px', color: '#666' }}>Signature Superviseur</div>
          <div style={{ fontWeight: 600 }}>{data.admin?.name}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ borderBottom: '1px solid #000', marginBottom: '8px', height: '60px' }}></div>
          <div style={{ fontSize: '12px', color: '#666' }}>Cachet Direction</div>
        </div>
      </div>

      <div style={{ marginTop: '40px', textAlign: 'center', fontSize: '10px', color: '#999', borderTop: '1px solid #EEE', paddingTop: '20px' }}>
        Généré le {new Date().toLocaleString('fr-FR')} • SIGDA v2.0 • Audit ID: {data.id}
      </div>

      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; }
          .no-print { display: none; }
        }
      `}</style>
    </div>
  );
};

export default ReportPrint;
