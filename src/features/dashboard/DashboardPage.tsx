import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { useFamily } from '../family/FamilyContext';
import { useEvents } from '../calendar/useEvents';
import { EventCard } from '../calendar/EventCard';
import { EventDetailsModal } from '../calendar/EventDetailsModal';
import { AddEventModal } from '../calendar/AddEventModal';
import { useState } from 'react';
import type { AppPage } from '../../types/index';
import type { EventWithParticipants } from '../../services/eventsService';

function todayHebrew(): string {
  return new Date().toLocaleDateString('he-IL', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

interface DashboardPageProps {
  onNavigate: (page: AppPage) => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { members, activeFamily } = useFamily();
  const { events: todayEvents, loading, refresh } = useEvents(0, 0);
  const { events: upcomingEvents } = useEvents(0, 6);

  const [showAdd, setShowAdd]       = useState(false);
  const [selected, setSelected]     = useState<EventWithParticipants | null>(null);

  // Upcoming = next 6 days excluding today
  const todayKey = new Date().toLocaleDateString('en-CA');
  const upcoming = upcomingEvents.filter(
    (e) => new Date(e.start_time).toLocaleDateString('en-CA') !== todayKey,
  ).slice(0, 5);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <PageHeader
        title={activeFamily?.name ?? 'יומן משפחתי'}
        subtitle={`מה קורה אצלנו היום? · ${todayHebrew()}`}
      />

      {/* Quick actions */}
      <div className="flex gap-2 mb-6">
        <Button size="md" onClick={() => setShowAdd(true)} icon={<span>📅</span>}>
          אירוע חדש
        </Button>
        <Button variant="secondary" size="md" onClick={() => onNavigate('tasks')} icon={<span>✅</span>}>
          מטלה חדשה
        </Button>
      </div>

      {/* Today events */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <span>📅</span> אירועי היום
            {todayEvents.length > 0 && (
              <span className="bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                {todayEvents.length}
              </span>
            )}
          </h2>
          <button onClick={() => onNavigate('calendar')}
            className="text-sm text-blue-500 hover:text-blue-700 font-medium">
            כל היומן ›
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : todayEvents.length === 0 ? (
          <Card>
            <EmptyState
              icon="📅"
              title="אין אירועים היום"
              description="לחץ על 'אירוע חדש' להוספה"
              actionLabel="הוסף אירוע"
              onAction={() => setShowAdd(true)}
            />
          </Card>
        ) : (
          <div className="space-y-2">
            {todayEvents.map((e) => (
              <EventCard key={e.id} event={e} members={members} onClick={() => setSelected(e)} />
            ))}
          </div>
        )}
      </section>

      {/* Tasks placeholder */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <span>✅</span> מטלות להיום
          </h2>
          <button onClick={() => onNavigate('tasks')}
            className="text-sm text-blue-500 hover:text-blue-700 font-medium">
            כל המטלות ›
          </button>
        </div>
        <Card>
          <EmptyState
            icon="✅"
            title="אין מטלות פתוחות להיום"
            description="מטלות יהיו זמינות בשלב הבא"
          />
        </Card>
      </section>

      {/* Upcoming week */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <span>🗓️</span> השבוע הקרוב
          </h2>
          <button onClick={() => onNavigate('calendar')}
            className="text-sm text-blue-500 hover:text-blue-700 font-medium">
            תצוגת שבוע ›
          </button>
        </div>
        {upcoming.length === 0 ? (
          <Card>
            <EmptyState icon="🗓️" title="אין אירועים השבוע" />
          </Card>
        ) : (
          <div className="space-y-2">
            {upcoming.map((e) => (
              <EventCard key={e.id} event={e} members={members} onClick={() => setSelected(e)} />
            ))}
          </div>
        )}
      </section>

      {/* Modals */}
      {showAdd && (
        <AddEventModal onClose={() => setShowAdd(false)} onRefresh={() => void refresh()} />
      )}
      {selected && (
        <EventDetailsModal event={selected} onClose={() => setSelected(null)} onRefresh={() => void refresh()} />
      )}
    </div>
  );
}
