import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardOverview } from './pages/shared/DashboardOverview';
import { ReportFault } from './pages/student/ReportFault';
import { MyTickets } from './pages/student/MyTickets';
import { AssignedTasks } from './pages/employee/AssignedTasks';
import { TicketQueue } from './pages/manager/TicketQueue';
import { CCTVMonitoring } from './pages/admin/CCTVMonitoring';
import { PredictiveMaint } from './pages/admin/PredictiveMaint';
import { AssetRegistry } from './pages/admin/AssetRegistry';
import { CampusRiskMap } from './pages/admin/CampusRiskMap';
import { AnalyticsReports } from './pages/admin/AnalyticsReports';
import { UserDirectory } from './pages/admin/UserDirectory';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected App Shell */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<DashboardOverview />} />
            <Route path="/report-fault" element={<ReportFault />} />
            <Route path="/my-tickets" element={<MyTickets />} />
            <Route path="/assigned-tasks" element={<AssignedTasks />} />
            <Route path="/ticket-queue" element={<TicketQueue />} />
            <Route path="/cctv-monitoring" element={<CCTVMonitoring />} />
            <Route path="/predictive-maintenance" element={<PredictiveMaint />} />
            <Route path="/asset-registry" element={<AssetRegistry />} />
            <Route path="/risk-map" element={<CampusRiskMap />} />
            <Route path="/analytics-reports" element={<AnalyticsReports />} />
            <Route path="/user-directory" element={<UserDirectory />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
