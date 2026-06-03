export interface CategoryMeta {
  label: string;
  icon: string;
  color: string;
}

export const CATEGORY_META: Record<string, CategoryMeta> = {
  school:   { label: 'בית ספר / גן', icon: '🎒', color: '#6366f1' },
  work:     { label: 'עבודה',         icon: '💼', color: '#0ea5e9' },
  activity: { label: 'חוג',           icon: '🎨', color: '#f59e0b' },
  training: { label: 'אימון',         icon: '🏃', color: '#10b981' },
  family:   { label: 'משפחתי',        icon: '👨‍👩‍👧‍👦', color: '#ec4899' },
  other:    { label: 'אחר',           icon: '📌', color: '#8b5cf6' },
};

export const CATEGORIES = Object.entries(CATEGORY_META).map(([value, meta]) => ({
  value,
  ...meta,
}));
