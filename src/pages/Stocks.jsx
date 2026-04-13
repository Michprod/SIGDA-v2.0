import React, { useState } from 'react';
import { useAppState } from '../context/StateContext';
import { fmtQty, fmtUSD } from '../utils/formatters';
import { Icon } from '../components/Common';

const Stocks = () => {
  const { state, dispatch } = useAppState();
  const [activeTab, setActiveTab] = useState('dotation');
  
  const isCloture = ['CLOTUREE', 'VERROUILLEE', 'EN_CLOTURE'].includes(state.periode.statut);

  const getRestDepot = (produit) => {
    const dotationsForProd = state.dotations[produit.id] || {};
    const totalDote = Object.values(dotationsForProd).reduce((a, b) => a + (parseInt(b) || 0), 0);
    return produit.stockDepot - totalDote;
  };

  const getTotalDoteProduit = (produitId) => {
    return Object.values(state.dotations[produitId] || {}).reduce((a, b) => a + (parseInt(b) || 0), 0);
  };

  const getTotalDoteVendeur = (vendeurId) => {
    return state.produits.reduce((sum, p) => sum + (parseInt((state.dotations[p.id] || {})[vendeurId]) || 0), 0);
  };

  const totalCapacite = state.produits.reduce((sum, p) => sum + p.stockDepot, 0);
  const totalRestDepot = state.produits.reduce((sum, p) => sum + getRestDepot(p), 0);

  const handleUpdateDotation = (produitId, vendeurId, value) => {
    dispatch({
      type: 'UPDATE_DOTATION',
      payload: { produitId, vendeurId, quantite: value }
    });
  };

  const handleAddAppro = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const ref = formData.get('ref');
    const produitId = formData.get('produitId');
    const qty = parseInt(formData.get('qty'));
    const fournisseur = formData.get('fournisseur');

    if (!ref || !produitId || !qty || qty < 1) {
      alert('Remplissez tous les champs obligatoires.');
      return;
    }

    // In a real app, we'd have a specific action for this
    // For now, mirroring the original logic
    dispatch({
      type: 'LOAD_STATE',
      payload: {
        ...state,
        produits: state.produits.map(p => p.id === produitId ? { ...p, stockDepot: p.stockDepot + qty } : p),
        approvisionnements: [
          ...state.approvisionnements,
          {
            id: 'A' + Date.now(),
            produitId,
            quantite: qty,
            fournisseur,
            date: new Date().toISOString().replace('T', ' ').substring(0, 16),
            reference: ref
          }
        ]
      }
    });

    e.target.reset();
  };

  const handleAddRetour = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    dispatch({
      type: 'ADD_RETOUR',
      payload: {
        vendeurId: formData.get('vendeurId'),
        produitId: formData.get('produitId'),
        quantite: formData.get('qty'),
        motif: formData.get('motif')
      }
    });
    e.target.reset();
  };

  const renderDotation = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-5 bg-slate-50 flex justify-between items-center border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            {state.vendeurs.slice(0, 3).map(v => (
              <div key={v.id} className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-blue-700">
                {v.initiales}
              </div>
            ))}
          </div>
          <span className="text-xs font-bold text-[#1A3A6B] uppercase tracking-widest">Tableau de répartition</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-[#1A3A6B]">
              <th className="px-6 py-4 min-w-[200px]">Produit</th>
              <th className="px-5 py-4 text-center min-w-[100px]">Stock Dépôt</th>
              {state.vendeurs.map(v => (
                <th key={v.id} className="px-5 py-4 text-center min-w-[110px] bg-slate-100/50">
                  {v.nom}
                </th>
              ))}
              <th className="px-5 py-4 text-center min-w-[100px]">Reste Dépôt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {state.produits.map(p => {
              const rest = getRestDepot(p);
              const restClass = rest < 0 ? 'text-red-600 font-black' : rest === 0 ? 'text-slate-400' : 'text-slate-700 font-black';
              return (
                <tr key={p.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Icon name={p.icon} className="text-[#1A3A6B]" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#002451]">{p.nom}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">{p.categorie}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="inline-block px-3 py-1 bg-slate-100 rounded text-sm font-bold text-[#002451]">
                      {fmtQty(p.stockDepot)}
                    </span>
                  </td>
                  {state.vendeurs.map(v => (
                    <td key={v.id} className="px-5 py-4">
                      {isCloture ? (
                        <div className="text-center font-bold text-sm">{(state.dotations[p.id] || {})[v.id] || 0}</div>
                      ) : (
                        <input
                          type="number"
                          min="0"
                          max={p.stockDepot}
                          value={(state.dotations[p.id] || {})[v.id] || 0}
                          onChange={(e) => handleUpdateDotation(p.id, v.id, e.target.value)}
                          className="w-full bg-slate-50 border-0 border-b-2 border-slate-200 focus:border-[#C9A227] focus:ring-0 text-center font-bold rounded-t-lg h-10 text-sm transition-colors"
                        />
                      )}
                    </td>
                  ))}
                  <td className="px-5 py-4 text-center">
                    <div className={`text-sm ${restClass}`}>{fmtQty(rest)}</div>
                    {rest < 0 && <div className="text-[10px] text-red-500 font-semibold">Dépassement!</div>}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="border-t-2 border-slate-200 bg-slate-50/50">
            <tr>
              <td className="px-6 py-5 text-right font-black text-[#002451] text-xs uppercase tracking-wider">Totaux</td>
              <td className="px-5 py-5 text-center">
                <span className="text-lg font-black text-[#002451]">{fmtQty(totalCapacite)}</span>
                <p className="text-[9px] font-bold text-slate-500 uppercase">Capacité</p>
              </td>
              {state.vendeurs.map(v => (
                <td key={v.id} className="px-5 py-5 text-center">
                  <span className="text-lg font-black text-[#002451]">{fmtQty(getTotalDoteVendeur(v.id))}</span>
                  <p className="text-[9px] font-bold text-slate-500 uppercase">Unités</p>
                </td>
              ))}
              <td className="px-5 py-5 text-center">
                <span className={`text-lg font-black ${totalRestDepot < 0 ? 'text-red-600' : 'text-[#002451]'}`}>
                  {fmtQty(totalRestDepot)}
                </span>
                <p className="text-[9px] font-bold text-slate-500 uppercase">Dispo Dépôt</p>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );

  const renderAppro = () => (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h4 className="font-bold text-[#002451] mb-5 flex items-center gap-2">
          <Icon name="add_circle" className="text-[#C9A227]" />
          Nouvelle Livraison
        </h4>
        <form onSubmit={handleAddAppro} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Référence</label>
            <input name="ref" type="text" placeholder="LIV-2026-XXX" className="w-full bg-slate-50 border-b-2 border-slate-200 p-2 focus:border-[#C9A227] outline-none text-sm font-semibold" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Produit</label>
            <select name="produitId" className="w-full bg-slate-50 border-b-2 border-slate-200 p-2 focus:border-[#C9A227] outline-none text-sm font-semibold">
              {state.produits.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Quantité</label>
            <input name="qty" type="number" min="1" placeholder="0" className="w-full bg-slate-50 border-b-2 border-slate-200 p-2 focus:border-[#C9A227] outline-none text-sm font-semibold" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Fournisseur</label>
            <input name="fournisseur" type="text" placeholder="Nom du fournisseur" defaultValue="Usine Centrale" className="w-full bg-slate-50 border-b-2 border-slate-200 p-2 focus:border-[#C9A227] outline-none text-sm font-semibold" />
          </div>
          {!isCloture ? (
            <button type="submit" className="w-full mt-2 py-3 bg-gradient-to-br from-[#1A3A6B] to-[#002451] text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2">
              <Icon name="add" className="text-sm" /> Enregistrer la Livraison
            </button>
          ) : (
            <div className="text-center text-xs text-slate-400 italic py-2">Saisies bloquées — journée en clôture</div>
          )}
        </form>
      </div>
      <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-50">
          <h4 className="font-bold text-[#002451]">Historique des Approvisionnements</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="px-6 py-4">Référence</th>
                <th className="px-6 py-4">Produit</th>
                <th className="px-6 py-4">Fournisseur</th>
                <th className="px-6 py-4">Quantité</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {state.approvisionnements.map(a => {
                const prod = state.produits.find(p => p.id === a.produitId);
                return (
                  <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-sm">{a.reference}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Icon name={prod?.icon || 'inventory'} className="text-[#1A3A6B] text-sm" />
                        <span className="font-semibold text-sm">{prod?.nom || a.produitId}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">{a.fournisseur}</td>
                    <td className="px-6 py-4 font-black text-[#002451] text-sm">{fmtQty(a.quantite)} unités</td>
                    <td className="px-6 py-4 text-slate-400 text-xs">{a.date}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold">✓ Reçu</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderRetours = () => (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h4 className="font-bold text-[#002451] mb-5 flex items-center gap-2">
          <Icon name="undo" className="text-orange-500" />
          Saisir un Retour
        </h4>
        <form onSubmit={handleAddRetour} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Vendeur</label>
            <select name="vendeurId" className="w-full bg-slate-50 border-b-2 border-slate-200 p-2 focus:border-[#C9A227] outline-none text-sm font-semibold">
              {state.vendeurs.map(v => <option key={v.id} value={v.id}>{v.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Produit</label>
            <select name="produitId" className="w-full bg-slate-50 border-b-2 border-slate-200 p-2 focus:border-[#C9A227] outline-none text-sm font-semibold">
              {state.produits.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Quantité</label>
            <input name="qty" type="number" min="1" placeholder="0" className="w-full bg-slate-50 border-b-2 border-slate-200 p-2 focus:border-[#C9A227] outline-none text-sm font-semibold" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Motif</label>
            <select name="motif" className="w-full bg-slate-50 border-b-2 border-slate-200 p-2 focus:border-[#C9A227] outline-none text-sm font-semibold">
              <option>Invendu</option>
              <option>Casse</option>
              <option>Péremption</option>
              <option>Refus client</option>
            </select>
          </div>
          {!isCloture ? (
            <button type="submit" className="w-full mt-2 py-3 bg-gradient-to-br from-[#1A3A6B] to-[#002451] text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2">
              <Icon name="add" className="text-sm" /> Enregistrer le Retour
            </button>
          ) : (
            <div className="text-center text-xs text-slate-400 italic py-2">Saisies bloquées — journée en clôture</div>
          )}
        </form>
      </div>
      <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center">
          <h4 className="font-bold text-[#002451]">Retours Enregistrés</h4>
          <span className="text-xs font-bold text-slate-400">{state.retours.length} retour(s)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="px-6 py-4">Date/Heure</th>
                <th className="px-6 py-4">Vendeur</th>
                <th className="px-6 py-4">Produit</th>
                <th className="px-6 py-4">Quantité</th>
                <th className="px-6 py-4">Motif</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {state.retours.length > 0 ? (
                state.retours.map(r => {
                  const prod = state.produits.find(p => p.id === r.produitId);
                  const vend = state.vendeurs.find(v => v.id === r.vendeurId);
                  const isCasse = r.motif === 'Casse';
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-slate-500 text-xs">{r.date}</td>
                      <td className="px-6 py-4"><span className="font-semibold text-sm">{vend?.nom || r.vendeurId}</span></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Icon name={prod?.icon || 'inventory'} className="text-[#1A3A6B] text-sm" />
                          <span className="font-semibold text-sm">{prod?.nom || r.produitId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-[#002451] text-sm">{fmtQty(r.quantite)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${isCasse ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                          {isCasse ? '⚠ ' : ''}{r.motif}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400 text-sm">Aucun retour enregistré</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-[#002451]">Gestion des Stocks</h2>
          <p className="text-slate-500 font-medium mt-1">Cycle Circulaire · Distribution journalière et contrôle des flux</p>
        </div>
        <div className="flex gap-2 p-1 bg-slate-100/50 rounded-xl w-fit">
          <button 
            onClick={() => setActiveTab('appro')} 
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'appro' ? 'bg-white text-[#002451] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Approvisionnement
          </button>
          <button 
            onClick={() => setActiveTab('dotation')} 
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'dotation' ? 'bg-white text-[#002451] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Dotation Matinale
          </button>
          <button 
            onClick={() => setActiveTab('retours')} 
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'retours' ? 'bg-white text-[#002451] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Retours & Démarque
          </button>
        </div>
      </div>

      <div className="mt-6">
        {activeTab === 'dotation' && renderDotation()}
        {activeTab === 'appro' && renderAppro()}
        {activeTab === 'retours' && renderRetours()}
      </div>
    </div>
  );
};

export default Stocks;
