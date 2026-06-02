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

interface BottomNavProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
}

export function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-40 safe-area-inset-bottom">
      <div className="flex items-stretch h-16">
        {NAV_ITEMS.map((item) => {
          const active = currentPage === item.page;
          return (
            <button
              key={item.page}
              onClick={() => onNavigate(item.page)}
              className={[
                'flex-1 flex flex-col items-center justify-center gap-0.5 py-2',
                'focus:outline-none transition-colors',
                active ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600',
              ].join(' ')}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span className={`text-[10px] font-medium ${active ? 'text-blue-600' : 'text-gray-400'}`}>
                {item.label}
              </span>
              {active && (
                <span className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500 rounded-b" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
