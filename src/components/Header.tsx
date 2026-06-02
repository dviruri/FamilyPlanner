import { useAppStore } from '../store';
import {
  formatDateHebrew,
  addDays,
  addWeeks,
  addMonths,
  monthLabel,
  getWeekDays,
} from '../utils/dateHelpers';

export function Header() {
  const { currentView, currentDate, setView, setCurrentDate } = useAppStore();

  function navigate(dir: -1 | 1) {
    if (currentView === 'day') setCurrentDate(addDays(currentDate, dir));
    else if (currentView === 'week') setCurrentDate(addWeeks(currentDate, dir));
    else setCurrentDate(addMonths(currentDate, dir));
  }

  function goToday() {
    setCurrentDate(new Date().toISOString().split('T')[0]);
  }

  function getTitle() {
    if (currentView === 'day') return formatDateHebrew(currentDate);
    if (currentView === 'week') {
      const days = getWeekDays(currentDate);
      const start = days[0];
      const end = days[6];
      const s = new Date(start + 'T00:00:00').toLocaleDateString('he-IL', {
        day: 'numeric',
        month: 'short',
      });
      const e = new Date(end + 'T00:00:00').toLocaleDateString('he-IL', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      return `${s} — ${e}`;
    }
    return monthLabel(currentDate);
  }

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-2 ml-auto">
        <span className="text-2xl">🏠</span>
        <span className="font-bold text-lg text-gray-800">משפחה</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(1)}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          title="הקודם"
        >
          ‹
        </button>
        <button
          onClick={goToday}
          className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          היום
        </button>
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          title="הבא"
        >
          ›
        </button>
      </div>

      {/* Title */}
      <span className="text-base font-semibold text-gray-700 min-w-48 text-center">
        {getTitle()}
      </span>

      {/* View switcher */}
      <div className="flex rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
        {(['day', 'week', 'month'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-400 ${
              currentView === v
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {v === 'day' ? 'יום' : v === 'week' ? 'שבוע' : 'חודש'}
          </button>
        ))}
      </div>
    </header>
  );
}
