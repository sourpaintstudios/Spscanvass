import {
  clamp,
  darken,
  hexToRgb,
  lighten,
  mix,
  mulberry32,
  samplePalette,
  type RGB,
} from "@/lib/paint/color";
import { createMark, drawMark, drawSignature, drawVignette } from "@/lib/paint/draw";
import { complements, intentColor, interpret, neutralGap, noteColor, type PaintIntent } from "@/lib/paint/interpret";
import { styleById } from "@/lib/paint/styles";
import type { Guide, GuideKind, Mark, MarkKind, PaintFrame, SessionConfig, StyleDef } from "@/lib/paint/types";
import { genreById, guidesFor, paletteById } from "@/lib/paint/world";

const PREFER: Record<GuideKind, MarkKind[]> = {
  disc: ["dab", "bristle", "knife", "block", "wash", "stroke"],
  dome: ["stroke", "outline", "bristle", "wash", "dab"],
  beam: ["wash", "streak", "stroke", "drip", "knife", "block"],
  glow: ["wash", "glaze", "pool"],
  mass: ["dab", "block", "wash", "bristle", "knife"],
  ridge: ["stroke", "drybrush", "bristle", "knife"],
  peak: ["knife", "stroke", "block", "dab"],
  leg: ["stroke", "block", "bristle", "knife"],
  eye: ["dab", "dot", "block"],
  scatter: ["dot", "splatter", "stroke"],
  orb: ["wash", "glaze", "dab", "block"],
};

function weighted(style: StyleDef, rng: () => number): MarkKind {
  let sum = 0;
  for (const item of style.marks) sum += item.w;
  let r = rng() * sum;
  for (const item of style.marks) {
    r -= item.w;
    if (r <= 0) return item.kind;
  }
  return style.marks[0]?.kind ?? "stroke";
}

function pickKind(style: StyleDef, prefer: MarkKind[], rng: () => number): MarkKind {
  const have = prefer.filter((kind) => style.marks.some((m) => m.kind === kind));
  if (have.length && rng() < 0.82) return have[Math.floor(rng() * have.length)];
  return weighted(style, rng);
}

export class Painter {
  readonly paper: string;
  readonly vignette: number;
  readonly marks: Mark[] = [];
  private queue: Mark[] = [];
  private paint: HTMLCanvasElement | null = null;
  private pctx: CanvasRenderingContext2D | null = null;
  private rng: () => number;
  private perf = 0;
  private perfMax: number;
  private lastSustain = 0;
  private lastX = 0.5;
  private lastY = 0.5;
  private massRot = 0;
  private gallopFlip = false;
  private lastMusical = 0;
  private lastAttack = 0;
  private lastRelease = 0;
  private born = 0;
  private dirty = true;
  private region = -1;
  private readonly cols = 18;
  private readonly rows = 32;
  private readonly taken = new Uint8Array(18 * 32);
  private theme: "" | "land" | "tree" = "";
  private phraseHue = 40;
  private washed = false;
  private washX = 0.5;
  private washY = 0.46;
  private lastDrip = 0;
  private noteN = 0;
  private contour = -0.2;
  private lastNotes: number[] = [];
  private washKey = "";
  private lineKey = "";
  private lastIntent: PaintIntent | null = null;
  private nextBeat = 0;
  private queued: number[] | null = null;
  private readonly loads = new Uint8Array(18 * 32);
  private readonly hues = new Int16Array(18 * 32).fill(-1);
  private readonly cap = 3;
  private readonly livePaint: boolean;
  private readonly seconds: number;
  private readonly style: StyleDef;
  private readonly genre: ReturnType<typeof genreById>;
  private readonly guides: Guide[];
  private readonly colors: RGB[];
  private readonly line: RGB;
  private readonly w: number;
  private readonly h: number;

  constructor(config: SessionConfig, seed: number, live = false) {
    this.style = styleById(config.styleId);
    this.genre = genreById(config.genreId);
    const palette = paletteById(config.paletteId);
    this.paper = live ? "#d6cec2" : palette.paper;
    this.livePaint = live;
    this.vignette = this.genre.vignette;
    this.colors = palette.colors.map(hexToRgb);
    this.line = darken(this.colors[0] ?? { r: 0, g: 0, b: 0 }, 0.55);
    this.guides = guidesFor(config.subject, this.genre);
    const title = config.subject.toLowerCase();
    if (/tree|cholla|cactus|branch|pine/.test(title)) this.theme = "tree";
    else if (/land|desert|horizon|night|road|sky|western|field|mesa/.test(title)) this.theme = "land";
    this.rng = mulberry32(seed || 1);
    this.perfMax = Math.max(live ? 90 : 18, Math.round(config.seconds * (live ? 8 : 1.35) * Math.max(0.75, this.style.density)));
    this.seconds = config.seconds;
    this.w = 720;
    this.h = 1280;
    if (live && typeof document !== "undefined") {
      this.paint = document.createElement("canvas");
      this.paint.width = this.w;
      this.paint.height = this.h;
      this.pctx = this.paint.getContext("2d");
    }
  }

  begin() {
    if (this.pctx && this.paint) {
      this.pctx.fillStyle = this.paper;
      this.pctx.fillRect(0, 0, this.paint.width, this.paint.height);
      if (this.livePaint) this.weave(this.pctx, this.paint.width, this.paint.height);
    }
    if (this.paint) return;
    const paperRgb = hexToRgb(this.paper);
    const grain = mix(paperRgb, this.colors[Math.min(2, this.colors.length - 1)] ?? paperRgb, 0.35);
    this.commit(
      createMark({
        kind: "grain",
        x: 0.5,
        y: 0.5,
        r: grain.r,
        g: grain.g,
        b: grain.b,
        a: 0.2,
        seed: this.nextSeed(),
      }),
    );
    for (const mark of this.groundMarks()) this.commit(mark);
    this.queue = this.skeletonMarks();
  }

  flush() {
    while (this.queue.length) {
      const mark = this.queue.shift();
      if (mark) this.commit(mark);
    }
  }

  tick(now: number, frame: PaintFrame | null) {
    if (!this.born) this.born = now;
    if (this.queue.length && now - this.lastRelease > 36) {
      const mark = this.queue.shift();
      if (mark) this.commit(mark);
      this.lastRelease = now;
    }
    if (!frame || !frame.sounding || frame.level < 0.07) return;
    this.contour = this.contour * 0.9 + frame.lift * 0.85;
    this.lastIntent = interpret(frame, this.contour);
    this.heard = frame;
    const notes = frame.notes.filter((pc) => pc >= 0 && pc < 12).slice(0, 4);
    if (notes.length >= 3) {
      const key = notes.slice().sort((a, b) => a - b).join(",");
      if (key !== this.washKey) {
        this.openPhrase(frame);
        this.layChordWash(notes);
        this.washKey = key;
        this.lineKey = "";
        this.queued = null;
      } else if (now - this.lastDrip > 260) {
        this.runPaint();
        this.lastDrip = now;
      }
    } else if (notes.length > 0 && (frame.onset || notes.join(",") !== this.lineKey)) {
      this.queued = notes.slice();
      this.lineKey = notes.join(",");
    }
    if (this.queued && now >= this.nextBeat) {
      const loud = frame.level > 0.55 && frame.strength > 0.4;
      if (this.region < 0) this.openPhrase(frame);
      this.queued.forEach((pc, index) => (loud ? this.layImpasto(pc, index) : this.layNoteLine(pc, index)));
      this.queued = null;
      this.nextBeat = now + (this.lastIntent?.beatMs ?? 420);
    } else if (notes.length > 0 && now >= this.nextBeat) {
      const pc = notes[Math.floor(this.rng() * notes.length)] ?? notes[0] ?? 0;
      this.layNoteLine(pc, 0);
      this.nextBeat = now + 360;
    }
    this.lastMusical = now;
  }

  composite(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.clearRect(0, 0, w, h);
    if (this.paint) ctx.drawImage(this.paint, 0, 0, w, h);
    else this.paintMarks(ctx, w, h);
    drawVignette(ctx, this.paint ? Math.min(0.16, this.vignette * 0.22) : this.vignette, w, h);
    drawSignature(ctx, w, h);
  }

  renderFull(ctx: CanvasRenderingContext2D, w: number, h: number) {
    this.paintMarks(ctx, w, h);
    drawVignette(ctx, this.vignette, w, h);
    drawSignature(ctx, w, h);
  }

  renderPrint(ctx: CanvasRenderingContext2D, w: number, h: number) {
    this.paintMarks(ctx, w, h);
    drawSignature(ctx, w, h);
  }

  async exportBlob(type: "image/png" | "image/jpeg", w: number, h: number, quality?: number, print = false) {
    if (typeof document !== "undefined" && document.fonts?.ready) {
      try {
        await document.fonts.ready;
      } catch {
        /* signature falls back */
      }
    }
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not export the painting.");
    if (print) this.renderPrint(ctx, w, h);
    else this.renderFull(ctx, w, h);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
    if (!blob) throw new Error("Could not export the painting.");
    return blob;
  }

  async exportPrint() {
    const tries: [number, number][] = [
      [8640, 15360],
      [5760, 10240],
      [4320, 7680],
      [2160, 3840],
      [1800, 3200],
    ];
    for (const [w, h] of tries) {
      const canvas = document.createElement("canvas");
      try {
        canvas.width = w;
        canvas.height = h;
      } catch {
        continue;
      }
      if (canvas.width !== w || canvas.height !== h) continue;
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;
      try {
        if (typeof document !== "undefined" && document.fonts?.ready) await document.fonts.ready.catch(() => undefined);
        this.renderPrint(ctx, w, h);
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
        if (blob && blob.size > 8000) return blob;
      } catch {
        /* this size would not hold */
      }
    }
    return this.exportBlob("image/png", 1800, 3200, undefined, true);
  }

  private weave(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.save();
    ctx.fillStyle = "#c4b496";
    ctx.fillRect(0, 0, w, h);
    const gap = 4;
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(92, 68, 42, 0.28)";
    for (let y = 0; y < h; y += gap) {
      ctx.beginPath();
      const shift = (y / gap) % 2 === 0 ? 0 : 2;
      ctx.moveTo(shift, y + 0.5);
      ctx.lineTo(w, y + 0.5);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(255, 244, 220, 0.18)";
    for (let x = 0; x < w; x += gap) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, h);
      ctx.stroke();
    }
    ctx.restore();
  }

  private paintMarks(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.fillStyle = this.paper;
    ctx.fillRect(0, 0, w, h);
    if (this.livePaint) this.weave(ctx, w, h);
    for (const mark of this.marks) drawMark(ctx, mark, w, h);
  }

  private commit(mark: Mark) {
    this.marks.push(mark);
    this.dirty = true;
    if (this.pctx && this.paint) drawMark(this.pctx, mark, this.paint.width, this.paint.height);
  }

  consumeDirty() {
    const changed = this.dirty;
    this.dirty = false;
    return changed;
  }

  private nextSeed() {
    return (this.rng() * 1e9) >>> 0;
  }

  private tone(guide: Guide | null, t: number): RGB {
    if (this.style.reveal) return samplePalette(this.colors, 0.72 + t * 0.28);
    if (guide?.dark) return this.colors[0] ?? { r: 10, g: 10, b: 10 };
    if (guide?.bright) return this.colors[Math.max(0, this.colors.length - 2)] ?? { r: 255, g: 255, b: 255 };
    return samplePalette(this.colors, t);
  }

  private stamp(
    kind: MarkKind,
    x: number,
    y: number,
    len: number,
    thick: number,
    rot: number,
    rgb: RGB,
    alpha: number,
  ): Mark {
    const alt = lighten(rgb, 0.28);
    return createMark({
      kind,
      x,
      y,
      len,
      thick,
      rot,
      r: rgb.r,
      g: rgb.g,
      b: rgb.b,
      a: alpha,
      r2: alt.r,
      g2: alt.g,
      b2: alt.b,
      seed: this.nextSeed(),
      bristles: this.style.bristles,
      bleed: this.style.bleed,
      breakUp: this.style.breakUp,
      keyline: this.style.keyline,
      lr: this.line.r,
      lg: this.line.g,
      lb: this.line.b,
      hardness: this.style.hardness,
      echo: this.style.echo,
    });
  }

  private groundMarks(): Mark[] {
    const style = this.style;
    const genre = this.genre;
    const marks: Mark[] = [];
    const alpha = clamp((style.alpha[0] + style.alpha[1]) / 2, 0.18, 1);
    const kind = style.ground;
    if (style.reveal) {
      marks.push(this.stamp("block", 0.5, 0.5, 0.72, 1.15, 0, this.colors[0] ?? { r: 8, g: 8, b: 8 }, 1));
      return marks;
    }
    const sky = this.colors[Math.max(0, this.colors.length - 2)] ?? { r: 200, g: 200, b: 200 };
    const mid = samplePalette(this.colors, 0.55);
    const land = this.colors[Math.min(1, this.colors.length - 1)] ?? mid;
    if (genre.horizon != null) {
      for (let i = 0; i < 4; i++) {
        marks.push(
          this.stamp(
            kind === "block" || kind === "knife" ? kind : "wash",
            0.2 + i * 0.2,
            genre.horizon * (0.25 + i * 0.14),
            0.34,
            0.05,
            0,
            i % 2 ? sky : mid,
            alpha * 0.85,
          ),
        );
      }
      for (let i = 0; i < 3; i++) {
        marks.push(
          this.stamp(
            kind,
            0.3 + i * 0.18,
            genre.horizon + 0.08 + i * 0.08,
            0.42,
            0.035,
            0.02,
            land,
            Math.min(1, alpha),
          ),
        );
      }
      return marks;
    }
    if (genre.radial > 0.55) {
      for (let i = 0; i < 9; i++) {
        const ang = (i / 9) * Math.PI * 2;
        marks.push(
          this.stamp(
            kind === "wash" ? "streak" : kind,
            genre.focus.x + Math.cos(ang) * 0.12,
            genre.focus.y + Math.sin(ang) * 0.1,
            0.28,
            0.02,
            ang,
            i % 2 ? sky : mid,
            alpha,
          ),
        );
      }
      marks.push(this.stamp("wash", genre.focus.x, genre.focus.y, 0.2, 0.08, 0, sky, alpha * 0.8));
      return marks;
    }
    for (let i = 0; i < 4; i++) {
      marks.push(
        this.stamp(
          kind,
          0.28 + this.rng() * 0.44,
          0.22 + this.rng() * 0.5,
          0.26 + this.rng() * 0.12,
          0.04,
          this.rng() * Math.PI,
          i % 2 ? mid : land,
          alpha,
        ),
      );
    }
    return marks;
  }

  private skeletonMarks(): Mark[] {
    const out: Mark[] = [];
    const cap = this.style.spare ? 16 : 42;
    for (const guide of this.guides) {
      if (out.length >= cap) break;
      this.emitGuide(guide, out, cap);
    }
    return out;
  }

  private lineKind(): MarkKind {
    if (this.style.reveal) return "scratch";
    const order: MarkKind[] = ["stroke", "bristle", "drybrush", "outline", "knife", "hatch", "streak", "dab"];
    for (const kind of order) {
      if (this.style.marks.some((mark) => mark.kind === kind)) return kind;
    }
    return this.style.marks[0]?.kind ?? "stroke";
  }

  private ink(guide: Guide, baseAlpha: number) {
    if (guide.bright) return Math.max(baseAlpha, 0.86);
    if (guide.dark) return Math.max(baseAlpha, 0.72);
    return Math.max(baseAlpha, 0.5);
  }

  private axisLen(nx: number) {
    return (nx * this.w) / Math.min(this.w, this.h);
  }

  private axisThick(ny: number) {
    return (ny * this.h) / Math.min(this.w, this.h);
  }

  private emitGuide(guide: Guide, out: Mark[], cap: number) {
    const style = this.style;
    const prefer: MarkKind[] = style.reveal
      ? ["scratch", "stroke", "drybrush"]
      : PREFER[guide.kind];
    const baseAlpha = clamp((style.alpha[0] + style.alpha[1]) / 2, 0.15, 1);
    const rgb = this.tone(guide, guide.bright ? 0.9 : guide.dark ? 0.08 : 0.62);
    const ink = this.ink(guide, baseAlpha);
    const push = (mark: Mark) => {
      if (out.length < cap) out.push(mark);
    };
    const line = this.lineKind();
    if (guide.kind === "disc" || guide.kind === "orb" || guide.kind === "dome") {
      const count = guide.kind === "dome" ? 8 : guide.kind === "orb" ? 12 : 16;
      const span = guide.kind === "dome" ? Math.PI : Math.PI * 2;
      const a0 = guide.kind === "dome" ? Math.PI : 0;
      const chord = guide.kind === "orb" ? this.axisLen(guide.rx) * 0.42 : this.axisLen(guide.rx) * 0.2;
      const rim = Math.max(0.006, this.axisThick(guide.ry) * (guide.kind === "orb" ? 0.16 : 0.28));
      for (let i = 0; i < count; i++) {
        const a = a0 + ((i + 0.5) / count) * span;
        push(
          this.stamp(
            line,
            guide.x + Math.cos(a) * guide.rx * 0.92,
            guide.y + Math.sin(a) * guide.ry * 0.92,
            Math.max(0.03, chord),
            rim,
            a + Math.PI / 2,
            rgb,
            ink,
          ),
        );
      }
      push(
        this.stamp(
          line,
          guide.x,
          guide.y,
          this.axisLen(guide.rx) * (guide.kind === "dome" ? 1.15 : 1.85),
          Math.max(0.007, this.axisThick(guide.ry) * 0.22),
          guide.rot,
          rgb,
          ink,
        ),
      );
      push(
        this.stamp(
          pickKind(style, ["wash", "glaze", "pool", "dab", "block"] as MarkKind[], this.rng),
          guide.x,
          guide.y,
          this.axisLen(guide.rx) * (guide.kind === "dome" ? 0.55 : 0.42),
          Math.max(0.02, this.axisThick(guide.ry) * 0.7),
          guide.rot,
          rgb,
          ink * 0.62,
        ),
      );
      return;
    }
    if (guide.kind === "beam" || guide.kind === "ridge" || guide.kind === "leg") {
      const unit = Math.min(this.w, this.h);
      const along = (Math.max(guide.rx * this.w, guide.ry * this.h) * 2) / unit;
      const across = Math.max(0.008, (Math.min(guide.rx * this.w, guide.ry * this.h) * 1.6) / unit);
      push(this.stamp(line, guide.x, guide.y, along, across, guide.rot, rgb, ink));
      if (guide.kind === "beam") {
        push(
          this.stamp(
            "wash",
            guide.x,
            guide.y,
            along * 0.42,
            across * 1.8,
            guide.rot,
            this.tone(guide, 0.96),
            Math.min(0.5, ink),
          ),
        );
      }
      return;
    }
    if (guide.kind === "glow") {
      push(this.stamp("wash", guide.x, guide.y, Math.max(guide.rx, 0.12), guide.ry, 0, rgb, baseAlpha * 0.75));
      return;
    }
    if (guide.kind === "scatter") {
      const dots = style.spare ? 4 : 8;
      for (let i = 0; i < dots; i++) {
        push(
          this.stamp(
            pickKind(style, ["dot", "splatter", "dab", "stroke"] as MarkKind[], this.rng),
            guide.x + (this.rng() - 0.5) * guide.rx * 2,
            guide.y + (this.rng() - 0.5) * guide.ry * 2,
            0.03 + this.rng() * 0.04,
            0.008,
            this.rng() * Math.PI,
            this.tone(guide, 0.4 + this.rng() * 0.5),
            baseAlpha,
          ),
        );
      }
      return;
    }
    if (guide.kind === "eye") {
      push(this.stamp("dab", guide.x, guide.y, guide.rx * 2.2, guide.ry, 0, this.tone(guide, guide.dark ? 0.05 : 0.9), 1));
      return;
    }
    const count = style.spare ? 2 : 4;
    for (let i = 0; i < count; i++) {
      push(
        this.stamp(
          pickKind(style, prefer, this.rng),
          guide.x + (this.rng() - 0.5) * guide.rx,
          guide.y + (this.rng() - 0.5) * guide.ry,
          Math.max(0.05, guide.rx * (0.6 + this.rng() * 0.5)),
          Math.max(0.012, guide.ry * 0.4) * style.size,
          guide.rot + (this.rng() - 0.5) * 0.6,
          rgb,
          baseAlpha,
        ),
      );
    }
  }

  private toneColor(shift = 0, satScale = 1, lightScale = 1): RGB {
    if (!this.lastIntent) return hsl(this.phraseHue, 58, 52);
    return intentColor(this.lastIntent, shift, satScale, lightScale);
  }

  private heard: PaintFrame | null = null;

  private pigment(pc: number) {
    return noteColor(pc, this.heard?.chord ?? "", this.heard?.level ?? 0.45);
  }

  private seat(x: number, y: number, hue: number, down = false) {
    const spot = this.openSeat(x, y, down);
    if (!spot) return null;
    const index = this.cell(spot.x, spot.y);
    const prev = this.hues[index] ?? -1;
    let sx = spot.x;
    let sy = spot.y;
    if (prev >= 0 && complements(prev, hue)) {
      const gap = this.stamp("wash", spot.x, spot.y, 0.07, 0.01, 0, neutralGap(), 0.4);
      gap.bleed = 0.2;
      gap.keyline = 0;
      this.commit(gap);
      this.perf += 1;
      sx = clamp(spot.x + 0.07, 0.1, 0.9);
      sy = clamp(spot.y, 0.1, 0.9);
      const shifted = this.openSeat(sx, sy, down) ?? { x: sx, y: sy };
      sx = shifted.x;
      sy = shifted.y;
    }
    const landed = this.cell(sx, sy);
    this.loads[landed] = Math.min(this.cap, (this.loads[landed] ?? 0) + 1);
    this.hues[landed] = hue;
    return { x: sx, y: sy, wet: (this.loads[landed] ?? 0) > 1 };
  }

  private openSeat(x: number, y: number, down: boolean) {
    const tryAt = (nx: number, ny: number) => {
      if (nx < 0.08 || nx > 0.92 || ny < 0.08 || ny > 0.92) return null;
      if ((this.loads[this.cell(nx, ny)] ?? 0) >= this.cap) return null;
      return { x: nx, y: ny };
    };
    const here = tryAt(x, y);
    if (here) return here;
    const steps = down
      ? [
          [0, 0.045],
          [0.06, 0.04],
          [-0.06, 0.04],
          [0.1, 0],
          [-0.1, 0],
        ]
      : [
          [0.07, 0],
          [-0.07, 0],
          [0, -0.05],
          [0, 0.05],
          [0.1, -0.04],
          [-0.1, 0.04],
        ];
    for (let ring = 1; ring <= 8; ring++) {
      for (const [dx, dy] of steps) {
        const spot = tryAt(x + (dx ?? 0) * ring, y + (dy ?? 0) * ring);
        if (spot) return spot;
      }
    }
    return null;
  }

  private layChordWash(notes: number[]) {
    this.lastNotes = notes.slice(0, 3);
    this.washed = true;
    this.washX = this.lastX;
    this.washY = this.lastY;
    this.lastNotes.forEach((pc, index) => {
      this.ribbon(pc, index, 0.7 + this.rng() * 0.35, 0.02 + this.rng() * 0.018, 0.5);
    });
  }

  private drop(pc: number, slot = 0) {
    const rgb = this.pigment(pc);
    const x = clamp(this.washX + (slot - 1) * 0.04, 0.12, 0.88);
    const y = clamp(this.washY + 0.04, 0.12, 0.86);
    const mark = this.stamp("drip", x, y, 0.18 + this.rng() * 0.16, 0.008, Math.PI / 2, rgb, 0.55);
    mark.keyline = 0;
    mark.bleed = 0;
    this.commit(mark);
    this.perf += 1;
    this.noteN += 1;
  }

  private runPaint() {
    const notes = this.lastNotes.length ? this.lastNotes : [0];
    const pc = notes[Math.floor(this.rng() * notes.length)] ?? 0;
    this.drop(pc, Math.floor(this.rng() * 3));
    this.dots(pc, this.washX, this.washY);
  }

  private ribbon(pc: number, index: number, len: number, thick: number, alpha: number) {
    const rgb = this.pigment(pc);
    const rot = (this.lastIntent?.rot ?? this.contour) + index * 0.7 + (this.rng() - 0.5) * 0.5;
    const x = clamp(this.lastX, 0.14, 0.86);
    const y = clamp(this.lastY, 0.12, 0.84);
    const mark = this.stamp("stroke", x, y, len, thick, rot, rgb, alpha);
    mark.bleed = 0.15;
    mark.breakUp = 0;
    mark.keyline = 0;
    this.commit(mark);
    this.perf += 1;
    if (this.rng() < 0.45) {
      const thin = this.stamp("stroke", x, y, len * 0.72, Math.max(0.003, thick * 0.22), rot + 0.18, rgb, alpha * 0.7);
      thin.bleed = 0;
      thin.breakUp = 0;
      thin.keyline = 0;
      this.commit(thin);
    }
    this.dots(pc, x, y);
    const step = 0.1;
    const nx = x + Math.cos(rot) * step;
    const ny = y + Math.sin(rot) * step;
    this.lastX = clamp(nx * 0.62 + 0.5 * 0.38, 0.22, 0.78);
    this.lastY = clamp(ny * 0.62 + 0.46 * 0.38, 0.2, 0.68);
    this.washX = this.lastX;
    this.washY = this.lastY;
  }

  private dots(pc: number, x: number, y: number) {
    const rgb = this.pigment(pc);
    const n = 2 + Math.floor(this.rng() * 3);
    for (let i = 0; i < n; i++) {
      const mark = this.stamp(
        "dot",
        clamp(x + (this.rng() - 0.5) * 0.22, 0.08, 0.92),
        clamp(y + (this.rng() - 0.5) * 0.18, 0.08, 0.9),
        0.02 + this.rng() * 0.03,
        0.006,
        0,
        rgb,
        0.65,
      );
      mark.keyline = 0;
      mark.bleed = 0;
      this.commit(mark);
    }
  }

  private layNoteLine(pc: number, index: number) {
    this.ribbon(pc, index, 0.62 + this.rng() * 0.4, 0.014 + this.rng() * 0.016, 0.52 + this.rng() * 0.18);
  }

  private layImpasto(pc: number, index: number) {
    this.ribbon(pc, index, 0.5 + this.rng() * 0.35, 0.028 + this.rng() * 0.03, 0.62);
  }

  private cell(x: number, y: number) {
    const c = clamp(Math.floor(x * this.cols), 0, this.cols - 1);
    const r = clamp(Math.floor(y * this.rows), 0, this.rows - 1);
    return r * this.cols + c;
  }

  private free(x: number, y: number) {
    if (x < 0.06 || x > 0.94 || y < 0.06 || y > 0.94) return false;
    return this.taken[this.cell(x, y)] === 0;
  }

  private claim(x: number, y: number) {
    const i = this.cell(x, y);
    if (this.taken[i]) return false;
    this.taken[i] = 1;
    return true;
  }

  private seek(anchorX: number, anchorY: number) {
    if (this.free(anchorX, anchorY)) return { x: anchorX, y: anchorY };
    for (let ring = 1; ring <= 7; ring++) {
      for (let k = 0; k < 8; k++) {
        const ang = (k / 8) * Math.PI * 2 + ring * 0.4;
        const x = anchorX + Math.cos(ang) * ring * 0.05;
        const y = anchorY + Math.sin(ang) * ring * 0.05;
        if (Math.hypot(x - anchorX, y - anchorY) > 0.24) continue;
        if (this.free(x, y)) return { x, y };
      }
    }
    return null;
  }

  private openPhrase(_frame: PaintFrame) {
    if (this.region < 0) {
      this.lastX = 0.5;
      this.lastY = 0.46;
    } else {
      const ang = this.rng() * Math.PI * 2;
      this.lastX = clamp(this.lastX * 0.5 + 0.5 * 0.5 + Math.cos(ang) * 0.14, 0.24, 0.76);
      this.lastY = clamp(this.lastY * 0.5 + 0.46 * 0.5 + Math.sin(ang) * 0.12, 0.22, 0.66);
    }
    this.region += 1;
    this.washed = false;
    return true;
  }
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

export function renderStill(canvas: HTMLCanvasElement, config: SessionConfig, seed: number) {
  const painter = new Painter(config, seed, false);
  painter.begin();
  painter.flush();
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  painter.renderFull(ctx, canvas.width, canvas.height);
}
