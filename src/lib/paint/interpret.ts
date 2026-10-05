import { clamp, type RGB } from "@/lib/paint/color";
import type { PaintFrame } from "@/lib/paint/types";

const ROOT_HUE = [8, 22, 36, 50, 96, 132, 162, 188, 214, 246, 276, 316];

export type PaintIntent = {
  hue: number;
  sat: number;
  light: number;
  beatMs: number;
  rot: number;
  wash: boolean;
  melody: boolean;
  impasto: boolean;
  silent: boolean;
  tension: boolean;
};

export function interpret(frame: PaintFrame, contour: number): PaintIntent {
  const root = frame.root >= 0 ? ((frame.root % 12) + 12) % 12 : 0;
  let hue = ROOT_HUE[root] ?? 28;
  const quality = frame.chord;
  if (quality === "Major") hue += 12;
  else if (quality === "Minor" || quality === "Minor7") hue -= 20;
  else if (quality === "Dominant") hue += 28;
  else if (quality === "Cluster" || quality === "Dissonant") hue += 168;
  hue = (hue + 360) % 360;
  const sat = clamp(48 + frame.level * 36 + (quality === "Dominant" ? 10 : 0), 48, 88);
  const light = clamp(36 + frame.level * 28, 36, 70);
  const perSec = Math.max(0.45, frame.rate || 0.7);
  const beatMs = clamp(1000 / perSec, 180, 680);
  const silent = !frame.sounding || frame.level < 0.07;
  const wash = !silent && !frame.thin && (quality !== "" || frame.voices >= 2 || frame.density >= 0.34);
  const impasto = !silent && frame.onset && frame.level > 0.5 && frame.strength > 0.4;
  const melody = !silent && frame.onset && frame.strength > 0.28 && !impasto;
  return {
    hue,
    sat,
    light,
    beatMs,
    rot: contour,
    wash,
    melody,
    impasto,
    silent,
    tension: quality === "Dominant" || quality === "Cluster" || quality === "Dissonant",
  };
}

const NOTE_HUE = [6, 26, 46, 64, 98, 132, 164, 196, 220, 250, 284, 318];

export function noteHue(pc: number, chord = ""): number {
  let hue = NOTE_HUE[((pc % 12) + 12) % 12] ?? 28;
  if (chord === "Major") hue += 12;
  else if (chord === "Minor" || chord === "Minor7") hue -= 18;
  else if (chord === "Dominant") hue += 32;
  else if (chord === "Cluster" || chord === "Dissonant") hue += 150;
  return (hue + 360) % 360;
}

export function complements(a: number, b: number) {
  const d = Math.abs(a - b) % 360;
  const gap = Math.min(d, 360 - d);
  return gap > 150 && gap < 210;
}

export function noteColor(pc: number, chord = "", level = 0.45): RGB {
  const sat = clamp(48 + level * 34 + (chord === "Dominant" ? 8 : 0), 48, 88);
  const light = clamp(36 + level * 28, 36, 70);
  return hsl(noteHue(pc, chord), sat, light);
}

export function neutralGap(): RGB {
  return hsl(34, 8, 64);
}

export function intentColor(intent: PaintIntent, shift = 0, satScale = 1, lightScale = 1): RGB {
  return hsl((intent.hue + shift + 360) % 360, intent.sat * satScale, intent.light * lightScale);
}

function hsl(h: number, s: number, l: number): RGB {
  const sat = clamp(s, 0, 100) / 100;
  const light = clamp(l, 0, 100) / 100;
  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0;
  let g = 0;
  let b = 0;
  if (hp < 1) {
    r = c;
    g = x;
  } else if (hp < 2) {
    r = x;
    g = c;
  } else if (hp < 3) {
    g = c;
    b = x;
  } else if (hp < 4) {
    g = x;
    b = c;
  } else if (hp < 5) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  const m = light - c / 2;
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}
