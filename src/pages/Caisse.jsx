import React, { useState } from 'react';
import { useAppState } from '../context/StateContext';
import { fmtUSD, fmtQty } from '../utils/formatters';
import { Icon } from '../components/Common';

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

const Caisse = () => {
  const { state, dispatch, getSoldeActuelCaisse, getTotalEntreesCaisse, getTotalSortiesCaisse } = useAppState();
  const [modalType, setModalType] = useState(null); // 'entree' | 'sortie' | null
  
  const isCloture = ['CLOTUREE', 'VERROUILLEE', 'EN_CLOTURE'].includes(state.periode.statut);
  const soldeActuel = getSoldeActuelCaisse();
  const totalEntrees = getTotalEntreesCaisse();
  const totalSorties = getTotalSortiesCaisse();

  const typeColors = {
    'VENTE': 'bg-blue-100 text-blue-700',
    'FRAIS': 'bg-orange-100 text-orange-700',
    'PROVISION': 'bg-purple-100 text-purple-700',
    'TRANSFERT': 'bg-slate-100 text-slate-600',
  };

  const handleConfirmTx = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const libelle = formData.get('libelle');
    const txType = formData.get('type');
    const montant = parseFloat(formData.get('montant'));
    
    if (!libelle || !montant || montant <= 0) {
      alert('Remplissez tous les champs correctement.');
      return;
    }
    
    const finalMontant = modalType === 'entree' ? montant : -montant;
    dispatch({
      type: 'ADD_TRANSACTION',
      payload: { libelle, type: txType, montant: finalMontant }
    });
    setModalType(null);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <p className="text-[10px] uppercase font-black tracking-[0.2em] text-[#C9A227] mb-1">Module Trésorerie</p>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#002451]">Journal de Caisse</h2>
          <p className="text-slate-500 text-sm mt-1">Gestion des flux en temps réel — {state.periode.date}</p>
        </div>
        {!isCloture && (
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full md:w-auto">
            <button 
              onClick={() => setModalType('entree')}
              className="w-full sm:w-auto justify-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2"
            >
              <Icon name="add_circle" className="text-sm" /> Nouvelle Entrée
            </button>
            <button 
              onClick={() => setModalType('sortie')}
              className="w-full sm:w-auto justify-center px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2"
            >
              <Icon name="remove_circle" className="text-sm" /> Sortie de Caisse
            </button>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white p-5 rounded-2xl shadow-sm border-b-4 border-slate-300">
          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">Solde Initial</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#002451]">{fmtUSD(state.caisse.soldeInitial)}</span>
            <span className="text-xs font-bold text-slate-400">USD</span>
          </div>
          <div className="mt-3 flex items-center text-[10px] text-slate-500 font-semibold gap-1">
            <Icon name="history" className="text-xs" /> Report de la veille
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border-b-4 border-emerald-500">
          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">Total Entrées</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700">+{fmtUSD(totalEntrees)}</span>
            <span className="text-xs font-bold text-slate-400">USD</span>
          </div>
          <div className="mt-3 flex items-center text-[10px] text-emerald-600 font-semibold gap-1">
            <Icon name="trending_up" className="text-xs" /> {state.caisse.transactions.filter(t => t.montant > 0).length} transactions
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border-b-4 border-red-500">
          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">Total Sorties</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-red-600">{fmtUSD(totalSorties)}</span>
            <span className="text-xs font-bold text-slate-400">USD</span>
          </div>
          <div className="mt-3 flex items-center text-[10px] text-red-500 font-semibold gap-1">
            <Icon name="trending_down" className="text-xs" /> {state.caisse.transactions.filter(t => t.montant < 0).length} opérations
          </div>
        </div>
        <div className="bg-gradient-to-br from-[#1A3A6B] to-[#002451] p-5 rounded-2xl shadow-lg border-b-4 border-[#1A3A6B] text-white">
          <p className="text-[10px] uppercase font-bold tracking-wider text-blue-300 mb-2">Solde Actuel</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{fmtUSD(soldeActuel)}</span>
            <span className="text-xs font-bold text-blue-300">USD</span>
          </div>
          <div className="mt-3 flex items-center text-[10px] text-blue-200 font-semibold gap-1">
            <Icon name="account_balance" className="text-xs" /> En caisse physique
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Journal Table */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-50">
            <h3 className="font-bold text-[#002451] flex items-center gap-2">
              <Icon name="list_alt" className="text-[#C9A227]" />
              Transactions Récentes
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <th className="px-6 py-4">Date/Heure</th>
                  <th className="px-6 py-4">Libellé</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Montant USD</th>
                  <th className="px-6 py-4">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {state.caisse.transactions.length > 0 ? (
                  [...state.caisse.transactions].reverse().map((t) => {
                    const isEntree = t.montant > 0;
                    const isEnAttente = t.statut === 'EN_ATTENTE';
                    return (
                      <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-slate-500 text-xs whitespace-nowrap">{t.datetime}</td>
                        <td className="px-6 py-4 font-semibold text-[#002451] text-sm">{t.libelle}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${typeColors[t.type] || 'bg-slate-100 text-slate-600'}`}>
                            {t.type}
                          </span>
                        </td>
                        <td className={`px-6 py-4 font-black text-base ${isEntree ? 'text-emerald-700' : 'text-red-600'}`}>
                          {isEntree ? '+' : ''}{fmtUSD(t.montant)}
                        </td>
                        <td className="px-6 py-4">
                          <div className={`flex items-center gap-1.5 font-bold text-xs ${isEnAttente ? 'text-amber-600' : 'text-emerald-700'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isEnAttente ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                            {isEnAttente ? 'En attente' : 'Validé'}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400 text-sm">Aucune transaction</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-5">
          {/* Provisions */}
          <div className="p-6 rounded-2xl text-white relative overflow-hidden bg-gradient-to-br from-[#1A3A6B] to-[#002451]">
            <div className="flex justify-between items-start mb-5">
              <h4 className="font-bold tracking-tight">Provisions Gelées</h4>
              <Icon name="lock" className="opacity-60" />
            </div>
            <div className="space-y-4">
              {state.caisse.provisions.map((p) => {
                const pctUtil = Math.round((p.utilise / p.montant) * 100);
                return (
                  <div key={p.id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] uppercase font-bold text-blue-200">{p.libelle}</span>
                      <span className="text-sm font-bold text-white">{fmtUSD(p.montant)}</span>
                    </div>
                    <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden mb-1">
                      <div className="bg-[#ffe08e] h-full rounded-full transition-all" style={{ width: `${pctUtil}%` }}></div>
                    </div>
                    {p.utilise < p.montant && (
                      <p className="text-[10px] text-blue-200 text-right">Reste: {fmtUSD(p.montant - p.utilise)}</p>
                    )}
                  </div>
                );
              })}
            </div>
            {!isCloture && (
              <button className="w-full mt-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-bold text-xs transition-all">
                Gérer les Provisions
              </button>
            )}
          </div>

          {/* Conformité */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <Icon name="shield" className="text-[#1A3A6B]" fill={true} />
              </div>
              <h4 className="font-bold text-[#002451] text-sm">Contrôle de Conformité</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Toutes les transactions supérieures à <strong>$500</strong> nécessitent une validation du Responsable Financier.
            </p>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[10px] font-bold py-2 border-b border-slate-50">
                <span className="text-slate-500 uppercase">Dernier Inventaire</span>
                <span className="text-[#002451]">Aujourd'hui, 08:00</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold py-2 border-b border-slate-50">
                <span className="text-slate-500 uppercase">Écart de Caisse</span>
                <span className="text-emerald-600">0.00 USD (OK)</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold py-3 mt-1">
                <span className="text-slate-500 uppercase">Solde Théorique</span>
                <span className="text-[#002451] font-black text-sm">{fmtUSD(soldeActuel)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {modalType && (
        <Modal
          title={modalType === 'entree' ? 'Nouvelle Entrée' : 'Sortie de Caisse'}
          icon={modalType === 'entree' ? 'payments' : 'money_off'}
          onClose={() => setModalType(null)}
          footer={
            <>
              <button 
                onClick={() => setModalType(null)}
                className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Annuler
              </button>
              <button 
                form="tx-form"
                type="submit"
                className={`w-full sm:w-auto justify-center px-6 py-2.5 text-white text-sm font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-all flex items-center gap-2 ${
                  modalType === 'entree' ? 'bg-emerald-600' : 'bg-red-600'
                }`}
              >
                <Icon name={modalType === 'entree' ? 'add_circle' : 'remove_circle'} className="text-sm" />
                Enregistrer
              </button>
            </>
          }
        >
          <form id="tx-form" onSubmit={handleConfirmTx} className="space-y-4">
            <div className={`p-3 rounded-lg ${modalType === 'entree' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'} flex items-center gap-2`}>
              <Icon name={modalType === 'entree' ? 'add_circle' : 'remove_circle'} className="text-lg" />
              <span className="text-sm font-bold">{modalType === 'entree' ? 'Nouvelle entrée de fonds' : 'Sortie de caisse'}</span>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Libellé</label>
              <input name="libelle" type="text" placeholder={modalType === 'entree' ? 'Ex: Versement Vendeur' : 'Ex: Carburant'} className="w-full bg-slate-50 border-b-2 border-slate-200 p-2 focus:border-[#C9A227] outline-none text-sm font-semibold" required autoFocus />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Type</label>
              <select name="type" className="w-full bg-slate-50 border-b-2 border-slate-200 p-2 focus:border-[#C9A227] outline-none text-sm font-semibold">
                {modalType === 'entree'
                  ? <><option>VENTE</option><option>TRANSFERT</option></>
                  : <><option>FRAIS</option><option>PROVISION</option><option>TRANSFERT</option></>}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Montant (USD)</label>
              <input name="montant" type="number" min="0.01" step="0.01" placeholder="0.00" className="w-full bg-slate-50 border-b-2 border-slate-200 p-2 focus:border-[#C9A227] outline-none text-sm font-semibold" required />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Caisse;
