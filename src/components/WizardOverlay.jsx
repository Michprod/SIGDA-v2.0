import React, { useState, useEffect } from 'react';
import { useAppState } from '../context/StateContext';
import { fmtUSD, fmtQty } from '../utils/formatters';
import { Icon, VendeurBadge, StatutBadge } from './Common';

const WizardOverlay = ({ onClose }) => {
  const { state, dispatch, getSoldeActuelCaisse, getVendeursReconcilies } = useAppState();
  const [etape, setEtape] = useState(state.wizard.etapeActuelle || 1);
  const [soldePhysique, setSoldePhysique] = useState(state.wizard.soldeFisique !== null ? state.wizard.soldeFisique : getSoldeActuelCaisse());
  const [justificationEcart, setJustificationEcart] = useState(state.wizard.justificationEcart || '');
  const [password, setPassword] = useState('');

  const steps = [
    { n: 1, label: 'Validation Stocks', icon: 'inventory_2' },
    { n: 2, label: 'Validation Vendeurs', icon: 'groups' },
    { n: 3, label: 'Arrêté de Caisse', icon: 'account_balance_wallet' },
    { n: 4, label: 'Rapport Final', icon: 'assessment' },
    { n: 5, label: 'Signature', icon: 'history_edu' },
  ];

  useEffect(() => {
    // Sync local etape to state
    dispatch({
      type: 'LOAD_STATE',
      payload: {
        ...state,
        wizard: {
          ...state.wizard,
          etapeActuelle: etape
        }
      }
    });
  }, [etape]);

  const handleNext = () => {
    if (etape === 3) {
      dispatch({
        type: 'LOAD_STATE',
        payload: {
          ...state,
          wizard: {
            ...state.wizard,
            soldeFisique: soldePhysique,
            justificationEcart: justificationEcart
          }
        }
      });
    }

    if (etape === 2) {
      const nonReconcilies = state.vendeurs.filter(v => v.statut === 'EN_ATTENTE');
      if (nonReconcilies.length > 0) {
        if (!window.confirm(`${nonReconcilies.length} vendeur(s) non réconcilié(s). Continuer quand même ?`)) return;
      }
    }

    if (etape < 5) {
      setEtape(etape + 1);
    }
  };

  const handlePrev = () => {
    if (etape > 1) {
      setEtape(etape - 1);
    }
  };

  const handleSceller = () => {
    if (!password) {
      alert('Entrez le mot de passe de scellement.');
      return;
    }
    if (password !== 'admin123') {
      alert('Mot de passe incorrect.');
      return;
    }
    
    dispatch({
      type: 'SIGNER_CLOTURE',
      payload: {
        soldePhysique,
        justificationEcart
      }
    });
    onClose();
  };

  const renderStep1 = () => (
    <div className="animate-in fade-in duration-300">
      <h3 className="text-xl font-black text-[#002451] mb-2">Validation du Bilan de Stock</h3>
      <p className="text-slate-500 text-sm mb-6">Vérifiez que les chiffres correspondent aux registres physiques.</p>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <th className="px-6 py-4">Produit</th>
              <th className="px-6 py-4 text-center">Stock Initial</th>
              <th className="px-6 py-4 text-center">Doté</th>
              <th className="px-6 py-4 text-center">Retours</th>
              <th className="px-6 py-4 text-center">Vendu Estimé</th>
              <th className="px-6 py-4 text-center">Valeur Théo.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {state.produits.map(p => {
              const totalDote = Object.values(state.dotations[p.id] || {}).reduce((a, b) => a + (parseInt(b) || 0), 0);
              const totalRetours = state.retours.filter(r => r.produitId === p.id).reduce((a, r) => a + r.quantite, 0);
              const soldEstime = totalDote - totalRetours;
              return (
                <tr key={p.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Icon name={p.icon} className="text-[#1A3A6B] text-sm" />
                      <span className="font-semibold text-sm">{p.nom}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-[#002451] text-sm">{fmtQty(p.stockDepot)}</td>
                  <td className="px-6 py-4 text-center font-bold text-sm">{fmtQty(totalDote)}</td>
                  <td className="px-6 py-4 text-center font-bold text-emerald-700 text-sm">{fmtQty(totalRetours)}</td>
                  <td className="px-6 py-4 text-center font-black text-[#002451] text-sm">{fmtQty(soldEstime)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-bold text-[#C9A227] text-sm">{fmtUSD(soldEstime * p.prixUnitaire)}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-5 p-4 bg-blue-50 rounded-xl flex items-center gap-3">
        <Icon name="info" className="text-blue-600" />
        <p className="text-sm text-blue-700">Ce tableau est figé. Aucune modification n'est possible à ce stade.</p>
      </div>
    </div>
  );

  const renderStep2 = () => {
    const allReconcilies = state.vendeurs.every(v => v.statut === 'RECONCILIEE');
    return (
      <div className="animate-in fade-in duration-300">
        <h3 className="text-xl font-black text-[#002451] mb-2">Validation des Vendeurs</h3>
        <p className="text-slate-500 text-sm mb-6">Confirmez que tous les vendeurs sont au statut RÉCONCILIÉE.</p>
        {!allReconcilies ? (
          <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
            <Icon name="warning" className="text-amber-600" fill={true} />
            <p className="text-sm text-amber-800 font-semibold">
              {state.vendeurs.filter(v => v.statut === 'EN_ATTENTE').length} vendeur(s) non réconcilié(s).
            </p>
          </div>
        ) : (
          <div className="mb-5 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
            <Icon name="check_circle" className="text-emerald-600" fill={true} />
            <p className="text-sm text-emerald-800 font-semibold">Tous les vendeurs sont réconciliés. ✓</p>
          </div>
        )}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="px-6 py-4">Vendeur</th>
                <th className="px-6 py-4 text-center">Théorique</th>
                <th className="px-6 py-4 text-center">Réel</th>
                <th className="px-6 py-4 text-center">Écart</th>
                <th className="px-6 py-4 text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {state.vendeurs.map(v => {
                const isOk = v.statut === 'RECONCILIEE';
                const ecartClass = !isOk ? 'text-slate-300' : v.ecart < -0.01 ? 'text-red-600' : 'text-emerald-600';
                return (
                  <tr key={v.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <VendeurBadge initiales={v.initiales} colorClass={v.colorClass} />
                        <span className="font-semibold text-sm">{v.nom}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-[#002451] text-sm">{fmtUSD(v.caisseTheorique)}</td>
                    <td className="px-6 py-4 text-center font-bold text-sm text-emerald-700">{isOk ? fmtUSD(v.caisseSaisie) : '--'}</td>
                    <td className={`px-6 py-4 text-center font-bold text-sm ${ecartClass}`}>{isOk ? (v.ecart >= 0 ? '+' : '') + fmtUSD(v.ecart) : '--'}</td>
                    <td className="px-6 py-4 text-center"><StatutBadge statut={v.statut} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderStep3 = () => {
    const soldeTheorique = getSoldeActuelCaisse();
    const ecart = soldePhysique - soldeTheorique;
    const isEquilibre = Math.abs(ecart) < 0.01;
    const ecartColor = isEquilibre ? 'text-[#C9A227]' : ecart > 0 ? 'text-emerald-600' : 'text-red-600';

    return (
      <div className="animate-in fade-in duration-300">
        <h3 className="text-xl font-black text-[#002451] mb-2">Arrêté de Caisse</h3>
        <p className="text-slate-500 text-sm mb-6">Entrez le solde physique compté manuellement en coffre.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Solde Théorique Calculé</label>
              <p className="text-3xl font-black text-[#002451]">{fmtUSD(soldeTheorique)}</p>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Solde Physique (Compté)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0"
                  value={soldePhysique}
                  onChange={(e) => setSoldePhysique(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border-0 border-b-2 border-slate-200 focus:border-[#C9A227] focus:ring-0 pl-8 py-3 text-xl font-black text-[#002451] rounded-t-xl outline-none transition-colors"
                  autoFocus
                />
              </div>
              <p className="text-[10px] text-slate-400 italic">Montant total compté physiquement en coffre.</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl p-8 bg-gradient-to-br from-[#fffbf0] to-white relative overflow-hidden h-full min-h-[220px]">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Calcul de l'Écart</label>
            <div className={`text-6xl font-black ${ecartColor} tracking-tighter transition-all`}>
              {ecart >= 0 ? '+' : ''}{fmtUSD(ecart)}
            </div>
            <div className={`mt-6 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
              isEquilibre ? 'bg-[#ffe08e]/20 text-[#755b00] border-[#C9A227]/30' : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              {isEquilibre ? '⚖ ÉQUILIBRE PARFAIT' : '⚠ ÉCART DÉTECTÉ'}
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-tight">
              <Icon name="description" className="text-slate-400" />
              Justification de l'écart
            </label>
            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${
              isEquilibre ? 'bg-slate-100 text-slate-500' : 'bg-red-100 text-red-700'
            }`}>
              {isEquilibre ? 'Optionnel' : 'Obligatoire'}
            </span>
          </div>
          <textarea 
            rows="3"
            value={justificationEcart}
            onChange={(e) => setJustificationEcart(e.target.value)}
            className="w-full bg-slate-50 border-0 border-b-2 border-slate-200 p-3 focus:border-[#C9A227] outline-none text-sm font-medium resize-none rounded-t-xl transition-colors"
            placeholder="Si un écart est constaté, merci de détailler les raisons (erreur de saisie, perte, etc.)..."
          ></textarea>
        </div>
      </div>
    );
  };

  const renderStep4 = () => {
    const CA = state.vendeurs.filter(v => v.statut === 'RECONCILIEE').reduce((s, v) => s + v.caisseSaisie, 0);
    const solde = soldePhysique;
    const reconciliesCount = state.vendeurs.filter(v => v.statut === 'RECONCILIEE').length;

    return (
      <div className="animate-in fade-in duration-300">
        <h3 className="text-xl font-black text-[#002451] mb-2">Rapport Final de Clôture</h3>
        <p className="text-slate-500 text-sm mb-6">Résumé de la journée du {state.periode.date} — {state.periode.site}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-blue-50/50 text-center border border-blue-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">CA Journée</p>
            <p className="text-xl font-black text-[#1A3A6B]">{fmtUSD(CA)}</p>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50 text-center border border-emerald-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Vendeurs Réconciliés</p>
            <p className="text-xl font-black text-emerald-700">{reconciliesCount}/{state.vendeurs.length}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 text-center border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Solde Caisse</p>
            <p className="text-xl font-black text-[#002451]">{fmtUSD(solde)}</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-50 text-center border border-amber-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Retours</p>
            <p className="text-xl font-black text-[#755b00]">{state.retours.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Icon name="description" className="text-[#C9A227]" fill={true} />
            <h4 className="font-bold text-[#002451]">Rapport de Clôture — Référence: RPT-{new Date().toISOString().slice(0, 10).replace(/-/g, '')}</h4>
          </div>
          <div className="space-y-4 text-sm text-slate-600">
            <div className="flex justify-between py-2 border-b border-slate-50">
              <span className="font-semibold">Site</span><span>{state.periode.site}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-50">
              <span className="font-semibold">Date Comptable</span><span>{state.periode.date}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-50">
              <span className="font-semibold">Administrateur</span><span>{state.periode.admin}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-50">
              <span className="font-semibold">Chiffre d'Affaires</span><span className="font-black text-[#002451] font-bold text-base">{fmtUSD(CA)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-50">
              <span className="font-semibold">Solde Final de Caisse</span><span className="font-black text-[#002451] font-bold text-base">{fmtUSD(solde)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-semibold">Écart de Caisse</span><span className={`font-black text-base font-bold ${Math.abs(soldePhysique - getSoldeActuelCaisse()) < 0.01 ? 'text-emerald-600' : 'text-red-600'}`}>{fmtUSD(soldePhysique - getSoldeActuelCaisse())}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStep5 = () => (
    <div className="animate-in fade-in duration-300 text-center space-y-8 max-w-md mx-auto py-4">
      <div className="relative inline-block">
        <div className="p-8 rounded-full bg-[#C9A227]/10 border-4 border-[#C9A227]/20 flex items-center justify-center">
          <Icon name="lock" className="text-6xl text-[#C9A227]" fill={true} />
        </div>
        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
          <Icon name="check" className="text-white text-xl font-black" />
        </div>
      </div>
      <div>
        <h3 className="text-3xl font-extrabold text-[#002451] mb-3">Signature & Scellement</h3>
        <p className="text-slate-500 text-sm leading-relaxed">
          Vous allez sceller la journée comptable du <strong className="text-[#002451]">{state.periode.date}</strong>.<br />
          Cette action est <strong className="text-red-600 uppercase tracking-widest font-black ml-1">irréversible</strong>.
        </p>
      </div>
      <div className="p-5 bg-red-50 border-l-4 border-red-500 rounded-2xl text-left">
        <div className="flex items-start gap-3">
          <Icon name="warning" className="text-red-600 mt-0.5" fill={true} />
          <p className="text-sm text-red-800 leading-relaxed font-medium">
            <strong>Avertissement :</strong> Toutes les écritures seront verrouillées. Aucune modification ne sera possible sans audit système.
          </p>
        </div>
      </div>
      <div className="space-y-6 text-left">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Responsable Clôture</label>
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-3 rounded-xl opacity-60">
             <Icon name="person" className="text-slate-400" />
             <span className="text-sm font-bold text-[#002451]">{state.periode.admin}</span>
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mot de passe de scellement</label>
          <div className="relative">
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-100 border-0 border-b-2 border-slate-300 p-3 focus:border-[#002451] focus:ring-0 rounded-t-xl outline-none transition-colors font-black text-xl tracking-widest"
              autoFocus
            />
            <Icon name="key" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Mot de passe démo : <strong className="text-slate-600">admin123</strong></p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 max-h-[90vh]">
        
        {/* Header */}
        <div className="px-10 py-7 flex items-center justify-between bg-gradient-to-r from-[#002451] to-[#1A3A6B]">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10">
              <Icon name="lock_clock" className="text-white text-2xl" />
            </div>
            <div>
              <h2 className="text-white font-extrabold text-xl">Processus de Clôture Journalière — {state.periode.date}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.2em]">SIGDA v2.0 • Session Sécurisée</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-all w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10">
            <Icon name="close" className="text-2xl" />
          </button>
        </div>

        {/* Stepper */}
        <div className="px-10 py-8 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-start gap-4 max-w-3xl mx-auto">
            {steps.map((st, i) => {
              const done = st.n < etape;
              const active = st.n === etape;
              const pending = st.n > etape;
              return (
                <React.Fragment key={st.n}>
                  <div className="flex flex-col items-center gap-3 flex-shrink-0 z-10">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                      done ? 'bg-emerald-500 text-white shadow-emerald-200 shadow-lg' : 
                      active ? 'bg-[#002451] text-white shadow-blue-200 shadow-lg' : 
                      'bg-white text-slate-300 border-2 border-slate-100'
                    }`}>
                      <Icon name={done ? 'check' : st.icon} className="text-lg" fill={done || active} />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest text-center max-w-[80px] leading-tight ${
                      active ? 'text-[#002451]' : 'text-slate-400'
                    }`}>
                      {st.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="flex-1 mt-5 h-1 relative overflow-hidden bg-slate-200 rounded-full">
                      <div className={`h-full bg-emerald-500 transition-all duration-700 ${done ? 'w-full' : 'w-0'}`}></div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-10 py-10 scrollbar-thin">
          {etape === 1 && renderStep1()}
          {etape === 2 && renderStep2()}
          {etape === 3 && renderStep3()}
          {etape === 4 && renderStep4()}
          {etape === 5 && renderStep5()}
        </div>

        {/* Footer */}
        <div className="px-10 py-7 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          {etape > 1 ? (
            <button 
              onClick={handlePrev} 
              className="flex items-center gap-2 px-6 py-3 text-[#1A3A6B] font-black text-xs uppercase tracking-widest hover:bg-slate-200/50 rounded-2xl transition-all"
            >
              <Icon name="arrow_back" className="text-sm" /> Précédent
            </button>
          ) : (
            <button 
              onClick={onClose} 
              className="flex items-center gap-2 px-6 py-3 text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-100 rounded-2xl transition-all"
            >
              <Icon name="close" className="text-sm" /> Annuler
            </button>
          )}

          <div className="flex items-center gap-6">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] hidden md:block">Étape {etape} / 5</span>
            {etape < 5 ? (
              <button 
                onClick={handleNext} 
                className="bg-gradient-to-r from-[#002451] to-[#1A3A6B] text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center gap-3"
              >
                Continuer <Icon name="arrow_forward" className="text-sm" />
              </button>
            ) : (
              <button 
                onClick={handleSceller}
                className="bg-emerald-600 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center gap-3 shadow-emerald-200"
              >
                <Icon name="history_edu" className="text-sm" fill={true} /> Sceller la Journée
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Security badge at the bottom */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white/5 backdrop-blur-xl px-6 py-2.5 rounded-full border border-white/10 shadow-2xl">
        <Icon name="security" className="text-white text-base" fill={true} />
        <span className="text-white text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Encryption AES-256 Actif</span>
      </div>
    </div>
  );
};

export default WizardOverlay;
