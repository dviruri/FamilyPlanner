import { useAppStore } from '../../store';
import { Header } from '../../components/Header';
import { MemberFilter } from '../../components/MemberFilter';
import { DayView } from '../../views/DayView';
import { WeekView } from '../../views/WeekView';
import { MonthView } from '../../views/MonthView';

export function CalendarPage() {
  const { currentView } = useAppStore();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header />
      <MemberFilter />
      <div className="flex-1 overflow-hidden flex flex-col">
        {currentView === 'day' && <DayView />}
        {currentView === 'week' && <WeekView />}
        {currentView === 'month' && <MonthView />}
      </div>
    </div>
  );
}
