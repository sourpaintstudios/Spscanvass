import { hashString, mulberry32 } from "@/lib/paint/color";
import { STYLES } from "@/lib/paint/styles";
import type { GenreDef, Guide, PaletteDef, SessionConfig } from "@/lib/paint/types";

export const GENRES: GenreDef[] = [
  {
    id: "desert",
    name: "Desert / Southwest",
    blurb: "A low horizon, a big sky, heat sitting on the ground.",
    flow: 0,
    focus: { x: 0.68, y: 0.3 },
    bands: { sky: 0.48, mid: 0.16, ground: 0.36 },
    horizon: 0.62,
    vignette: 0.22,
    symmetry: 0.1,
    diagonal: 0.08,
    radial: 0.12,
    value: "full",
  },
  {
    id: "landscape",
    name: "Landscape",
    blurb: "Sky above a horizon, ground below, marks moving sideways.",
    flow: 0,
    focus: { x: 0.32, y: 0.34 },
    bands: { sky: 0.4, mid: 0.2, ground: 0.4 },
    horizon: 0.58,
    vignette: 0.16,
    symmetry: 0.15,
    diagonal: 0.05,
    radial: 0.08,
    value: "full",
  },
  {
    id: "frazetta",
    name: "Frazetta",
    blurb: "A dark mass and one bright focal light on a diagonal.",
    flow: 0.35,
    focus: { x: 0.6, y: 0.4 },
    bands: { sky: 0.28, mid: 0.5, ground: 0.22 },
    horizon: null,
    vignette: 0.84,
    symmetry: 0.05,
    diagonal: 0.88,
    radial: 0.18,
    value: "low",
  },
  {
    id: "rock-poster",
    name: "Rock poster",
    blurb: "A centered blast. Marks radiate. Saturation stays up.",
    flow: 0.25,
    focus: { x: 0.5, y: 0.44 },
    bands: { sky: 0.2, mid: 0.62, ground: 0.18 },
    horizon: null,
    vignette: 0.48,
    symmetry: 0.84,
    diagonal: 0.15,
    radial: 0.94,
    value: "poster",
  },
  {
    id: "album-cover",
    name: "Album cover",
    blurb: "One strong center, a vignette, the corners held back.",
    flow: 0.1,
    focus: { x: 0.5, y: 0.46 },
    bands: { sky: 0.18, mid: 0.68, ground: 0.14 },
    horizon: null,
    vignette: 0.58,
    symmetry: 0.72,
    diagonal: 0.1,
    radial: 0.5,
    value: "poster",
  },
  {
    id: "comic-book",
    name: "Comic book",
    blurb: "A poster value structure. The figure owns the middle.",
    flow: 0.08,
    focus: { x: 0.5, y: 0.46 },
    bands: { sky: 0.22, mid: 0.58, ground: 0.2 },
    horizon: null,
    vignette: 0.18,
    symmetry: 0.35,
    diagonal: 0.2,
    radial: 0.22,
    value: "poster",
  },
  {
    id: "cosmic",
    name: "Cosmic",
    blurb: "Deep field, a bright event, lots of sky.",
    flow: 0.12,
    focus: { x: 0.5, y: 0.36 },
    bands: { sky: 0.7, mid: 0.2, ground: 0.1 },
    horizon: null,
    vignette: 0.7,
    symmetry: 0.2,
    diagonal: 0.12,
    radial: 0.36,
    value: "low",
  },
  {
    id: "abstract",
    name: "Abstract",
    blurb: "No horizon. The marks negotiate the whole sheet.",
    flow: 0.18,
    focus: { x: 0.5, y: 0.5 },
    bands: { sky: 0.34, mid: 0.33, ground: 0.33 },
    horizon: null,
    vignette: 0.1,
    symmetry: 0.05,
    diagonal: 0.2,
    radial: 0.1,
    value: "full",
  },
  {
    id: "portrait",
    name: "Portrait",
    blurb: "The head sits high. The edges fall off.",
    flow: 0.05,
    focus: { x: 0.5, y: 0.38 },
    bands: { sky: 0.22, mid: 0.62, ground: 0.16 },
    horizon: null,
    vignette: 0.56,
    symmetry: 0.55,
    diagonal: 0.08,
    radial: 0.15,
    value: "full",
  },
  {
    id: "noir",
    name: "Noir",
    blurb: "Low key, a hard diagonal, the light is a small permission.",
    flow: 0.32,
    focus: { x: 0.4, y: 0.4 },
    bands: { sky: 0.2, mid: 0.36, ground: 0.44 },
    horizon: 0.72,
    vignette: 0.8,
    symmetry: 0.05,
    diagonal: 0.72,
    radial: 0.1,
    value: "low",
  },
  {
    id: "folk",
    name: "Folk",
    blurb: "A simple horizon, a centered sun, nothing fussy.",
    flow: 0,
    focus: { x: 0.5, y: 0.32 },
    bands: { sky: 0.42, mid: 0.2, ground: 0.38 },
    horizon: 0.6,
    vignette: 0.08,
    symmetry: 0.7,
    diagonal: 0.02,
    radial: 0.12,
    value: "high",
  },
  {
    id: "still-life",
    name: "Still life",
    blurb: "A table line and the weight sitting just above it.",
    flow: 0.02,
    focus: { x: 0.5, y: 0.56 },
    bands: { sky: 0.14, mid: 0.4, ground: 0.46 },
    horizon: 0.7,
    vignette: 0.36,
    symmetry: 0.4,
    diagonal: 0.06,
    radial: 0.08,
    value: "full",
  },
  {
    id: "mural",
    name: "Street mural",
    blurb: "Big symmetric masses, meant to be read from across the room.",
    flow: 0.06,
    focus: { x: 0.5, y: 0.48 },
    bands: { sky: 0.3, mid: 0.4, ground: 0.3 },
    horizon: null,
    vignette: 0.2,
    symmetry: 0.82,
    diagonal: 0.1,
    radial: 0.2,
    value: "poster",
  },
  {
    id: "eerie",
    name: "Eerie",
    blurb: "The light is off-center and the corners close in.",
    flow: 0.22,
    focus: { x: 0.44, y: 0.4 },
    bands: { sky: 0.46, mid: 0.34, ground: 0.2 },
    horizon: null,
    vignette: 0.76,
    symmetry: 0.05,
    diagonal: 0.4,
    radial: 0.16,
    value: "low",
  },
  {
    id: "western-night",
    name: "Western night",
    blurb: "A high dark sky, a low land, one light in the distance.",
    flow: 0,
    focus: { x: 0.74, y: 0.24 },
    bands: { sky: 0.58, mid: 0.14, ground: 0.28 },
    horizon: 0.7,
    vignette: 0.62,
    symmetry: 0.1,
    diagonal: 0.12,
    radial: 0.1,
    value: "low",
  },
  {
    id: "figure",
    name: "Figure in motion",
    blurb: "The body cuts a diagonal through the middle band.",
    flow: 0.34,
    focus: { x: 0.56, y: 0.48 },
    bands: { sky: 0.18, mid: 0.64, ground: 0.18 },
    horizon: null,
    vignette: 0.4,
    symmetry: 0.1,
    diagonal: 0.78,
    radial: 0.12,
    value: "full",
  },
];

export const PALETTES: PaletteDef[] = [
  { id: "blacklight", name: "Blacklight", paper: "#0c1208", colors: ["#10210a", "#1d4a14", "#6fbe1e", "#c6ff3d", "#f4ff6a", "#f7ffe4"] },
  { id: "desert-dusk", name: "Desert dusk", paper: "#24160f", colors: ["#1a0c08", "#6b2e28", "#c4652a", "#e8a04a", "#f2d2a2", "#f7efe2"] },
  { id: "cholla-gold", name: "Cholla gold", paper: "#1c140c", colors: ["#2a1a0c", "#6a4420", "#c4892a", "#e6c15a", "#f3e2a8", "#fff6d8"] },
  { id: "cadmium", name: "Cadmium night", paper: "#1a100c", colors: ["#140c08", "#5c1a12", "#c4311a", "#e86820", "#f0c14a", "#f6e6c8"] },
  { id: "bone-soot", name: "Bone and soot", paper: "#d7d0c4", colors: ["#1a1816", "#3a342e", "#6e655c", "#a3988c", "#d9d0c4", "#f4efe6"] },
  { id: "sumi-paper", name: "Sumi paper", paper: "#efe6d6", colors: ["#12110e", "#2c2a26", "#5c5852", "#8d877e", "#cfc6b6", "#f7f1e6"] },
  { id: "frazetta-bronze", name: "Frazetta bronze", paper: "#140e0c", colors: ["#1a0808", "#4a1c14", "#8a3a22", "#c47a3a", "#e8c07a", "#f6e6c8"] },
  { id: "cosmic-night", name: "Cosmic night", paper: "#070814", colors: ["#12081c", "#3a1860", "#6a3ad4", "#d24a8a", "#f2c14a", "#efeaff"] },
  { id: "rock-poster", name: "Rock poster", paper: "#0e0e12", colors: ["#14141c", "#e21b4c", "#1d4ed8", "#f2d000", "#f4f4f6", "#ff5fa8"] },
  { id: "minor-key", name: "Minor key", paper: "#10141c", colors: ["#0c1018", "#1a3050", "#3a5a78", "#7a98b0", "#c5d4e0", "#eef3f7"] },
  { id: "major-key", name: "Major key", paper: "#1c140c", colors: ["#3a1808", "#a84810", "#e88820", "#f2c14a", "#ffe9a8", "#fff8e8"] },
  { id: "southwest-clay", name: "Southwest clay", paper: "#c4a88a", colors: ["#3a241c", "#7a4030", "#c46a48", "#e0a070", "#f0d2b4", "#f8efe4"] },
  { id: "sea-glass", name: "Sea glass", paper: "#10201c", colors: ["#0c2420", "#1a5c54", "#3aaa98", "#8ed9c4", "#d5f3ea", "#f4fffb"] },
  { id: "blood-moon", name: "Blood moon", paper: "#14080c", colors: ["#1a0608", "#6e1020", "#c42030", "#e86048", "#f0b0a0", "#f8e8e4"] },
  { id: "neon-alley", name: "Neon alley", paper: "#080a10", colors: ["#10121a", "#ff2d78", "#6a4cff", "#3dffe8", "#f4ff6a", "#ffffff"] },
  { id: "happy-little", name: "Happy little", paper: "#163040", colors: ["#0e1c28", "#1d4e3a", "#3d7a48", "#c4a15a", "#e8dcb8", "#f4f0e4"] },
  { id: "pastel-dust", name: "Pastel dust", paper: "#2a2c32", colors: ["#3a3038", "#d98ea2", "#f2c14a", "#7ec8c3", "#cbb6ea", "#fff6ee"] },
  { id: "dust-storm", name: "Dust storm", paper: "#8a7a68", colors: ["#2a241c", "#5c4a3a", "#8a7058", "#c4a888", "#e6d6c4", "#f6f0e8"] },
];

export function genreById(id: string) {
  return GENRES.find((g) => g.id === id) ?? GENRES[0];
}

export function paletteById(id: string) {
  return PALETTES.find((p) => p.id === id) ?? PALETTES[0];
}

export function paletteSwatch(palette: PaletteDef) {
  return palette.colors[Math.min(3, palette.colors.length - 1)];
}

export function rollJam(source: SessionConfig["source"] = "mic", subject = ""): SessionConfig {
  const pick = <T,>(arr: readonly T[]) => arr[Math.floor(Math.random() * arr.length)];
  const seconds = pick([30, 60, 90] as const);
  return {
    styleId: pick(STYLES).id,
    genreId: pick(GENRES).id,
    paletteId: pick(PALETTES).id,
    subject: subject.trim(),
    seconds,
    source,
  };
}

function g(partial: Guide): Guide {
  return partial;
}

const UFO: Guide[] = [
  g({ kind: "disc", x: 0.5, y: 0.36, rx: 0.28, ry: 0.05, rot: -0.05, weight: 1, bright: true }),
  g({ kind: "dome", x: 0.5, y: 0.318, rx: 0.1, ry: 0.045, rot: 0, weight: 0.8, bright: true }),
  g({ kind: "beam", x: 0.38, y: 0.52, rx: 0.02, ry: 0.14, rot: Math.PI / 2 + 0.18, weight: 0.7, bright: true }),
  g({ kind: "beam", x: 0.5, y: 0.56, rx: 0.028, ry: 0.18, rot: Math.PI / 2, weight: 1, bright: true }),
  g({ kind: "beam", x: 0.62, y: 0.52, rx: 0.02, ry: 0.14, rot: Math.PI / 2 - 0.18, weight: 0.7, bright: true }),
  g({ kind: "glow", x: 0.5, y: 0.8, rx: 0.24, ry: 0.035, rot: 0, weight: 0.5, bright: true }),
  g({ kind: "scatter", x: 0.5, y: 0.14, rx: 0.42, ry: 0.08, rot: 0, weight: 0.3 }),
];

const WOLF: Guide[] = [
  g({ kind: "mass", x: 0.46, y: 0.58, rx: 0.2, ry: 0.09, rot: -0.08, weight: 1 }),
  g({ kind: "mass", x: 0.7, y: 0.5, rx: 0.09, ry: 0.07, rot: 0.15, weight: 0.9 }),
  g({ kind: "ridge", x: 0.8, y: 0.52, rx: 0.07, ry: 0.015, rot: 0.25, weight: 0.5 }),
  g({ kind: "peak", x: 0.66, y: 0.43, rx: 0.025, ry: 0.045, rot: -0.5, weight: 0.4 }),
  g({ kind: "peak", x: 0.74, y: 0.42, rx: 0.025, ry: 0.05, rot: 0.3, weight: 0.4 }),
  g({ kind: "leg", x: 0.34, y: 0.74, rx: 0.015, ry: 0.09, rot: 1.5, weight: 0.45 }),
  g({ kind: "leg", x: 0.42, y: 0.75, rx: 0.015, ry: 0.1, rot: 1.55, weight: 0.45 }),
  g({ kind: "leg", x: 0.54, y: 0.75, rx: 0.015, ry: 0.1, rot: 1.6, weight: 0.45 }),
  g({ kind: "leg", x: 0.62, y: 0.74, rx: 0.014, ry: 0.08, rot: 1.5, weight: 0.4 }),
  g({ kind: "eye", x: 0.73, y: 0.485, rx: 0.012, ry: 0.012, rot: 0, weight: 0.5, bright: true }),
];

const CACTUS: Guide[] = [
  g({ kind: "leg", x: 0.5, y: 0.64, rx: 0.04, ry: 0.2, rot: Math.PI / 2, weight: 1 }),
  g({ kind: "ridge", x: 0.36, y: 0.52, rx: 0.12, ry: 0.02, rot: -0.35, weight: 0.75 }),
  g({ kind: "ridge", x: 0.66, y: 0.5, rx: 0.12, ry: 0.02, rot: 0.45, weight: 0.75 }),
  g({ kind: "peak", x: 0.5, y: 0.4, rx: 0.03, ry: 0.045, rot: 0, weight: 0.4 }),
];

const GUITAR: Guide[] = [
  g({ kind: "mass", x: 0.4, y: 0.7, rx: 0.14, ry: 0.16, rot: 0.45, weight: 1 }),
  g({ kind: "disc", x: 0.38, y: 0.68, rx: 0.04, ry: 0.05, rot: 0.45, weight: 0.45, dark: true }),
  g({ kind: "ridge", x: 0.58, y: 0.42, rx: 0.22, ry: 0.012, rot: -0.95, weight: 0.9 }),
  g({ kind: "mass", x: 0.76, y: 0.2, rx: 0.05, ry: 0.04, rot: -0.8, weight: 0.4 }),
];

const MOON: Guide[] = [
  g({ kind: "orb", x: 0.64, y: 0.28, rx: 0.13, ry: 0.13, rot: 0, weight: 1, bright: true }),
  g({ kind: "ridge", x: 0.42, y: 0.72, rx: 0.28, ry: 0.015, rot: 0.04, weight: 0.35 }),
  g({ kind: "mass", x: 0.32, y: 0.8, rx: 0.16, ry: 0.06, rot: 0, weight: 0.4, dark: true }),
];

const SUN: Guide[] = [
  g({ kind: "orb", x: 0.62, y: 0.32, rx: 0.12, ry: 0.12, rot: 0, weight: 1, bright: true }),
  g({ kind: "scatter", x: 0.62, y: 0.32, rx: 0.28, ry: 0.2, rot: 0, weight: 0.4, bright: true }),
  g({ kind: "ridge", x: 0.5, y: 0.7, rx: 0.46, ry: 0.015, rot: 0, weight: 0.4 }),
];

const MESA: Guide[] = [
  g({ kind: "mass", x: 0.42, y: 0.64, rx: 0.26, ry: 0.1, rot: 0, weight: 1 }),
  g({ kind: "ridge", x: 0.42, y: 0.54, rx: 0.26, ry: 0.012, rot: 0, weight: 0.55 }),
  g({ kind: "mass", x: 0.78, y: 0.68, rx: 0.1, ry: 0.07, rot: 0, weight: 0.5 }),
  g({ kind: "orb", x: 0.72, y: 0.28, rx: 0.07, ry: 0.07, rot: 0, weight: 0.4, bright: true }),
];

const TREE: Guide[] = [
  g({ kind: "leg", x: 0.5, y: 0.74, rx: 0.02, ry: 0.14, rot: Math.PI / 2, weight: 0.7 }),
  g({ kind: "mass", x: 0.5, y: 0.46, rx: 0.16, ry: 0.14, rot: 0, weight: 1 }),
  g({ kind: "mass", x: 0.36, y: 0.5, rx: 0.08, ry: 0.07, rot: 0, weight: 0.5 }),
  g({ kind: "mass", x: 0.64, y: 0.48, rx: 0.09, ry: 0.08, rot: 0, weight: 0.5 }),
];

const SKULL: Guide[] = [
  g({ kind: "mass", x: 0.5, y: 0.42, rx: 0.16, ry: 0.18, rot: 0, weight: 1 }),
  g({ kind: "eye", x: 0.43, y: 0.4, rx: 0.035, ry: 0.04, rot: 0, weight: 0.7, dark: true }),
  g({ kind: "eye", x: 0.57, y: 0.4, rx: 0.035, ry: 0.04, rot: 0, weight: 0.7, dark: true }),
  g({ kind: "ridge", x: 0.5, y: 0.5, rx: 0.035, ry: 0.012, rot: 0, weight: 0.35, dark: true }),
  g({ kind: "peak", x: 0.5, y: 0.64, rx: 0.08, ry: 0.05, rot: Math.PI, weight: 0.4 }),
];

const EYE: Guide[] = [
  g({ kind: "orb", x: 0.5, y: 0.46, rx: 0.2, ry: 0.1, rot: 0, weight: 1 }),
  g({ kind: "disc", x: 0.5, y: 0.46, rx: 0.07, ry: 0.07, rot: 0, weight: 0.8, dark: true }),
  g({ kind: "eye", x: 0.53, y: 0.45, rx: 0.018, ry: 0.018, rot: 0, weight: 0.5, bright: true }),
];

const FACE: Guide[] = [
  g({ kind: "mass", x: 0.5, y: 0.46, rx: 0.16, ry: 0.2, rot: 0, weight: 1 }),
  g({ kind: "eye", x: 0.43, y: 0.42, rx: 0.02, ry: 0.014, rot: 0, weight: 0.5, dark: true }),
  g({ kind: "eye", x: 0.57, y: 0.42, rx: 0.02, ry: 0.014, rot: 0, weight: 0.5, dark: true }),
  g({ kind: "ridge", x: 0.5, y: 0.56, rx: 0.05, ry: 0.01, rot: 0.04, weight: 0.35 }),
  g({ kind: "mass", x: 0.5, y: 0.74, rx: 0.18, ry: 0.1, rot: 0, weight: 0.35 }),
];

const BIRD: Guide[] = [
  g({ kind: "mass", x: 0.48, y: 0.5, rx: 0.07, ry: 0.045, rot: -0.2, weight: 0.8 }),
  g({ kind: "ridge", x: 0.3, y: 0.48, rx: 0.14, ry: 0.016, rot: -0.45, weight: 0.75 }),
  g({ kind: "ridge", x: 0.66, y: 0.46, rx: 0.14, ry: 0.016, rot: 0.35, weight: 0.75 }),
  g({ kind: "peak", x: 0.58, y: 0.5, rx: 0.04, ry: 0.012, rot: 0.2, weight: 0.3 }),
];

const HORSE: Guide[] = [
  g({ kind: "mass", x: 0.46, y: 0.58, rx: 0.18, ry: 0.08, rot: 0, weight: 1 }),
  g({ kind: "mass", x: 0.7, y: 0.44, rx: 0.055, ry: 0.09, rot: 0.35, weight: 0.7 }),
  g({ kind: "ridge", x: 0.78, y: 0.38, rx: 0.06, ry: 0.012, rot: 0.45, weight: 0.35 }),
  g({ kind: "leg", x: 0.34, y: 0.74, rx: 0.012, ry: 0.1, rot: Math.PI / 2, weight: 0.4 }),
  g({ kind: "leg", x: 0.44, y: 0.75, rx: 0.012, ry: 0.1, rot: Math.PI / 2, weight: 0.4 }),
  g({ kind: "leg", x: 0.56, y: 0.75, rx: 0.012, ry: 0.1, rot: Math.PI / 2, weight: 0.4 }),
  g({ kind: "leg", x: 0.64, y: 0.74, rx: 0.012, ry: 0.09, rot: Math.PI / 2, weight: 0.4 }),
];

const FLOWER: Guide[] = [
  g({ kind: "disc", x: 0.5, y: 0.4, rx: 0.055, ry: 0.055, rot: 0, weight: 0.6, bright: true }),
  g({ kind: "peak", x: 0.5, y: 0.28, rx: 0.04, ry: 0.06, rot: 0, weight: 0.5 }),
  g({ kind: "peak", x: 0.62, y: 0.36, rx: 0.04, ry: 0.06, rot: 1.1, weight: 0.5 }),
  g({ kind: "peak", x: 0.56, y: 0.52, rx: 0.04, ry: 0.06, rot: 2.2, weight: 0.5 }),
  g({ kind: "peak", x: 0.4, y: 0.5, rx: 0.04, ry: 0.06, rot: 3.6, weight: 0.5 }),
  g({ kind: "peak", x: 0.36, y: 0.36, rx: 0.04, ry: 0.06, rot: 4.7, weight: 0.5 }),
  g({ kind: "leg", x: 0.5, y: 0.7, rx: 0.01, ry: 0.14, rot: Math.PI / 2, weight: 0.35 }),
];

const CITY: Guide[] = [
  g({ kind: "leg", x: 0.22, y: 0.62, rx: 0.04, ry: 0.16, rot: Math.PI / 2, weight: 0.7 }),
  g({ kind: "leg", x: 0.36, y: 0.56, rx: 0.05, ry: 0.22, rot: Math.PI / 2, weight: 0.9 }),
  g({ kind: "leg", x: 0.5, y: 0.64, rx: 0.045, ry: 0.14, rot: Math.PI / 2, weight: 0.6 }),
  g({ kind: "leg", x: 0.66, y: 0.54, rx: 0.055, ry: 0.24, rot: Math.PI / 2, weight: 1 }),
  g({ kind: "leg", x: 0.8, y: 0.62, rx: 0.04, ry: 0.15, rot: Math.PI / 2, weight: 0.6 }),
  g({ kind: "orb", x: 0.78, y: 0.22, rx: 0.07, ry: 0.07, rot: 0, weight: 0.4, bright: true }),
  g({ kind: "ridge", x: 0.5, y: 0.84, rx: 0.46, ry: 0.01, rot: 0, weight: 0.3 }),
];

const RIDER: Guide[] = [
  g({ kind: "mass", x: 0.48, y: 0.62, rx: 0.18, ry: 0.07, rot: 0, weight: 1 }),
  g({ kind: "mass", x: 0.58, y: 0.46, rx: 0.05, ry: 0.07, rot: 0, weight: 0.6 }),
  g({ kind: "peak", x: 0.58, y: 0.38, rx: 0.06, ry: 0.02, rot: 0, weight: 0.35 }),
  g({ kind: "leg", x: 0.36, y: 0.76, rx: 0.012, ry: 0.08, rot: Math.PI / 2, weight: 0.35 }),
  g({ kind: "leg", x: 0.48, y: 0.76, rx: 0.012, ry: 0.08, rot: Math.PI / 2, weight: 0.35 }),
  g({ kind: "leg", x: 0.6, y: 0.76, rx: 0.012, ry: 0.08, rot: Math.PI / 2, weight: 0.35 }),
];

const ROAD: Guide[] = [
  g({ kind: "ridge", x: 0.5, y: 0.62, rx: 0.48, ry: 0.01, rot: 0, weight: 0.3 }),
  g({ kind: "ridge", x: 0.38, y: 0.78, rx: 0.2, ry: 0.012, rot: -1.05, weight: 0.8 }),
  g({ kind: "ridge", x: 0.62, y: 0.78, rx: 0.2, ry: 0.012, rot: 1.05, weight: 0.8 }),
  g({ kind: "orb", x: 0.72, y: 0.28, rx: 0.06, ry: 0.06, rot: 0, weight: 0.3, bright: true }),
];

const HEART: Guide[] = [
  g({ kind: "mass", x: 0.4, y: 0.4, rx: 0.1, ry: 0.09, rot: -0.4, weight: 0.8, bright: true }),
  g({ kind: "mass", x: 0.6, y: 0.4, rx: 0.1, ry: 0.09, rot: 0.4, weight: 0.8, bright: true }),
  g({ kind: "peak", x: 0.5, y: 0.62, rx: 0.16, ry: 0.14, rot: Math.PI, weight: 0.9, bright: true }),
];

const CROSS: Guide[] = [
  g({ kind: "ridge", x: 0.5, y: 0.48, rx: 0.02, ry: 0.22, rot: Math.PI / 2, weight: 1 }),
  g({ kind: "ridge", x: 0.5, y: 0.4, rx: 0.14, ry: 0.018, rot: 0, weight: 0.8 }),
];

const WAVE: Guide[] = [
  g({ kind: "ridge", x: 0.5, y: 0.42, rx: 0.42, ry: 0.02, rot: 0.08, weight: 0.7 }),
  g({ kind: "ridge", x: 0.48, y: 0.54, rx: 0.4, ry: 0.02, rot: -0.06, weight: 0.8 }),
  g({ kind: "ridge", x: 0.52, y: 0.66, rx: 0.44, ry: 0.025, rot: 0.05, weight: 0.9 }),
  g({ kind: "ridge", x: 0.5, y: 0.78, rx: 0.46, ry: 0.02, rot: -0.04, weight: 0.6 }),
];

const HAND: Guide[] = [
  g({ kind: "mass", x: 0.48, y: 0.62, rx: 0.12, ry: 0.1, rot: 0.1, weight: 1 }),
  g({ kind: "ridge", x: 0.36, y: 0.4, rx: 0.1, ry: 0.012, rot: -1.2, weight: 0.55 }),
  g({ kind: "ridge", x: 0.44, y: 0.36, rx: 0.12, ry: 0.012, rot: -1.45, weight: 0.6 }),
  g({ kind: "ridge", x: 0.52, y: 0.35, rx: 0.12, ry: 0.012, rot: -1.55, weight: 0.6 }),
  g({ kind: "ridge", x: 0.6, y: 0.4, rx: 0.1, ry: 0.012, rot: -1.3, weight: 0.5 }),
];

const FIGURE: Guide[] = [
  g({ kind: "mass", x: 0.52, y: 0.28, rx: 0.06, ry: 0.07, rot: 0.1, weight: 0.6 }),
  g({ kind: "mass", x: 0.5, y: 0.48, rx: 0.1, ry: 0.12, rot: 0.3, weight: 1 }),
  g({ kind: "ridge", x: 0.34, y: 0.46, rx: 0.12, ry: 0.015, rot: 0.7, weight: 0.45 }),
  g({ kind: "leg", x: 0.44, y: 0.72, rx: 0.016, ry: 0.12, rot: 1.3, weight: 0.5 }),
  g({ kind: "leg", x: 0.58, y: 0.72, rx: 0.016, ry: 0.12, rot: 1.8, weight: 0.5 }),
];

const RECIPES: { name: string; test: RegExp; guides: Guide[] }[] = [
  { name: "UFO", test: /\bufo\b|\bsaucer\b|\bspacecraft\b|flying saucer/, guides: UFO },
  { name: "Wolf", test: /\bwolf\b|\bcoyote\b|\bdog\b|\bhound\b/, guides: WOLF },
  { name: "Cholla", test: /\bcholla\b|\bcactus\b|\bsaguaro\b/, guides: CACTUS },
  { name: "Guitar", test: /\bguitar\b/, guides: GUITAR },
  { name: "Moon", test: /\bmoon\b|\bluna\b/, guides: MOON },
  { name: "Sun", test: /\bsun\b/, guides: SUN },
  { name: "Mesa", test: /\bmesa\b|\bmountain\b|\bbutte\b|\bpeak\b/, guides: MESA },
  { name: "Tree", test: /\btree\b|\bpine\b|\bcottonwood\b/, guides: TREE },
  { name: "Skull", test: /\bskull\b/, guides: SKULL },
  { name: "Eye", test: /\beye\b/, guides: EYE },
  { name: "Portrait", test: /\bface\b|\bportrait\b|\bwoman\b|\bman\b|\bgirl\b|\bboy\b/, guides: FACE },
  { name: "Bird", test: /\braven\b|\beagle\b|\bbird\b|\bowl\b/, guides: BIRD },
  { name: "Horse", test: /\bhorse\b/, guides: HORSE },
  { name: "Flower", test: /\bflower\b|\brose\b|\bbloom\b/, guides: FLOWER },
  { name: "Phoenix", test: /\bphoenix\b|\bcity\b|\bskyline\b|\btown\b/, guides: CITY },
  { name: "Cowboy", test: /\bcowboy\b|\brider\b/, guides: RIDER },
  { name: "Road", test: /\broad\b|\bhighway\b|county road/, guides: ROAD },
  { name: "Heart", test: /\bheart\b/, guides: HEART },
  { name: "Cross", test: /\bcross\b/, guides: CROSS },
  { name: "Wave", test: /\bwave\b|\bocean\b|\bsea\b/, guides: WAVE },
  { name: "Hand", test: /\bhand\b/, guides: HAND },
  { name: "Figure", test: /\bfigure\b|\bdancer\b|\bperson\b|\bbody\b/, guides: FIGURE },
];

export function subjectRecipe(subject: string) {
  const text = subject.trim().toLowerCase();
  if (!text) return null;
  return RECIPES.find((recipe) => recipe.test.test(text))?.name ?? null;
}

function genreSkeleton(genre: GenreDef): Guide[] {
  const guides: Guide[] = [];
  if (genre.horizon != null) {
    guides.push(g({ kind: "ridge", x: 0.5, y: genre.horizon, rx: 0.48, ry: 0.012, rot: 0, weight: 0.4 }));
    guides.push(
      g({
        kind: "mass",
        x: 0.5,
        y: Math.min(0.9, genre.horizon + 0.14),
        rx: 0.38,
        ry: 0.07,
        rot: 0,
        weight: 0.45,
      }),
    );
  }
  guides.push(
    g({
      kind: genre.radial > 0.5 ? "disc" : "glow",
      x: genre.focus.x,
      y: genre.focus.y,
      rx: genre.radial > 0.5 ? 0.14 : 0.16,
      ry: genre.radial > 0.5 ? 0.1 : 0.11,
      rot: 0,
      weight: 0.7,
      bright: true,
    }),
  );
  if (genre.radial > 0.5) {
    guides.push(g({ kind: "scatter", x: genre.focus.x, y: genre.focus.y, rx: 0.32, ry: 0.24, rot: 0, weight: 0.5 }));
  }
  return guides;
}

function unknownGuides(text: string, genre: GenreDef): Guide[] {
  const rng = mulberry32(hashString(text));
  const guides = genreSkeleton(genre);
  const n = 3 + (hashString(text) % 3);
  for (let i = 0; i < n; i++) {
    guides.push(
      g({
        kind: i === 0 ? "mass" : rng() > 0.5 ? "ridge" : "mass",
        x: 0.28 + rng() * 0.44,
        y: 0.3 + rng() * 0.36,
        rx: 0.08 + rng() * 0.12,
        ry: 0.045 + rng() * 0.09,
        rot: rng() * Math.PI,
        weight: 0.5 + rng() * 0.5,
      }),
    );
  }
  return guides;
}

export function guidesFor(_subject: string, genre: GenreDef): Guide[] {
  return genreSkeleton(genre);
}
