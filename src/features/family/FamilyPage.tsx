import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useAppStore } from '../../store';

export function FamilyPage() {
  const { members } = useAppStore();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <PageHeader
        title="משפחה"
        subtitle="בני המשפחה והגדרות"
        action={
          <Button icon={<span>+</span>} size="md">
            הוסף בן משפחה
          </Button>
        }
      />

      <div className="space-y-3">
        {members.map((member) => (
          <Card key={member.id} padding="md">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                style={{ backgroundColor: member.color + '25', border: `2px solid ${member.color}` }}
              >
                {member.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-800">{member.name}</div>
                <div className="text-sm text-gray-400">
                  {member.isAdult ? 'הורה' : 'ילד'}
                </div>
              </div>
              <div
                className="w-4 h-4 rounded-full border border-white shadow-sm flex-shrink-0"
                style={{ backgroundColor: member.color }}
              />
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-2xl text-sm text-blue-700 text-center">
        ✨ ניהול בני משפחה מלא יהיה זמין בשלב הבא
      </div>
    </div>
  );
}
