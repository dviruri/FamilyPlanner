# יומן משפחתי — Family Planner

אפליקציית ווב לתכנון לוח זמנים משפחתי, מטלות ואירועים.  
Hebrew RTL · React · TypeScript · Vite · Tailwind CSS · Supabase

---

## הרצה מקומית

```bash
npm install
cp .env.example .env.local   # ← מלא פרטי Supabase
npm run dev
```

---

## הגדרת Supabase

### שלב 1 — יצירת פרויקט

1. גש ל-[supabase.com](https://supabase.com) וצור חשבון
2. לחץ **New project**
3. בחר שם, סיסמה ואזור (Region)
4. המתן לאתחול (~2 דקות)

### שלב 2 — יישום הסכמה

1. לך ל-**SQL Editor** בפרויקט
2. פתח את הקובץ `supabase/schema.sql` מהפרויקט הזה
3. הדבק את כל תוכן הקובץ בעורך
4. לחץ **Run**

הסכמה יוצרת:
- `families` — משפחות
- `profiles` — פרופיל לכל משתמש Auth
- `family_members` — בני משפחה (כולל ילדים ללא חשבון)
- `events` — אירועים
- `event_participants` — משתתפי אירוע
- `tasks` — מטלות
- `task_checklist_items` — פריטי רשימת תיוג

Row Level Security מוגדר — כל משתמש ניגש רק לנתוני המשפחה שלו.

### שלב 3 — מפתחות API

1. לך ל-**Settings → API**
2. העתק:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon / public key** → `VITE_SUPABASE_ANON_KEY`
3. הדבק ב-`.env.local`:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### שלב 4 — הפעלת Auth

1. לך ל-**Authentication → Providers**
2. ודא ש-**Email** מופעל (ברירת מחדל)
3. אופציונלי: הפעל Google / Apple OAuth לשלב מאוחר יותר

---

## מבנה הפרויקט

```
src/
  components/
    layout/      # AppShell, Sidebar, BottomNav, TopBar
    ui/          # Button, Card, PageHeader, EmptyState
  features/
    dashboard/   # DashboardPage
    calendar/    # CalendarPage + views
    tasks/       # TasksPage
    family/      # FamilyPage
    auth/        # (שלב 3)
    settings/    # SettingsPage
  services/
    supabase/    # client.ts
  types/
    database.ts  # טיפוסי DB (snake_case)
    index.ts     # ייצוא מרכזי
  utils/
  store.ts       # Zustand (מצב זמני עד חיבור ל-Supabase)

supabase/
  schema.sql     # סכמת DB + RLS
```

---

## פקודות שימושיות

```bash
npm run dev        # שרת פיתוח
npm run build      # build לייצור
npm run lint       # בדיקת ESLint
```
