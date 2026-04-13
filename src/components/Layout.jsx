import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import WizardOverlay from './WizardOverlay';
import { useAppState } from '../context/StateContext';

const Layout = ({ children }) => {
  const { state, dispatch } = useAppState();

  const handleCloseWizard = () => {
    dispatch({
      type: 'SET_STATUT_PERIODE',
      payload: 'OUVERTE'
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      {/* Sidebar: fixed width, full height, scrollable */}
      <aside className="w-64 flex-shrink-0 h-screen overflow-y-auto bg-slate-50 border-r border-slate-100 z-50">
        <Sidebar />
      </aside>

      {/* Right side: topbar + scrollable main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>

      {state.periode.statut === 'EN_CLOTURE' && (
        <WizardOverlay onClose={handleCloseWizard} />
      )}
    </div>
  );
};

export default Layout;
