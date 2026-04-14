import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import WizardOverlay from './WizardOverlay';
import { useAppState } from '../context/StateContext';

const Layout = ({ children }) => {
  const { state, dispatch } = useAppState();

  const handleCloseWizard = () => {
    dispatch({ type: 'SET_STATUT_PERIODE', payload: 'OUVERTE' });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">

      {/* Sidebar — desktop only */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 h-screen overflow-y-auto bg-slate-50 border-r border-slate-100 z-50">
        <Sidebar />
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        {/* pb-16 on mobile to clear bottom nav, lg:pb-0 for desktop */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-20 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Bottom nav — mobile only */}
      <BottomNav />

      {/* Wizard Overlay */}
      {state.periode.statut === 'EN_CLOTURE' && (
        <WizardOverlay onClose={handleCloseWizard} />
      )}
    </div>
  );
};

export default Layout;
