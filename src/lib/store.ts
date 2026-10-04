import { useSyncExternalStore } from "react";
import { buildDefaultTimetable, type Group, type Slot } from "./timetable";
import { buildFirstYearTimetable, FIRST_YEAR_SECTIONS } from "./first-year";
import {
  ACADEMIC_KEYS,
  defaultAcademicEvents,
  emptyAcademic,
  type Academic,
  type AcademicKey,
} from "./academic";

export type Status = "present" | "absent";
export type Theme = "light" | "dark" | "system";

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD (IST)
  slotId: string;
  code: string;
  teacher: string;
  status: Status;
  timestamp: string; // ISO
  note?: string;
}

export interface Settings {
  name: string;
  section: string;
  classroom: string;
  group: Group;
  target: number; // percent
  theme: Theme;
  notifications: boolean;
}

export interface SectionData {
  timetable: Slot[];
  records: AttendanceRecord[];
  academic: Academic;
}

export interface AppState {
  version: number;
  settings: Settings;
  timetable: Slot[];
  records: AttendanceRecord[];
  academic: Academic;
  sectionData: Record<string, SectionData>;
}

export const STORAGE_KEY = "nit-self-attendance:v1";

export const DEFAULT_SETTINGS: Settings = {
  name: "",
  section: "D",
  classroom: "F1",
  group: 1,
  target: 75,
  theme: "system",
  notifications: false,
};

const freshAcademic = (): Academic => ({ ...emptyAcademic(), events: defaultAcademicEvents() });
const freshSectionData = (section: string): SectionData => ({
  timetable: buildFirstYearTimetable(section),
  records: [],
  academic: freshAcademic(),
});

export function defaultState(): AppState {
  const sectionData = Object.fromEntries(FIRST_YEAR_SECTIONS.map((section) => [section, freshSectionData(section)]));
  const active = sectionData[DEFAULT_SETTINGS.section] ?? { timetable: buildDefaultTimetable(), records: [], academic: freshAcademic() };
  return {
    version: 3,
    settings: { ...DEFAULT_SETTINGS, classroom: "F1" },
    ...active,
    sectionData,
  };
}

const SERVER_STATE: AppState = defaultState();

let state: AppState = SERVER_STATE;
let loaded = false;
const listeners = new Set<() => void>();

function sanitizeAcademic(raw: unknown, seedEvents: boolean): Academic {
  const a = emptyAcademic();
  const r = (raw ?? {}) as Record<string, unknown>;
  for (const key of ACADEMIC_KEYS) {
    const v = r[key];
    if (Array.isArray(v)) {
      // keep only object entries carrying an id
      (a[key] as unknown[]) = v.filter((x) => !!x && typeof x === "object" && "id" in (x as object));
    }
  }
  if (seedEvents && a.events.length === 0) a.events = defaultAcademicEvents();
  return a;
}

export function sanitizeState(raw: unknown): AppState | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Partial<AppState> & { academic?: unknown; sectionData?: unknown };
  const base = defaultState();
  const settings = { ...base.settings, ...(r.settings ?? {}) };
  settings.group = ([1, 2, 3] as const).includes(settings.group) ? settings.group : 1;
  settings.section = String(settings.section || DEFAULT_SETTINGS.section).toUpperCase();
  settings.target = Math.min(100, Math.max(1, Number(settings.target) || 75));
  const sectionData: Record<string, SectionData> = { ...base.sectionData };
  if (r.sectionData && typeof r.sectionData === "object") {
    for (const [section, value] of Object.entries(r.sectionData as Record<string, unknown>)) {
      if (!value || typeof value !== "object") continue;
      const data = value as Partial<SectionData> & { academic?: unknown };
      sectionData[section] = {
        timetable: Array.isArray(data.timetable) ? data.timetable as Slot[] : buildFirstYearTimetable(section),
        records: Array.isArray(data.records) ? data.records as AttendanceRecord[] : [],
        academic: sanitizeAcademic(data.academic, true),
      };
    }
  }
  const activeData = sectionData[settings.section];
  const legacyTimetable = Array.isArray(r.timetable) && r.timetable.length ? r.timetable : null;
  const timetable = legacyTimetable ?? activeData?.timetable ?? buildFirstYearTimetable(settings.section);
  const records = Array.isArray(r.records)
    ? r.records.filter((x): x is AttendanceRecord => !!x && typeof x === "object" && "date" in x && "slotId" in x)
    : activeData?.records ?? [];
  const academic = sanitizeAcademic(r.academic ?? activeData?.academic, true);
  sectionData[settings.section] = { timetable, records, academic };
  return { version: 3, settings, timetable, records, academic, sectionData };
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = sanitizeState(JSON.parse(raw));
      state = parsed ?? defaultState();
      if (parsed) persist();
    } else {
      state = defaultState();
    }
  } catch {
    state = defaultState();
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota or private mode: ignore */
  }
}

export function getState(): AppState {
  load();
  return state;
}

export function setState(updater: (s: AppState) => AppState) {
  load();
  const previous = state;
  const proposed = updater(previous);
  const previousSection = previous.settings.section;
  const nextSection = proposed.settings.section;
  const sectionData = { ...proposed.sectionData };
  if (previousSection !== nextSection) {
    sectionData[previousSection] = {
      timetable: previous.timetable,
      records: previous.records,
      academic: previous.academic,
    };
    const destination = sectionData[nextSection] ?? freshSectionData(nextSection);
    sectionData[nextSection] = destination;
    state = { ...proposed, ...destination, sectionData };
  } else {
    sectionData[nextSection] = {
      timetable: proposed.timetable,
      records: proposed.records,
      academic: proposed.academic,
    };
    state = { ...proposed, sectionData };
  }
  persist();
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

/** Whole-state hook; SSR/hydration renders default state, then swaps to localStorage data. */
export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, getState, () => SERVER_STATE);
}

export function subscribeAppState(listener: () => void) {
  return subscribe(listener);
}

export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) {
      loaded = false;
      load();
      listeners.forEach((l) => l());
    }
  });
}

/* ---------- actions ---------- */

const rid = () => `r${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export const recordKey = (date: string, slotId: string) => `${date}|${slotId}`;

export function findRecord(records: AttendanceRecord[], date: string, slotId: string) {
  return records.find((r) => r.date === date && r.slotId === slotId);
}

export interface MarkInput {
  date: string;
  slotId: string;
  code: string;
  teacher: string;
  status: Status;
}

/** Marks attendance (one record per class/date). Returns an undo function. */
export function markAttendance(input: MarkInput): () => void {
  const prev = findRecord(getState().records, input.date, input.slotId);
  const prevCopy = prev ? { ...prev } : null;
  setState((s) => {
    const others = s.records.filter((r) => !(r.date === input.date && r.slotId === input.slotId));
    const rec: AttendanceRecord = {
      id: prev?.id ?? rid(),
      date: input.date,
      slotId: input.slotId,
      code: input.code,
      teacher: input.teacher,
      status: input.status,
      timestamp: new Date().toISOString(),
    };
    return { ...s, records: [...others, rec] };
  });
  return () => {
    setState((s) => {
      const others = s.records.filter((r) => !(r.date === input.date && r.slotId === input.slotId));
      return { ...s, records: prevCopy ? [...others, prevCopy] : others };
    });
  };
}

export function clearRecord(date: string, slotId: string): () => void {
  const prev = findRecord(getState().records, date, slotId);
  const prevCopy = prev ? { ...prev } : null;
  setState((s) => ({ ...s, records: s.records.filter((r) => !(r.date === date && r.slotId === slotId)) }));
  return () => {
    if (!prevCopy) return;
    setState((s) => ({ ...s, records: [...s.records, prevCopy] }));
  };
}

export function updateSettings(patch: Partial<Settings>) {
  setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
}

export function upsertSlot(slot: Slot) {
  setState((s) => {
    const exists = s.timetable.some((x) => x.id === slot.id);
    return { ...s, timetable: exists ? s.timetable.map((x) => (x.id === slot.id ? slot : x)) : [...s.timetable, slot] };
  });
}

export function deleteSlot(slotId: string) {
  setState((s) => ({ ...s, timetable: s.timetable.filter((x) => x.id !== slotId) }));
}

export function resetTimetable() {
  setState((s) => ({ ...s, timetable: buildFirstYearTimetable(s.settings.section) }));
}

export function clearAllAttendance() {
  setState((s) => ({ ...s, records: [] }));
}

export function replaceState(next: AppState) {
  load();
  state = sanitizeState(next) ?? defaultState();
  persist();
  listeners.forEach((l) => l());
}

export function mergeRecords(incoming: AttendanceRecord[]) {
  setState((s) => {
    const map = new Map(s.records.map((r) => [recordKey(r.date, r.slotId), r]));
    for (const r of incoming) map.set(recordKey(r.date, r.slotId), r);
    return { ...s, records: [...map.values()] };
  });
}

/* ---------- academic actions ---------- */

type ItemOf<K extends AcademicKey> = Academic[K][number];

/** Adds or updates an academic entry (holiday, leave, cancellation, reschedule, exam, event). */
export function upsertAcademic<K extends AcademicKey>(key: K, item: ItemOf<K>) {
  setState((s) => {
    const list = s.academic[key] as ItemOf<K>[];
    const exists = list.some((x) => x.id === item.id);
    const next = exists ? list.map((x) => (x.id === item.id ? item : x)) : [...list, item];
    return { ...s, academic: { ...s.academic, [key]: next } };
  });
}

/** Removes an academic entry. Returns an undo function. */
export function deleteAcademic<K extends AcademicKey>(key: K, id: string): () => void {
  const prev = (getState().academic[key] as { id: string }[]).find((x) => x.id === id);
  setState((s) => ({
    ...s,
    academic: { ...s.academic, [key]: (s.academic[key] as { id: string }[]).filter((x) => x.id !== id) },
  }));
  return () => {
    if (!prev) return;
    setState((s) => ({ ...s, academic: { ...s.academic, [key]: [...(s.academic[key] as unknown[]), prev] } }));
  };
}

export function mergeAcademic(incoming: Partial<Academic>) {
  setState((s) => {
    const academic = { ...s.academic };
    for (const key of ACADEMIC_KEYS) {
      const add = incoming[key];
      if (!Array.isArray(add)) continue;
      const map = new Map((academic[key] as { id: string }[]).map((x) => [x.id, x]));
      for (const item of add as { id: string }[]) map.set(item.id, item);
      (academic[key] as unknown[]) = [...map.values()];
    }
    return { ...s, academic };
  });
}

export function resetAcademicCalendar() {
  setState((s) => ({ ...s, academic: { ...s.academic, events: defaultAcademicEvents() } }));
}
