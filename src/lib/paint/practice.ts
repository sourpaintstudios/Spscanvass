import { midiToFreq } from "@/lib/paint/listener";
import type { PaintFrame, SourceMode } from "@/lib/paint/types";

const NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

type Note = { t: number; dur: number; midi: number; vel: number };

function buildTender(ms: number): Note[] {
  const notes: Note[] = [];
  const beat = 60000 / 64;
  const scale = [57, 60, 62, 64, 67, 69, 67, 64, 62, 60, 69, 72, 69, 64];
  let t = 420;
  let i = 0;
  while (t < ms) {
    notes.push({
      t,
      dur: beat * 1.65,
      midi: scale[i % scale.length] + (i % 11 === 0 ? -12 : 0),
      vel: 0.28 + (i % 5) * 0.03,
    });
    t += beat * 2;
    i++;
  }
  return notes;
}

function buildHard(ms: number): Note[] {
  const notes: Note[] = [];
  const eighth = 60000 / 150 / 2;
  const midis = [40, 47, 52, 47, 40, 55, 52, 47];
  const pattern = [0.55, 0.55, 1.15];
  let t = 220;
  let i = 0;
  while (t < ms) {
    notes.push({
      t,
      dur: eighth * 0.32,
      midi: midis[i % midis.length] + (i % 16 > 11 ? 12 : 0),
      vel: 0.8 + (i % 4) * 0.045,
    });
    t += eighth * pattern[i % 3];
    i++;
  }
  return notes;
}

export class PracticePlayer {
  private origin = 0;
  private cursor = 0;
  private activeUntil = -1;
  private active: Note | null = null;
  private lastNorm = 0.55;
  private readonly notes: Note[];
  private readonly hard: boolean;

  constructor(mode: Exclude<SourceMode, "mic">) {
    this.hard = mode === "hard";
    this.notes = this.hard ? buildHard(95000) : buildTender(95000);
    this.lastNorm = this.hard ? 0.18 : 0.62;
  }

  start(now: number) {
    this.origin = now;
    this.cursor = 0;
  }

  frame(now: number): PaintFrame {
    const t = now - this.origin;
    let onset = false;
    let strength = 0;
    while (this.cursor < this.notes.length && this.notes[this.cursor].t <= t) {
      const note = this.notes[this.cursor];
      this.cursor += 1;
      if (t - note.t < 48) {
        onset = true;
        strength = note.vel;
        this.active = note;
        this.activeUntil = note.t + note.dur;
        this.lastNorm = Math.max(0, Math.min(1, (note.midi - 40) / 48));
      }
    }
    const sounding = this.active != null && t < this.activeUntil;
    const midi = sounding && this.active ? this.active.midi : null;
    const nearest = midi == null ? 0 : Math.round(midi);
    return {
      rms: sounding ? 0.08 : 0,
      level: sounding ? (this.active?.vel ?? 0) : 0,
      sounding,
      onset,
      strength: onset ? strength : 0,
      rate: this.hard ? 6.2 : 0.55,
      speed: this.hard ? 0.88 : 0.06,
      freq: midi == null ? 0 : midiToFreq(midi),
      midi,
      pitchNorm: this.lastNorm,
      note: midi == null ? "" : (NAMES[((nearest % 12) + 12) % 12] ?? ""),
      octave: midi == null ? null : Math.floor(nearest / 12) - 1,
      cents: 0,
      clarity: sounding ? 0.95 : 0,
      crest: sounding ? 5 : 0,
      mood: this.hard ? 0.84 : -0.74,
      staccato: this.hard ? 0.92 : 0.12,
      gallop: this.hard,
      voices: sounding ? (this.hard ? 4 : 3) : 0,
      density: sounding ? (this.hard ? 0.82 : 0.42) : 0,
      brightness: this.hard ? 0.74 : 0.3,
      low: this.hard ? 0.72 : 0.34,
      tone: sounding ? 0.8 : 0,
      tension: this.hard ? 0.78 : 0.22,
      stable: sounding && !onset ? 0.88 : 0.2,
      thin: !sounding,
      changed: onset,
      chord: sounding ? (this.hard ? "Cluster" : "Minor") : "",
      approach: sounding ? (this.hard ? 0.8 : -0.2) : 0,
      lift: sounding ? (this.hard ? 0.5 : -0.4) : 0,
      root: sounding ? (this.hard ? 7 : 2) : -1,
      notes: sounding ? (this.hard ? [7, 11, 2] : [2]) : [],
    };
  }
}
