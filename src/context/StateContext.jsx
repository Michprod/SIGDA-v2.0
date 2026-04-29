import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { apiService } from '../services/api';

const StateContext = createContext();

/* ─────────────────────────────────────────────
   État vide — aucune donnée mock
   Tout vient de l'API
───────────────────────────────────────────── */
const EMPTY_STATE = {
  isLoading: true,
  error: null,
  periode: null,
  produits: [],
  vendeurs: [],
  dotations: {},
  retours: [],
  caisse: {
    soldeInitial: 0,
    transactions: [],
    provisions: [],
  },
  checklist: [
    { id: 'C01', label: 'Dotations matinales complètes',   module: 'Stocks',   statut: 'EN_ATTENTE' },
    { id: 'C02', label: 'Retours invendus enregistrés',    module: 'Stocks',   statut: 'EN_ATTENTE' },
    { id: 'C03', label: 'Bilan stock équilibré',           module: 'Stocks',   statut: 'EN_ATTENTE' },
    { id: 'C04', label: 'Toutes sessions RECONCILIEE',     module: 'Vendeurs', statut: 'BLOQUANT'   },
    { id: 'C05', label: 'Écarts vendeurs confirmés',       module: 'Vendeurs', statut: 'EN_ATTENTE' },
    { id: 'C06', label: 'Solde physique caisse saisi',     module: 'Caisse',   statut: 'EN_ATTENTE' },
    { id: 'C07', label: 'Écart global de caisse justifié', module: 'Caisse',   statut: 'EN_ATTENTE' },
  ],
  wizard: { etapeActuelle: 1, etapesValidees: [], soldeFisique: null, justificationEcart: '' },
  network: { sites: [] },
  audit: [],
  rapports: [],
  approvisionnements: [],
};

/* ─────────────────────────────────────────────
   Recalcul dynamique de la checklist
───────────────────────────────────────────── */
const recomputeChecklist = (state) => {
  const vendeurs   = state.vendeurs || [];
  const enAttente  = vendeurs.filter(v => v.statut === 'EN_ATTENTE').length;
  const avecEcart  = vendeurs.filter(v => v.statut === 'RECONCILIEE' && Math.abs(v.ecart || 0) > 1).length;
  const hasDot     = Object.keys(state.dotations || {}).length > 0;
  const hasRetours = (state.retours || []).length > 0;

  return (state.checklist || []).map(c => {
    if (c.id === 'C01') return { ...c, statut: hasDot      ? 'OK' : 'EN_ATTENTE' };
    if (c.id === 'C02') return { ...c, statut: hasRetours   ? 'OK' : 'EN_ATTENTE' };
    if (c.id === 'C03') return { ...c, statut: hasDot      ? 'OK' : 'EN_ATTENTE' };
    if (c.id === 'C04') return { ...c, statut: vendeurs.length > 0 && enAttente === 0 ? 'OK' : 'BLOQUANT' };
    if (c.id === 'C05') return { ...c, statut: avecEcart === 0 ? 'OK' : 'EN_ATTENTE' };
    return c;
  });
};

/* ─────────────────────────────────────────────
   Reducer
───────────────────────────────────────────── */
function stateReducer(state, action) {
  let newState;

  switch (action.type) {

    /* ── Chargement depuis l'API ── */
    case 'LOAD_API_DATA': {
      const data = action.payload;
      if (!data || !data.periode) {
        // Pas de période active → état vide, non-chargement
        return { ...EMPTY_STATE, isLoading: false, error: data === null ? null : 'Aucune période active trouvée.' };
      }

      const mappedProduits = (data.produits || []).map(p => ({
        id: p.id,
        nom: p.nom,
        categorie: p.categorie,
        prixUnitaire: parseFloat(p.prix_unitaire) || 0,
        stockDepot: parseInt(p.stock_depot_central) || 0,
        icon: 'inventory_2',
      }));

      const mappedVendeurs = (data.sessions || []).map(s => {
        let computedCaisseTheorique = 0;
        
        (s.dotations || []).forEach(d => {
           const prod = (data.produits || []).find(p => p.id === d.produit_id);
           if (prod) computedCaisseTheorique += d.quantite * (parseFloat(prod.prix_unitaire) || 0);
        });
        
        (s.retours || []).forEach(r => {
           const prod = (data.produits || []).find(p => p.id === r.produit_id);
           if (prod) computedCaisseTheorique -= r.quantite * (parseFloat(prod.prix_unitaire) || 0);
        });

        const backendTheorique = parseFloat(s.caisse_theorique) || 0;
        const caisseTheorique = s.statut === 'RECONCILIEE' ? backendTheorique : computedCaisseTheorique;

        return {
          sessionId: s.id,
          id: s.vendeur?.id,
          nom: s.vendeur?.nom || 'Inconnu',
          initiales: s.vendeur?.initiales || (s.vendeur?.nom || 'XX').slice(0, 2).toUpperCase(),
          colorClass: 'blue',
          statut: s.statut,
          caisseSaisie: parseFloat(s.caisse_saisie_reelle) || 0,
          caisseTheorique: caisseTheorique,
          ecart: s.ecart ?? null,
          commission: parseFloat(s.vendeur?.taux_commission) || 0.05,
          stockDepart: 0,
          retours: 0,
        };
      });

      const mappedDotations = {};
      const mappedRetours = [];
      (data.sessions || []).forEach(s => {
        (s.dotations || []).forEach(d => {
          if (!mappedDotations[d.produit_id]) mappedDotations[d.produit_id] = {};
          mappedDotations[d.produit_id][s.vendeur?.id] = d.quantite;
        });
        (s.retours || []).forEach(r => {
          mappedRetours.push({
            id: r.id || 'R' + Date.now() + Math.random(),
            vendeurId: s.vendeur?.id,
            produitId: r.produit_id,
            quantite: r.quantite,
            motif: r.motif || 'Invendu',
            date: r.created_at ? new Date(r.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          });
        });
      });

      newState = {
        ...EMPTY_STATE,
        isLoading: false,
        error: null,
        periode: {
          id: data.periode.id,
          date: data.periode.date_exploitation,
          statut: data.periode.statut,
          site: data.periode.site?.nom || data.periode.site || '—',
          admin: data.currentUser?.name || data.periode.admin?.name || data.periode.admin || 'Admin',
          adminRole: data.currentUser?.role || 'Administrateur',
          soldeInitial: parseFloat(data.periode.solde_initial_caisse) || 0,
        },
        produits: mappedProduits,
        vendeurs: mappedVendeurs,
        dotations: mappedDotations,
        retours: mappedRetours,
        caisse: {
          soldeInitial: parseFloat(data.periode.solde_initial_caisse) || 0,
          transactions: (data.transactions || []).map(t => ({
            id: t.id,
            datetime: new Date(t.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            libelle: t.libelle,
            type: t.type,
            montant: parseFloat(t.montant),
            statut: 'VALIDE',
          })),
          provisions: data.provisions || [],
        },
      };
      break;
    }

    /* ── Statut période ── */
    case 'SET_STATUT_PERIODE':
      newState = { ...state, periode: { ...state.periode, statut: action.payload } };
      break;

    /* ── Réconciliation vendeur ── */
    case 'RECONCILIER_VENDEUR':
      newState = {
        ...state,
        vendeurs: state.vendeurs.map(v => {
          if (v.id !== action.payload.vendeurId) return v;
          const cs = parseFloat(action.payload.caisseSaisie) || 0;
          return { ...v, caisseSaisie: cs, ecart: cs - v.caisseTheorique, statut: 'RECONCILIEE' };
        }),
      };
      break;

    /* ── Transaction caisse ── */
    case 'ADD_TRANSACTION':
      newState = {
        ...state,
        caisse: {
          ...state.caisse,
          transactions: [
            ...state.caisse.transactions,
            {
              id: 'T' + Date.now(),
              datetime: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
              libelle: action.payload.libelle,
              type:    action.payload.type,
              montant: parseFloat(action.payload.montant),
              statut:  'VALIDE',
            }
          ]
        }
      };
      break;

    /* ── Dotation ── */
    case 'UPDATE_DOTATION':
      newState = {
        ...state,
        dotations: {
          ...state.dotations,
          [action.payload.produitId]: {
            ...(state.dotations[action.payload.produitId] || {}),
            [action.payload.vendeurId]: parseInt(action.payload.quantite) || 0,
          }
        }
      };
      break;

    /* ── Retour produit ── */
    case 'ADD_RETOUR':
      newState = {
        ...state,
        retours: [
          ...state.retours,
          {
            id: 'R' + Date.now(),
            vendeurId:  action.payload.vendeurId,
            produitId:  action.payload.produitId,
            quantite:   parseInt(action.payload.quantite) || 0,
            motif:      action.payload.motif || 'Invendu',
            date:       new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          }
        ]
      };
      break;

    /* ── Clôture ACID ── */
    case 'SIGNER_CLOTURE':
      newState = {
        ...state,
        periode: { ...state.periode, statut: 'CLOTUREE' },
        wizard:  { ...state.wizard, soldeFisique: action.payload.soldePhysique, justificationEcart: action.payload.justificationEcart },
      };
      break;

    /* ── Chargement brut ── */
    case 'LOAD_STATE':
      newState = action.payload;
      break;

    /* ── Reset ── */
    case 'RESET_STATE':
      return { ...EMPTY_STATE };

    default:
      return state;
  }

  // Recalcul dynamique de la checklist
  newState = { ...newState, checklist: recomputeChecklist(newState) };
  return newState;
}

/* ─────────────────────────────────────────────
   Provider
───────────────────────────────────────────── */
export const StateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(stateReducer, { ...EMPTY_STATE });

  useEffect(() => {
    const token = localStorage.getItem('sigda_token');
    if (!token) {
      dispatch({ type: 'LOAD_API_DATA', payload: null });
      return;
    }

    let mounted = true;

    // Timeout de 15 secondes pour éviter tout gel (serveur local parfois lent)
    const timeout = setTimeout(() => {
      if (mounted) {
        console.warn('Sync timeout — backend injoignable ou très lent.');
        // Ne pas supprimer le token tout de suite pour éviter une déco intempestive en local
        // On redirige juste vers /login ou on affiche une erreur
      }
    }, 15000);

    Promise.all([apiService.sync(), apiService.me()])
      .then(([data, user]) => {
        clearTimeout(timeout);
        if (mounted) dispatch({ type: 'LOAD_API_DATA', payload: { ...data, currentUser: user } });
      })
      .catch(err => {
        clearTimeout(timeout);
        console.warn('Erreur sync:', err.message);
        if (mounted) {
          // Si 401 : token invalide → retour login
          if (err.response?.status === 401) {
            localStorage.removeItem('sigda_token');
            window.location.href = '/login';
          } else {
            dispatch({ type: 'LOAD_API_DATA', payload: null });
          }
        }
      });

    return () => { mounted = false; clearTimeout(timeout); };
  }, []);

  /* ── Sélecteurs ── */
  const getCAJour              = () => (state.vendeurs || []).filter(v => v.statut === 'RECONCILIEE').reduce((s, v) => s + v.caisseSaisie, 0);
  const getVendeursReconcilies = () => (state.vendeurs || []).filter(v => v.statut === 'RECONCILIEE').length;
  const getTotalVendeurs       = () => (state.vendeurs || []).length;
  const getStockTotalDispo     = () => (state.produits || []).reduce((s, p) => s + p.stockDepot, 0);
  const getSoldeActuelCaisse   = () => {
    const tx = (state.caisse?.transactions || []).reduce((s, t) => s + t.montant, 0);
    return (state.caisse?.soldeInitial || 0) + tx;
  };
  const getTotalEntreesCaisse  = () => (state.caisse?.transactions || []).filter(t => t.montant > 0).reduce((s, t) => s + t.montant, 0);
  const getTotalSortiesCaisse  = () => (state.caisse?.transactions || []).filter(t => t.montant < 0).reduce((s, t) => s + t.montant, 0);
  const isClotureBloquee       = () => (state.checklist || []).some(c => c.statut === 'BLOQUANT');
  const getChecklistBloquants  = () => (state.checklist || []).filter(c => c.statut === 'BLOQUANT').length;

  const value = {
    state, dispatch,
    getCAJour, getVendeursReconcilies, getTotalVendeurs,
    getStockTotalDispo, getSoldeActuelCaisse,
    getTotalEntreesCaisse, getTotalSortiesCaisse,
    isClotureBloquee, getChecklistBloquants,
  };

  return <StateContext.Provider value={value}>{children}</StateContext.Provider>;
};

export const useAppState = () => {
  const ctx = useContext(StateContext);
  if (!ctx) throw new Error('useAppState must be used within a StateProvider');
  return ctx;
};
