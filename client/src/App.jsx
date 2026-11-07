import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AddSamplePage from './pages/AddSamplePage';
import SamplesListPage from './pages/SamplesListPage';
import SampleDetailsPage from './pages/SampleDetailsPage';
import AnalysisPage from './pages/AnalysisPage';
import LocationComparisonPage from './pages/LocationComparisonPage';
import MapPage from './pages/MapPage';
import TrendsPage from './pages/TrendsPage';
import ReportsPage from './pages/ReportsPage';
import StandardsPage from './pages/StandardsPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NotFoundPage from './pages/NotFoundPage';

import ErrorBoundary from './components/ErrorBoundary';
import AquaBot from './components/AquaBot';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Landing & Authentication */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Client Surveillance Platform Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/samples" element={<SamplesListPage />} />
              <Route path="/samples/new" element={<AddSamplePage />} />
              <Route path="/samples/:id" element={<SampleDetailsPage />} />
              <Route path="/analysis" element={<AnalysisPage />} />
              <Route path="/comparison" element={<LocationComparisonPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/trends" element={<TrendsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/standards" element={<StandardsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Dedicated Administrator Portal (Separate Enclave) */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboardPage />} />
            </Route>
          </Routes>
          <AquaBot />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
