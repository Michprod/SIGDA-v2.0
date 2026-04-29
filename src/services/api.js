import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://seagreen-finch-981371.hostingersite.com/api/v2',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

// ── Injecter le token sur chaque requête ──
api.interceptors.request.use(config => {
    const token = localStorage.getItem('sigda_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// ── Gérer les 401 sans boucle ──
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('sigda_token');
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const apiService = {

    // ── AUTH ────────────────────────────────────────────────────
    login: async (email, password) => {
        const response = await api.post('/login', { email, password });
        if (response.data.token) localStorage.setItem('sigda_token', response.data.token);
        return response.data;
    },
    logout: async () => {
        await api.post('/logout');
        localStorage.removeItem('sigda_token');
    },
    me: async () => {
        const response = await api.get('/me');
        return response.data;
    },

    // ── SYNC GLOBAL ─────────────────────────────────────────────
    sync: async () => {
        const response = await api.get('/sync');
        return response.data;
    },

    // ── PÉRIODES ────────────────────────────────────────────────
    getPeriodes: ()          => api.get('/periodes').then(r => r.data),
    getPeriodeDetail: (id)   => api.get(`/periodes/${id}`).then(r => r.data),

    /**
     * Ouvrir une nouvelle période journalière.
     * @param {object} payload
     *   - date_exploitation    : 'YYYY-MM-DD'
     *   - solde_initial_caisse : number (FC)
     *   - vendeur_ids          : string[]
     *   - objectif_ca          : number (optionnel)
     */
    ouvrirPeriode: (payload) => api.post('/periodes', payload).then(r => r.data),

    cloturerPeriode: (periodeId, payload) =>
        api.post(`/periodes/${periodeId}/cloture`, payload).then(r => r.data),

    // ── SITES ───────────────────────────────────────────────────
    getSites:  ()     => api.get('/sites').then(r => r.data),
    saveSite:  (data) => data.id
        ? api.patch(`/sites/${data.id}`, data).then(r => r.data)
        : api.post('/sites', data).then(r => r.data),

    // ── VENDEURS ────────────────────────────────────────────────
    getVendeurs:          ()     => api.get('/vendeurs').then(r => r.data),
    getVendeurHistorique: (id)   => api.get(`/vendeurs/${id}/historique`).then(r => r.data),
    saveVendeur:          (data) => data.id
        ? api.patch(`/vendeurs/${data.id}`, data).then(r => r.data)
        : api.post('/vendeurs', data).then(r => r.data),

    // ── PRODUITS ────────────────────────────────────────────────
    getProduits:  ()     => api.get('/produits').then(r => r.data),
    saveProduit:  (data) => data.id
        ? api.patch(`/produits/${data.id}`, data).then(r => r.data)
        : api.post('/produits', data).then(r => r.data),

    /**
     * Mettre à jour uniquement le stock dépôt d'un produit.
     * @param {string} produitId
     * @param {number} stock_depot_central
     */
    updateStockProduit: (produitId, stock_depot_central) =>
        api.patch(`/produits/${produitId}/stock`, { stock_depot_central }).then(r => r.data),

    // ── UTILISATEURS ────────────────────────────────────────────
    getUsers:  ()     => api.get('/users').then(r => r.data),
    saveUser:  (data) => data.id
        ? api.patch(`/users/${data.id}`, data).then(r => r.data)
        : api.post('/users', data).then(r => r.data),

    // ── AUDIT ───────────────────────────────────────────────────
    getAuditLogs: ()  => api.get('/audit-logs').then(r => r.data),

    // ── OPERATIONS ──────────────────────────────────────────────
    allouerDotation: (sessionVendeurId, produitId, quantite) =>
        api.post('/dotations/allouer', { session_vendeur_id: sessionVendeurId, produit_id: produitId, quantite }).then(r => r.data),

    ajouterRetour: (sessionVendeurId, produitId, quantite, motif) =>
        api.post('/retours', { session_vendeur_id: sessionVendeurId, produit_id: produitId, quantite, motif }).then(r => r.data),

    reconcilierSession: (sessionId, caisseSaisie) =>
        api.post(`/sessions/${sessionId}/reconcilier`, { caisse_saisie: caisseSaisie }).then(r => r.data),

    cloturePeriode: (periodeId, soldePhysique, justification) =>
        api.post(`/periodes/${periodeId}/cloture`, { solde_physique: soldePhysique, justification }).then(r => r.data),

    exportPeriode: (periodeId) =>
        api.get(`/periodes/${periodeId}/export`, { responseType: 'blob' }).then(r => r.data),
};

export default api;
