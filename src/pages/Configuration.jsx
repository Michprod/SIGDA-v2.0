import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

/* ── Modal générique ── */
const Modal = ({ title, onClose, children }) => (
  <div style={{ position:'fixed',inset:0,zIndex:9999,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',padding:16 }}>
    <div style={{ background:'#fff',borderRadius:12,width:'100%',maxWidth:520,boxShadow:'0 25px 60px rgba(0,0,0,0.2)',overflow:'hidden' }}>
      <div style={{ padding:'16px 20px',background:'#1A3A6B',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
        <span style={{ fontWeight:700,fontSize:15,color:'#fff' }}>{title}</span>
        <button onClick={onClose} style={{ border:'none',background:'transparent',color:'#fff',cursor:'pointer',fontSize:20,lineHeight:1 }}>×</button>
      </div>
      <div style={{ padding:24 }}>{children}</div>
    </div>
  </div>
);

const Field = ({ label, children }) => (
  <div style={{ marginBottom:14 }}>
    <label style={{ display:'block',fontSize:11,fontWeight:600,color:'#374151',textTransform:'uppercase',marginBottom:4 }}>{label}</label>
    {children}
  </div>
);

const Input = (props) => (
  <input {...props} style={{ width:'100%',padding:'9px 12px',border:'1px solid #E5E7EB',borderRadius:8,fontSize:14,outline:'none',boxSizing:'border-box',...props.style }} />
);

/* ════════════════════════════════════════
   ONGLET PÉRIODE
════════════════════════════════════════ */
const TabPeriode = ({ vendeurs }) => {
  const [date, setDate]       = useState(new Date().toISOString().slice(0,10));
  const [solde, setSolde]     = useState('');
  const [objectif, setObjectif] = useState('');
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggle = (id) => setSelected(s => s.includes(id) ? s.filter(x=>x!==id) : [...s,id]);

  const handleOuvrir = async () => {
    if (!solde || selected.length === 0) { 
      toast.error('Le solde initial et au moins un vendeur sont requis.');
      return; 
    }
    
    const loadId = toast.loading('Ouverture de la période...');
    setLoading(true);
    try {
      await apiService.ouvrirPeriode({
        date_exploitation: date,
        solde_initial_caisse: parseFloat(solde),
        vendeur_ids: selected,
        objectif_ca: objectif ? parseFloat(objectif) : 0,
      });
      toast.success('Période ouverte avec succès !', { id: loadId });
      // On peut déclencher un rechargement forcé du state via window.location si besoin
      setTimeout(() => window.location.reload(), 1000);
    } catch(e) {
      toast.error(e.response?.data?.message || 'Erreur lors de l\'ouverture de la période.', { id: loadId });
    } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth:560 }}>
      <div style={{ padding:14,background:'#EEF3FB',borderRadius:8,marginBottom:20,fontSize:13,color:'#1A3A6B',lineHeight:1.6 }}>
        <strong>Ouvrir une nouvelle journée d'exploitation.</strong><br/>
        Sélectionnez la date, le solde du coffre à l'ouverture, et les vendeurs qui participent aujourd'hui.
      </div>
      <Field label="Date d'exploitation">
        <Input type="date" value={date} onChange={e=>setDate(e.target.value)} />
      </Field>
      <Field label="Solde initial du coffre (FC)">
        <Input type="number" min="0" placeholder="ex: 500000" value={solde} onChange={e=>setSolde(e.target.value)} />
        <p style={{ fontSize:11,color:'#6B7280',marginTop:3 }}>Montant physique en caisse au début de la journée.</p>
      </Field>
      <Field label="Objectif CA du jour (FC) — optionnel">
        <Input type="number" min="0" placeholder="ex: 2500000" value={objectif} onChange={e=>setObjectif(e.target.value)} />
      </Field>
      <Field label={`Vendeurs participants (${selected.length} sélectionné(s))`}>
        <div style={{ display:'flex',flexDirection:'column',gap:8,padding:12,border:'1px solid #E5E7EB',borderRadius:8,maxHeight:200,overflowY:'auto' }}>
          {vendeurs.length === 0 && <span style={{ fontSize:13,color:'#9CA3AF' }}>Aucun vendeur actif. Ajoutez-en dans l'onglet Vendeurs.</span>}
          {vendeurs.map(v => (
            <label key={v.id} style={{ display:'flex',alignItems:'center',gap:10,cursor:'pointer',padding:'6px 8px',borderRadius:6,background: selected.includes(v.id)?'#EEF3FB':'transparent' }}>
              <input type="checkbox" checked={selected.includes(v.id)} onChange={()=>toggle(v.id)} />
              <span style={{ fontWeight:600,fontSize:13 }}>{v.nom}</span>
              <span style={{ fontSize:11,color:'#9CA3AF' }}>{v.initiales} · {(v.taux_commission*100).toFixed(0)}%</span>
            </label>
          ))}
        </div>
      </Field>
      {/* msg state was removed, toasts are used now */}
      <button onClick={handleOuvrir} disabled={loading} className="btn btn-primary" style={{ width:'100%' }}>
        {loading ? 'Ouverture en cours...' : '✦ Ouvrir la journée'}
      </button>
    </div>
  );
};

/* ════════════════════════════════════════
   ONGLET PRODUITS
════════════════════════════════════════ */
const TabProduits = ({ data, onRefresh }) => {
  const [editStock, setEditStock] = useState(null);
  const [stockVal, setStockVal]   = useState('');
  const [showAdd, setShowAdd]     = useState(false);
  const [form, setForm]           = useState({ nom:'',reference:'',categorie:'',prix_unitaire:'' });
  const [saving, setSaving]       = useState(false);

  const handleSaveStock = async () => {
    setSaving(true);
    try { 
      await apiService.updateStockProduit(editStock, parseInt(stockVal)||0); 
      onRefresh(); 
      setEditStock(null); 
      toast.success('Stock mis à jour');
    } catch(e) { 
      toast.error(e.response?.data?.message || 'Erreur lors de la mise à jour'); 
    } finally { setSaving(false); }
  };

  const handleAdd = async () => {
    setSaving(true);
    try { 
      await apiService.saveProduit(form); 
      onRefresh(); 
      setShowAdd(false); 
      setForm({ nom:'',reference:'',categorie:'',prix_unitaire:'' }); 
      toast.success('Produit ajouté');
    } catch(e) { 
      toast.error(e.response?.data?.message || 'Erreur lors de l\'ajout'); 
    } finally { setSaving(false); }
  };

  return (
    <>
      {editStock && (
        <Modal title="Mettre à jour le stock" onClose={()=>setEditStock(null)}>
          <Field label="Nouveau stock dépôt central (unités)">
            <Input type="number" min="0" autoFocus value={stockVal} onChange={e=>setStockVal(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSaveStock()} />
          </Field>
          <div style={{ display:'flex',gap:8,justifyContent:'flex-end' }}>
            <button className="btn btn-outline" onClick={()=>setEditStock(null)}>Annuler</button>
            <button className="btn btn-primary" onClick={handleSaveStock} disabled={saving}>Confirmer</button>
          </div>
        </Modal>
      )}
      {showAdd && (
        <Modal title="Nouveau produit" onClose={()=>setShowAdd(false)}>
          {['nom','reference','categorie'].map(k=>(
            <Field key={k} label={k.charAt(0).toUpperCase()+k.slice(1)}>
              <Input value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} placeholder={k==='reference'?'PRD-XXX-01':''} />
            </Field>
          ))}
          <Field label="Prix unitaire (FC)">
            <Input type="number" min="0" value={form.prix_unitaire} onChange={e=>setForm(f=>({...f,prix_unitaire:e.target.value}))} />
          </Field>
          <div style={{ display:'flex',gap:8,justifyContent:'flex-end' }}>
            <button className="btn btn-outline" onClick={()=>setShowAdd(false)}>Annuler</button>
            <button className="btn btn-primary" onClick={handleAdd} disabled={saving}>Créer</button>
          </div>
        </Modal>
      )}
      <div style={{ display:'flex',justifyContent:'flex-end',marginBottom:12 }}>
        <button className="btn btn-primary btn-sm" onClick={()=>setShowAdd(true)}>
          <span className="material-symbols-outlined" style={{fontSize:15}}>add</span> Nouveau produit
        </button>
      </div>
      <table className="data-table">
        <thead><tr><th>Référence</th><th>Désignation</th><th>Catégorie</th><th style={{textAlign:'right'}}>Prix (FC)</th><th style={{textAlign:'center'}}>Stock dépôt</th><th>Actions</th></tr></thead>
        <tbody>
          {data.length===0&&<tr><td colSpan={6} style={{textAlign:'center',color:'#9CA3AF',padding:20}}>Aucun produit. Créez-en un ci-dessus.</td></tr>}
          {data.map(p=>(
            <tr key={p.id}>
              <td style={{fontWeight:700,color:'#1A3A6B'}}>{p.reference}</td>
              <td style={{fontWeight:600}}>{p.nom}</td>
              <td>{p.categorie}</td>
              <td style={{textAlign:'right',fontWeight:600}}>{parseInt(p.prix_unitaire).toLocaleString('fr-FR')}</td>
              <td style={{textAlign:'center'}}>
                <span style={{fontWeight:700,color:p.stock_depot_central>0?'#2E7D52':'#C0392B'}}>{p.stock_depot_central||0}</span>
              </td>
              <td>
                <button className="btn btn-outline btn-sm" onClick={()=>{setEditStock(p.id);setStockVal(p.stock_depot_central||0);}}>
                  <span className="material-symbols-outlined" style={{fontSize:14}}>inventory</span> Stock
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

/* ════════════════════════════════════════
   ONGLET VENDEURS
════════════════════════════════════════ */
const TabVendeurs = ({ data, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ nom:'',initiales:'',taux_commission:'5' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiService.saveVendeur({ ...form, taux_commission: parseFloat(form.taux_commission)/100 });
      onRefresh(); 
      setShowModal(false); 
      setForm({ nom:'',initiales:'',taux_commission:'5' });
      toast.success('Vendeur créé avec succès');
    } catch(e) { 
      toast.error(e.response?.data?.message || 'Erreur lors de la création'); 
    } finally { setSaving(false); }
  };

  return (
    <>
      {showModal && (
        <Modal title="Nouveau vendeur" onClose={()=>setShowModal(false)}>
          <Field label="Nom complet"><Input autoFocus value={form.nom} onChange={e=>setForm(f=>({...f,nom:e.target.value}))} /></Field>
          <Field label="Initiales (3 lettres)"><Input value={form.initiales} maxLength={3} onChange={e=>setForm(f=>({...f,initiales:e.target.value.toUpperCase()}))} /></Field>
          <Field label="Commission (%)"><Input type="number" min="0" max="30" value={form.taux_commission} onChange={e=>setForm(f=>({...f,taux_commission:e.target.value}))} /></Field>
          <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
            <button className="btn btn-outline" onClick={()=>setShowModal(false)}>Annuler</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>Créer</button>
          </div>
        </Modal>
      )}
      <div style={{display:'flex',justifyContent:'flex-end',marginBottom:12}}>
        <button className="btn btn-primary btn-sm" onClick={()=>setShowModal(true)}>
          <span className="material-symbols-outlined" style={{fontSize:15}}>add</span> Nouveau vendeur
        </button>
      </div>
      <table className="data-table">
        <thead><tr><th>Initiales</th><th>Nom</th><th>Commission</th><th>Statut</th></tr></thead>
        <tbody>
          {data.length===0&&<tr><td colSpan={4} style={{textAlign:'center',color:'#9CA3AF',padding:20}}>Aucun vendeur. Créez-en un ci-dessus.</td></tr>}
          {data.map(v=>(
            <tr key={v.id}>
              <td><div style={{width:32,height:32,borderRadius:'50%',background:'#EEF3FB',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#1A3A6B'}}>{v.initiales}</div></td>
              <td style={{fontWeight:600}}>{v.nom}</td>
              <td>{(v.taux_commission*100).toFixed(0)}%</td>
              <td><span style={{padding:'2px 8px',borderRadius:10,fontSize:10,fontWeight:600,background:v.actif?'#DCFCE7':'#FEE2E2',color:v.actif?'#166534':'#991B1B'}}>{v.actif?'Actif':'Inactif'}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

/* ════════════════════════════════════════
   ONGLET UTILISATEURS
════════════════════════════════════════ */
const TabUsers = ({ data, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name:'',email:'',password:'',role:'ADMIN_LOCAL' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try { 
      await apiService.saveUser(form); 
      onRefresh(); 
      setShowModal(false); 
      setForm({ name:'',email:'',password:'',role:'ADMIN_LOCAL' }); 
      toast.success('Utilisateur créé');
    } catch(e) { 
      toast.error(e.response?.data?.message || 'Erreur lors de la création'); 
    } finally { setSaving(false); }
  };

  return (
    <>
      {showModal && (
        <Modal title="Nouvel utilisateur" onClose={()=>setShowModal(false)}>
          <Field label="Nom complet"><Input autoFocus value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} /></Field>
          <Field label="Email"><Input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} /></Field>
          <Field label="Mot de passe"><Input type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} /></Field>
          <Field label="Rôle">
            <select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))} style={{width:'100%',padding:'9px 12px',border:'1px solid #E5E7EB',borderRadius:8,fontSize:14}}>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="ADMIN_LOCAL">Admin Local</option>
              <option value="GESTIONNAIRE">Gestionnaire</option>
            </select>
          </Field>
          <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
            <button className="btn btn-outline" onClick={()=>setShowModal(false)}>Annuler</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>Créer</button>
          </div>
        </Modal>
      )}
      <div style={{display:'flex',justifyContent:'flex-end',marginBottom:12}}>
        <button className="btn btn-primary btn-sm" onClick={()=>setShowModal(true)}>
          <span className="material-symbols-outlined" style={{fontSize:15}}>add</span> Nouvel utilisateur
        </button>
      </div>
      <table className="data-table">
        <thead><tr><th>Utilisateur</th><th>Email</th><th>Rôle</th></tr></thead>
        <tbody>
          {data.map(u=>(
            <tr key={u.id}>
              <td style={{fontWeight:600}}>{u.name}</td>
              <td style={{color:'#6B7280'}}>{u.email}</td>
              <td><span style={{padding:'2px 8px',borderRadius:4,fontSize:10,fontWeight:700,background:'#E5E7EB',color:'#374151'}}>{u.role}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

/* ════════════════════════════════════════
   PAGE PRINCIPALE
════════════════════════════════════════ */
const TABS = [
  { id:'periode',  label:'Ouvrir une période', icon:'calendar_today' },
  { id:'produits', label:'Produits & Stocks',  icon:'inventory_2'    },
  { id:'vendeurs', label:'Vendeurs',            icon:'groups'         },
  { id:'users',    label:'Utilisateurs',        icon:'manage_accounts'},
];

const Configuration = () => {
  const [tab, setTab]         = useState('periode');
  const [vendeurs, setVendeurs] = useState([]);
  const [produits, setProduits] = useState([]);
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [v,p,u] = await Promise.all([apiService.getVendeurs(), apiService.getProduits(), apiService.getUsers()]);
      setVendeurs(v); setProduits(p); setUsers(u);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <div style={{ maxWidth:1000, margin:'0 auto' }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:20,fontWeight:700,color:'#1A3A6B',margin:0 }}>Configuration Système</h1>
        <p style={{ fontSize:13,color:'#6B7280',margin:'4px 0 0' }}>Paramétrage du réseau de distribution</p>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex',gap:8,marginBottom:20,flexWrap:'wrap' }}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            display:'flex',alignItems:'center',gap:8,padding:'9px 16px',borderRadius:10,cursor:'pointer',fontWeight:600,fontSize:13,transition:'all 0.2s',
            background: tab===t.id?'#1A3A6B':'#fff',
            color: tab===t.id?'#fff':'#4B5563',
            border: `1px solid ${tab===t.id?'#1A3A6B':'#E5E7EB'}`,
          }}>
            <span className="material-symbols-outlined" style={{fontSize:17}}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content card */}
      <div className="card">
        <div className="card-body" style={{ padding: tab==='periode' ? 24 : 0 }}>
          {loading ? (
            <div style={{textAlign:'center',padding:40,color:'#9CA3AF'}}>Chargement...</div>
          ) : (
            <>
              {tab==='periode'  && <TabPeriode vendeurs={vendeurs} />}
              {tab==='produits' && <TabProduits data={produits} onRefresh={load} />}
              {tab==='vendeurs' && <TabVendeurs data={vendeurs} onRefresh={load} />}
              {tab==='users'    && <TabUsers data={users} onRefresh={load} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Configuration;
