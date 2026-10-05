import { create } from "zustand";
import { SEED_SONGS, type Song } from "@/lib/songs";
import { DEFAULT_CONFIG, type SessionConfig } from "@/lib/paint/types";

export type Screen =
  | { name: "home" }
  | { name: "gallery" }
  | { name: "setup" }
  | { name: "splash"; config: SessionConfig }
  | { name: "stage"; config: SessionConfig }
  | { name: "piece"; id: string }
  | { name: "book" }
  | { name: "read"; id: string }
  | { name: "tuner" }
  | { name: "tempo" };

type Studio = {
  stack: Screen[];
  draft: SessionConfig;
  bpm: number | null;
  songs: Song[];
  push: (screen: Screen) => void;
  pop: () => void;
  replaceTop: (screen: Screen) => void;
  showPiece: (id: string) => void;
  setDraft: (patch: Partial<SessionConfig>) => void;
  resetDraft: () => void;
  setBpm: (bpm: number | null) => void;
  setSongs: (songs: Song[]) => void;
};

export const useStudio = create<Studio>((set) => ({
  stack: [{ name: "home" }],
  draft: DEFAULT_CONFIG,
  bpm: null,
  songs: SEED_SONGS,
  push: (screen) => set((state) => ({ stack: [...state.stack, screen] })),
  pop: () => set((state) => ({ stack: state.stack.length > 1 ? state.stack.slice(0, -1) : state.stack })),
  replaceTop: (screen) => set((state) => ({ stack: [...state.stack.slice(0, -1), screen] })),
  showPiece: (id) => set({ stack: [{ name: "home" }, { name: "gallery" }, { name: "piece", id }] }),
  setDraft: (patch) => set((state) => ({ draft: { ...state.draft, ...patch } })),
  resetDraft: () => set({ draft: DEFAULT_CONFIG }),
  setBpm: (bpm) => set({ bpm }),
  setSongs: (songs) => set({ songs }),
}));
