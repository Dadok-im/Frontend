import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type MedSource = "ocr" | "manual";
export type MedEntry = {
  id: string;
  name: string;
  date: string;
  addedAt: number;
  source: MedSource;
};
export type MedsByDate = Record<string, MedEntry[]>;

const STORAGE_KEY = "medsByDate-v1";

function uuid(): string {
  const c = (globalThis as any)?.crypto;
  if (c?.randomUUID) return c.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function todayISO(d = new Date()) {
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

function load(): MedsByDate {
  try {
    const raw =
      typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function save(state: MedsByDate) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* noop */
  }
}

interface Ctx {
  medsByDate: MedsByDate;
  addMed: (name: string, date?: string, source?: MedSource) => MedEntry;
  addMeds: (names: string[], date?: string, source?: MedSource) => MedEntry[];
  removeMed: (date: string, id: string) => void;
  updateMed: (date: string, id: string, newName: string) => void;
  getMeds: (date?: string) => MedEntry[];
}

const MedicationContext = createContext<Ctx | null>(null);

export const MedicationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<MedsByDate>(() => load());

  useEffect(() => {
    save(state);
  }, [state]);

  const api = useMemo<Ctx>(
    () => ({
      medsByDate: state,

      addMed: (name, date = todayISO(), source = "manual") => {
        const entry: MedEntry = {
          id: uuid(),
          name: name.trim(),
          date,
          addedAt: Date.now(),
          source,
        };
        setState((prev) => {
          const next = { ...prev };
          next[date] = [...(next[date] || []), entry];
          return next;
        });
        return entry;
      },

      addMeds: (names, date = todayISO(), source = "ocr") => {
        const trimmed = Array.from(new Set(names.map((n) => n.trim()).filter(Boolean)));
        const created: MedEntry[] = [];
        setState((prev) => {
          const next = { ...prev };
          const list = [...(next[date] || [])];
          trimmed.forEach((name) => {
            const e: MedEntry = { id: uuid(), name, date, addedAt: Date.now(), source };
            list.push(e);
            created.push(e);
          });
          next[date] = list;
          return next;
        });
        return created;
      },

      removeMed: (date, id) => {
        setState((prev) => {
          const list = (prev[date] || []).filter((m) => m.id !== id);
          return { ...prev, [date]: list };
        });
      },

      updateMed: (date, id, newName) => {
        setState((prev) => {
          const updatedList = (prev[date] || []).map((m) =>
            m.id === id ? { ...m, name: newName } : m,
          );
          return { ...prev, [date]: updatedList };
        });
      },

      getMeds: (date = todayISO()) => state[date] || [],
    }),
    [state],
  );

  return <MedicationContext.Provider value={api}>{children}</MedicationContext.Provider>;
};

export function useMedication() {
  const ctx = useContext(MedicationContext);
  if (!ctx) throw new Error("useMedication must be used within MedicationProvider");
  return ctx;
}
