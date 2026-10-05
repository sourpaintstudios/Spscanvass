export type MarkKind =
  | "wash"
  | "pool"
  | "stroke"
  | "dab"
  | "bristle"
  | "knife"
  | "splatter"
  | "drip"
  | "dot"
  | "hatch"
  | "glaze"
  | "outline"
  | "halftone"
  | "drybrush"
  | "streak"
  | "block"
  | "scratch"
  | "grain";

export type Axis = "free" | "horiz" | "vert" | "diag";

export type StyleDef = {
  id: string;
  name: string;
  group: string;
  blurb: string;
  marks: { kind: MarkKind; w: number }[];
  alpha: [number, number];
  size: number;
  length: number;
  hardness: number;
  cover: number;
  bleed: number;
  drip: number;
  bristles: number;
  breakUp: number;
  keyline: number;
  axis: Axis;
  spare: boolean;
  allover: boolean;
  pitchMap: boolean;
  density: number;
  echo: number;
  reveal: boolean;
  ground: MarkKind;
};

export type GenreDef = {
  id: string;
  name: string;
  blurb: string;
  flow: number;
  focus: { x: number; y: number };
  bands: { sky: number; mid: number; ground: number };
  horizon: number | null;
  vignette: number;
  symmetry: number;
  diagonal: number;
  radial: number;
  value: "high" | "low" | "full" | "poster";
};

export type PaletteDef = {
  id: string;
  name: string;
  paper: string;
  colors: string[];
};

export type GuideKind =
  | "disc"
  | "dome"
  | "beam"
  | "glow"
  | "mass"
  | "ridge"
  | "peak"
  | "leg"
  | "eye"
  | "scatter"
  | "orb";

export type Guide = {
  kind: GuideKind;
  x: number;
  y: number;
  rx: number;
  ry: number;
  rot: number;
  weight: number;
  dark?: boolean;
  bright?: boolean;
};

export type Mark = {
  kind: MarkKind;
  x: number;
  y: number;
  len: number;
  thick: number;
  rot: number;
  r: number;
  g: number;
  b: number;
  a: number;
  r2: number;
  g2: number;
  b2: number;
  seed: number;
  bristles: number;
  bleed: number;
  breakUp: number;
  keyline: number;
  lr: number;
  lg: number;
  lb: number;
  hardness: number;
  echo: number;
  blend?: GlobalCompositeOperation;
};

export type SourceMode = "mic" | "tender" | "hard";

export type SessionConfig = {
  styleId: string;
  genreId: string;
  paletteId: string;
  subject: string;
  seconds: 30 | 60 | 90;
  source: SourceMode;
};

export const DEFAULT_CONFIG: SessionConfig = {
  styleId: "watercolor",
  genreId: "desert",
  paletteId: "blacklight",
  subject: "",
  seconds: 90,
  source: "mic",
};

/** Fields through `clarity` match the Sour Paint listener. Mood, staccato, and gallop feed the brush. */
export type PaintFrame = {
  rms: number;
  level: number;
  sounding: boolean;
  onset: boolean;
  strength: number;
  rate: number;
  speed: number;
  freq: number;
  midi: number | null;
  pitchNorm: number;
  note: string;
  octave: number | null;
  cents: number;
  clarity: number;
  crest: number;
  mood: number;
  staccato: number;
  gallop: boolean;
  /** Polyphonic body. The brush follows these, not a tuner note. */
  voices: number;
  density: number;
  brightness: number;
  low: number;
  tone: number;
  tension: number;
  stable: number;
  thin: boolean;
  changed: boolean;
  chord: string;
  /** -1 the sound is leaving the mic, +1 it is coming at the mic. */
  approach: number;
  /** -1 the phrase is falling, +1 it is rising. */
  lift: number;
  /** Pitch class of the chord root, 0–11. -1 when there is no sound. */
  root: number;
  /** Pitch classes sounding together right now. */
  notes: number[];
};

export const SILENT_FRAME: PaintFrame = {
  rms: 0,
  level: 0,
  sounding: false,
  onset: false,
  strength: 0,
  rate: 0,
  speed: 0,
  freq: 0,
  midi: null,
  pitchNorm: 0.5,
  note: "",
  octave: null,
  cents: 0,
  clarity: 0,
  crest: 0,
  mood: 0,
  staccato: 0.35,
  gallop: false,
  voices: 0,
  density: 0,
  brightness: 0.5,
  low: 0,
  tone: 0,
  tension: 0,
  stable: 0,
  thin: true,
  changed: false,
  chord: "",
  approach: 0,
  lift: 0,
  root: -1,
  notes: [],
};
