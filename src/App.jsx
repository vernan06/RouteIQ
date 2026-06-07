// src/App.jsx
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import RouteOptimizer from './pages/RouteOptimizer';
import FleetSorter from './pages/FleetSorter';
import NetworkMapper from './pages/NetworkMapper';
import BudgetAllocator from './pages/BudgetAllocator';
import Scheduler from './pages/Scheduler';
import DocumentSearch from './pages/DocumentSearch';
import GridPlanner from './pages/GridPlanner';
import TicketQueue from './pages/TicketQueue';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Stubs for topbar events
  const handleRunModule = () => {
    // Triggers current active run if applicable
    console.log(`Triggering engine for page: ${currentPage}`);
  };

  const handleImportCSV = () => {
    alert("Import CSV: Select a municipal log or grid dataset to load.");
  };

  const handleExportReport = () => {
    alert("Export Report: Compiling operation logs. PDF/CSV download started.");
  };

  const renderActivePage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard setCurrentPage={setCurrentPage} />;
      case 'route-optimizer':
        return <RouteOptimizer />;
      case 'fleet-sorter':
        return <FleetSorter />;
      case 'network-mapper':
        return <NetworkMapper />;
      case 'budget-allocator':
        return <BudgetAllocator />;
      case 'scheduler':
        return <Scheduler />;
      case 'document-search':
        return <DocumentSearch />;
      case 'grid-planner':
        return <GridPlanner />;
      case 'ticket-queue':
        return <TicketQueue />;
      default:
        return <Dashboard setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="flex h-screen w-screen bg-darkBg text-textPrimary overflow-hidden font-sans select-none antialiased">
      {/* Fixed Sidebar */}
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {/* Main Content Outer Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Top Header Controls bar */}
        <Topbar
          currentPage={currentPage}
          onRunModule={handleRunModule}
          onImportCSV={handleImportCSV}
          onExportReport={handleExportReport}
        />

        {/* Scrollable Page Canvas */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
}
