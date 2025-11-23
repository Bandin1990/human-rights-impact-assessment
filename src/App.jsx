import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AssessmentProvider } from './context/AssessmentContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AssessmentForm from './pages/AssessmentForm';
import Reports from './pages/Report';
import ReportDetail from './pages/ReportDetail';
import AIAdvisor from './pages/AIAdvisor';

function App() {
  return (
    <AssessmentProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/assess/new" element={<AssessmentForm />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/report/:id" element={<ReportDetail />} />
            <Route path="/advisor" element={<AIAdvisor />} />
            <Route path="/settings" element={<div className="text-gray-500">Settings placeholder</div>} />
          </Routes>
        </Layout>
      </Router>
    </AssessmentProvider>
  );
}

export default App;
