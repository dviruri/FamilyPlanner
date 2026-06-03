import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';

interface SettingsRow {
  icon: string;
  title: string;
  description: string;
  soon?: boolean;
}

const SETTINGS: SettingsRow[] = [
  { icon: '👨‍👩‍👧‍👦', title: 'בני משפחה', description: 'הוסף, ערוך או הסר בני משפחה' },
  { icon: '🔔', title: 'התראות', description: 'קבע התראות לאירועים ומטלות', soon: true },
  { icon: '🎨', title: 'עיצוב', description: 'ערכת צבעים וגופן', soon: true },
  { icon: '📺', title: 'תצוגת טלוויזיה', description: 'פתח את לוח הבקרה המשפחתי על מסך גדול' },
  { icon: '🔐', title: 'חשבון', description: 'התחברות וסנכרון בין מכשירים', soon: true },
];

export function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <PageHeader title="הגדרות" subtitle="התאמה אישית" />

      <div className="space-y-2">
        {SETTINGS.map((s) => s.title === 'תצוגת טלוויזיה' ? (
            <a key={s.title} href="/tv" target="_blank" rel="noopener noreferrer" className="block">
              <Card padding="md">
                <div className="flex items-center gap-3">
                  <span className="text-2xl w-10 text-center flex-shrink-0">{s.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 text-sm">{s.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{s.description}</div>
                  </div>
                  <span className="text-gray-300 text-lg">›</span>
                </div>
              </Card>
            </a>
          ) : (
            <Card key={s.title} padding="md" onClick={s.soon ? undefined : () => {}}>
              <div className="flex items-center gap-3">
                <span className="text-2xl w-10 text-center flex-shrink-0">{s.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800 text-sm">{s.title}</span>
                    {s.soon && (
                      <span className="text-xs bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full font-medium">
                        בקרוב
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{s.description}</div>
                </div>
                {!s.soon && <span className="text-gray-300 text-lg">›</span>}
              </div>
            </Card>
          )
        )}
      </div>

      <div className="mt-8 text-center text-xs text-gray-300">
        יומן משפחתי · גרסה 1.0
      </div>
    </div>
  );
}
