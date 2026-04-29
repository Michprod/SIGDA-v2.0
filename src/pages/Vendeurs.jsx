import React, { useState } from 'react';
import { useAppState } from '../context/StateContext';
import { fmtUSD } from '../utils/formatters';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiService } from '../services/api';

const Vendeurs = () => {
  const { state, dispatch } = useAppState();
  const [selected, setSelected] = useState(null);
  const [viewDetails, setViewDetails] = useState(null);
  const [montant, setMontant] = useState(0);
  const [saving, setSaving] = useState(false);

  const vendeurs = state.vendeurs || [];
  const isCloture = ['CLOTUREE', 'VERROUILLEE', 'EN_CLOTURE'].includes(state.periode?.statut);

  const totalCA        = vendeurs.filter(v => v.statut === 'RECONCILIEE').reduce((s, v) => s + v.caisseSaisie, 0);
  const reconcilies    = vendeurs.filter(v => v.statut === 'RECONCILIEE').length;
  const enAttente      = vendeurs.filter(v => v.statut === 'EN_ATTENTE').length;
  const totalRemunet   = vendeurs.filter(v => v.statut === 'RECONCILIEE')
    .reduce((s, v) => s + Math.max(0, v.caisseSaisie * (v.commission || 0.05) - Math.abs(v.ecart || 0)), 0);

  const openModal = (v) => { setSelected(v); setMontant(v.caisseTheorique); };
  const confirm = async () => {
    if (isNaN(montant) || montant < 0) return;
    setSaving(true);
    const loadId = toast.loading(`Réconciliation en cours...`);
    try {
      await apiService.reconcilierSession(selected.sessionId, montant);
      dispatch({ type: 'RECONCILIER_VENDEUR', payload: { vendeurId: selected.id, caisseSaisie: montant } });
      setSelected(null);
      toast.success(`Session de ${selected.nom} réconciliée avec succès.`, { id: loadId });
    } catch (e) {
      toast.error(e.response?.data?.message || 'Erreur lors de la réconciliation.', { id: loadId });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* KPIs */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        <div className="kpi-card">
          <div className="kpi-label">CA réconcilié</div>
          <div className="kpi-value">{fmtUSD(totalCA)}</div>
          <div className="kpi-sub">Encaissements validés</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Réconciliés</div>
          <div className="kpi-value">{reconcilies} <span style={{ fontSize: 14, color: '#6B7280', fontWeight: 400 }}>/ {vendeurs.length}</span></div>
          <div className={`kpi-sub ${enAttente > 0 ? 'warn' : 'up'}`}>{enAttente > 0 ? `${enAttente} en attente` : 'Tous traités ✓'}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Rémunérations nettes</div>
          <div className="kpi-value">{fmtUSD(totalRemunet)}</div>
          <div className="kpi-sub">Net à distribuer</div>
        </div>
      </div>

      {/* Table sessions */}
      <div className="card" style={{ overflowX: 'auto' }}>
        <div className="card-head">
          <div className="card-title">Sessions vendeurs — {state.periode?.date || '—'}</div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Vendeur</th>
              <th style={{ textAlign: 'center' }}>Encais. Théorique</th>
              <th style={{ textAlign: 'center' }}>Encais. Réel</th>
              <th style={{ textAlign: 'center' }}>Écart</th>
              <th style={{ textAlign: 'center' }}>Statut</th>
              <th style={{ textAlign: 'center' }}>Rémunération</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendeurs.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: '#9CA3AF', padding: 24 }}>Aucune session</td></tr>
            ) : vendeurs.map(v => {
              const isRecon = v.statut === 'RECONCILIEE';
              const ecart = v.ecart || 0;
              const remunet = isRecon ? Math.max(0, v.caisseSaisie * (v.commission || 0.05) - Math.abs(ecart)) : null;
              return (
                <tr key={v.id}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{v.nom}</div>
                  </td>
                  <td style={{ textAlign: 'center', color: '#2D6FAD', fontWeight: 600 }}>{fmtUSD(v.caisseTheorique)}</td>
                  <td style={{ textAlign: 'center', fontWeight: 600, color: isRecon ? '#2E7D52' : '#9CA3AF' }}>
                    {isRecon ? fmtUSD(v.caisseSaisie) : '—'}
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 700, color: ecart < 0 ? '#C0392B' : ecart > 0 ? '#2E7D52' : '#6B7280' }}>
                    {isRecon ? `${ecart >= 0 ? '+' : ''}${fmtUSD(ecart)}` : '—'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`sess-badge ${isRecon ? 'sess-recon' : v.statut === 'PARTIELLE' ? 'sess-partial' : 'sess-wait'}`}>
                      {isRecon ? 'Réconcilié' : v.statut === 'PARTIELLE' ? 'Partielle' : 'En attente'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 700, color: '#1F2937' }}>
                    {isRecon ? fmtUSD(remunet) : '—'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                      <Link to={`/vendeurs/${v.id}/historique`} className="icon-btn" title="Historique">
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>history</span>
                      </Link>
                      <button onClick={() => setViewDetails(v)} className="icon-btn" title="Détails journée">
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>inventory</span>
                      </button>
                      {!isRecon && !isCloture && (
                        <button onClick={() => openModal(v)} className="btn btn-primary" style={{ padding: '5px 12px', fontSize: 11 }}>
                          Réconcilier
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Formule de rémunération */}
      <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 8, background: '#EEF3FB', borderLeft: '3px solid #1A3A6B', fontSize: 12, color: '#374151' }}>
        <strong>Formule :</strong> Rémunération nette = MAX(0, Σ(ventes × taux) − Σ(écarts défavorables))
        <span style={{ color: '#6B7280', marginLeft: 8 }}>— Ne peut jamais être négative.</span>
      </div>

      {/* Modal Réconciliation */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.4)' }}>
          <div style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#1F2937' }}>Réconciliation — {selected.nom}</div>
                <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>Saisir l'encaissement réel remis par le vendeur</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 20, lineHeight: 1 }}>×</button>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div style={{ padding: '12px', borderRadius: 8, background: '#EEF3FB', border: '1px solid #BFDBFE' }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#2D6FAD', textTransform: 'uppercase', marginBottom: 4 }}>Encaissement théorique</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#1F2937' }}>{fmtUSD(selected.caisseTheorique)}</div>
                </div>
                <div style={{ padding: '12px', borderRadius: 8, background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                  <label style={{ fontSize: 10, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Argent remis réel (FC)</label>
                  <input
                    type="number" value={montant} autoFocus
                    onChange={e => setMontant(parseFloat(e.target.value) || 0)}
                    style={{ width: '100%', fontSize: 20, fontWeight: 700, border: 'none', outline: 'none', background: 'transparent', color: '#1F2937', borderBottom: '2px solid #1A3A6B' }}
                  />
                </div>
              </div>
              {(() => {
                const diff = montant - selected.caisseTheorique;
                const neg = diff < -0.01;
                return (
                  <div style={{ padding: '12px', borderRadius: 8, textAlign: 'center', border: `2px dashed ${neg ? '#C0392B' : '#2E7D52'}`, background: neg ? '#FEE2E2' : '#DCFCE7' }}>
                    <div style={{ fontSize: 10, color: '#6B7280', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>Écart calculé</div>
                    <div style={{ fontSize: 26, fontWeight: 700, color: neg ? '#C0392B' : '#2E7D52' }}>{diff >= 0 ? '+' : ''}{fmtUSD(diff)}</div>
                  </div>
                );
              })()}
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setSelected(null)} disabled={saving} className="btn btn-outline">Annuler</button>
              <button onClick={confirm} disabled={saving} className="btn btn-success">
                {saving ? 'Validation...' : '✓ Valider la session'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Détails Journée */}
      {viewDetails && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.4)' }}>
          <div style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 520, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
             <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Journée de {viewDetails.nom}</div>
                <button onClick={() => setViewDetails(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 20 }}>×</button>
             </div>
             <div style={{ padding: 20 }}>
                <h4 style={{ fontSize: 12, color: '#6B7280', marginBottom: 10, textTransform: 'uppercase' }}>Stocks attribués</h4>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Produit</th>
                            <th>Dotation</th>
                            <th>Retours</th>
                            <th>Vendu</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(state.produits || []).map(p => {
                            const dot = state.dotations[p.id]?.[viewDetails.id] || 0;
                            const ret = (state.retours || []).filter(r => r.vendeurId === viewDetails.id && r.produitId === p.id).reduce((s, r) => s + r.quantite, 0);
                            if (dot === 0 && ret === 0) return null;
                            return (
                                <tr key={p.id}>
                                    <td>{p.nom}</td>
                                    <td>{dot}</td>
                                    <td>{ret}</td>
                                    <td style={{ fontWeight: 600, color: '#1A3A6B' }}>{dot - ret}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
             </div>
             <div style={{ padding: '12px 20px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setViewDetails(null)} className="btn btn-outline">Fermer</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vendeurs;
