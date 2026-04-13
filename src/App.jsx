import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { StateProvider, useAppState } from './context/StateContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Stocks from './pages/Stocks';
import Vendeurs from './pages/Vendeurs';
import Caisse from './pages/Caisse';
import Rapports from './pages/Rapports';
import Network from './pages/Network';
import Audit from './pages/Audit';
import { Icon } from './components/Common';

const SplashScreen = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 2500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-[99999] bg-[#002451] flex flex-col items-center justify-center">
      <div className="relative">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#C9A227] to-[#a07d18] flex items-center justify-center shadow-2xl animate-bounce">
          <Icon name="account_balance" className="text-white text-5xl" fill={true} />
        </div>
        <div className="absolute -inset-4 bg-[#C9A227]/20 rounded-full blur-2xl animate-pulse"></div>
      </div>
      <h1 className="text-white text-4xl font-black mt-10 tracking-tighter">
        SIGDA <span className="text-[#C9A227]">v2.0</span>
      </h1>
      <p className="text-blue-300 text-xs font-bold uppercase tracking-[0.4em] mt-3 opacity-60">
        Système Intégré de Gestion de Distribution
      </p>
      
      <div className="mt-12 w-48 h-1 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-[#C9A227] animate-loading-bar"></div>
      </div>
      <p className="text-blue-200/40 text-[10px] font-bold mt-4 uppercase tracking-widest">Initialisation sécurisée...</p>
    </div>
  );
};

const AppContent = () => {
  const [showSplash, setShowSplash] = useState(true);
  const { state } = useAppState();

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/stocks" element={<Stocks />} />
          <Route path="/vendeurs" element={<Vendeurs />} />
          <Route path="/caisse" element={<Caisse />} />
          <Route path="/rapports" element={<Rapports />} />
          <Route path="/network" element={<Network />} />
          <Route path="/audit" element={<Audit />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

function App() {
  return (
    <StateProvider>
      <AppContent />
    </StateProvider>
  );
}

export default App;
