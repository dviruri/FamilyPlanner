import { useAuth } from '../../features/auth/AuthContext';
import type { AppPage } from '../../types/index';

interface NavItem {
  page: AppPage;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { page: 'dashboard', label: 'היום', icon: '🏠' },
  { page: 'calendar', label: 'יומן', icon: '📅' },
  { page: 'tasks', label: 'מטלות', icon: '✅' },
  { page: 'family', label: 'משפחה', icon: '👨‍👩‍👧‍👦' },
  { page: 'settings', label: 'הגדרות', icon: '⚙️' },
];

interface SidebarProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { user, signOut } = useAuth();
  const displayName =
    (user?.user_metadata?.display_name as string | undefined) ?? user?.email ?? 'משתמש';

  return (
    <aside className="hidden md:flex flex-col w-56 bg-white border-l border-gray-100 shadow-sm h-full flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🏠</span>
          <div>
            <div className="font-bold text-gray-900 text-base leading-tight">יומן משפחתי</div>
            <div className="text-xs text-gray-400">המשפחה שלנו</div>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = currentPage === item.page;
          return (
            <button
              key={item.page}
              onClick={() => onNavigate(item.page)}
              className={[
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-right',
                'focus:outline-none focus:ring-2 focus:ring-blue-300',
                active
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              ].join(' ')}
            >
              <span className="text-xl w-7 text-center flex-shrink-0">{item.icon}</span>
              <span>{item.label}</span>
              {active && (
                <span className="mr-auto w-1.5 h-1.5 rounded-full bg-blue-500" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer — user + logout */}
      <div className="px-3 py-3 border-t border-gray-100 space-y-1">
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-sm flex-shrink-0">
            👤
          </div>
          <span className="text-xs text-gray-600 truncate flex-1">{displayName}</span>
        </div>
        <button
          onClick={() => void signOut()}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium
                     text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors
                     focus:outline-none focus:ring-2 focus:ring-red-200"
        >
          <span className="text-xl w-7 text-center flex-shrink-0">🚪</span>
          יציאה
        </button>
      </div>
    </aside>
  );
}
