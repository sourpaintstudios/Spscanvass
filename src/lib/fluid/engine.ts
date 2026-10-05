import { FluidEar, type EarSample } from "@/lib/fluid/ear";

const W = 270;
const H = 480;
const N = W * H;

const KR_MAJOR = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const KR_MINOR = [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

type Deposit = {
  x: number;
  y: number;
  hue: number;
  sat: number;
  force: number;
  width: number;
  height: number;
  splash: number;
  water: number;
  complement: number;
  churn: number;
  alpha: number;
  dirx: number;
  diry: number;
};

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function hash(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function hsl(h: number, s: number, l: number) {
  const sat = clamp(s, 0, 1);
  const light = clamp(l, 0, 1);
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
  return [r + m, g + m, b + m] as const;
}

function hueOf(pc: number, warmth: number, keyRoot: number) {
  const tilt = (warmth - 0.5) * 24;
  const table = [0, 16, 28, -30, 30, 45, 150, 60, 78, 98, 118, 138];
  if (keyRoot >= 0) {
    const rel = (pc - keyRoot + 12) % 12;
    return (keyRoot * 30 + (table[rel] ?? 0) + tilt + 360) % 360;
  }
  return (pc * 30 + tilt + 360) % 360;
}

function judgeChord(chroma: number[]) {
  let best = 0;
  let second = 0;
  let root = 0;
  let quality: "major" | "minor" | "dom7" | "ambiguous" = "ambiguous";
  const major = [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0];
  const minor = [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0];
  const dom = [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0];
  const score = (tmpl: number[], shift: number) => {
    let s = 0;
    for (let i = 0; i < 12; i++) s += (chroma[(i + shift) % 12] ?? 0) * (tmpl[i] ?? 0);
    return s;
  };
  for (let shift = 0; shift < 12; shift++) {
    const pairs: ["major" | "minor" | "dom7", number][] = [
      ["major", score(major, shift)],
      ["minor", score(minor, shift)],
      ["dom7", score(dom, shift)],
    ];
    for (const [name, value] of pairs) {
      if (value > best) {
        second = best;
        best = value;
        root = (12 - shift) % 12;
        quality = name;
      } else if (value > second) second = value;
    }
  }
  const conf = best <= 0 ? 0 : clamp((best - second) / best, 0, 1);
  const base = quality === "major" ? 0 : quality === "minor" ? 1 : quality === "dom7" ? 0.5 : 0.3;
  const val = conf < 0.12 ? 0.3 : base * (0.45 + conf * 0.55);
  return { root, quality, conf, val: clamp(val, 0, 1) };
}

function krumhansl(hist: Float32Array) {
  let best = -Infinity;
  let second = -Infinity;
  let root = 0;
  let minor = false;
  const dot = (profile: number[], shift: number) => {
    let s = 0;
    let a = 0;
    let b = 0;
    for (let i = 0; i < 12; i++) {
      const hv = hist[(i + shift) % 12] ?? 0;
      const pv = profile[i] ?? 0;
      s += hv * pv;
      a += hv * hv;
      b += pv * pv;
    }
    return s / Math.sqrt((a || 1) * (b || 1));
  };
  for (let shift = 0; shift < 12; shift++) {
    const maj = dot(KR_MAJOR, shift);
    const min = dot(KR_MINOR, shift);
    if (maj > best) {
      second = best;
      best = maj;
      root = (12 - shift) % 12;
      minor = false;
    } else if (maj > second) second = maj;
    if (min > best) {
      second = best;
      best = min;
      root = (12 - shift) % 12;
      minor = true;
    } else if (min > second) second = min;
  }
  return { root, minor, conf: best - second };
}

class Sim {
  private readonly r = new Float32Array(N);
  private readonly g = new Float32Array(N);
  private readonly b = new Float32Array(N);
  private readonly wa = new Float32Array(N);
  private readonly h = new Float32Array(N);
  private readonly age = new Float32Array(N);
  private readonly vx = new Float32Array(N);
  private readonly vy = new Float32Array(N);
  private readonly rb = new Float32Array(N);
  private readonly gb = new Float32Array(N);
  private readonly bb = new Float32Array(N);
  private readonly wab = new Float32Array(N);
  private readonly hb = new Float32Array(N);
  private readonly vxb = new Float32Array(N);
  private readonly vyb = new Float32Array(N);
  private readonly mix = new Uint8Array(N);
  private readonly used = new Uint8Array(8 * 6);
  private readonly view = new ImageData(W, H);
  private readonly plate: HTMLCanvasElement;
  private readonly pctx: CanvasRenderingContext2D;
  private crack = 0;

  constructor() {
    const plate = document.createElement("canvas");
    plate.width = W;
    plate.height = H;
    const pctx = plate.getContext("2d", { willReadFrequently: true });
    if (!pctx) throw new Error("Could not open the canvas.");
    this.plate = plate;
    this.pctx = pctx;
  }

  ground(pc: number, warmth: number) {
    const [r, g, b] = hsl(hueOf(pc, warmth, pc), 0.35, 0.55);
    const cx = W * 0.5;
    const cy = H * 0.46;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const fall = Math.exp(-(((x - cx) ** 2) / (W * 40) + ((y - cy) ** 2) / (H * 50)));
        const i = y * W + x;
        const a = fall * 0.12;
        this.r[i] = this.r[i] * (1 - a) + r * a;
        this.g[i] = this.g[i] * (1 - a) + g * a;
        this.b[i] = this.b[i] * (1 - a) + b * a;
      }
    }
  }

  bloom(nx: number, ny: number, hue: number) {
    const [r, g, b] = hsl(hue, 0.45, 0.5);
    const cx = nx * (W - 1);
    const cy = ny * (H - 1);
    for (let y = -40; y <= 40; y++) {
      for (let x = -40; x <= 40; x++) {
        const ix = Math.round(cx + x);
        const iy = Math.round(cy + y);
        if (ix < 1 || iy < 1 || ix >= W - 1 || iy >= H - 1) continue;
        const fall = Math.exp(-(x * x + y * y) / 500);
        const i = iy * W + ix;
        const a = fall * 0.12;
        this.r[i] = this.r[i] * (1 - a) + r * a;
        this.g[i] = this.g[i] * (1 - a) + g * a;
        this.b[i] = this.b[i] * (1 - a) + b * a;
        this.wa[i] = Math.min(1, this.wa[i] + a);
      }
    }
  }

  deposit(p: Deposit) {
    const cx = p.x * (W - 1);
    const cy = p.y * (H - 1);
    const rad = Math.max(p.width, p.splash > 0 ? Math.min(80, p.splash) : p.width);
    const r0 = Math.max(1, Math.min(72, Math.ceil(rad)));
    const light = p.force > 0.65 ? 0.4 : p.force > 0.35 ? 0.48 : 0.58;
    const [cr, cg, cb] = hsl(p.hue, p.sat, light);
    const comp = hsl((p.hue + 180) % 360, Math.max(0.18, p.sat * 0.8), light * 1.15);
    for (let y = -r0; y <= r0; y++) {
      for (let x = -r0; x <= r0; x++) {
        const ix = Math.round(cx + x);
        const iy = Math.round(cy + y);
        if (ix < 1 || iy < 1 || ix >= W - 1 || iy >= H - 1) continue;
        const d2 = x * x + y * y;
        const fall = Math.exp(-d2 / (2 * rad * rad * 0.42 + 1));
        if (fall < 0.03) continue;
        const i = iy * W + ix;
        const add = fall * (0.12 + p.force * 0.5) * p.alpha;
        const had = this.r[i] + this.g[i] + this.b[i] > 0.08;
        const ratio = had ? p.complement : 0;
        const rr = cr * (1 - ratio) + comp[0] * ratio;
        const gg = cg * (1 - ratio) + comp[1] * ratio;
        const bb = cb * (1 - ratio) + comp[2] * ratio;
        this.r[i] = this.r[i] * (1 - add) + rr * add;
        this.g[i] = this.g[i] * (1 - add) + gg * add;
        this.b[i] = this.b[i] * (1 - add) + bb * add;
        this.wa[i] = Math.min(1, this.wa[i] * (1 - add * 0.5) + p.water * add);
        this.age[i] = 0;
        if (had) this.mix[i] = Math.min(255, this.mix[i] + 1);
        if (this.mix[i] > 6) {
          this.wa[i] = Math.min(1, this.wa[i] + 0.25);
          this.mix[i] = 2;
        }
        const inv = Math.hypot(x, y) || 1;
        if (p.splash > 0) {
          this.vx[i] += (x / inv) * fall * p.force * 0.35;
          this.vy[i] += (y / inv) * fall * p.force * 0.35;
        } else {
          this.vx[i] += p.dirx * fall * p.force * 0.45;
          this.vy[i] += p.diry * fall * p.force * 0.45;
        }
        if (p.height > 0) {
          const next = this.h[i] + fall * p.height * 0.12;
          if (next > 1) {
            this.h[i] = 1;
            const spill = (next - 1) * 0.6;
            this.h[i + 1] = Math.min(1, this.h[i + 1] + spill);
            this.h[i + W] = Math.min(1, this.h[i + W] + spill);
          } else this.h[i] = next;
        }
      }
    }
  }

  smear(p: { x0: number; y0: number; x1: number; y1: number; hue: number; sat: number; light: number; width: number; water: number }) {
    const x0 = p.x0 * (W - 1);
    const y0 = p.y0 * (H - 1);
    const x1 = p.x1 * (W - 1);
    const y1 = p.y1 * (H - 1);
    const span = Math.hypot(x1 - x0, y1 - y0) || 1;
    const steps = clamp(Math.ceil(span / 2), 1, 24);
    const [cr, cg, cb] = hsl(p.hue, clamp(p.sat, 0.72, 0.95), clamp(p.light, 0.42, 0.62));
    const rad = clamp(p.width, 3, 18);
    const r0 = Math.ceil(rad);
    for (let s = 0; s <= steps; s++) {
      const cx = x0 + ((x1 - x0) * s) / steps;
      const cy = y0 + ((y1 - y0) * s) / steps;
      for (let y = -r0; y <= r0; y++) {
        for (let x = -r0; x <= r0; x++) {
          const d = Math.hypot(x, y) / rad;
          if (d > 1) continue;
          const ix = Math.round(cx + x);
          const iy = Math.round(cy + y);
          if (ix < 1 || iy < 1 || ix >= W - 1 || iy >= H - 1) continue;
          const edge = (1 - d) * (1 - d);
          const add = (p.water > 0.6 ? 0.22 : 0.4) * edge;
          const i = iy * W + ix;
          this.r[i] = (this.r[i] ?? 0) * (1 - add) + cr * add;
          this.g[i] = (this.g[i] ?? 0) * (1 - add) + cg * add;
          this.b[i] = (this.b[i] ?? 0) * (1 - add) + cb * add;
          this.wa[i] = p.water;
          this.age[i] = 0;
        }
      }
    }
  }

  drip(nx: number, ny: number, hue: number, light: number) {
    const [cr, cg, cb] = hsl(hue, 0.8, light);
    let x = nx * (W - 1);
    let y = ny * (H - 1);
    for (let s = 0; s < 18; s++) {
      y += 1.4;
      const add = 0.28 * (1 - s / 18);
      const ix = Math.round(x);
      const iy = Math.round(y);
      if (iy >= H - 1) break;
      const i = iy * W + ix;
      this.r[i] = (this.r[i] ?? 0) * (1 - add) + cr * add;
      this.g[i] = (this.g[i] ?? 0) * (1 - add) + cg * add;
      this.b[i] = (this.b[i] ?? 0) * (1 - add) + cb * add;
    }
  }

  openSpot(preferY: number) {
    let best = 1e9;
    let x = 0.5;
    let y = preferY;
    for (let row = 1; row < 7; row++) {
      for (let col = 1; col < 5; col++) {
        const cy = row / 7;
        const cx = col / 5;
        const ix = clamp(Math.floor(cx * (W - 1)), 8, W - 9);
        const iy = clamp(Math.floor(cy * (H - 1)), 8, H - 9);
        let acc = 0;
        for (let dy = -8; dy <= 8; dy += 4) {
          for (let dx = -8; dx <= 8; dx += 4) {
            const i = (iy + dy) * W + (ix + dx);
            acc += (this.r[i] ?? 0) + (this.g[i] ?? 0) + (this.b[i] ?? 0);
          }
        }
        const score = acc + Math.abs(cy - preferY) * 3;
        if (score < best) {
          best = score;
          x = cx;
          y = cy;
        }
      }
    }
    return { x, y };
  }

  densityAhead(nx: number, ny: number, heading: number, dist: number) {
    let acc = 0;
    for (let s = 1; s <= 4; s++) {
      const x = nx + Math.cos(heading) * dist * (s / 4);
      const y = ny + Math.sin(heading) * dist * (s / 4);
      if (x < 0.05 || x > 0.95 || y < 0.05 || y > 0.95) return 4;
      const ix = clamp(Math.floor(x * (W - 1)), 1, W - 2);
      const iy = clamp(Math.floor(y * (H - 1)), 1, H - 2);
      acc += (this.r[iy * W + ix] ?? 0) + (this.g[iy * W + ix] ?? 0) + (this.b[iy * W + ix] ?? 0);
    }
    return acc / 4;
  }

  bleed(amount: number) {
    const a = clamp(amount, 0, 0.08);
    for (let y = 1; y < H - 1; y++) {
      for (let x = 1; x < W - 1; x++) {
        const i = y * W + x;
        if ((this.age[i] ?? 9) > 1.8 || (this.wa[i] ?? 0) < 0.2) continue;
        const share = a / 4;
        this.rb[i] =
          (this.r[i] ?? 0) * (1 - a) +
          ((this.r[i - 1] ?? 0) + (this.r[i + 1] ?? 0) + (this.r[i - W] ?? 0) + (this.r[i + W] ?? 0)) * share;
        this.gb[i] =
          (this.g[i] ?? 0) * (1 - a) +
          ((this.g[i - 1] ?? 0) + (this.g[i + 1] ?? 0) + (this.g[i - W] ?? 0) + (this.g[i + W] ?? 0)) * share;
        this.bb[i] =
          (this.b[i] ?? 0) * (1 - a) +
          ((this.b[i - 1] ?? 0) + (this.b[i + 1] ?? 0) + (this.b[i - W] ?? 0) + (this.b[i + W] ?? 0)) * share;
      }
    }
    for (let i = 0; i < N; i++) {
      if ((this.age[i] ?? 9) > 1.8 || (this.wa[i] ?? 0) < 0.2) continue;
      this.r[i] = this.rb[i] ?? 0;
      this.g[i] = this.gb[i] ?? 0;
      this.b[i] = this.bb[i] ?? 0;
    }
  }

  advance(dt: number, drying: boolean, energy: number, viscosity: number) {
    const scale = 0;
    const dry = drying ? Math.min(0.2, 0.01 + this.crack * 0.004) : 0;
    if (drying) this.crack = Math.min(80, this.crack + 1);
    else this.crack = 0;
    this.advect(this.r, this.rb, scale);
    this.advect(this.g, this.gb, scale);
    this.advect(this.b, this.bb, scale);
    this.advect(this.wa, this.wab, scale);
    this.advect(this.h, this.hb, scale * 0.35);
    this.advect(this.vx, this.vxb, scale);
    this.advect(this.vy, this.vyb, scale);
    this.r.set(this.rb);
    this.g.set(this.gb);
    this.b.set(this.bb);
    this.wa.set(this.wab);
    this.h.set(this.hb);
    this.vx.set(this.vxb);
    this.vy.set(this.vyb);
    const diff = (drying ? 0.5 : 1) * (0.05 + (1 - viscosity) * 0.12);
    this.blur(this.vx, this.vxb, diff);
    this.blur(this.vy, this.vyb, diff);
    this.blur(this.r, this.rb, 0);
    this.blur(this.g, this.gb, 0);
    this.blur(this.b, this.bb, 0);
    this.vx.set(this.vxb);
    this.vy.set(this.vyb);
    this.r.set(this.rb);
    this.g.set(this.gb);
    this.b.set(this.bb);
    const damp = drying ? 0.9 : 0.96;
    for (let i = 0; i < N; i++) {
      this.vx[i] *= damp;
      this.vy[i] *= damp;
      this.wa[i] = Math.max(0, this.wa[i] * (1 - dry));
      this.age[i] += dt;
      if (this.age[i] > 8) {
        const l = (this.r[i] + this.g[i] + this.b[i]) / 3;
        this.r[i] = l + (this.r[i] - l) * 0.985;
        this.g[i] = l + (this.g[i] - l) * 0.985;
        this.b[i] = l + (this.b[i] - l) * 0.985;
      }
      const settle = energy < 0.4 ? 0.999 : 0.997;
      this.h[i] *= drying ? 0.998 : settle;
      if ((i & 31) === 0) this.mix[i] = this.mix[i] > 0 ? this.mix[i] - 1 : 0;
    }
  }

  private sample(src: Float32Array, x: number, y: number) {
    const x0 = clamp(Math.floor(x), 0, W - 1);
    const y0 = clamp(Math.floor(y), 0, H - 1);
    const x1 = Math.min(W - 1, x0 + 1);
    const y1 = Math.min(H - 1, y0 + 1);
    const tx = x - x0;
    const ty = y - y0;
    const i00 = y0 * W + x0;
    const i10 = y0 * W + x1;
    const i01 = y1 * W + x0;
    const i11 = y1 * W + x1;
    const a = src[i00] * (1 - tx) + src[i10] * tx;
    const b = src[i01] * (1 - tx) + src[i11] * tx;
    return a * (1 - ty) + b * ty;
  }

  private advect(src: Float32Array, dst: Float32Array, scale: number) {
    for (let y = 0; y < H; y++) {
      const row = y * W;
      for (let x = 0; x < W; x++) {
        const i = row + x;
        const px = x - this.vx[i] * scale;
        const py = y - this.vy[i] * scale;
        dst[i] = this.sample(src, px, py);
      }
    }
  }

  private blur(src: Float32Array, dst: Float32Array, amount: number) {
    const keep = 1 - amount;
    for (let y = 1; y < H - 1; y++) {
      const row = y * W;
      for (let x = 1; x < W - 1; x++) {
        const i = row + x;
        const avg = (src[i - 1] + src[i + 1] + src[i - W] + src[i + W]) * 0.25;
        dst[i] = src[i] * keep + avg * amount;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const data = this.view.data;
    const paper = [0.86, 0.82, 0.74];
    for (let i = 0; i < N; i++) {
      const o = i * 4;
      data[o] = paper[0] * 255;
      data[o + 1] = paper[1] * 255;
      data[o + 2] = paper[2] * 255;
      data[o + 3] = 255;
    }
    const lx = -0.72;
    const ly = -0.48;
    const lz = 0.5;
    const ll = Math.hypot(lx, ly, lz);
    for (let y = 1; y < H - 1; y++) {
      for (let x = 1; x < W - 1; x++) {
        const i = y * W + x;
        let r = this.r[i];
        let g = this.g[i];
        let b = this.b[i];
        const density = r + g + b;
        const water = this.wa[i];
        const hh = this.h[i];
        if (density < 0.015) {
          r = paper[0];
          g = paper[1];
          b = paper[2];
        } else {
          const inv = 1 / density;
          const cover = clamp(density * 1.6, 0, 1) * (1 - water * 0.25);
          r = paper[0] * (1 - cover) + r * inv * cover;
          g = paper[1] * (1 - cover) + g * inv * cover;
          b = paper[2] * (1 - cover) + b * inv * cover;
        }
        const nx = this.h[i - 1] - this.h[i + 1];
        const ny = this.h[i - W] - this.h[i + W];
        const nz = 0.85;
        const nl = Math.hypot(nx, ny, nz) || 1;
        const ndot = (nx / nl) * (lx / ll) + (ny / nl) * (ly / ll) + (nz / nl) * (lz / ll);
        let shade = 0.88 + ndot * 0.22 * Math.min(1, hh * 2);
        if (hh > 0.2 && ndot < -0.2) {
          const ratio = Math.min(0.18, -ndot * 0.2);
          const hue = (Math.atan2(g - b, r - g) * 180) / Math.PI;
          const comp = hsl((hue + 180) % 360, 0.35, 0.4);
          r = r * (1 - ratio) + comp[0] * ratio;
          g = g * (1 - ratio) + comp[1] * ratio;
          b = b * (1 - ratio) + comp[2] * ratio;
        }
        r *= shade;
        g *= shade;
        b *= shade;
        const grain = 0.96 + hash(x * 13 + y * 7) * 0.06;
        r *= grain;
        g *= grain;
        b *= grain;
        if (this.crack > 300 && hh > 0.4 && hash(x * 3.1 + y * 9.4) > 0.92) {
          r *= 0.72;
          g *= 0.66;
          b *= 0.6;
        }
        const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        if (lum < 0.12) {
          r = r * 0.5 + paper[0] * 0.5;
          g = g * 0.5 + paper[1] * 0.5;
          b = b * 0.5 + paper[2] * 0.5;
        }
        const o = (i * 4);
        data[o] = clamp(r * 255, 0, 255);
        data[o + 1] = clamp(g * 255, 0, 255);
        data[o + 2] = clamp(b * 255, 0, 255);
        data[o + 3] = 255;
      }
    }
    this.pctx.putImageData(this.view, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(this.plate, 0, 0, w, h);
  }
}

export class FluidSession {
  private readonly ear = new FluidEar();
  private readonly sim = new Sim();
  private readonly queue: EarSample[] = [];
  private readonly rmsHist: number[] = [];
  private readonly f0s: number[] = [];
  private readonly onsets: number[] = [];
  private readonly chromaHist = new Float32Array(12);
  private readonly hueBins = new Float32Array(12);
  ampNow = 0;
  private started = 0;
  private lastStep = 0;
  private lastIngest = 0;
  private floor = 0;
  private gate = 0;
  private hearing = false;
  private ampEma = 0;
  private lastF0 = 0;
  private lastF0T = 0;
  private lastPc = 0;
  private keyRoot = -1;
  private groundDone = false;
  private silenceFor = 0;
  private pcRun = 0;
  private pcRunId = -1;
  private bloomed = false;
  private moodW = 0.5;
  private moodE = 0.5;
  private viscosity = 0.3;
  private gx = 0.5;
  private gy = 0.46;
  private active = false;
  private lastOnsetT = 0;
  private heading = 0.12;
  private turn = 1;
  private penDown = false;
  private gestureLeft = 0;
  private gestureMax = 0.3;
  private dripped = false;
  private wobble = 0;
  private bleeding = false;
  private phraseHue = 28;
  private phraseLight = 0.5;
  private tx = 0.72;
  private ty = 0.4;
  private smoothOct = 0.45;

  private linked = false;

  async attach(stream: MediaStream, now: number) {
    if (this.linked) return;
    this.linked = true;
    this.started = now;
    this.lastStep = now;
    this.ear.onSample = (sample) => {
      this.queue.push(sample);
      if (this.queue.length > 6) this.queue.shift();
    };
    await this.ear.attach(stream);
  }

  step(now: number) {
    const samples = this.queue.splice(0, this.queue.length);
    const dt = clamp((now - this.lastStep) / 1000, 0.016, 0.05);
    this.lastStep = now;
    if (samples.length === 0) this.silenceFor += dt;
    for (const sample of samples) this.ingest(sample, now);
    this.sim.advance(dt, this.silenceFor > 0.3, this.moodE, this.viscosity);
    if (this.bleeding) this.sim.bleed(0.02);
  }

  draw(ctx: CanvasRenderingContext2D, w: number, h: number) {
    this.sim.draw(ctx, w, h);
  }

  stop() {
    this.ear.stop();
  }

  private ingest(s: EarSample, now: number) {
    const elapsed = (now - this.started) / 1000;
    this.rmsHist.push(s.rms);
    if (this.rmsHist.length > 180) this.rmsHist.shift();
    let vary = 0;
    if (this.rmsHist.length > 8) {
      const n = Math.min(18, this.rmsHist.length - 1);
      const start = this.rmsHist.length - n;
      let acc = 0;
      let mean = 0;
      for (let i = start; i < this.rmsHist.length; i++) {
        const cur = this.rmsHist[i] ?? 0;
        const prev = this.rmsHist[i - 1] ?? cur;
        acc += Math.abs(cur - prev);
        mean += cur;
      }
      mean /= n;
      vary = acc / n / (mean + 1e-4);
    }
    let rms = s.rms;
    const jump = rms - this.ampEma;
    if (jump > 0.5 && s.onset < 0.25) rms = this.ampEma;
    else if (jump > 0.3) rms = this.ampEma + 0.3;
    else if (jump < -0.3) rms = this.ampEma - 0.3;
    const dt = Math.max(16, now - this.lastIngest);
    this.lastIngest = now;
    const follow = 1 - Math.exp(-dt / 50);
    this.ampEma += (rms - this.ampEma) * follow;
    if (elapsed < 0.6 || this.rmsHist.length < 8) {
      if (this.floor === 0) this.floor = this.ampEma || 0.01;
      else this.floor = Math.min(this.floor, this.ampEma || this.floor);
      this.ampNow = 0;
      this.silenceFor += 0.021;
      return;
    }
    if (!this.hearing) {
      if (this.ampEma < this.floor) this.floor = this.floor * 0.4 + this.ampEma * 0.6;
      else this.floor += (this.ampEma - this.floor) * 0.012;
    } else if (this.ampEma < this.floor) this.floor = this.ampEma;
    const rise = (this.ampEma - this.floor) / (this.floor + 0.003);
    const amp = clamp(rise / 2.4, 0, 1.2);
    this.ampNow = Math.min(1, Math.max(0, amp));
    if (!this.hearing && rise > 1.7) {
      this.hearing = true;
      this.gate = now;
    }
    if (this.hearing && rise < 0.65) this.hearing = false;
    if (!this.hearing) {
      this.silenceFor += 0.021;
      this.penDown = false;
      this.bleeding = false;
      return;
    }
    this.silenceFor = 0;

    let f0 = s.f0;
    if (f0 > 40) {
      if (this.lastF0 > 40 && Math.abs(12 * Math.log2(f0 / this.lastF0)) > 12 && now - this.lastF0T < 100) {
        f0 = this.lastF0;
      }
      this.f0s.push(f0);
      if (this.f0s.length > 5) this.f0s.shift();
      const ordered = [...this.f0s].sort((a, b) => a - b);
      f0 = ordered[Math.floor(ordered.length / 2)] ?? f0;
      this.lastF0 = f0;
      this.lastF0T = now;
    } else f0 = this.lastF0;

    const pc = f0 > 40 ? ((Math.round(12 * Math.log2(f0 / 440)) % 12) + 12) % 12 : this.lastPc;
    if (f0 > 40) this.lastPc = pc;
    const octHz = clamp(f0 || 220, 82.4, 1318.5);
    const oct = clamp(Math.log2(octHz / 82.4) / Math.log2(1318.5 / 82.4), 0, 1);
    if (s.onset > 0.55 && this.hearing) {
      this.onsets.push(now);
      if (this.onsets.length > 8) this.onsets.shift();
    }
    const gaps: number[] = [];
    for (let i = 1; i < this.onsets.length; i++) {
      const gap = (this.onsets[i] ?? 0) - (this.onsets[i - 1] ?? 0);
      if (gap > 0 && gap < 2000) gaps.push(gap);
    }
    gaps.sort((a, b) => a - b);
    const ioi = gaps[Math.floor(gaps.length / 2)] ?? 520;
    const bpm = clamp(60000 / ioi, 40, 200);
    const churn = clamp(0.1 + ((bpm - 40) / 160) * 1.9, 0.1, 2);
    const chord = judgeChord(s.chroma);
    this.viscosity = chord.val;

    for (let i = 0; i < 12; i++) this.chromaHist[i] += s.chroma[i] ?? 0;
    if (elapsed > 3 && Math.floor(elapsed * 10) % 20 === 0) {
      const key = krumhansl(this.chromaHist);
      if (key.conf >= 0.15) this.keyRoot = key.root;
    }
    if (!this.groundDone && elapsed > 30 && this.keyRoot >= 0) {
      this.groundDone = true;
    }

    const targetW = (chord.quality === "minor" ? 0.2 : chord.quality === "major" ? 0.8 : chord.quality === "dom7" ? 0.6 : 0.5) + s.centroid * 0.1;
    this.moodW = clamp(this.moodW + (clamp(targetW, 0.05, 0.95) - this.moodW) * 0.02, 0.05, 0.95);
    this.moodE = clamp(this.moodE + (clamp(churn / 2, 0.05, 0.95) - this.moodE) * 0.02, 0.05, 0.95);

    if (pc === this.pcRunId) this.pcRun += 1;
    else {
      this.pcRunId = pc;
      this.pcRun = 1;
      this.bloomed = false;
    }
    if (this.pcRun > 140) this.bloomed = true;

    const want = oct > 0.58 ? -0.85 : oct < 0.38 ? 0.85 : 0.12;
    const glide = oct - this.smoothOct;
    this.smoothOct += glide * 0.35;
    const hard = amp > 0.62 && s.onset > 0.45;
    const soft = amp < 0.4 && s.onset < 0.35;
    const attack = s.onset > 0.55 && now - this.lastOnsetT > 160;
    const run = attack && now - this.lastOnsetT < 420;
    if (s.onset > 0.4) this.lastOnsetT = now;
    let vibrato = 0;
    if (this.f0s.length > 4) {
      let flips = 0;
      for (let i = 2; i < this.f0s.length; i++) {
        const a = (this.f0s[i] ?? 0) - (this.f0s[i - 1] ?? 0);
        const b = (this.f0s[i - 1] ?? 0) - (this.f0s[i - 2] ?? 0);
        if (a * b < 0 && Math.abs(a) < 8) flips++;
      }
      if (flips >= 2) vibrato = 1;
    }
    if (!this.penDown || (attack && !run)) {
      this.penDown = true;
      this.bleeding = false;
      if (!this.active) {
        this.gx = 0.5;
        this.gy = 0.38;
        this.active = true;
        this.heading = -0.4;
      } else {
        this.heading += 0.9 * this.turn;
        this.turn = -this.turn;
      }
      const reach = hard ? 0.46 : soft ? 0.24 : 0.34;
      this.gestureMax = reach;
      this.gestureLeft = reach;
      this.dripped = false;
      this.phraseHue = (pc * 30 + (chord.quality === "minor" ? 20 : 0) + 360) % 360;
      this.phraseLight = clamp(0.46 + oct * 0.14, 0.44, 0.62);
    } else if (run) {
      this.gestureLeft = Math.min(0.7, this.gestureLeft + 0.16);
      this.gestureMax = Math.max(this.gestureMax, this.gestureLeft);
      this.bleeding = false;
    }
    this.heading += clamp(glide * 1.4, -0.08, 0.08) + 0.035 * this.turn;
    this.wobble += vibrato ? 0.8 : 0.05;
    if (this.gestureLeft <= 0) {
      if (soft && !this.dripped) {
        this.sim.drip(this.gx, this.gy, this.phraseHue, this.phraseLight);
        this.dripped = true;
      }
      this.bleeding = true;
      return;
    }
    const along = 1 - this.gestureLeft / this.gestureMax;
    const taper = Math.sin(Math.PI * clamp(along, 0.05, 0.95));
    const step = Math.min(this.gestureLeft, 0.016 + amp * 0.012);
    const wob = vibrato ? Math.sin(this.wobble) * 0.012 : 0;
    let nx = this.gx + Math.cos(this.heading) * step + Math.cos(this.heading + 1.57) * wob;
    let ny = this.gy + Math.sin(this.heading) * step + Math.sin(this.heading + 1.57) * wob;
    if (nx < 0.06 || nx > 0.94 || ny < 0.06 || ny > 0.92) {
      this.heading = nx < 0.06 || nx > 0.94 ? Math.PI - this.heading : -this.heading;
      this.turn = -this.turn;
      nx = clamp(nx, 0.06, 0.94);
      ny = clamp(ny, 0.06, 0.92);
    }
    this.sim.smear({
      x0: this.gx,
      y0: this.gy,
      x1: nx,
      y1: ny,
      hue: this.phraseHue,
      sat: 0.88,
      light: this.phraseLight,
      width: (hard ? 16 : soft ? 5 : 9) * (0.45 + taper),
      water: soft ? 0.75 : 0.25,
    });
    this.gestureLeft -= step;
    this.gx = nx;
    this.gy = ny;
    this.bleeding = false;
    this.viscosity = soft ? 0.35 : 0.8;
  }
}
