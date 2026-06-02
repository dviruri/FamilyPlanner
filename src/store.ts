import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FamilyMember, CalendarEvent } from './types';

const DEFAULT_MEMBERS: FamilyMember[] = [
  { id: '1', name: 'אבא', color: '#3b82f6', avatar: '👨', isAdult: true },
  { id: '2', name: 'אמא', color: '#ec4899', avatar: '👩', isAdult: true },
  { id: '3', name: 'ילד 1', color: '#f59e0b', avatar: '👦', isAdult: false },
  { id: '4', name: 'ילד 2', color: '#10b981', avatar: '👧', isAdult: false },
];

const TODAY = new Date().toISOString().split('T')[0];

const SAMPLE_EVENTS: CalendarEvent[] = [
  {
    id: 'e1',
    title: 'בית ספר',
    date: TODAY,
    startTime: '08:00',
    endTime: '14:00',
    category: 'school',
    memberIds: ['3', '4'],
    isRecurring: true,
    recurringDays: [0, 1, 2, 3, 4],
  },
  {
    id: 'e2',
    title: 'עבודה',
    date: TODAY,
    startTime: '09:00',
    endTime: '18:00',
    category: 'work',
    memberIds: ['1'],
    workLocation: 'office',
    isRecurring: true,
    recurringDays: [0, 1, 2, 3, 4],
  },
  {
    id: 'e3',
    title: 'עבודה מהבית',
    date: TODAY,
    startTime: '09:00',
    endTime: '17:00',
    category: 'work',
    memberIds: ['2'],
    workLocation: 'home',
    isRecurring: true,
    recurringDays: [0, 1, 2, 3, 4],
  },
  {
    id: 'e4',
    title: 'כדורגל',
    date: TODAY,
    startTime: '16:00',
    endTime: '17:30',
    category: 'activity',
    memberIds: ['3'],
  },
  {
    id: 'e5',
    title: 'בלט',
    date: TODAY,
    startTime: '15:30',
    endTime: '16:30',
    category: 'activity',
    memberIds: ['4'],
  },
];

interface AppState {
  members: FamilyMember[];
  events: CalendarEvent[];
  selectedMemberIds: string[];
  currentView: 'day' | 'week' | 'month';
  currentDate: string;

  setView: (view: 'day' | 'week' | 'month') => void;
  setCurrentDate: (date: string) => void;
  toggleMember: (id: string) => void;
  selectAllMembers: () => void;
  addEvent: (event: CalendarEvent) => void;
  updateEvent: (event: CalendarEvent) => void;
  deleteEvent: (id: string) => void;
  addMember: (member: FamilyMember) => void;
  updateMember: (member: FamilyMember) => void;
  deleteMember: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      members: DEFAULT_MEMBERS,
      events: SAMPLE_EVENTS,
      selectedMemberIds: DEFAULT_MEMBERS.map((m) => m.id),
      currentView: 'day',
      currentDate: TODAY,

      setView: (view) => set({ currentView: view }),
      setCurrentDate: (date) => set({ currentDate: date }),
      toggleMember: (id) => {
        const { selectedMemberIds } = get();
        if (selectedMemberIds.includes(id)) {
          if (selectedMemberIds.length === 1) return;
          set({ selectedMemberIds: selectedMemberIds.filter((m) => m !== id) });
        } else {
          set({ selectedMemberIds: [...selectedMemberIds, id] });
        }
      },
      selectAllMembers: () =>
        set({ selectedMemberIds: get().members.map((m) => m.id) }),
      addEvent: (event) =>
        set((s) => ({ events: [...s.events, event] })),
      updateEvent: (event) =>
        set((s) => ({ events: s.events.map((e) => (e.id === event.id ? event : e)) })),
      deleteEvent: (id) =>
        set((s) => ({ events: s.events.filter((e) => e.id !== id) })),
      addMember: (member) =>
        set((s) => ({ members: [...s.members, member] })),
      updateMember: (member) =>
        set((s) => ({ members: s.members.map((m) => (m.id === member.id ? member : m)) })),
      deleteMember: (id) =>
        set((s) => ({
          members: s.members.filter((m) => m.id !== id),
          selectedMemberIds: s.selectedMemberIds.filter((mid) => mid !== id),
        })),
    }),
    { name: 'family-planner' }
  )
);
