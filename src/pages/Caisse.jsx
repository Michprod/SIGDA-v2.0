import React, { useState } from 'react';
import { useAppState } from '../context/StateContext';
import { fmtUSD } from '../utils/formatters';
import toast from 'react-hot-toast';

const inputStyle = { width: '100%', padding: '7px 10px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 13, outline: 'none', color: '#1F2937', background: '#fff' };
const selectStyle = { ...inputStyle };
const labelStyle = { display: 'block', fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.4px' };

const TX_TYPES = {
  VENTE:     { label: 'Vente',     color: '#2D6FAD', bg: '#DBEAFE' },
  FRAIS:     { label: 'Frais',     color: '#92400E', bg: '#FEF3C7' },
  PROVISION: { label: 'Provision', color: '#6D28D9', bg: '#EDE9FE' },
  TRANSFERT: { label: 'Transfert', color: '#374151', bg: '#F3F4F6' },
};

const Caisse = () => {
  const { state, dispatch, getSoldeActuelCaisse, getTotalEntreesCaisse, getTotalSortiesCaisse } = useAppState();
  const [modal, setModal] = useState(null); // 'entree' | 'sortie'

  const isCloture = ['CLOTUREE', 'VERROUILLEE', 'EN_CLOTURE'].includes(state.periode?.statut);
  const solde = getSoldeActuelCaisse();
  const entrees = getTotalEntreesCaisse();
  const sorties = getTotalSortiesCaisse();
  const transactions = state.caisse?.transactions || [];
  const provisions = state.caisse?.provisions || [];

  const handleTx = (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const libelle = f.get('libelle'), txType = f.get('type'), montant = parseFloat(f.get('montant'));
    if (!libelle || !montant) { 
      toast.error('Veuillez renseigner le libellé et le montant.'); 
      return; 
    }
    dispatch({ type: 'ADD_TRANSACTION', payload: { libelle, type: txType, montant: modal === 'entree' ? montant : -montant } });
    setModal(null);
  };

  return (
    <div>
      {/* KPIs */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="kpi-card">
          <div className="kpi-label">Solde théorique</div>
          <div className="kpi-value" style={{ color: solde < 0 ? '#C0392B' : '#1F2937' }}>{fmtUSD(solde)}</div>
          <div className="kpi-sub">Non arrêté (calculé)</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Total entrées</div>
          <div className="kpi-value" style={{ color: '#2E7D52' }}>+{fmtUSD(entrees)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Total sorties</div>
          <div className="kpi-value" style={{ color: '#C0392B' }}>{fmtUSD(sorties)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Solde initial</div>
          <div className="kpi-value">{fmtUSD(state.caisse?.soldeInitial || 0)}</div>
          <div className="kpi-sub">Ouverture journée</div>
        </div>
      </div>

      {/* Actions */}
      {!isCloture && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button onClick={() => setModal('entree')} className="btn btn-success">
            + Saisir une entrée
          </button>
          <button onClick={() => setModal('sortie')} className="btn btn-outline" style={{ color: '#C0392B', borderColor: '#FCA5A5' }}>
            − Saisir une sortie
          </button>
        </div>
      )}

      <div className="two-col">
        {/* Transactions */}
        <div className="card" style={{ overflowX: 'auto' }}>
          <div className="card-head">
            <div className="card-title">Flux de caisse</div>
            <div className="card-sub">{transactions.length} opération(s)</div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Heure</th>
                <th>Libellé</th>
                <th>Type</th>
                <th style={{ textAlign: 'right' }}>Montant</th>
                <th style={{ textAlign: 'center' }}>Statut</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: '#9CA3AF', padding: 20 }}>Aucune opération</td></tr>
              ) : transactions.map((t, i) => {
                const tc = TX_TYPES[t.type] || TX_TYPES.VENTE;
                return (
                  <tr key={t.id || i}>
                    <td style={{ color: '#9CA3AF', fontSize: 11 }}>{t.datetime}</td>
                    <td style={{ fontWeight: 500 }}>{t.libelle}</td>
                    <td>
                      <span style={{ background: tc.bg, color: tc.color, padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600 }}>
                        {tc.label}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: t.montant > 0 ? '#2E7D52' : '#C0392B' }}>
                      {t.montant > 0 ? '+' : ''}{fmtUSD(t.montant)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`sess-badge ${t.statut === 'VALIDE' ? 'sess-recon' : 'sess-partial'}`}>
                        {t.statut === 'VALIDE' ? 'Validé' : 'En attente'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Provisions */}
        <div className="card">
          <div className="card-head"><div className="card-title">Provisions & Fonds</div></div>
          {provisions.length === 0 ? (
            <div className="card-body" style={{ color: '#9CA3AF', fontSize: 13 }}>Aucune provision saisie.</div>
          ) : (
            <table className="data-table">
              <thead><tr><th>Libellé</th><th style={{ textAlign: 'right' }}>Dotation</th><th style={{ textAlign: 'right' }}>Utilisé</th></tr></thead>
              <tbody>
                {provisions.map(p => (
                  <tr key={p.id}>
                    <td>{p.libelle}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmtUSD(p.montant)}</td>
                    <td style={{ textAlign: 'right', color: '#E67E22', fontWeight: 600 }}>{fmtUSD(p.utilise)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Note écart physique */}
          <div className="card-body" style={{ borderTop: '1px solid #E5E7EB' }}>
            <div style={{ padding: '10px 12px', borderRadius: 6, background: '#EEF3FB', borderLeft: '3px solid #1A3A6B', fontSize: 12, color: '#374151', lineHeight: 1.6 }}>
              <strong>Arrêté physique (Étape 03 de la clôture)</strong><br />
              Le gestionnaire saisira le solde réellement compté. L'écart avec le solde théorique génère une opération de régularisation automatique.
            </div>
          </div>
        </div>
      </div>

      {/* Modal Saisie */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.4)' }}>
          <div style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>
                {modal === 'entree' ? '+ Nouvelle entrée' : '− Nouvelle sortie'}
              </div>
              <button onClick={() => setModal(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 20 }}>×</button>
            </div>
            <form onSubmit={handleTx}>
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div><label style={labelStyle}>Type d'opération</label>
                  <select name="type" style={selectStyle}>
                    {modal === 'entree'
                      ? <><option value="VENTE">Vente</option><option value="TRANSFERT">Transfert</option></>
                      : <><option value="FRAIS">Frais</option><option value="PROVISION">Provision</option></>
                    }
                  </select>
                </div>
                <div><label style={labelStyle}>Libellé *</label><input name="libelle" type="text" required placeholder="Ex: Vente comptoir #8421" style={inputStyle} /></div>
                <div><label style={labelStyle}>Montant (FC) *</label><input name="montant" type="number" step="1" min="1" required placeholder="0" style={inputStyle} /></div>
              </div>
              <div style={{ padding: '12px 20px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" onClick={() => setModal(null)} className="btn btn-outline">Annuler</button>
                <button type="submit" className={modal === 'entree' ? 'btn btn-success' : 'btn btn-primary'}>Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Caisse;
