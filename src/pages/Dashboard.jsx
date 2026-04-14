import React from 'react';
import { useAppState } from '../context/StateContext';
import { fmtUSD, fmtQty, pct, getStatutConfig } from '../utils/formatters';
import { Icon, StatutBadge, VendeurBadge, CircularGauge, ChecklistIcon } from '../components/Common';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ onOpenWizard }) => {
  const { 
    state, 
    getCAJour, 
    getVendeursReconcilies, 
    getTotalVendeurs, 
    getStockTotalDispo, 
    getChecklistBloquants, 
    isClotureBloquee 
  } = useAppState();
  
  const navigate = useNavigate();

  const CA = getCAJour();
  const caPercent = pct(CA, state.periode.objectifCA);
  const reconcilies = getVendeursReconcilies();
  const totalV = getTotalVendeurs();
  const stockTotal = getStockTotalDispo();
  const bloquants = getChecklistBloquants();
  const clotureBloqueeValue = isClotureBloquee();
  const isCloture = ['CLOTUREE', 'VERROUILLEE'].includes(state.periode.statut);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#002451]">Tableau de Bord Journalier</h2>
        <p className="text-slate-500 font-medium mt-1">Aperçu de la gestion du site — {state.periode.site}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* CA Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-[#C9A227] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Chiffre d'Affaires</p>
            <h3 className="text-2xl font-black text-[#002451]">{fmtUSD(CA)} <span className="text-sm font-medium text-slate-400">USD</span></h3>
            <p className="text-xs font-semibold text-[#755b00] mt-2 flex items-center gap-1">
              <Icon name="trending_up" className="text-sm" />
              {caPercent}% de l'objectif ({fmtUSD(state.periode.objectifCA)})
            </p>
          </div>
          <CircularGauge pct={caPercent} />
        </div>

        {/* Vendeurs Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-emerald-500 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Vendeurs Réconciliés</p>
            <h3 className="text-2xl font-black text-[#002451]">{reconcilies} <span className="text-sm font-medium text-slate-400">/ {totalV}</span></h3>
            <span className="inline-flex items-center px-2 py-0.5 mt-2 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">
              {reconcilies < totalV ? `${totalV - reconcilies} EN ATTENTE` : '✓ TOUS RÉCONCILIÉS'}
            </span>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
            <Icon name="how_to_reg" className="text-2xl" fill={true} />
          </div>
        </div>

        {/* Stock Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-secondary flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Stock Total Dispo</p>
            <h3 className="text-2xl font-black text-[#002451]">{fmtQty(stockTotal)} <span className="text-sm font-medium text-slate-400">unités</span></h3>
            <p className="text-xs font-semibold text-slate-500 mt-2">Inventaire centralisé</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-secondary rounded-full flex items-center justify-center">
            <Icon name="inventory_2" className="text-2xl" fill={true} />
          </div>
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-12 gap-8 items-start">
        {/* Vendeurs Table */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
            <h4 className="font-bold text-[#002451] flex items-center gap-2">
              <span className="w-1.5 h-5 bg-[#C9A227] rounded-full"></span>
              Activité des Vendeurs
            </h4>
            <button 
              onClick={() => navigate('/vendeurs')}
              className="p-2 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200 text-slate-500 hover:text-[#002451]"
            >
              <Icon name="open_in_new" className="text-sm" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-6 py-3">Nom Vendeur</th>
                  <th className="px-6 py-3">Stock Départ</th>
                  <th className="px-6 py-3">Retours</th>
                  <th className="px-6 py-3">Caisse Théo.</th>
                  <th className="px-6 py-3">Statut</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {state.vendeurs.map((v) => {
                  const isReconcilie = v.statut === 'RECONCILIEE';
                  return (
                    <tr key={v.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <VendeurBadge initiales={v.initiales} colorClass={v.colorClass} />
                          <span className="font-semibold text-slate-700">{v.nom}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-sm">{fmtQty(v.stockDepart)} unités</td>
                      <td className="px-6 py-4 text-slate-600 text-sm">{v.retours > 0 ? `${fmtQty(v.retours)} unités` : '--'}</td>
                      <td className="px-6 py-4 font-bold text-[#002451] text-sm">{fmtUSD(v.caisseTheorique)}</td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-1.5 font-semibold text-sm ${isReconcilie ? 'text-emerald-700' : 'text-amber-600'}`}>
                          <Icon name={isReconcilie ? 'check_circle' : 'schedule'} className="text-base" fill={isReconcilie} />
                          {isReconcilie ? 'Réconcilié' : 'En attente'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {!isCloture && !isReconcilie && (
                          <button 
                            onClick={() => navigate('/vendeurs')}
                            className="text-xs font-bold text-[#2D6FAD] hover:underline flex items-center gap-1"
                          >
                            <Icon name="arrow_forward" className="text-sm" />
                            Réconcilier
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div className="col-span-12 lg:col-span-4 space-y-5">
          {/* Checklist */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h4 className="font-bold text-[#002451] mb-5 flex items-center gap-2 text-base">
              <Icon name="fact_check" className="text-[#C9A227]" />
              Checklist de Clôture
            </h4>
            <div className="space-y-3">
              {state.checklist.map((c) => {
                const blocking = c.statut === 'BLOQUANT';
                const warning = c.statut === 'AVERTISSEMENT';
                const extraClass = blocking ? 'bg-red-50 rounded-lg px-2 py-1 -mx-2' : warning ? 'bg-amber-50 rounded-lg px-2 py-1 -mx-2' : '';
                return (
                  <div key={c.id} className={`flex items-start gap-3 ${extraClass}`}>
                    <ChecklistIcon statut={c.statut} />
                    <span className={`text-sm font-medium ${blocking ? 'font-bold text-red-800' : ''}`}>{c.label}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 pt-5 border-t border-slate-100">
              {clotureBloqueeValue && !isCloture ? (
                <>
                  <button disabled className="w-full py-4 bg-slate-200 text-slate-400 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed uppercase tracking-wider">
                    <Icon name="lock" />
                    Initier la Clôture Journalière
                  </button>
                  <p className="text-[10px] text-center text-slate-400 mt-2 italic">{bloquants} point(s) bloquant(s) à corriger.</p>
                </>
              ) : isCloture ? (
                <div className="w-full py-4 bg-emerald-100 text-emerald-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2 uppercase tracking-wider">
                  <Icon name="verified" />
                  Journée Clôturée
                </div>
              ) : (
                <button 
                  onClick={onOpenWizard}
                  className="w-full py-4 bg-gradient-to-br from-[#1A3A6B] to-[#002451] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 uppercase tracking-wider shadow-lg hover:scale-[1.01] transition-all"
                >
                  <Icon name="lock_clock" />
                  Initier la Clôture Journalière
                </button>
              )}
            </div>
          </div>

          {/* Alert card */}
          <div className="rounded-2xl p-6 text-white relative overflow-hidden bg-gradient-to-br from-[#C9A227] to-[#a07d18]">
            <div className="absolute -right-4 -top-4 opacity-10">
              <Icon name="stars" className="text-[6rem]" fill={true} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest mb-3 opacity-70">Alerte Prioritaire</p>
            <h5 className="text-lg font-black mb-2 leading-tight">Vérification de Stock Requise</h5>
            <p className="text-xs opacity-90 mb-4">L'entrepôt signale un décalage sur le Jus d'Ananas 1L.</p>
            <button 
              onClick={() => navigate('/stocks')}
              className="px-4 py-2 bg-white/20 text-white border border-white/30 rounded-lg text-xs font-bold hover:bg-white/30 transition-all"
            >
              Vérifier maintenant
            </button>
          </div>
        </div>
      </div>

      {/* Floating status bar */}
      <div className="hidden md:flex fixed bottom-6 left-72 z-30 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg border border-slate-200 items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        Sync Cloud · OK · Il y a 2 min
      </div>
    </div>
  );
};

export default Dashboard;
