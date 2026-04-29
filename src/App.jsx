import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StateProvider } from './context/StateContext';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Stocks from './pages/Stocks';
import Vendeurs from './pages/Vendeurs';
import Caisse from './pages/Caisse';
import Historique from './pages/Historique';
import Periode from './pages/Periode';
import Sites from './pages/Sites';
import Audit from './pages/Audit';
import Configuration from './pages/Configuration';
import VendeurHistorique from './pages/VendeurHistorique';
import ReportPrint from './pages/ReportPrint';

import { Toaster } from 'react-hot-toast';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('sigda_token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const App = () => {
  return (
    <StateProvider>
      <Toaster position="top-right" reverseOrder={false} />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<ProtectedRoute><Layout><Navigate to="/dashboard" replace /></Layout></ProtectedRoute>} />
          
          <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/periode"   element={<ProtectedRoute><Layout><Periode /></Layout></ProtectedRoute>} />
          <Route path="/stocks"    element={<ProtectedRoute><Layout><Stocks /></Layout></ProtectedRoute>} />
          <Route path="/vendeurs"  element={<ProtectedRoute><Layout><Vendeurs /></Layout></ProtectedRoute>} />
          <Route path="/vendeurs/:id/historique" element={<ProtectedRoute><Layout><VendeurHistorique /></Layout></ProtectedRoute>} />
          <Route path="/caisse"    element={<ProtectedRoute><Layout><Caisse /></Layout></ProtectedRoute>} />
          <Route path="/historique" element={<ProtectedRoute><Layout><Historique /></Layout></ProtectedRoute>} />
          <Route path="/sites"      element={<ProtectedRoute><Layout><Sites /></Layout></ProtectedRoute>} />
          <Route path="/audit"      element={<ProtectedRoute><Layout><Audit /></Layout></ProtectedRoute>} />
          <Route path="/configuration" element={<ProtectedRoute><Layout><Configuration /></Layout></ProtectedRoute>} />
          
          {/* Vue impression - Pas de Layout */}
          <Route path="/print/periode/:id" element={<ProtectedRoute><ReportPrint /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </StateProvider>
  );
};

export default App;
