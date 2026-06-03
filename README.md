# יומן משפחתי — Family Planner

אפליקציית ווב לניהול לוח שנה ומטלות משפחתיות.  
Hebrew RTL · React 19 · TypeScript · Vite · Tailwind CSS v4 · Supabase

---

## תכונות נוכחיות

- 🔐 **הרשמה / התחברות** — אימייל + סיסמה, Google OAuth
- 👨‍👩‍👧‍👦 **Onboarding משפחה** — יצירת משפחה, הוספת בני משפחה עם צבעים ותפקידים
- 📅 **יומן אירועים** — תצוגת יום / שבוע / רשימה, יצירה/עריכה/מחיקה
- ✅ **מטלות** — יצירה, הסמת השלמה, סינון לפי תאריך / אחראי / סטטוס
- 🔄 **חזרות** — FREQ=DAILY / WEEKLY / MONTHLY לאירועים ומטלות
- 🏠 **Dashboard** — היום, מטלות להיום, מטלות באיחור, שבוע קרוב
- 📺 **מסך TV** — `/tv` — תצוגה read-only גדולה, מתרענן כל דקה
- 📱 **PWA** — manifest, icons, installable

---

## דרישות מקדימות

- Node.js 18+
- חשבון [Supabase](https://supabase.com) (חינמי)
- (אופציונלי) Google Cloud Console לGoogle OAuth

---

## הגדרה ראשונית

### 1. שכפול + התקנה

```bash
git clone https://github.com/dviruri/FamilyPlanner.git
cd FamilyPlanner
npm install
```

### 2. הגדרת Supabase

#### יצירת פרויקט
1. גש ל-[supabase.com](https://supabase.com) → New project
2. המתן לאתחול (~2 דקות)

#### יישום הסכמה
1. **SQL Editor** → פתח `supabase/schema.sql` → הדבק והרץ
2. **SQL Editor** → פתח `supabase/patches/001_create_family_rpc.sql` → הדבק והרץ

#### מפתחות API
1. **Settings → API** → העתק:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon / public key** → `VITE_SUPABASE_ANON_KEY`

### 3. משתני סביבה

```bash
cp .env.example .env.local
```

ערוך את `.env.local`:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### 4. Google OAuth (אופציונלי)

1. [Google Cloud Console](https://console.cloud.google.com) → New Project
2. **APIs & Services → OAuth consent screen** → Get Started → מלא שם + אימייל
3. **Credentials → Create OAuth client ID → Web application**
   - Redirect URI: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
4. Supabase Dashboard → **Authentication → Providers → Google** → הפעל + הכנס Client ID/Secret

---

## הרצה מקומית

```bash
npm run dev
```

פתח: `http://localhost:5173`

**מסך TV:** `http://localhost:5173/tv`

---

## פקודות שימושיות

```bash
npm run dev        # שרת פיתוח
npm run build      # build לייצור
npm run lint       # בדיקת ESLint
```

---

## מבנה הפרויקט

```
src/
  components/
    layout/      # AppShell, Sidebar, BottomNav, TopBar
    ui/          # Button, Card, PageHeader, EmptyState
  features/
    auth/        # AuthContext, LoginForm, RegisterForm, GoogleSignInButton
    calendar/    # CalendarPage, DayView, WeekView, EventForm, EventCard
    dashboard/   # DashboardPage
    family/      # FamilyContext, FamilyPage, MemberForm, OnboardingFlow
    settings/    # SettingsPage
    tasks/       # TasksPage, TaskCard, TaskForm, TaskDetailsModal
    tv/          # TvPage
  services/      # eventsService, tasksService, familyService, supabase/client
  types/         # database.ts (DB types), index.ts (barrel)
  utils/         # calendarDates, eventTime, recurrence

supabase/
  schema.sql                      # סכמה ראשונית + RLS
  patches/
    001_create_family_rpc.sql     # פונקציית create_family
```

---

## הנחות RLS

כל גישה לנתונים מוגנת ב-Row Level Security:
- משתמש רואה רק נתוני המשפחה שלו
- הורה = יכול ליצור/לערוך/למחוק
- ילד = יכול לסמן השלמת מטלה
- `create_family` RPC = SECURITY DEFINER לפתרון bootstrapping

---

## מגבלות ידועות

- חזרות: אין exceptions (עריכת מופע בודד), אין UNTIL/COUNT, אין BYDAY
- אין הזמנה לבני משפחה נוספים לאפליקציה
- תמיכה במשפחה אחת בלבד (multi-family בעתיד)
- אין תצוגת חודש בלוח שנה
- TV route: אין אימות ייעודי, מחייב login רגיל
- PWA: אין Service Worker (offline) — רק installable

---

## שלבי פיתוח הבאים המוצעים

1. תצוגת חודש מלאה
2. הזמנת בני משפחה לאפליקציה (email invite)
3. הגדרת תאריך סיום לחזרות (UNTIL)
4. Service Worker לתמיכה offline בסיסית
5. Push notifications
