import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAppStore } from '../../store';
import { getEventsForDate } from '../../utils/eventHelpers';
import { CATEGORY_COLORS } from '../../utils/eventHelpers';
import type { AppPage } from '../../types/index';

const TODAY = new Date().toISOString().split('T')[0];

function todayHebrew(): string {
  return new Date().toLocaleDateString('he-IL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

interface DashboardPageProps {
  onNavigate: (page: AppPage) => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { events, members } = useAppStore();

  const todayEvents = getEventsForDate(events, TODAY, members.map((m) => m.id));

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <PageHeader
        title="יומן משפחתי"
        subtitle={`מה קורה אצלנו היום? · ${todayHebrew()}`}
      />

      {/* Quick actions */}
      <div className="flex gap-2 mb-6">
        <Button
          size="md"
          onClick={() => onNavigate('calendar')}
          icon={<span>📅</span>}
        >
          אירוע חדש
        </Button>
        <Button
          variant="secondary"
          size="md"
          onClick={() => onNavigate('tasks')}
          icon={<span>✅</span>}
        >
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
          <button
            onClick={() => onNavigate('calendar')}
            className="text-sm text-blue-500 hover:text-blue-700 font-medium"
          >
            ‹ כל היומן
          </button>
        </div>

        {todayEvents.length === 0 ? (
          <Card>
            <EmptyState
              icon="📅"
              title="אין אירועים היום"
              description="לחץ על 'אירוע חדש' להוספה"
              actionLabel="הוסף אירוע"
              onAction={() => onNavigate('calendar')}
            />
          </Card>
        ) : (
          <div className="space-y-2">
            {todayEvents.map((event) => {
              const color = CATEGORY_COLORS[event.category] || '#8b5cf6';
              const eventMembers = members.filter((m) => event.memberIds.includes(m.id));
              return (
                <Card
                  key={event.id}
                  padding="sm"
                  onClick={() => onNavigate('calendar')}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-1 self-stretch rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800 text-sm truncate">
                        {event.title}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {event.startTime} – {event.endTime}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {eventMembers.map((m) => (
                        <span
                          key={m.id}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                          style={{ backgroundColor: m.color + '25', border: `1.5px solid ${m.color}` }}
                          title={m.name}
                        >
                          {m.avatar}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Tasks section (placeholder) */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <span>✅</span> מטלות להיום
          </h2>
          <button
            onClick={() => onNavigate('tasks')}
            className="text-sm text-blue-500 hover:text-blue-700 font-medium"
          >
            ‹ כל המטלות
          </button>
        </div>
        <Card>
          <EmptyState
            icon="✅"
            title="אין מטלות פתוחות להיום"
            description="מטלות ייטענו בשלב הבא"
          />
        </Card>
      </section>

      {/* Upcoming week (placeholder) */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <span>🗓️</span> השבוע הקרוב
          </h2>
          <button
            onClick={() => onNavigate('calendar')}
            className="text-sm text-blue-500 hover:text-blue-700 font-medium"
          >
            ‹ תצוגת שבוע
          </button>
        </div>
        <Card>
          <EmptyState
            icon="🗓️"
            title="תצוגת שבוע תהיה זמינה בקרוב"
            description="לחץ על 'יומן' לראות את לוח השנה המלא"
            actionLabel="פתח יומן"
            onAction={() => onNavigate('calendar')}
          />
        </Card>
      </section>
    </div>
  );
}
