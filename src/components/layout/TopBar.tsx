import { useAuth } from '../../features/auth/AuthContext';
import type { AppPage } from '../../types/index';

const PAGE_TITLES: Record<AppPage, string> = {
  dashboard: 'היום',
  calendar: 'יומן',
  tasks: 'מטלות',
  family: 'משפחה',
  settings: 'הגדרות',
};

interface TopBarProps {
  currentPage: AppPage;
}

export function TopBar({ currentPage }: TopBarProps) {
  const { signOut } = useAuth();

  return (
    <header className="md:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm z-30 sticky top-0">
      <div className="flex items-center gap-2">
        <span className="text-xl">🏠</span>
        <span className="font-bold text-gray-900 text-base">יומן משפחתי</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-500">
          {PAGE_TITLES[currentPage]}
        </span>
        <button
          onClick={() => void signOut()}
          title="יציאה"
          className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-red-200"
        >
          🚪
        </button>
      </div>
    </header>
  );
}
