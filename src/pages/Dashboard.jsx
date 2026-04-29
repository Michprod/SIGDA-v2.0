import React from 'react';
import { useAppState } from '../context/StateContext';
import { fmtUSD } from '../utils/formatters';

/* ─── Checklist config (statut vient du state, pas hardcodé ici) ─── */
const CHECKLIST_DEF = [
  { id: 'C01', label: 'Dotations matinales complètes',   module: 'Stocks'   },
  { id: 'C02', label: 'Retours invendus enregistrés',    module: 'Stocks'   },
  { id: 'C03', label: 'Bilan stock équilibré',           module: 'Stocks'   },
  { id: 'C04', label: 'Toutes sessions RECONCILIEE',     module: 'Vendeurs' },
  { id: 'C05', label: 'Écarts vendeurs confirmés',       module: 'Vendeurs' },
  { id: 'C06', label: 'Solde physique caisse saisi',     module: 'Caisse'   },
  { id: 'C07', label: 'Écart global de caisse justifié', module: 'Caisse'   },
];

/* ─── Explanation du solde caisse ─── */
const SoldeExplain = ({ solde, soldeInitial, entrees, sorties }) => (
  <div style={{ fontSize: 11, color: '#6B7280', lineHeight: 1.6, marginTop: 4 }}>
    <strong style={{ color: '#1F2937' }}>Solde initial : </strong>{fmtUSD(soldeInitial)}<br />
    <strong style={{ color: '#2E7D52' }}>+ Entrées (réconciliations) : </strong>{fmtUSD(entrees)}<br />
    <strong style={{ color: '#C0392B' }}>− Sorties (frais) : </strong>{fmtUSD(Math.abs(sorties))}<br />
    <strong style={{ color: '#1A3A6B' }}>= Solde théorique : </strong>{fmtUSD(solde)}
  </div>
);

const Dashboard = () => {
  const {
    state, dispatch,
    getCAJour, getVendeursReconcilies, getTotalVendeurs,
    getStockTotalDispo, getSoldeActuelCaisse,
    getTotalEntreesCaisse, getTotalSortiesCaisse,
    isClotureBloquee, getChecklistBloquants,
  } = useAppState();

  const { periode, vendeurs = [], checklist = [], produits = [], isLoading, error } = state;

  /* ── État de chargement ── */
  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12, color: '#6B7280' }}>
        <span className="material-symbols-outlined" style={{ fontSize: 36, opacity: 0.3 }}>sync</span>
        <span style={{ fontSize: 14 }}>Chargement des données...</span>
      </div>
    );
  }

  /* ── Aucune période active ── */
  if (!periode) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 360, gap: 16, textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: 16, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 36, color: '#9CA3AF' }}>event_busy</span>
        </div>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1F2937', margin: 0 }}>Aucune période active</h2>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '6px 0 0' }}>
            Aucune journée d'exploitation n'est ouverte sur ce site.<br />
            Créez une nouvelle période via le menu <strong>Configuration → Période</strong>.
          </p>
        </div>
        <a href="/configuration" className="btn btn-primary">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add_circle</span>
          Ouvrir une nouvelle période
        </a>
      </div>
    );
  }

  const caJour             = getCAJour();
  const vendeursReconcilies = getVendeursReconcilies();
  const totalVendeurs       = getTotalVendeurs();
  const stockDispo          = getStockTotalDispo();
  const solde               = getSoldeActuelCaisse();
  const entrees             = getTotalEntreesCaisse();
  const sorties             = getTotalSortiesCaisse();
  const soldeInitial        = state.caisse?.soldeInitial || 0;
  const bloquants           = getChecklistBloquants();
  const bloquee             = isClotureBloquee();

  const vendeursEnAttente = vendeurs.filter(v => v.statut === 'EN_ATTENTE').length;

  /* Checklist depuis le state (plus de hardcode) */
  const clStates = CHECKLIST_DEF.map(c => {
    const saved = checklist.find(x => x.id === c.id);
    return { ...c, statut: saved?.statut || 'EN_ATTENTE' };
  });
  const nbOk = clStates.filter(c => c.statut === 'OK').length;
  const pct  = Math.round((nbOk / clStates.length) * 100);

  const handleInitierCloture = () => {
    if (!bloquee) dispatch({ type: 'SET_STATUT_PERIODE', payload: 'EN_CLOTURE' });
  };

  return (
    <div>
      {/* Alert strip */}
      {vendeursEnAttente > 0 && (
        <div className="alert-strip alert-warn">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>warning</span>
          <strong>{vendeursEnAttente} session{vendeursEnAttente > 1 ? 's' : ''} vendeur{vendeursEnAttente > 1 ? 's' : ''}</strong> en attente de réconciliation — clôture bloquée.
        </div>
      )}

      {/* KPIs */}
      <div className="kpi-grid">
        {/* CA Jour */}
        <div className="kpi-card">
          <div className="kpi-label">CA du jour</div>
          <div className="kpi-value">{fmtUSD(caJour)}</div>
          <div className="kpi-sub">Vendeurs réconciliés seulement</div>
        </div>

        {/* Vendeurs */}
        <div className="kpi-card">
          <div className="kpi-label">Vendeurs réconciliés</div>
          <div className="kpi-value">{vendeursReconcilies} <span style={{ fontSize: 14, color: '#6B7280', fontWeight: 400 }}>/ {totalVendeurs}</span></div>
          <div className={`kpi-sub ${vendeursEnAttente > 0 ? 'warn' : 'up'}`}>
            {vendeursEnAttente > 0 ? `${vendeursEnAttente} en attente` : 'Tous réconciliés ✓'}
          </div>
        </div>

        {/* Stock */}
        <div className="kpi-card">
          <div className="kpi-label">Stock disponible</div>
          <div className="kpi-value">{stockDispo.toLocaleString('fr-FR')} <span style={{ fontSize: 14, color: '#6B7280', fontWeight: 400 }}>u.</span></div>
          <div className="kpi-sub">
            {produits.length > 0 ? `${produits.length} produit(s) au dépôt` : 'Aucun produit configuré'}
          </div>
        </div>

        {/* Solde caisse */}
        <div className="kpi-card" style={{ position: 'relative', overflow: 'visible' }}>
          <div className="kpi-label">
            Solde caisse théorique
            <span title="Comment est calculé ce solde ?" style={{ marginLeft: 6, cursor: 'help', fontSize: 14, color: '#9CA3AF', verticalAlign: 'middle' }}>
              ⓘ
            </span>
          </div>
          <div className="kpi-value">{fmtUSD(solde)}</div>
          <div className="kpi-sub">= Solde initial + entrées − sorties</div>
          {/* Détail inline */}
          <SoldeExplain solde={solde} soldeInitial={soldeInitial} entrees={entrees} sorties={sorties} />
        </div>
      </div>

      {/* Two columns */}
      <div className="two-col">
        {/* Checklist clôture */}
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Prêt pour la clôture ?</div>
              <div className="card-sub">{nbOk} / {clStates.length} conditions satisfaites</div>
            </div>
          </div>
          <div className="card-body">
            <div className="cl-progress">
              <div className="cl-bar" style={{ width: `${pct}%` }} />
            </div>

            {clStates.map(c => {
              const isOk   = c.statut === 'OK';
              const isWarn = c.statut === 'AVERTISSEMENT';
              const icon   = isOk ? '✓' : isWarn ? '!' : '✗';
              const cls    = isOk ? 'ic-ok' : isWarn ? 'ic-warn' : 'ic-ko';
              return (
                <div key={c.id} className="cl-item">
                  <div className={`cl-icon ${cls}`}>{icon}</div>
                  <div>
                    <div className="cl-text">{c.label}</div>
                    <div className="cl-module">{c.module}</div>
                  </div>
                </div>
              );
            })}

            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <span style={{ fontSize: 11, color: bloquants > 0 ? '#6B7280' : '#2E7D52' }}>
                {bloquants > 0 ? `${bloquants} bloquante(s) restante(s)` : '✓ Prêt pour la clôture'}
              </span>
              <button
                onClick={handleInitierCloture}
                className={bloquants > 0 ? 'btn btn-disabled' : 'btn btn-primary'}
                disabled={bloquants > 0}
              >
                Initier la clôture {bloquants === 0 && '→'}
              </button>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Sessions vendeurs */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">Sessions vendeurs</div>
              <a href="/vendeurs" className="card-link">Voir tout →</a>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Vendeur</th>
                    <th>CA Réel</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {vendeurs.length > 0 ? vendeurs.slice(0, 6).map(v => (
                    <tr key={v.id}>
                      <td style={{ fontWeight: 600 }}>{v.nom}</td>
                      <td>{v.caisseSaisie > 0 ? fmtUSD(v.caisseSaisie) : '—'}</td>
                      <td>
                        <span className={`sess-badge ${v.statut === 'RECONCILIEE' ? 'sess-recon' : 'sess-wait'}`}>
                          {v.statut === 'RECONCILIEE' ? 'Réconcilié' : 'En attente'}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center', color: '#9CA3AF', padding: '20px 16px', fontSize: 13 }}>
                        Aucune session vendeur pour cette période.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Récapitulatif caisse */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">Récapitulatif Caisse</div>
            </div>
            <div className="card-body">
              {[
                { label: 'Solde d\'ouverture (coffre)', val: fmtUSD(soldeInitial), color: '#1F2937' },
                { label: '+ Encaissements vendeurs', val: fmtUSD(entrees > 0 ? entrees : 0), color: '#2E7D52' },
                { label: '− Frais et sorties', val: fmtUSD(Math.abs(sorties)), color: '#C0392B' },
                { label: '= Solde théorique actuel', val: fmtUSD(solde), color: '#1A3A6B', bold: true },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < 3 ? '1px dashed #F3F4F6' : 'none' }}>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>{r.label}</span>
                  <span style={{ fontSize: 13, fontWeight: r.bold ? 700 : 600, color: r.color }}>{r.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
