import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';

export function TasksPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <PageHeader
        title="מטלות"
        subtitle="המטלות של כל בני המשפחה"
        action={
          <Button icon={<span>+</span>} size="md">
            מטלה חדשה
          </Button>
        }
      />

      {/* Filter tabs placeholder */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {['הכל', 'שלי', 'ילדים', 'משפחה', 'מושלמו'].map((label) => (
          <button
            key={label}
            className="px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors first:bg-blue-500 first:text-white"
          >
            {label}
          </button>
        ))}
      </div>

      <Card>
        <EmptyState
          icon="✅"
          title="אין מטלות עדיין"
          description="הוסף מטלה לבני המשפחה — כמו קניות, שיעורי בית, או כל דבר אחר"
          actionLabel="הוסף מטלה ראשונה"
          onAction={() => {}}
        />
      </Card>
    </div>
  );
}
