import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { fmtUSD } from '../utils/formatters';

const VendeurHistorique = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiService.getVendeurHistorique(id)
            .then(res => {
                setData(res);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Chargement de l'historique...</div>;
    if (!data) return <div style={{ padding: 40, textAlign: 'center' }}>Vendeur non trouvé</div>;

    const { vendeur, sessions } = data;

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <Link to="/vendeurs" style={{ 
                    width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E7EB',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: '#fff', color: '#6B7280', textDecoration: 'none'
                }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_back</span>
                </Link>
                <div>
                    <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1F2937', margin: 0 }}>Historique : {vendeur.nom}</h1>
                    <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Sessions des 30 derniers jours</p>
                </div>
            </div>

            <div className="card">
                <div className="card-body" style={{ padding: 0 }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date exploitation</th>
                                <th>CA Réel</th>
                                <th>CA Théorique</th>
                                <th>Écart</th>
                                <th>Rémunération</th>
                                <th>Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sessions.map(s => (
                                <tr key={s.id}>
                                    <td style={{ fontWeight: 600 }}>{s.periode.date_exploitation}</td>
                                    <td>{fmtUSD(s.caisse_saisie_reelle || 0)}</td>
                                    <td style={{ color: '#6B7280' }}>{fmtUSD(s.caisse_theorique || 0)}</td>
                                    <td style={{ color: (s.ecart || 0) < 0 ? '#C0392B' : '#2E7D52', fontWeight: 600 }}>
                                        {(s.ecart || 0) > 0 ? '+' : ''}{fmtUSD(s.ecart || 0)}
                                    </td>
                                    <td style={{ fontWeight: 700, color: '#1A3A6B' }}>{fmtUSD(s.remuneration_nette || 0)}</td>
                                    <td>
                                        <span className="sess-badge sess-recon" style={{ background: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600 }}>
                                            Réconcilié
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {sessions.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>
                                        Aucune session passée pour ce vendeur.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default VendeurHistorique;
