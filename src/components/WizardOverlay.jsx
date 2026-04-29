import React, { useState, useEffect } from 'react';
import { useAppState } from '../context/StateContext';
import { fmtUSD } from '../utils/formatters';
import toast from 'react-hot-toast';
import { apiService } from '../services/api';

const STEPS = [
  { n: 1, label: 'Validation stocks',  icon: 'inventory_2'           },
  { n: 2, label: 'Validation vendeurs',icon: 'groups'                 },
  { n: 3, label: 'Arrêté de caisse',   icon: 'account_balance_wallet' },
  { n: 4, label: 'Rapport & Scellement',icon: 'description'           },
];

/* ── Ligne de séparation dans le rapport ── */
const Row = ({ label, value, accent }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #F3F4F6' }}>
    <span style={{ fontSize: 13, color: '#6B7280' }}>{label}</span>
    <span style={{ fontSize: 13, fontWeight: 700, color: accent || '#1F2937' }}>{value}</span>
  </div>
);

const WizardOverlay = ({ onClose }) => {
  const { state, dispatch, getSoldeActuelCaisse } = useAppState();
  const [etape, setEtape]       = useState(state.wizard?.etapeActuelle || 1);
  const [soldePhys, setSoldePhys] = useState(state.wizard?.soldeFisique ?? getSoldeActuelCaisse());
  const [justif, setJustif]     = useState(state.wizard?.justificationEcart || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch({ type: 'LOAD_STATE', payload: { ...state, wizard: { ...state.wizard, etapeActuelle: etape } } });
  }, [etape]);

  const handleNext = () => {
    if (etape === 3) {
      dispatch({ type: 'LOAD_STATE', payload: { ...state, wizard: { ...state.wizard, soldeFisique: soldePhys, justificationEcart: justif } } });
    }
    if (etape === 2) {
      const nonRecon = (state.vendeurs || []).filter(v => v.statut === 'EN_ATTENTE');
      if (nonRecon.length > 0 && !window.confirm(`${nonRecon.length} vendeur(s) non réconcilié(s). Continuer quand même ?`)) return;
    }
    if (etape < 4) setEtape(e => e + 1);
  };
  const handlePrev = () => { if (etape > 1) setEtape(e => e - 1); };

  const handleSceller = async () => {
    setIsSubmitting(true);
    const loadId = toast.loading('Clôture en cours, veuillez patienter...');
    try {
      await apiService.cloturePeriode(state.periode.id, soldePhys, justif);
      dispatch({ type: 'SIGNER_CLOTURE', payload: { soldePhysique: soldePhys, justificationEcart: justif } });
      toast.success('Journée clôturée et scellée avec succès !', { id: loadId });
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la clôture de la période.', { id: loadId });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ───── Étape 1 — Validation stocks ───── */
  const Step1 = () => (
    <div>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1F2937', marginBottom: 4 }}>Validation du bilan de stock</h3>
      <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>Vérifiez que les chiffres correspondent aux registres physiques.</p>
      <div className="card" style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Produit</th>
              <th style={{ textAlign: 'center' }}>Stock initial</th>
              <th style={{ textAlign: 'center' }}>Doté</th>
              <th style={{ textAlign: 'center' }}>Retours</th>
              <th style={{ textAlign: 'center' }}>Vendu estimé</th>
              <th style={{ textAlign: 'right' }}>Valeur théo.</th>
            </tr>
          </thead>
          <tbody>
            {(state.produits || []).map(p => {
              const totalDote   = Object.values(state.dotations[p.id] || {}).reduce((a, b) => a + (parseInt(b) || 0), 0);
              const totalRetours = (state.retours || []).filter(r => r.produitId === p.id).reduce((a, r) => a + r.quantite, 0);
              const vendu       = totalDote - totalRetours;
              return (
                <tr key={p.id}>
                  <td><strong>{p.nom}</strong></td>
                  <td style={{ textAlign: 'center', fontWeight: 600 }}>{p.stockDepot}</td>
                  <td style={{ textAlign: 'center' }}>{totalDote}</td>
                  <td style={{ textAlign: 'center', color: '#2E7D52', fontWeight: 600 }}>{totalRetours}</td>
                  <td style={{ textAlign: 'center', fontWeight: 700, color: '#1A3A6B' }}>{vendu}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#C9A227' }}>{fmtUSD(vendu * p.prixUnitaire)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="alert-strip alert-info" style={{ marginTop: 12 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>lock</span>
        Ce tableau est figé. Aucune modification n'est possible à ce stade.
      </div>
    </div>
  );

  /* ───── Étape 2 — Validation vendeurs ───── */
  const Step2 = () => {
    const vendeurs = state.vendeurs || [];
    const allOk = vendeurs.every(v => v.statut === 'RECONCILIEE');
    return (
      <div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1F2937', marginBottom: 4 }}>Validation des vendeurs</h3>
        <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 12 }}>Confirmez que tous les vendeurs sont au statut RÉCONCILIÉE.</p>
        <div className={`alert-strip ${allOk ? 'alert-info' : 'alert-warn'}`} style={{ marginBottom: 12 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{allOk ? 'check_circle' : 'warning'}</span>
          {allOk ? 'Tous les vendeurs sont réconciliés. ✓' : `${vendeurs.filter(v => v.statut === 'EN_ATTENTE').length} vendeur(s) non réconcilié(s).`}
        </div>
        <div className="card" style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Vendeur</th>
                <th style={{ textAlign: 'center' }}>Théorique</th>
                <th style={{ textAlign: 'center' }}>Réel</th>
                <th style={{ textAlign: 'center' }}>Écart</th>
                <th style={{ textAlign: 'center' }}>Statut</th>
              </tr>
            </thead>
            <tbody>
              {vendeurs.map(v => {
                const ok = v.statut === 'RECONCILIEE';
                const ecart = v.ecart || 0;
                return (
                  <tr key={v.id}>
                    <td><strong>{v.nom}</strong></td>
                    <td style={{ textAlign: 'center', color: '#2D6FAD', fontWeight: 600 }}>{fmtUSD(v.caisseTheorique)}</td>
                    <td style={{ textAlign: 'center', color: ok ? '#2E7D52' : '#9CA3AF', fontWeight: 600 }}>{ok ? fmtUSD(v.caisseSaisie) : '—'}</td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: ecart < 0 ? '#C0392B' : '#2E7D52' }}>{ok ? `${ecart >= 0 ? '+' : ''}${fmtUSD(ecart)}` : '—'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`sess-badge ${ok ? 'sess-recon' : 'sess-wait'}`}>{ok ? 'Réconcilié' : 'En attente'}</span>
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

  /* ───── Étape 3 — Arrêté de caisse ───── */
  const Step3 = () => {
    const theo = getSoldeActuelCaisse();
    const ecart = soldePhys - theo;
    const ok = Math.abs(ecart) < 1; // Tolerance increased for FC
    return (
      <div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1F2937', marginBottom: 4 }}>Arrêté de caisse</h3>
        <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>Entrez le solde physique compté manuellement en coffre.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div style={{ padding: 16, borderRadius: 8, background: '#EEF3FB', border: '1px solid #BFDBFE' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#2D6FAD', textTransform: 'uppercase', marginBottom: 6 }}>Solde théorique calculé</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#1F2937' }}>{fmtUSD(theo)}</div>
          </div>
          <div style={{ padding: 16, borderRadius: 8, background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', marginBottom: 6 }}>Solde physique compté (FC)</div>
            <input
              type="number" step="1" min="0" value={soldePhys} autoFocus
              onChange={e => setSoldePhys(parseFloat(e.target.value) || 0)}
              style={{ width: '100%', fontSize: 24, fontWeight: 700, border: 'none', outline: 'none', background: 'transparent', color: '#1F2937', borderBottom: '2px solid #1A3A6B' }}
            />
          </div>
        </div>
        <div style={{ padding: 16, borderRadius: 8, textAlign: 'center', border: `2px dashed ${ok ? '#2E7D52' : '#C0392B'}`, background: ok ? '#DCFCE7' : '#FEE2E2', marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: '#6B7280', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' }}>Écart calculé</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: ok ? '#2E7D52' : '#C0392B' }}>{ecart >= 0 ? '+' : ''}{fmtUSD(ecart)}</div>
          <div style={{ fontSize: 11, fontWeight: 600, marginTop: 4, color: ok ? '#166534' : '#991B1B' }}>
            {ok ? '⚖ ÉQUILIBRE PARFAIT' : '⚠ ÉCART DÉTECTÉ'}
          </div>
        </div>
        <div className="card">
          <div className="card-head">
            <div className="card-title">Justification de l'écart</div>
            <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10, background: ok ? '#F3F4F6' : '#FEE2E2', color: ok ? '#6B7280' : '#991B1B' }}>
              {ok ? 'Optionnel' : 'Obligatoire'}
            </span>
          </div>
          <div className="card-body">
            <textarea
              rows={3}
              value={justif}
              onChange={e => setJustif(e.target.value)}
              placeholder="Si un écart est constaté, merci de détailler les raisons..."
              style={{ width: '100%', padding: '8px 10px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 13, outline: 'none', resize: 'none', color: '#1F2937' }}
            />
          </div>
        </div>
      </div>
    );
  };

  /* ───── Étape 4 — Rapport final ───── */
  const Step4 = () => {
    const vendeurs = state.vendeurs || [];
    const CA = vendeurs.filter(v => v.statut === 'RECONCILIEE').reduce((s, v) => s + v.caisseSaisie, 0);
    const reconcilies = vendeurs.filter(v => v.statut === 'RECONCILIEE').length;
    const theo = getSoldeActuelCaisse();
    const ecart = soldePhys - theo;
    const ref = `RPT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;
    return (
      <div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1F2937', marginBottom: 4 }}>Rapport final de clôture</h3>
        <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>Résumé — {state.periode?.date} · {state.periode?.site}</p>
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 16 }}>
          <div className="kpi-card"><div className="kpi-label">CA journée</div><div className="kpi-value" style={{ fontSize: 16 }}>{fmtUSD(CA)}</div></div>
          <div className="kpi-card"><div className="kpi-label">Réconciliés</div><div className="kpi-value">{reconcilies}/{vendeurs.length}</div></div>
          <div className="kpi-card"><div className="kpi-label">Solde physique</div><div className="kpi-value" style={{ fontSize: 16 }}>{fmtUSD(soldePhys)}</div></div>
          <div className="kpi-card"><div className="kpi-label">Retours</div><div className="kpi-value">{(state.retours || []).length}</div></div>
        </div>
        <div className="card">
          <div className="card-head"><div className="card-title">Rapport — Réf: {ref}</div></div>
          <div className="card-body">
            <Row label="Site"               value={state.periode?.site} />
            <Row label="Date comptable"     value={state.periode?.date} />
            <Row label="Administrateur"     value={state.periode?.admin} />
            <Row label="Chiffre d'affaires" value={fmtUSD(CA)} accent="#1A3A6B" />
            <Row label="Solde final caisse" value={fmtUSD(soldePhys)} accent="#1A3A6B" />
            <Row label="Écart de caisse"    value={`${ecart >= 0 ? '+' : ''}${fmtUSD(ecart)}`} accent={Math.abs(ecart) < 1 ? '#2E7D52' : '#C0392B'} />
          </div>
        </div>
      </div>
    );
  };

  const renderStep = () => {
    switch (etape) {
      case 1: return <Step1 />;
      case 2: return <Step2 />;
      case 3: return <Step3 />;
      case 4: return <Step4 />;
      default: return null;
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(17,24,39,0.6)', backdropFilter: 'blur(4px)' }}>
      <div style={{ width: '100%', maxWidth: 800, background: '#fff', borderRadius: 14, boxShadow: '0 25px 80px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '16px 24px', background: '#1A3A6B', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: 22 }}>lock_clock</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>Clôture journalière — {state.periode?.date}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 1 }}>SIGDA v2.0 · Session sécurisée</div>
            </div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'rgba(255,255,255,0.1)', borderRadius: 6, color: '#fff', cursor: 'pointer', padding: '5px 8px', display: 'flex', alignItems: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
          </button>
        </div>

        {/* Stepper */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #E5E7EB', background: '#F9FAFB', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            {STEPS.map((st, i) => {
              const done    = st.n < etape;
              const active  = st.n === etape;
              const pending = st.n > etape;
              return (
                <React.Fragment key={st.n}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, fontWeight: 700,
                      background: done ? '#2E7D52' : active ? '#1A3A6B' : '#E5E7EB',
                      color: done || active ? '#fff' : '#9CA3AF',
                      transition: 'all 0.25s',
                    }}>
                      {done
                        ? <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check</span>
                        : <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{st.icon}</span>
                      }
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', color: active ? '#1A3A6B' : '#9CA3AF', textAlign: 'center', maxWidth: 64, lineHeight: 1.3 }}>
                      {st.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ flex: 1, height: 2, background: done ? '#2E7D52' : '#E5E7EB', marginBottom: 18, transition: 'background 0.4s' }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {renderStep()}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid #E5E7EB', background: '#F9FAFB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600 }}>Étape {etape} / 4</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {etape > 1 ? (
              <button onClick={handlePrev} className="btn btn-outline">
                ← Précédent
              </button>
            ) : (
              <button onClick={onClose} className="btn btn-outline" style={{ color: '#C0392B' }}>
                Annuler
              </button>
            )}
            {etape < 4 ? (
              <button onClick={handleNext} disabled={isSubmitting} className="btn btn-primary">
                Continuer →
              </button>
            ) : (
              <button onClick={handleSceller} disabled={isSubmitting} className="btn btn-success">
                <span className="material-symbols-outlined" style={{ fontSize: 15 }}>history_edu</span>
                {isSubmitting ? 'Scellement...' : 'Sceller la journée'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WizardOverlay;
