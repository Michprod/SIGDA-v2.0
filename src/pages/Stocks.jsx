import React, { useState } from 'react';
import { useAppState } from '../context/StateContext';
import { fmtUSD } from '../utils/formatters';
import toast from 'react-hot-toast';
import { apiService } from '../services/api';

const inputStyle = { width: '100%', padding: '7px 10px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 13, outline: 'none', color: '#1F2937', background: '#fff' };
const selectStyle = { ...inputStyle };
const labelStyle = { display: 'block', fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.4px' };

const Stocks = () => {
  const { state, dispatch } = useAppState();
  const [activeTab, setActiveTab] = useState('dotation');
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingDotations, setSavingDotations] = useState(false);
  const isCloture = ['CLOTUREE', 'VERROUILLEE', 'EN_CLOTURE'].includes(state.periode?.statut);

  const produits = state.produits || [];
  const vendeurs = state.vendeurs || [];

  // ── Garde : aucune période active ──
  if (!state.periode && !state.isLoading) {
    return (
      <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:300,gap:16,textAlign:'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize:48,color:'#D1D5DB' }}>inventory_2</span>
        <div>
          <h3 style={{ margin:0,fontWeight:700,color:'#1F2937' }}>Aucune période active</h3>
          <p style={{ fontSize:13,color:'#6B7280',margin:'6px 0 0' }}>Ouvrez d'abord une journée via <strong>Configuration → Ouvrir une période</strong>.</p>
        </div>
        <a href="/configuration" className="btn btn-primary">Aller à la Configuration</a>
      </div>
    );
  }

  const getRestDepot = (produit) => {
    const dotationsForProd = state.dotations[produit.id] || {};
    const totalDote = Object.values(dotationsForProd).reduce((a, b) => a + (parseInt(b) || 0), 0);
    return produit.stockDepot - totalDote;
  };

  const handleUpdateDotation = (produitId, vendeurId, value) =>
    dispatch({ type: 'UPDATE_DOTATION', payload: { produitId, vendeurId, quantite: value } });

  const handleValiderDotations = async () => {
    setSavingDotations(true);
    let successCount = 0;
    const loadId = toast.loading('Enregistrement des dotations...');
    try {
      for (const p of produits) {
        for (const v of vendeurs) {
          const qty = (state.dotations[p.id] || {})[v.id] || 0;
          if (qty > 0) {
            await apiService.allouerDotation(v.sessionId, p.id, qty);
            successCount++;
          }
        }
      }
      toast.success(`${successCount} dotation(s) enregistrée(s) avec succès !`, { id: loadId });
      setShowConfirm(false);
    } catch (e) {
      toast.error(e.response?.data?.message || "Erreur lors de l'enregistrement des dotations.", { id: loadId });
    } finally {
      setSavingDotations(false);
    }
  };

  const handleAddAppro = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const qty = parseInt(f.get('qty'));
    const produitId = f.get('produitId');
    if (!f.get('ref') || !produitId || !qty) { 
      toast.error('Veuillez remplir tous les champs obligatoires.'); 
      return; 
    }
    const produit = produits.find(p => p.id === produitId);
    if (!produit) return;

    const loadId = toast.loading("Enregistrement de la livraison...");
    try {
        const newStock = produit.stockDepot + qty;
        await apiService.updateStockProduit(produitId, newStock);
        
        dispatch({
          type: 'LOAD_STATE',
          payload: {
            ...state,
            produits: produits.map(p => p.id === produitId ? { ...p, stockDepot: newStock } : p),
            approvisionnements: [...(state.approvisionnements || []), {
              id: 'A' + Date.now(), produitId, quantite: qty,
              fournisseur: f.get('fournisseur') || 'Usine Centrale',
              date: new Date().toISOString().replace('T', ' ').substring(0, 16),
              reference: f.get('ref')
            }]
          }
        });
        toast.success("Livraison enregistrée avec succès.", { id: loadId });
        e.target.reset();
    } catch(err) {
        toast.error("Erreur lors de l'enregistrement de la livraison.", { id: loadId });
    }
  };

  const handleAddRetour = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const vendeurId = f.get('vendeurId');
    const produitId = f.get('produitId');
    const quantite = parseInt(f.get('qty'));
    const motif = f.get('motif');

    if (!vendeurId || !produitId || !quantite) {
      toast.error("Veuillez remplir tous les champs.");
      return;
    }

    const vendeur = vendeurs.find(v => v.id === vendeurId);
    if (!vendeur) return;

    const loadId = toast.loading("Enregistrement du retour...");
    try {
      await apiService.ajouterRetour(vendeur.sessionId, produitId, quantite, motif);
      dispatch({ type: 'ADD_RETOUR', payload: { vendeurId, produitId, quantite, motif } });
      
      // Also update stock in the backend (Returns go back to central stock)
      const produit = produits.find(p => p.id === produitId);
      if (produit) {
         await apiService.updateStockProduit(produitId, produit.stockDepot + quantite);
         dispatch({
            type: 'LOAD_STATE',
            payload: {
              ...state,
              produits: produits.map(p => p.id === produitId ? { ...p, stockDepot: p.stockDepot + quantite } : p),
            }
         });
      }

      toast.success("Retour enregistré avec succès.", { id: loadId });
      e.target.reset();
    } catch(err) {
      toast.error("Erreur lors de l'enregistrement du retour.", { id: loadId });
    }
  };

  const TABS = [
    { key: 'dotation', label: 'Dotation matinale' },
    { key: 'appro',    label: 'Approvisionnement' },
    { key: 'retours',  label: 'Retours & Démarque' },
  ];

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid #E5E7EB', paddingBottom: 0 }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none', background: 'none',
              color: activeTab === t.key ? '#1A3A6B' : '#6B7280',
              borderBottom: activeTab === t.key ? '2px solid #1A3A6B' : '2px solid transparent',
              marginBottom: -1, transition: 'color 0.12s',
            }}
          >{t.label}</button>
        ))}
      </div>

      {/* ── TAB: Dotation ── */}
      {activeTab === 'dotation' && (
        <>
          <div className="card" style={{ overflowX: 'auto' }}>
            <div className="card-head" style={{ justifyContent: 'space-between' }}>
              <div>
                <div className="card-title">Tableau de répartition</div>
                <div className="card-sub">{vendeurs.length} vendeur(s)</div>
              </div>
              {!isCloture && (
                <button onClick={() => setShowConfirm(true)} className="btn btn-success">
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check_circle</span>
                  Valider les dotations
                </button>
              )}
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th style={{ textAlign: 'center' }}>Stock Dépôt</th>
                  {vendeurs.map(v => <th key={v.id} style={{ textAlign: 'center' }}>{v.nom}</th>)}
                  <th style={{ textAlign: 'center' }}>Reste Dépôt</th>
                </tr>
              </thead>
              <tbody>
                {produits.length === 0 && (
                  <tr><td colSpan={3 + vendeurs.length} style={{ textAlign:'center',color:'#9CA3AF',padding:24,fontSize:13 }}>
                    Aucun produit configuré. Ajoutez des produits dans <a href="/configuration">Configuration → Produits</a>.
                  </td></tr>
                )}
                {vendeurs.length === 0 && produits.length > 0 && (
                  <tr><td colSpan={3} style={{ textAlign:'center',color:'#9CA3AF',padding:24,fontSize:13 }}>
                    Aucun vendeur dans cette période. Vérifiez la configuration.
                  </td></tr>
                )}
                {produits.map(p => {
                  const rest = getRestDepot(p);
                  return (
                    <tr key={p.id}>
                      <td><strong style={{ fontSize: 13 }}>{p.nom}</strong><br /><span style={{ fontSize: 10, color: '#9CA3AF' }}>{p.categorie}</span></td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{p.stockDepot}</td>
                      {vendeurs.map(v => (
                        <td key={v.id} style={{ textAlign: 'center' }}>
                          {isCloture ? (
                            <span style={{ fontWeight: 600 }}>{(state.dotations[p.id] || {})[v.id] || 0}</span>
                          ) : (
                            <input
                              type="number" min="0"
                              value={(state.dotations[p.id] || {})[v.id] || 0}
                              onChange={e => handleUpdateDotation(p.id, v.id, e.target.value)}
                              style={{ width: 70, textAlign: 'center', padding: '4px 6px', border: '1px solid #E5E7EB', borderRadius: 4, fontSize: 13, outline: 'none' }}
                              onFocus={e => e.target.style.borderColor = '#1A3A6B'}
                              onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                            />
                          )}
                        </td>
                      ))}
                      <td style={{ textAlign: 'center', fontWeight: 700, color: rest < 0 ? '#C0392B' : rest === 0 ? '#6B7280' : '#2E7D52' }}>
                        {rest}
                        {rest < 0 && <div style={{ fontSize: 10, color: '#C0392B' }}>Dépassement!</div>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid #E5E7EB', background: '#FAFAFA' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 600, fontSize: 11, color: '#6B7280', textTransform: 'uppercase' }}>Totaux</td>
                  <td style={{ textAlign: 'center', fontWeight: 700 }}>{produits.reduce((s, p) => s + p.stockDepot, 0)}</td>
                  {vendeurs.map(v => (
                    <td key={v.id} style={{ textAlign: 'center', fontWeight: 700, color: '#1A3A6B' }}>
                      {produits.reduce((s, p) => s + (parseInt((state.dotations[p.id] || {})[v.id]) || 0), 0)}
                    </td>
                  ))}
                  <td style={{ textAlign: 'center', fontWeight: 700, color: '#2E7D52' }}>
                    {produits.reduce((s, p) => s + getRestDepot(p), 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Modal de Confirmation Dotation */}
          {showConfirm && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.4)' }}>
               <div style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 640, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>Validation des dotations matinales</div>
                    <button onClick={() => setShowConfirm(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 20 }}>×</button>
                  </div>
                  <div style={{ padding: 20, maxHeight: '60vh', overflowY: 'auto' }}>
                    <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>Veuillez confirmer les quantités attribuées avant l'enregistrement définitif.</p>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Produit</th>
                                <th>Vendeur</th>
                                <th>Quantité</th>
                                <th>Valeur Estimée</th>
                            </tr>
                        </thead>
                        <tbody>
                            {produits.map(p => (
                                vendeurs.map(v => {
                                    const qty = (state.dotations[p.id] || {})[v.id] || 0;
                                    if (qty <= 0) return null;
                                    return (
                                        <tr key={`${p.id}-${v.id}`}>
                                            <td>{p.nom}</td>
                                            <td>{v.nom}</td>
                                            <td style={{ fontWeight: 700 }}>{qty}</td>
                                            <td>{fmtUSD(qty * p.prixUnitaire)}</td>
                                        </tr>
                                    );
                                })
                            ))}
                        </tbody>
                    </table>
                  </div>
                  <div style={{ padding: '12px 20px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                    <button onClick={() => setShowConfirm(false)} disabled={savingDotations} className="btn btn-outline">Modifier</button>
                    <button onClick={handleValiderDotations} disabled={savingDotations} className="btn btn-success">
                      {savingDotations ? 'Enregistrement...' : 'Confirmer et Allouer'}
                    </button>
                  </div>
               </div>
            </div>
          )}
        </>
      )}

      {/* ── TAB: Appro ── */}
      {activeTab === 'appro' && (
        <div className="two-col">
          <div className="card">
            <div className="card-head"><div className="card-title">Nouvelle livraison</div></div>
            <div className="card-body">
              <form onSubmit={handleAddAppro} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div><label style={labelStyle}>Référence *</label><input name="ref" type="text" placeholder="LIV-2026-XXX" required style={inputStyle} /></div>
                <div><label style={labelStyle}>Produit *</label>
                  <select name="produitId" required style={selectStyle}>
                    {produits.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
                  </select>
                </div>
                <div><label style={labelStyle}>Quantité *</label><input name="qty" type="number" min="1" placeholder="0" required style={inputStyle} /></div>
                <div><label style={labelStyle}>Fournisseur</label><input name="fournisseur" type="text" defaultValue="Usine Centrale" style={inputStyle} /></div>
                {!isCloture ? (
                  <button type="submit" className="btn btn-primary" style={{ marginTop: 4 }}>Enregistrer la livraison</button>
                ) : (
                  <div style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', padding: '8px 0' }}>Saisies bloquées — journée en clôture</div>
                )}
              </form>
            </div>
          </div>

          <div className="card" style={{ overflowX: 'auto' }}>
            <div className="card-head">
              <div className="card-title">Historique des approvisionnements</div>
              <div className="card-sub">{(state.approvisionnements || []).length} livraison(s)</div>
            </div>
            <table className="data-table">
              <thead><tr><th>Référence</th><th>Produit</th><th>Qté</th><th>Date</th></tr></thead>
              <tbody>
                {(state.approvisionnements || []).length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: '#9CA3AF', padding: 20 }}>Aucun approvisionnement</td></tr>
                ) : (state.approvisionnements || []).map((a, i) => {
                  const prod = produits.find(p => p.id === a.produitId);
                  return (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 600 }}>{a.reference}</td>
                      <td>{prod?.nom || a.produitId}</td>
                      <td style={{ fontWeight: 700, color: '#2D6FAD' }}>{a.quantite} u.</td>
                      <td style={{ color: '#9CA3AF', fontSize: 11 }}>{a.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB: Retours ── */}
      {activeTab === 'retours' && (
        <div className="two-col">
          <div className="card">
            <div className="card-head"><div className="card-title">Saisir un retour</div></div>
            <div className="card-body">
              <form onSubmit={handleAddRetour} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div><label style={labelStyle}>Vendeur</label>
                  <select name="vendeurId" style={selectStyle}>
                    {vendeurs.map(v => <option key={v.id} value={v.id}>{v.nom}</option>)}
                  </select>
                </div>
                <div><label style={labelStyle}>Produit</label>
                  <select name="produitId" style={selectStyle}>
                    {produits.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
                  </select>
                </div>
                <div><label style={labelStyle}>Quantité *</label><input name="qty" type="number" min="1" required style={inputStyle} /></div>
                <div><label style={labelStyle}>Motif</label>
                  <select name="motif" style={selectStyle}>
                    <option>Invendu</option><option>Casse</option><option>Péremption</option><option>Refus client</option>
                  </select>
                </div>
                {!isCloture ? (
                  <button type="submit" className="btn btn-primary" style={{ marginTop: 4 }}>Enregistrer le retour</button>
                ) : (
                  <div style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', padding: '8px 0' }}>Saisies bloquées</div>
                )}
              </form>
            </div>
          </div>

          <div className="card" style={{ overflowX: 'auto' }}>
            <div className="card-head">
              <div className="card-title">Retours enregistrés</div>
              <div className="card-sub">{(state.retours || []).length} retour(s)</div>
            </div>
            <table className="data-table">
              <thead><tr><th>Vendeur</th><th>Produit</th><th>Qté</th><th>Motif</th></tr></thead>
              <tbody>
                {(state.retours || []).length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: '#9CA3AF', padding: 20 }}>Aucun retour</td></tr>
                ) : (state.retours || []).map(r => {
                  const prod = produits.find(p => p.id === r.produitId);
                  const vend = vendeurs.find(v => v.id === r.vendeurId);
                  return (
                    <tr key={r.id}>
                      <td>{vend?.nom || r.vendeurId}</td>
                      <td>{prod?.nom || r.produitId}</td>
                      <td style={{ fontWeight: 700 }}>{r.quantite}</td>
                      <td>
                        <span className={`sess-badge ${r.motif === 'Casse' ? 'sess-wait' : 'sess-partial'}`}>{r.motif}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stocks;
