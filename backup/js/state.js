// ============================================================
// SIGDA v2.0 — State Management + localStorage Persistence
// ============================================================

const STORAGE_KEY = 'sigda_v2_state';

const DEFAULT_STATE = {
  periode: {
    date: '20 Octobre 2026',
    dateISO: '2026-10-20',
    statut: 'OUVERTE', // OUVERTE | EN_CLOTURE | CLOTUREE | VERROUILLEE
    site: 'Kinshasa Central',
    admin: 'Jean-Marc Bakulu',
    adminRole: 'Chef de Site',
    objectifCA: 180000,
  },

  produits: [
    { id: 'P001', nom: 'Yaourt Vanille 125g', categorie: 'Frais / Crémerie', icon: 'icecream', prixUnitaire: 0.80, stockDepot: 1250 },
    { id: 'P002', nom: 'Yaourt Fraise 125g',  categorie: 'Frais / Crémerie', icon: 'icecream', prixUnitaire: 0.80, stockDepot: 980  },
    { id: 'P003', nom: 'Jus d\'Orange 33cl',  categorie: 'Boisson / Pur Jus', icon: 'local_drink', prixUnitaire: 1.20, stockDepot: 840  },
    { id: 'P004', nom: 'Jus d\'Ananas 1L',    categorie: 'Boisson',          icon: 'local_drink', prixUnitaire: 2.50, stockDepot: 560  },
  ],

  vendeurs: [
    { id: 'V01', nom: 'Alain B.',  initiales: 'AB', colorClass: 'blue',   statut: 'RECONCILIEE', stockDepart: 450, retours: 12, caisseSaisie: 1240.00, caisseTheorique: 1240.00, ecart: 0,     commission: 0.05 },
    { id: 'V02', nom: 'Sarah M.',  initiales: 'SM', colorClass: 'amber',  statut: 'EN_ATTENTE',  stockDepart: 380, retours: 0,  caisseSaisie: 0,       caisseTheorique: 980.50,  ecart: null,  commission: 0.05 },
    { id: 'V03', nom: 'David K.',  initiales: 'DK', colorClass: 'emerald',statut: 'RECONCILIEE', stockDepart: 500, retours: 5,  caisseSaisie: 1850.00, caisseTheorique: 1850.00, ecart: 0,     commission: 0.05 },
    { id: 'V04', nom: 'Pierre L.', initiales: 'PL', colorClass: 'slate',  statut: 'RECONCILIEE', stockDepart: 420, retours: 20, caisseSaisie: 1100.00, caisseTheorique: 1100.00, ecart: 0,     commission: 0.05 },
    { id: 'V05', nom: 'Marie T.',  initiales: 'MT', colorClass: 'purple', statut: 'EN_ATTENTE',  stockDepart: 300, retours: 0,  caisseSaisie: 0,       caisseTheorique: 750.00,  ecart: null,  commission: 0.05 },
  ],

  dotations: {
    // produitId -> { vendeurId -> quantite }
    'P001': { 'V01': 300, 'V02': 250, 'V03': 400, 'V04': 200, 'V05': 100 },
    'P002': { 'V01': 150, 'V02': 100, 'V03': 200, 'V04': 150, 'V05': 80  },
    'P003': { 'V01': 120, 'V02': 120, 'V03': 240, 'V04': 180, 'V05': 90  },
    'P004': { 'V01': 80,  'V02': 60,  'V03': 100, 'V04': 80,  'V05': 50  },
  },

  retours: [
    { id: 'R001', vendeurId: 'V01', produitId: 'P001', quantite: 12, motif: 'Invendu', date: '2026-10-20 17:30' },
    { id: 'R002', vendeurId: 'V03', produitId: 'P003', quantite: 5,  motif: 'Casse',   date: '2026-10-20 17:45' },
    { id: 'R003', vendeurId: 'V04', produitId: 'P002', quantite: 20, motif: 'Invendu', date: '2026-10-20 18:00' },
  ],

  approvisionnements: [
    { id: 'A001', produitId: 'P001', quantite: 500, fournisseur: 'Usine Centrale', date: '2026-10-20 06:00', reference: 'LIV-2026-089' },
    { id: 'A002', produitId: 'P003', quantite: 300, fournisseur: 'Usine Centrale', date: '2026-10-20 06:30', reference: 'LIV-2026-090' },
  ],

  caisse: {
    soldeInitial: 4250.00,
    transactions: [
      { id: 'T001', datetime: '20/10 09:42', libelle: 'Vente Comptoir #8421',          type: 'VENTE',  montant: +450.00, statut: 'VALIDE'     },
      { id: 'T002', datetime: '20/10 10:15', libelle: 'Paiement Facture #F90',          type: 'VENTE',  montant: +1200.00,statut: 'VALIDE'     },
      { id: 'T003', datetime: '20/10 11:30', libelle: 'Achat Fournitures Bureau',       type: 'FRAIS',  montant: -85.50,  statut: 'VALIDE'     },
      { id: 'T004', datetime: '20/10 13:05', libelle: 'Approvisionnement Carburant',    type: 'FRAIS',  montant: -150.00, statut: 'EN_ATTENTE' },
      { id: 'T005', datetime: '20/10 14:20', libelle: 'Versement Vendeur Alain B.',     type: 'VENTE',  montant: +192.50, statut: 'VALIDE'     },
    ],
    provisions: [
      { id: 'PR001', libelle: 'Fond de Caisse',      montant: 500.00, utilise: 500.00 },
      { id: 'PR002', libelle: 'Provision Carburant', montant: 350.00, utilise: 175.00 },
    ],
  },

  checklist: [
    { id: 'C01', label: 'Réconciliation des stocks vendeurs',  statut: 'OK'          },
    { id: 'C02', label: 'Validation des retours produits',     statut: 'OK'          },
    { id: 'C03', label: 'Saisie des ventes comptant',         statut: 'OK'          },
    { id: 'C04', label: 'Clôture des sessions de caisse',     statut: 'OK'          },
    { id: 'C05', label: 'Validation des notes de frais',      statut: 'OK'          },
    { id: 'C06', label: 'Pointage des crédits clients',       statut: 'OK'          },
    { id: 'C07', label: 'Écarts de caisse justifiés',         statut: 'BLOQUANT'    },
    { id: 'C08', label: 'Dépôts bancaires saisis',            statut: 'AVERTISSEMENT'},
    { id: 'C09', label: 'Inventaire final validé',            statut: 'BLOQUANT'    },
  ],

  wizard: {
    etapeActuelle: 1,
    etapesValidees: [],
    soldeFisique: null,
    justificationEcart: '',
  },

  network: {
    objectifAnnuel: 250000,
    caAnnuelAtteint: 180000,
    sites: [
      { id: 'KN',  nom: 'Kinshasa Nord',  responsable: 'Jean Kabeya',  statut: 'CLOTUREE',   volumeJour: 12450, retard: 0   },
      { id: 'KS',  nom: 'Kinshasa Sud',   responsable: 'Marie Tumba',  statut: 'EN_RETARD',  volumeJour: 0,     retard: 1   },
      { id: 'LUB', nom: 'Lubumbashi',     responsable: 'Marc Luba',    statut: 'EN_CLOTURE', volumeJour: 0,     progression: 85 },
      { id: 'GMA', nom: 'Goma',           responsable: 'Aimé Bizu',    statut: 'CLOTUREE',   volumeJour: 8920,  retard: 0   },
    ],
  },

  audit: [
    { id: 'AU001', datetime: '24 Oct 2026\n14:32:11', site: 'ALPHA-01', admin: 'Jean Dupont',   initiales: 'JD', motif: 'Erreur saisie inventaire - Correction manuelle de la quantité sur palette #882.', statut: 'TRACE' },
    { id: 'AU002', datetime: '24 Oct 2026\n12:15:04', site: 'BETA-04',  admin: 'Marie S.',      initiales: 'MS', motif: 'Ajustement caisse après panne réseau - Synchronisation forcée des terminaux.',       statut: 'TRACE' },
    { id: 'AU003', datetime: '24 Oct 2026\n09:44:56', site: 'MAIN-WH',  admin: 'Robert King',   initiales: 'RK', motif: 'Déverrouillage quai de chargement suite à faux positif capteur de sécurité.',        statut: 'TRACE' },
    { id: 'AU004', datetime: '23 Oct 2026\n18:20:12', site: 'ALPHA-02', admin: 'Jean Dupont',   initiales: 'JD', motif: 'Réinitialisation d\'urgence mot de passe superviseur site distant.',                  statut: 'TRACE' },
    { id: 'AU005', datetime: '23 Oct 2026\n11:05:33', site: 'KN-01',    admin: 'Admin SIGDA',   initiales: 'AS', motif: 'Ouverture manuelle de la journée J-2 après blocage système.',                        statut: 'TRACE' },
    { id: 'AU006', datetime: '22 Oct 2026\n16:48:22', site: 'LUB-03',   admin: 'Marc Luba',     initiales: 'ML', motif: 'Correction d\'écart de stock suite à vol constaté (plainte déposée).',               statut: 'TRACE' },
  ],

  rapports: [
    { id: 'RPT001', titre: 'Clôture Journalière - 19 Oct 2026', type: 'CLOTURE',   date: '2026-10-19', statut: 'SIGNE',    taille: '248 KB' },
    { id: 'RPT002', titre: 'Clôture Journalière - 18 Oct 2026', type: 'CLOTURE',   date: '2026-10-18', statut: 'SIGNE',    taille: '231 KB' },
    { id: 'RPT003', titre: 'Rapport Hebdomadaire S42',          type: 'HEBDO',     date: '2026-10-18', statut: 'SIGNE',    taille: '1.2 MB' },
    { id: 'RPT004', titre: 'Clôture Journalière - 17 Oct 2026', type: 'CLOTURE',   date: '2026-10-17', statut: 'SIGNE',    taille: '219 KB' },
    { id: 'RPT005', titre: 'Rapport d\'Audit - Réseau Q3',      type: 'AUDIT',     date: '2026-10-01', statut: 'SIGNE',    taille: '3.4 MB' },
    { id: 'RPT006', titre: 'Rapport de Conformité ISO',         type: 'CONFORMITE',date: '2026-10-01', statut: 'EN_COURS', taille: '--'     },
  ],
};

// ---- Persistence ----
function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge with defaults to handle new fields
      return deepMerge(DEFAULT_STATE, parsed);
    }
  } catch (e) {
    console.warn('SIGDA: Failed to load state from localStorage', e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(window.SIGDA_STATE));
  } catch (e) {
    console.warn('SIGDA: Failed to save state to localStorage', e);
  }
}

function resetState() {
  window.SIGDA_STATE = JSON.parse(JSON.stringify(DEFAULT_STATE));
  saveState();
}

function deepMerge(defaults, overrides) {
  const result = JSON.parse(JSON.stringify(defaults));
  for (const key in overrides) {
    if (overrides[key] !== null && typeof overrides[key] === 'object' && !Array.isArray(overrides[key])) {
      result[key] = deepMerge(result[key] || {}, overrides[key]);
    } else {
      result[key] = overrides[key];
    }
  }
  return result;
}

// ---- Computed getters ----
function getCAJour() {
  const state = window.SIGDA_STATE;
  return state.vendeurs.filter(v => v.statut === 'RECONCILIEE').reduce((sum, v) => sum + v.caisseSaisie, 0);
}

function getVendeursReconcilies() {
  return window.SIGDA_STATE.vendeurs.filter(v => v.statut === 'RECONCILIEE').length;
}

function getTotalVendeurs() {
  return window.SIGDA_STATE.vendeurs.length;
}

function getStockTotalDispo() {
  return window.SIGDA_STATE.produits.reduce((sum, p) => sum + p.stockDepot, 0);
}

function getSoldeActuelCaisse() {
  const state = window.SIGDA_STATE;
  const totalTransactions = state.caisse.transactions.reduce((sum, t) => sum + t.montant, 0);
  return state.caisse.soldeInitial + totalTransactions;
}

function getTotalEntreesCaisse() {
  return window.SIGDA_STATE.caisse.transactions.filter(t => t.montant > 0).reduce((sum, t) => sum + t.montant, 0);
}

function getTotalSortiesCaisse() {
  return window.SIGDA_STATE.caisse.transactions.filter(t => t.montant < 0).reduce((sum, t) => sum + t.montant, 0);
}

function isClotureBloquee() {
  return window.SIGDA_STATE.checklist.some(c => c.statut === 'BLOQUANT');
}

function getChecklistBloquants() {
  return window.SIGDA_STATE.checklist.filter(c => c.statut === 'BLOQUANT').length;
}

function updateChecklistFromState() {
  // C07: Écarts de caisse justifiés → OK si tous vendeurs reconciliés sans écart
  const vendeursAvecEcart = window.SIGDA_STATE.vendeurs.filter(v => v.statut === 'RECONCILIEE' && Math.abs(v.ecart || 0) > 0);
  const vendeursEnAttente = window.SIGDA_STATE.vendeurs.filter(v => v.statut === 'EN_ATTENTE');
  
  const c07 = window.SIGDA_STATE.checklist.find(c => c.id === 'C07');
  const c09 = window.SIGDA_STATE.checklist.find(c => c.id === 'C09');
  
  if (c07) c07.statut = (vendeursEnAttente.length === 0 && vendeursAvecEcart.length === 0) ? 'OK' : 'BLOQUANT';
  if (c09) c09.statut = vendeursEnAttente.length === 0 ? 'OK' : 'BLOQUANT';
  
  saveState();
}

// ---- Mutations ----
function reconcilierVendeur(vendeurId, caisseSaisie) {
  const vendeur = window.SIGDA_STATE.vendeurs.find(v => v.id === vendeurId);
  if (!vendeur) return;
  vendeur.caisseSaisie = parseFloat(caisseSaisie) || 0;
  vendeur.ecart = vendeur.caisseSaisie - vendeur.caisseTheorique;
  vendeur.statut = 'RECONCILIEE';
  updateChecklistFromState();
  saveState();
}

function setStatutPeriode(statut) {
  window.SIGDA_STATE.periode.statut = statut;
  saveState();
}

function addTransaction(libelle, type, montant) {
  const now = new Date();
  const datetime = `${now.getDate().toString().padStart(2,'0')}/${(now.getMonth()+1).toString().padStart(2,'0')} ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
  const id = 'T' + Date.now();
  window.SIGDA_STATE.caisse.transactions.push({ id, datetime, libelle, type, montant: parseFloat(montant), statut: 'VALIDE' });
  saveState();
}

function updateDotation(produitId, vendeurId, quantite) {
  if (!window.SIGDA_STATE.dotations[produitId]) window.SIGDA_STATE.dotations[produitId] = {};
  window.SIGDA_STATE.dotations[produitId][vendeurId] = parseInt(quantite) || 0;
  saveState();
}

function addRetour(vendeurId, produitId, quantite, motif) {
  const id = 'R' + Date.now();
  const date = new Date().toISOString().replace('T', ' ').substring(0, 16);
  window.SIGDA_STATE.retours.push({ id, vendeurId, produitId, quantite: parseInt(quantite), motif, date });
  saveState();
}

function signerCloture(soldePhysique, justification) {
  window.SIGDA_STATE.wizard.soldeFisique = parseFloat(soldePhysique);
  window.SIGDA_STATE.wizard.justificationEcart = justification || '';
  setStatutPeriode('CLOTUREE');
  // Add to rapports
  const now = new Date();
  window.SIGDA_STATE.rapports.unshift({
    id: 'RPT' + Date.now(),
    titre: `Clôture Journalière - ${window.SIGDA_STATE.periode.date}`,
    type: 'CLOTURE',
    date: window.SIGDA_STATE.periode.dateISO,
    statut: 'SIGNE',
    taille: '252 KB'
  });
  saveState();
}

// ---- Init ----
window.SIGDA_STATE = loadState();
window.SIGDA = {
  state: window.SIGDA_STATE,
  save: saveState,
  reset: resetState,
  getCAJour,
  getVendeursReconcilies,
  getTotalVendeurs,
  getStockTotalDispo,
  getSoldeActuelCaisse,
  getTotalEntreesCaisse,
  getTotalSortiesCaisse,
  isClotureBloquee,
  getChecklistBloquants,
  updateChecklistFromState,
  reconcilierVendeur,
  setStatutPeriode,
  addTransaction,
  updateDotation,
  addRetour,
  signerCloture,
};

console.log('SIGDA v2.0 State initialized:', window.SIGDA_STATE.periode.statut);
