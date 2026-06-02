import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { TopBar } from './TopBar';
import type { AppPage } from '../../types/index';

// Feature pages
import { DashboardPage } from '../../features/dashboard/DashboardPage';
import { CalendarPage } from '../../features/calendar/CalendarPage';
import { TasksPage } from '../../features/tasks/TasksPage';
import { FamilyPage } from '../../features/family/FamilyPage';
import { SettingsPage } from '../../features/settings/SettingsPage';

export function AppShell() {
  const [currentPage, setCurrentPage] = useState<AppPage>('dashboard');

  function renderPage() {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage onNavigate={setCurrentPage} />;
      case 'calendar':  return <CalendarPage />;
      case 'tasks':     return <TasksPage />;
      case 'family':    return <FamilyPage />;
      case 'settings':  return <SettingsPage />;
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop sidebar */}
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <TopBar currentPage={currentPage} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {renderPage()}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />
    </div>
  );
}
