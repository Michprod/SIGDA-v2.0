import React, { useState } from 'react';
import { useAppState } from '../context/StateContext';
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

const Audit = () => {
  const { state, dispatch } = useAppState();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddEntry = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const site = formData.get('site');
    const motif = formData.get('motif');
    
    if (!site || !motif) {
      alert('Remplissez tous les champs.');
      return;
    }

    const now = new Date();
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const date = `${now.getDate().toString().padStart(2, '0')} ${months[now.getMonth()]} ${now.getFullYear()}`;
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    
    const newEntry = {
      id: 'AU' + Date.now(),
      datetime: `${date}\n${time}`,
      site,
      admin: state.periode.admin,
      initiales: state.periode.admin.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
      motif,
      statut: 'TRACE'
    };

    dispatch({
      type: 'LOAD_STATE',
      payload: {
        ...state,
        audit: [newEntry, ...state.audit]
      }
    });
    
    setIsModalOpen(false);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-[#FFF9F0] -m-4 md:-m-6 lg:-m-8 p-4 md:p-6 lg:p-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-7 bg-[#C9A227] rounded-full flex-shrink-0"></div>
            <h2 className="text-2xl font-extrabold tracking-tight text-[#002451]">Journal d'Audit des Interventions Exceptionnelles</h2>
          </div>
          <p className="text-slate-500 text-sm max-w-2xl leading-relaxed">
            Registre immuable des ouvertures de caisse et ajustements hors procédure standard. Chaque entrée est horodatée et signée cryptographiquement.
          </p>
        </div>
        <div className="bg-[#002451] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 flex-shrink-0">
          <div className="relative">
            <Icon name="verified_user" className="text-3xl text-[#ffe08e]" fill={true} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#002451]"></div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-tight opacity-70 font-bold">Security Standard</p>
            <p className="text-sm font-bold">Audit Blockchain</p>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left: Metrics */}
        <div className="col-span-12 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-col gap-5">
          <div className="bg-white p-6 rounded-2xl shadow-sm border-b-2 border-[#002451]">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Alertes 24h</p>
            <h3 className="text-4xl font-extrabold text-[#002451]">14</h3>
            <div className="mt-3 flex items-center gap-1 text-red-600 text-xs font-bold">
              <Icon name="trending_up" className="text-xs" />
              <span>+12% vs hier</span>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Dernier Déverrouillage</p>
            <p className="text-sm font-semibold text-slate-800">Il y a 14 min</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#ffe08e] flex items-center justify-center text-[#4f3d00]">
                <Icon name="key" className="text-base" />
              </div>
              <span className="text-xs text-slate-500 font-medium">Entrepôt Sud-Est</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-[#C9A227]">
            <div className="flex justify-between items-start mb-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sûreté du Journal</p>
              <Icon name="shield_lock" className="text-[#C9A227]" />
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-[#C9A227] rounded-full" style={{ width: '98%' }}></div>
            </div>
            <p className="text-[11px] text-slate-500">Score d'intégrité : 99.8%</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-[#1A3A6B]">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Blockchain Sync</p>
              <Icon name="dataset" className="text-[#1A3A6B]" />
            </div>
            <p className="text-xs font-mono text-slate-500">0x4F2A...99C1</p>
            <p className="text-[11px] text-slate-400">Validé par 8 nœuds</p>
          </div>
        </div>

        {/* Right: Table */}
        <div className="col-span-12 lg:col-span-9 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Flux d'Audit en Temps Réel</span>
            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                onClick={() => setIsModalOpen(true)}
                disabled={['CLOTUREE', 'VERROUILLEE'].includes(state.periode.statut)}
                className="flex-1 sm:flex-none justify-center px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 transition-all flex items-center gap-1 shadow-sm disabled:opacity-50"
              >
                <Icon name="add" className="text-sm" /> Nouvelle Entrée
              </button>
              <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors border border-slate-200 sm:border-transparent">
                <Icon name="download" className="text-sm" />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">
                  <th className="px-6 py-4">Date/Heure</th>
                  <th className="px-6 py-4">Site</th>
                  <th className="px-6 py-4">Administrateur</th>
                  <th className="px-6 py-4">Motif d'Exception</th>
                  <th className="px-6 py-4 text-center">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {state.audit.map((a, i) => (
                  <tr key={a.id} className={`${i % 2 === 1 ? 'bg-blue-50/20' : ''} hover:bg-slate-50/80 transition-colors`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-[#002451]">{a.datetime.split('\n')[0]}</div>
                      <div className="text-[11px] text-slate-400 font-mono tracking-tighter">{a.datetime.split('\n')[1] || ''}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-md">{a.site}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">{a.initiales}</div>
                        <span className="text-sm font-semibold text-slate-800">{a.admin}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-[300px]">
                      <p className="text-xs text-slate-500 leading-relaxed italic line-clamp-2">"{a.motif}"</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-black uppercase">
                        <Icon name="check_circle" className="text-[10px]" fill={true} />
                        Action Tracée
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-auto p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-400">
            <p className="uppercase tracking-widest">Affichage 1-{state.audit.length} sur {state.audit.length} entrées</p>
            <div className="flex gap-1">
              <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-white text-[#002451] shadow-sm border border-slate-100">
                <Icon name="chevron_left" className="text-sm" />
              </button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#002451] text-white shadow-sm text-[10px]">1</button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-white text-slate-400 shadow-sm border border-slate-100 hover:text-[#002451] text-[10px]">2</button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-white text-[#002451] shadow-sm border border-slate-100">
                <Icon name="chevron_right" className="text-sm" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="mt-8 flex flex-col md:flex-row gap-6">
        <div className="flex-[2] bg-white p-6 rounded-2xl shadow-sm border-l-4 border-[#C9A227] flex items-start justify-between">
          <div>
            <h4 className="text-sm font-bold text-[#002451] mb-2">Générer Rapport de Conformité</h4>
            <p className="text-xs text-slate-500 mb-4 max-w-md">Prêt pour l'audit annuel ISO-27001. Contient toutes les exceptions cryptées.</p>
            <button className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-black text-slate-600 transition-all flex items-center gap-2 uppercase tracking-widest">
              <Icon name="picture_as_pdf" className="text-sm" /> Exporter PDF
            </button>
          </div>
          <Icon name="analytics" className="text-[#C9A227] text-4xl opacity-20" />
        </div>
        <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border-l-4 border-emerald-500">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Rapport Prêt</p>
          <p className="text-sm font-bold text-[#002451]">Conformité ISO-27001</p>
          <p className="text-xs text-slate-400 mt-2">Dernière génération : {state.periode.date}</p>
        </div>
      </div>

      {isModalOpen && (
        <Modal
          title="Nouvelle Entrée d'Audit"
          icon="rule"
          onClose={() => setIsModalOpen(false)}
          footer={
            <>
              <button onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">Annuler</button>
              <button form="audit-form" type="submit" className="w-full sm:w-auto justify-center px-6 py-2.5 bg-gradient-to-br from-[#1A3A6B] to-[#002451] text-white text-sm font-bold rounded-xl shadow-lg">Enregistrer</button>
            </>
          }
        >
          <form id="audit-form" onSubmit={handleAddEntry} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Site</label>
              <input name="site" type="text" placeholder="Ex: KN-01" className="w-full bg-slate-50 border-b-2 border-slate-200 p-2 focus:border-[#C9A227] outline-none text-sm font-semibold" required autoFocus />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Motif d'exception <span className="text-red-500">*</span></label>
              <textarea name="motif" rows="3" className="w-full bg-slate-50 border-b-2 border-slate-200 p-2 focus:border-[#C9A227] outline-none text-sm font-semibold resize-none" placeholder="Décrivez l'intervention exceptionnelle..." required></textarea>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Audit;
