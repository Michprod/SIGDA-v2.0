import React, { useState } from 'react';
import { useAppState } from '../context/StateContext';
import { fmtUSD, fmtQty, getStatutConfig } from '../utils/formatters';
import { Icon, StatutBadge, VendeurBadge } from '../components/Common';

const Modal = ({ title, icon, children, onClose, footer }) => (
  <div className="fixed inset-0 z-[8000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-fixed-dim flex items-center justify-center">
            <Icon name={icon} className="text-primary" />
          </div>
          <h3 className="font-bold text-primary text-lg">{title}</h3>
        </div>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
          <Icon name="close" className="text-slate-400" />
        </button>
      </div>
      <div className="px-6 py-5">{children}</div>
      {footer && (
        <div className="px-6 py-4 bg-slate-50 rounded-b-2xl border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-3">
          {footer}
        </div>
      )}
    </div>
  </div>
);

const Vendeurs = () => {
  const { state, dispatch } = useAppState();
  const [selectedVendeur, setSelectedVendeur] = useState(null);
  const [reconMontant, setReconMontant] = useState(0);

  const isCloture = ['CLOTUREE', 'VERROUILLEE', 'EN_CLOTURE'].includes(state.periode.statut);

  const calcRemuneration = (v) => {
    const commission = v.caisseSaisie * v.commission;
    const ecartAbs = Math.abs(v.ecart || 0);
    return commission - ecartAbs;
  };

  const handleOpenReconciliation = (v) => {
    setSelectedVendeur(v);
    setReconMontant(v.caisseTheorique);
  };

  const handleConfirmReconciliation = () => {
    if (isNaN(reconMontant) || reconMontant < 0) {
      alert('Entrez un montant valide.');
      return;
    }
    dispatch({
      type: 'RECONCILIER_VENDEUR',
      payload: { vendeurId: selectedVendeur.id, caisseSaisie: reconMontant }
    });
    setSelectedVendeur(null);
  };

  const totalCA = state.vendeurs.filter(v => v.statut === 'RECONCILIEE').reduce((s, v) => s + v.caisseSaisie, 0);
  const totalRemunet = state.vendeurs.filter(v => v.statut === 'RECONCILIEE').reduce((s, v) => s + calcRemuneration(v), 0);
  const totalEcart = state.vendeurs.filter(v => v.statut === 'RECONCILIEE').reduce((s, v) => s + (v.ecart || 0), 0);
  const reconciliesCount = state.vendeurs.filter(v => v.statut === 'RECONCILIEE').length;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-[#002451]">Vendeurs & Réconciliation</h2>
        <p className="text-slate-500 font-medium">Rapprochement des encaissements et calcul des rémunérations</p>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white p-5 rounded-2xl shadow-sm border-b-4 border-[#C9A227]">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">CA Total Réconcilié</p>
          <p className="text-2xl font-black text-[#002451]">{fmtUSD(totalCA)}</p>
          <p className="text-xs text-slate-400 mt-1">Encaissements validés</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border-b-4 border-emerald-500">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Réconciliés</p>
          <p className="text-2xl font-black text-[#002451]">{reconciliesCount} <span className="text-sm text-slate-400">/ {state.vendeurs.length}</span></p>
          <p className="text-xs text-slate-400 mt-1">Vendeurs traités</p>
        </div>
        <div className={`bg-white p-5 rounded-2xl shadow-sm border-b-4 ${totalEcart < 0 ? 'border-red-400' : 'border-emerald-400'}`}>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Écart Total</p>
          <p className={`text-2xl font-black ${totalEcart < 0 ? 'text-red-600' : totalEcart > 0 ? 'text-emerald-600' : 'text-slate-600'}`}>
            {totalEcart >= 0 ? '+' : ''}{fmtUSD(totalEcart)}
          </p>
          <p className="text-xs text-slate-400 mt-1">Différence cumulée</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border-b-4 border-[#1A3A6B]">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Rémunérations</p>
          <p className="text-2xl font-black text-[#002451]">{fmtUSD(totalRemunet)}</p>
          <p className="text-xs text-slate-400 mt-1">Net à distribuer</p>
        </div>
      </div>

      {/* Table principale */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
          <h4 className="font-bold text-[#002451] flex items-center gap-2">
            <span className="w-1.5 h-5 bg-[#2D6FAD] rounded-full"></span>
            Sessions de Vente — {state.periode.date}
          </h4>
          <button className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-600 transition-colors border border-slate-200">
            <Icon name="download" className="text-sm" /> Exporter
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="px-6 py-4">Vendeur</th>
                <th className="px-6 py-4 text-center">Stock Départ</th>
                <th className="px-6 py-4 text-center">Retours</th>
                <th className="px-6 py-4 text-center">Encaissement Théo.</th>
                <th className="px-6 py-4 text-center">Encaissement Réel</th>
                <th className="px-6 py-4 text-center">Écart</th>
                <th className="px-6 py-4 text-center">Statut</th>
                <th className="px-6 py-4 text-center">Rémunération</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {state.vendeurs.map((v) => {
                const isReconcilie = v.statut === 'RECONCILIEE';
                const remunet = isReconcilie ? calcRemuneration(v) : null;
                const ecartClass = v.ecart > 0 ? 'text-emerald-600' : v.ecart < 0 ? 'text-red-600' : 'text-slate-500';

                return (
                  <tr key={v.id} className={`${isReconcilie ? '' : 'bg-amber-50/20'} hover:bg-slate-50/50 transition-colors`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <VendeurBadge initiales={v.initiales} colorClass={v.colorClass} />
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{v.nom}</p>
                          <p className="text-[10px] text-slate-400">{v.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-sm">{fmtQty(v.stockDepart)}</td>
                    <td className="px-6 py-4 text-center font-semibold text-sm">{fmtQty(v.retours)}</td>
                    <td className="px-6 py-4 text-center font-bold text-[#002451] text-sm">{fmtUSD(v.caisseTheorique)}</td>
                    <td className="px-6 py-4 text-center font-bold text-sm">
                      {isReconcilie ? (
                        <span className="text-[#2E7D52]">{fmtUSD(v.caisseSaisie)}</span>
                      ) : (
                        <span className="text-slate-300">--</span>
                      )}
                    </td>
                    <td className={`px-6 py-4 text-center font-bold text-sm ${ecartClass}`}>
                      {isReconcilie ? `${v.ecart >= 0 ? '+' : ''}${fmtUSD(v.ecart)}` : '--'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatutBadge statut={v.statut} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      {isReconcilie ? (
                        <span className="font-black text-[#002451] text-sm">{fmtUSD(remunet)}</span>
                      ) : !isCloture ? (
                        <button
                          onClick={() => handleOpenReconciliation(v)}
                          className="px-3 py-1.5 bg-gradient-to-br from-[#1A3A6B] to-[#002451] text-white rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm hover:scale-[1.05] transition-all flex items-center gap-1 mx-auto"
                        >
                          <Icon name="payments" className="text-sm" /> Réconcilier
                        </button>
                      ) : (
                        <span className="text-slate-300 text-xs">En attente</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reconciliation Modal */}
      {selectedVendeur && (
        <Modal
          title={`Réconciliation — ${selectedVendeur.nom}`}
          icon="payments"
          onClose={() => setSelectedVendeur(null)}
          footer={
            <>
              <button 
                onClick={() => setSelectedVendeur(null)} 
                className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={handleConfirmReconciliation} 
                className="w-full sm:w-auto justify-center px-6 py-2.5 bg-gradient-to-br from-[#1A3A6B] to-[#002451] text-white text-sm font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-all flex items-center gap-2"
              >
                <Icon name="task_alt" className="text-sm" fill={true} /> Valider & Clôturer Session
              </button>
            </>
          }
        >
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
              <VendeurBadge initiales={selectedVendeur.initiales} colorClass={selectedVendeur.colorClass} />
              <div>
                <p className="font-bold text-[#002451]">{selectedVendeur.nom}</p>
                <p className="text-xs text-slate-500">
                  Stock départ: {fmtQty(selectedVendeur.stockDepart)} unités • Retours: {selectedVendeur.retours}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-xl">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Encaissement Théorique</p>
                <p className="text-2xl font-black text-[#002451]">{fmtUSD(selectedVendeur.caisseTheorique)}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Argent Remis Réel</label>
                <input
                  type="number"
                  step="0.01"
                  value={reconMontant}
                  onChange={(e) => setReconMontant(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border-0 border-b-2 border-slate-300 focus:border-[#002451] focus:ring-0 font-black text-xl text-[#002451] rounded-t-lg py-2 px-1 outline-none"
                  autoFocus
                />
              </div>
            </div>
            <div className={`p-4 rounded-xl text-center border-2 border-dashed transition-colors ${
              reconMontant - selectedVendeur.caisseTheorique < -0.01 
                ? 'border-red-300 bg-red-50' 
                : 'border-emerald-300 bg-emerald-50'
            }`}>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Écart Calculé</p>
              <p className={`text-3xl font-black ${
                reconMontant - selectedVendeur.caisseTheorique < -0.01 ? 'text-red-600' : 'text-emerald-600'
              }`}>
                {reconMontant - selectedVendeur.caisseTheorique >= 0 ? '+' : ''}{fmtUSD(reconMontant - selectedVendeur.caisseTheorique)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Rémunération nette: {fmtUSD(reconMontant * 0.05 - Math.abs(reconMontant - selectedVendeur.caisseTheorique))}
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* Formule de calcul */}
      <div className="mt-6 p-6 rounded-xl border-l-4 border-[#1A3A6B] bg-[#EEF3FB]">
        <p className="text-xs font-black text-[#1A3A6B] uppercase tracking-wider mb-3">Formule de Rémunération</p>
        <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-700">
          <span className="px-3 py-2 bg-white rounded-lg shadow-sm">Encaissement Réel</span>
          <span className="text-2xl text-slate-300">×</span>
          <span className="px-3 py-2 bg-white rounded-lg shadow-sm">Commission (5%)</span>
          <span className="text-2xl text-slate-300">−</span>
          <span className="px-3 py-2 bg-white rounded-lg shadow-sm border-b-2 border-red-400">|Écart de Caisse|</span>
          <span className="text-2xl text-[#1A3A6B]">=</span>
          <span className="px-4 py-2 bg-[#1A3A6B] text-white rounded-lg shadow-md font-bold">Net à Payer</span>
        </div>
      </div>
    </div>
  );
};

export default Vendeurs;
