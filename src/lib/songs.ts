export type Song = {
  id: string;
  title: string;
  subtitle: string;
  lyrics: string;
  updatedAt: number;
};

const KEY = "sps-songs-v1";

export const SEED_SONGS: Song[] = [
  { id: "cholla", title: "Arizona Cholla Girls", subtitle: "Desert set", lyrics: "", updatedAt: 0 },
  { id: "phoenix-sky", title: "She Rides the Phoenix Sky", subtitle: "Night drive", lyrics: "", updatedAt: 0 },
  { id: "county-9", title: "County Road 9", subtitle: "Story song", lyrics: "", updatedAt: 0 },
  { id: "annetoya", title: "Annetoya Girls", subtitle: "", lyrics: "", updatedAt: 0 },
  { id: "iowa-boys", title: "Iowa Boys", subtitle: "", lyrics: "", updatedAt: 0 },
  { id: "butterfly", title: "Carolina Butterfly", subtitle: "Don't You Kill My Crush", lyrics: "", updatedAt: 0 },
  {
    id: "page-guide",
    title: "Page guide",
    subtitle: "How a page is typed",
    lyrics: "[Verse]\nBig type for the room.\nShort lines, the way you sing them.\n\n[Chorus]\nThe chorus gets the same ink.\nBlank lines make a breath.\n\n[Bridge]\nTuner and tempo live one screen back.",
    updatedAt: 0,
  },
];

export function loadSongs(): Song[] {
  if (typeof localStorage === "undefined") return SEED_SONGS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(SEED_SONGS));
      return SEED_SONGS;
    }
    const parsed = JSON.parse(raw) as Song[];
    if (!Array.isArray(parsed)) return SEED_SONGS;
    return parsed;
  } catch {
    return SEED_SONGS;
  }
}

export function persistSongs(songs: Song[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(songs));
  } catch {
    /* private mode */
  }
}
