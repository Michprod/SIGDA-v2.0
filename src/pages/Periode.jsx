import React from 'react';
import { useAppState } from '../context/StateContext';

/* ── Reusable page section card ── */
const Card = ({ title, subtitle, children, action }) => (
  <div className="card">
    {title && (
      <div className="card-head">
        <div>
          <div className="card-title">{title}</div>
          {subtitle && <div className="card-sub">{subtitle}</div>}
        </div>
        {action}
      </div>
    )}
    <div className="card-body">{children}</div>
  </div>
);

const STATUT_INFO = {
  OUVERTE: {
    badge: 'badge-open',
    label: '⬤ Journée OUVERTE',
    desc: 'Toutes les saisies sont autorisées. Stocks, vendeurs, caisse.',
    items: [
      'Dotation autorisée — tant que la session vendeur n\'est pas RECONCILIEE.',
      'Transition vers EN_CLÔTURE uniquement si 100 % des prérequis satisfaits.',
      'Une seule période OUVERTE par site à la fois.',
    ],
  },
  EN_CLOTURE: {
    badge: 'badge-closing',
    label: '⏳ EN CLÔTURE',
    desc: 'Saisies suspendues. Wizard 5 étapes actif.',
    items: [
      'Toutes les saisies standards sont bloquées.',
      'L\'admin peut annuler → retour à OUVERTE sans perte de données.',
      'En cas de panne : ROLLBACK complet, retour EN_CLÔTURE.',
    ],
  },
  CLOTUREE: {
    badge: 'badge-closed',
    label: '🔓 CLÔTURÉE',
    desc: 'Protégée — lecture seule. PDF archivé.',
    items: [
      'Aucune écriture possible depuis l\'interface standard.',
      'Le Super Admin peut déverrouiller avec justification obligatoire.',
      'La période J+1 a déjà été créée automatiquement.',
    ],
  },
  VERROUILLEE: {
    badge: 'badge-locked',
    label: '🔒 VERROUILLÉE',
    desc: 'État final irréversible. Audit uniquement.',
    items: [
      'Accessible uniquement en lecture pour audit et exports.',
      'Aucune transition possible, même pour le Super Admin.',
      'Données requêtables pour reporting historique.',
    ],
  },
};

const TIMELINE = [
  { time: '00h01', statut: 'open',  title: 'Ouverture automatique (J+1)',   desc: 'Créée par la clôture de J-1. Stock initial et solde d\'ouverture reportés.' },
  { time: '06h–08h',statut:'open',  title: 'Approvisionnement',             desc: 'Saisie du bon de livraison. Incrémente le stock disponible du site.' },
  { time: '07h–09h',statut:'open',  title: 'Dotation matinale',             desc: 'Attribution qty/vendeur/produit. Crée les sessions au statut EN_ATTENTE.' },
  { time: '09h–17h',statut:'open',  title: 'Tournée de vente',              desc: 'Vendeurs en activité. Checklist se met à jour en temps réel.' },
  { time: '17h–19h',statut:'open',  title: 'Réconciliation vendeurs',       desc: 'Saisie retours + encaissement réel. Sessions passent à RECONCILIEE.' },
  { time: '18h–20h',statut:'open',  title: 'Saisie Hors-Produit',          desc: 'Frais fixes, provisions, opérations de caisse.' },
  { time: '20h–21h',statut:'close', title: 'Initiation clôture (Étapes 01–04)', desc: 'Admin vérifie 9/9 conditions. Saisies suspendues. Cristallisation stocks, vendeurs.' },
  { time: '21h15',  statut:'closed',title: 'Signature + Ouverture J+1 (Étape 05)', desc: 'Transaction atomique : clôture J + création J+1 avec reports.' },
];

const Periode = () => {
  const { state } = useAppState();
  const { periode } = state;
  if (!periode) return null;

  const info = STATUT_INFO[periode.statut] || STATUT_INFO.OUVERTE;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ marginBottom: 4 }}>
         <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1A3A6B', margin: 0 }}>Période d'Exploitation</h1>
         <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0' }}>Supervision du cycle de vie de la journée en cours</p>
      </div>

      {/* En-tête état courant */}
      <div className="card">
        <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <span className={`status-badge ${info.badge}`} style={{ fontSize: 13, padding: '6px 14px' }}>
            {info.label}
          </span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#1F2937' }}>{info.desc}</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
              {periode.date} · {periode.site}
            </div>
          </div>
        </div>
      </div>

      <div className="two-col">
        {/* Machine à états */}
        <Card title="Machine à états" subtitle="Cliquez pour voir les règles de transition">
          {['OUVERTE','EN_CLOTURE','CLOTUREE','VERROUILLEE'].map((s, i) => {
            const si = STATUT_INFO[s];
            const isCurrent = periode.statut === s;
            return (
              <div key={s}>
                {i > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 0', color: '#9CA3AF', fontSize: 11 }}>
                    <div style={{ width: 1, height: 12, background: '#E5E7EB' }} />
                    <span>↓</span>
                  </div>
                )}
                <div
                  style={{
                    border: isCurrent ? '1.5px solid #1A3A6B' : '1px solid #E5E7EB',
                    borderRadius: 8,
                    padding: '12px 14px',
                    background: isCurrent ? '#EEF3FB' : '#fff',
                    marginBottom: 2,
                  }}
                >
                  <span className={`status-badge ${si.badge}`} style={{ fontSize: 11, marginBottom: 6, display: 'inline-flex' }}>
                    {si.label}
                  </span>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1F2937' }}>
                    {s === 'OUVERTE' ? 'Journée en cours' : s === 'EN_CLOTURE' ? 'Clôture en cours' : s === 'CLOTUREE' ? 'Protégée — lecture seule' : 'Archivée — audit uniquement'}
                  </div>
                  <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>{si.desc}</div>
                  {isCurrent && (
                    <ul style={{ marginTop: 8, paddingLeft: 16, fontSize: 11, color: '#6B7280', lineHeight: 1.7 }}>
                      {si.items.map((it, j) => <li key={j}>{it}</li>)}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </Card>

        {/* Timeline journée type */}
        <Card title="Journée type" subtitle="Déroulé chronologique standard">
          <div style={{ position: 'relative' }}>
            {TIMELINE.map((tl, i) => {
              const dotColor = tl.statut === 'close' ? '#E67E22' : tl.statut === 'closed' ? '#2D6FAD' : '#2E7D52';
              return (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '60px 16px 1fr', gap: '0 10px', marginBottom: 6, alignItems: 'start' }}>
                  <div style={{ fontSize: 10, color: '#9CA3AF', paddingTop: 14, textAlign: 'right', lineHeight: 1.3 }}>{tl.time}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: dotColor, marginTop: 15, flexShrink: 0 }} />
                    {i < TIMELINE.length - 1 && <div style={{ width: 1, flex: 1, minHeight: 8, background: '#E5E7EB' }} />}
                  </div>
                  <div style={{ border: '0.5px solid #E5E7EB', borderRadius: 6, padding: '8px 12px', marginTop: 6, background: '#fff' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: dotColor, marginBottom: 2 }}>
                      {tl.statut === 'close' ? 'EN_CLÔTURE' : tl.statut === 'closed' ? 'CLÔTURÉE' : 'OUVERTE'}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#1F2937' }}>{tl.title}</div>
                    <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{tl.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 6, borderLeft: '3px solid #1A3A6B', background: '#EEF3FB', fontSize: 11, color: '#374151', lineHeight: 1.6 }}>
            <strong>Règle fondamentale :</strong> Aucun batch nocturne. La journée J+1 n'existe que si la clôture de J a été signée par un administrateur authentifié.
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Periode;
