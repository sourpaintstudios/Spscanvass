import { mulberry32 } from "@/lib/paint/color";
import type { Mark, MarkKind } from "@/lib/paint/types";

export function createMark(p: Partial<Mark> & Pick<Mark, "kind" | "x" | "y">): Mark {
  return {
    len: 0.12,
    thick: 0.02,
    rot: 0,
    r: 255,
    g: 255,
    b: 255,
    a: 0.8,
    r2: 255,
    g2: 255,
    b2: 255,
    seed: 1,
    bristles: 5,
    bleed: 0,
    breakUp: 0,
    keyline: 0,
    lr: 8,
    lg: 8,
    lb: 8,
    hardness: 0.5,
    echo: 0,
    ...p,
  };
}

function rgba(r: number, g: number, b: number, a: number) {
  const R = Math.max(0, Math.min(255, Math.round(r)));
  const G = Math.max(0, Math.min(255, Math.round(g)));
  const B = Math.max(0, Math.min(255, Math.round(b)));
  return `rgba(${R}, ${G}, ${B}, ${Math.max(0, Math.min(1, a))})`;
}

export function drawVignette(
  ctx: CanvasRenderingContext2D,
  amount: number,
  w: number,
  h: number,
) {
  if (amount < 0.04) return;
  const g = ctx.createRadialGradient(w * 0.5, h * 0.46, Math.min(w, h) * 0.18, w * 0.5, h * 0.5, Math.max(w, h) * 0.72);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, `rgba(0,0,0,${0.72 * amount})`);
  ctx.save();
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

export function drawSignature(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const size = Math.max(11, Math.round(w * 0.026));
  ctx.save();
  ctx.font = `600 ${size}px Outfit, sans-serif`;
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  const x = w * 0.94;
  const y = h * 0.975;
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fillText("SOUR PAINT STUDIOS", x + 1, y + 1);
  ctx.fillStyle = "rgba(243,246,234,0.84)";
  ctx.fillText("SOUR PAINT STUDIOS", x, y);
  ctx.restore();
}

export function drawMark(ctx: CanvasRenderingContext2D, m: Mark, w: number, h: number) {
  const unit = Math.min(w, h);
  const x = m.x * w;
  const y = m.y * h;
  const len = Math.max(1.5, m.len * unit);
  const thick = Math.max(1, m.thick * unit);
  const rng = mulberry32(m.seed || 1);
  ctx.save();
  if (m.blend) ctx.globalCompositeOperation = m.blend;
  switch (m.kind) {
    case "grain":
      paintGrain(ctx, m, w, h, rng);
      break;
    case "wash":
    case "glaze":
      paintWash(ctx, m, x, y, m.kind === "glaze" ? len * 1.35 : len, thick, unit);
      break;
    case "pool":
      paintPool(ctx, m, x, y, len, thick);
      break;
    case "stroke":
    case "drybrush":
    case "outline":
      paintStroke(ctx, m, x, y, len, thick, unit, m.kind);
      break;
    case "bristle":
      paintBristle(ctx, m, x, y, len, thick, rng);
      break;
    case "dab":
      paintDab(ctx, m, x, y, len, thick, unit, rng);
      break;
    case "knife":
      paintKnife(ctx, m, x, y, len, thick, rng);
      break;
    case "block":
      paintBlock(ctx, m, x, y, len, thick, unit);
      break;
    case "splatter":
      paintSplatter(ctx, m, x, y, len, thick, rng);
      break;
    case "drip":
      paintDrip(ctx, m, x, y, len, thick, rng);
      break;
    case "dot":
      paintDots(ctx, m, x, y, len, thick, rng);
      break;
    case "hatch":
      paintHatch(ctx, m, x, y, len, thick, rng);
      break;
    case "halftone":
      paintHalftone(ctx, m, x, y, len, thick);
      break;
    case "streak":
      paintStreak(ctx, m, x, y, len, thick, rng);
      break;
    case "scratch":
      paintScratch(ctx, m, x, y, len, thick, rng);
      break;
    default:
      paintStroke(ctx, m, x, y, len, thick, unit, "stroke");
  }
  ctx.restore();
}

function paintGrain(
  ctx: CanvasRenderingContext2D,
  m: Mark,
  w: number,
  h: number,
  rng: () => number,
) {
  ctx.fillStyle = rgba(m.r, m.g, m.b, 0.14);
  for (let i = 0; i < 380; i++) {
    const s = 0.6 + rng() * 1.6;
    ctx.fillRect(rng() * w, rng() * h, s, s);
  }
}

function paintWash(
  ctx: CanvasRenderingContext2D,
  m: Mark,
  x: number,
  y: number,
  len: number,
  _thick: number,
  unit: number,
) {
  const rng = mulberry32(m.seed || 1);
  ctx.translate(x, y);
  const lobes = 6;
  for (let i = 0; i < lobes; i++) {
    const ox = (rng() - 0.5) * len * 0.7;
    const oy = (rng() - 0.15) * len * 0.55;
    const rad = len * (0.42 + rng() * 0.5);
    const g = ctx.createRadialGradient(ox, oy - rad * 0.08, rad * 0.04, ox, oy + rad * 0.12, rad);
    const edge = rgba(m.r * 0.45, m.g * 0.38, m.b * 0.32, m.a * 0.42);
    g.addColorStop(0, rgba(m.r, m.g, m.b, m.a * 0.62));
    g.addColorStop(0.55, rgba(m.r, m.g, m.b, m.a * 0.28));
    g.addColorStop(0.86, edge);
    g.addColorStop(1, rgba(m.r, m.g, m.b, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(ox, oy, rad * (0.85 + rng() * 0.3), rad * (0.7 + rng() * 0.25), rng() * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = rgba(m.r, m.g, m.b, m.a * 0.16);
  ctx.beginPath();
  ctx.ellipse(0, len * 0.62, len * 0.38, len * 0.85, (rng() - 0.5) * 0.3, 0, Math.PI * 2);
  ctx.fill();
  const specks = Math.max(24, Math.round(unit / 48));
  for (let i = 0; i < specks; i++) {
    const sx = (rng() - 0.5) * len * 1.6;
    const sy = (rng() - 0.2) * len * 1.3;
    ctx.fillStyle = rgba(m.r * 0.35, m.g * 0.3, m.b * 0.25, m.a * (0.15 + rng() * 0.35));
    ctx.fillRect(sx, sy, Math.max(0.6, unit * 0.0015), Math.max(0.6, unit * 0.0015));
  }
}

function paintPool(ctx: CanvasRenderingContext2D, m: Mark, x: number, y: number, len: number, thick: number) {
  ctx.translate(x, y);
  ctx.rotate(m.rot);
  ctx.fillStyle = rgba(m.r, m.g, m.b, m.a * 0.55);
  ctx.beginPath();
  ctx.ellipse(0, 0, len, len * 0.62, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = rgba(m.r * 0.55, m.g * 0.55, m.b * 0.55, Math.min(1, m.a + 0.15));
  ctx.lineWidth = Math.max(2, thick * 0.85);
  ctx.beginPath();
  ctx.ellipse(0, len * 0.08, len * 0.92, len * 0.55, 0, 0.15, Math.PI - 0.15);
  ctx.stroke();
}

function hueOf(r: number, g: number, b: number) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min || 1;
  let h = 0;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  if (h < 0) h += 6;
  return h * 60;
}

function paintOil(ctx: CanvasRenderingContext2D, m: Mark, x: number, y: number, len: number, thick: number) {
  const rng = mulberry32((m.seed || 1) + 3);
  const flip = m.seed & 1 ? 1 : -1;
  const bow = len * (0.18 + ((m.seed % 7) / 7) * 0.32) * flip;
  const body = Math.max(thick * 2.4, 7);
  let push = 0;
  let mixR = m.r;
  let mixG = m.g;
  let mixB = m.b;
  let near = false;
  const ix = Math.round(x);
  const iy = Math.round(y);
  if (ix > 1 && iy > 1 && ix < ctx.canvas.width - 1 && iy < ctx.canvas.height - 1) {
    const px = ctx.getImageData(ix, iy, 1, 1).data;
    const sat = Math.max(px[0], px[1], px[2]) - Math.min(px[0], px[1], px[2]);
    if (sat > 26) {
      const gap = Math.abs(hueOf(m.r, m.g, m.b) - hueOf(px[0], px[1], px[2]));
      const apart = Math.min(gap, 360 - gap);
      if (apart > 140) push = flip * Math.max(8, body * 0.55);
      else {
        near = true;
        mixR = m.r * 0.62 + px[0] * 0.38;
        mixG = m.g * 0.62 + px[1] * 0.38;
        mixB = m.b * 0.62 + px[2] * 0.38;
      }
    }
  }
  if (push) ctx.translate(0, push);
  const paint = (y0: number, y1: number, width: number, color: string) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(-len / 2, y0);
    ctx.quadraticCurveTo(0, bow + (y0 + y1) * 0.5, len / 2, bow * 0.12 + y1);
    ctx.stroke();
  };
  if (near) paint(0, 0, body * 1.55, rgba(mixR, mixG, mixB, 0.28));
  paint(2.2, 2.2, body * 1.12, rgba(m.r * 0.42, m.g * 0.36, m.b * 0.3, m.a * 0.35));
  paint(0, 0, body, rgba(m.r, m.g, m.b, Math.min(0.78, m.a + 0.16)));
  const ridges = 7;
  for (let i = 0; i < ridges; i++) {
    const t = i / (ridges - 1) - 0.5;
    const yy = t * body * 0.62;
    const light = i % 2 === 0;
    const j = (rng() - 0.5) * 16;
    paint(
      yy,
      yy + (rng() - 0.5) * 3,
      Math.max(1, body * 0.07),
      light
        ? rgba(Math.min(255, m.r + 48 + j), Math.min(255, m.g + 40), Math.min(255, m.b + 16), 0.34)
        : rgba(m.r * 0.7, m.g * 0.64, m.b * 0.55, 0.36),
    );
  }
  paint(-body * 0.28, -body * 0.16, Math.max(1.2, body * 0.08), rgba(Math.min(255, m.r + 80), Math.min(255, m.g + 74), Math.min(255, m.b + 36), 0.45));
}

function paintStroke(
  ctx: CanvasRenderingContext2D,
  m: Mark,
  x: number,
  y: number,
  len: number,
  thick: number,
  unit: number,
  kind: MarkKind,
) {
  const glow = m.bleed > 0.55 && kind !== "drybrush";
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(m.rot);
  if (glow) {
    ctx.shadowColor = rgba(m.r, m.g, m.b, 0.95);
    ctx.shadowBlur = thick * 3.2;
  }
  ctx.strokeStyle = rgba(m.r, m.g, m.b, kind === "outline" ? Math.min(1, m.a) : m.a);
  ctx.lineWidth = kind === "outline" ? Math.max(thick * 1.7, m.keyline * unit || thick) : thick;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (kind === "stroke") {
    ctx.shadowBlur = 0;
    paintOil(ctx, m, x, y, len, thick);
    ctx.restore();
    return;
  }
  const gap = kind === "drybrush" || m.breakUp > 0.2 ? Math.max(2, thick * (0.4 + m.breakUp * 2.4)) : 0;
  if (gap > 0) ctx.setLineDash([Math.max(2, thick * (1.4 - m.breakUp)), gap]);
  ctx.beginPath();
  const flip = m.seed & 1 ? 1 : -1;
  const bow = len * (kind === "outline" ? 0.28 : 0.38 + ((m.seed % 5) / 5) * 0.45) * flip;
  ctx.moveTo(-len / 2, 0);
  ctx.quadraticCurveTo(0, bow, len / 2, bow * 0.15);
  ctx.stroke();
  if (kind !== "outline" && m.keyline > 0) {
    ctx.shadowBlur = 0;
    ctx.strokeStyle = rgba(m.lr, m.lg, m.lb, 0.9);
    ctx.lineWidth = Math.max(1.5, m.keyline * unit);
    ctx.setLineDash([]);
    ctx.stroke();
  }
  ctx.restore();
}

function paintBristle(
  ctx: CanvasRenderingContext2D,
  m: Mark,
  x: number,
  y: number,
  len: number,
  thick: number,
  rng: () => number,
) {
  ctx.translate(x, y);
  ctx.rotate(m.rot);
  const n = Math.max(3, m.bristles);
  const spread = thick * 1.8;
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0 : i / (n - 1) - 0.5;
    const jitter = (rng() - 0.5) * 22;
    ctx.strokeStyle = rgba(m.r + jitter, m.g + jitter * 0.6, m.b + jitter * 0.3, m.a);
    ctx.lineWidth = Math.max(1, (thick * 1.3) / n);
    ctx.lineCap = "round";
    ctx.beginPath();
    const y0 = t * spread;
    ctx.moveTo(-len / 2, y0);
    ctx.quadraticCurveTo(len * 0.05, y0 + len * 0.08 * (rng() - 0.4), len / 2, y0 + (rng() - 0.5) * thick);
    ctx.stroke();
  }
  if (m.a > 0.55) {
    ctx.fillStyle = rgba(m.r * 0.42, m.g * 0.36, m.b * 0.3, m.a * 0.45);
    ctx.beginPath();
    ctx.ellipse(len * 0.04, thick * 0.42, len * 0.46, thick * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = rgba(Math.min(255, m.r + 90), Math.min(255, m.g + 74), Math.min(255, m.b + 36), 0.9);
    ctx.lineWidth = Math.max(1.25, thick * 0.14);
    ctx.beginPath();
    ctx.moveTo(-len * 0.42, -thick * 0.55);
    ctx.quadraticCurveTo(0, -thick * 0.8, len * 0.38, -thick * 0.22);
    ctx.stroke();
  }
}

function paintDab(
  ctx: CanvasRenderingContext2D,
  m: Mark,
  x: number,
  y: number,
  len: number,
  thick: number,
  unit: number,
  rng: () => number,
) {
  ctx.translate(x, y);
  ctx.rotate(m.rot + (rng() - 0.5) * 0.4);
  const rx = len * (0.7 + rng() * 0.4);
  const ry = Math.max(thick * 2.2, len * 0.45);
  if (m.echo > 0) {
    ctx.fillStyle = rgba(m.r2, m.g2, m.b2, m.a * 0.8);
    ctx.beginPath();
    ctx.ellipse(m.echo * unit, m.echo * unit * 0.3, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = rgba(m.r, m.g, m.b, m.a);
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  if (m.keyline > 0) {
    ctx.strokeStyle = rgba(m.lr, m.lg, m.lb, 0.95);
    ctx.lineWidth = Math.max(1.5, m.keyline * unit);
    ctx.stroke();
  }
}

function paintKnife(
  ctx: CanvasRenderingContext2D,
  m: Mark,
  x: number,
  y: number,
  len: number,
  thick: number,
  rng: () => number,
) {
  ctx.translate(x, y);
  ctx.rotate(m.rot);
  const L = len;
  const T = Math.max(thick * 3.4, len * 0.28);
  const j = () => (rng() - 0.5) * T * 0.18;
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(-L * 0.5, -T * 0.32 + j());
    ctx.lineTo(L * 0.5, -T * 0.48 + j());
    ctx.lineTo(L * 0.38, T * 0.5 + j());
    ctx.lineTo(-L * 0.46, T * 0.22 + j());
    ctx.closePath();
  };
  ctx.fillStyle = rgba(m.r * 0.62, m.g * 0.62, m.b * 0.62, m.a);
  ctx.save();
  ctx.translate(T * 0.08, T * 0.1);
  path();
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = rgba(m.r, m.g, m.b, m.a);
  path();
  ctx.fill();
}

function paintBlock(
  ctx: CanvasRenderingContext2D,
  m: Mark,
  x: number,
  y: number,
  len: number,
  thick: number,
  unit: number,
) {
  ctx.translate(x, y);
  ctx.rotate(m.rot);
  const hw = len;
  const hh = Math.max(thick * 2.4, len * 0.55);
  if (m.echo > 0) {
    ctx.fillStyle = rgba(m.r2, m.g2, m.b2, m.a * 0.85);
    ctx.fillRect(-hw + m.echo * unit, -hh + m.echo * unit * 0.4, hw * 2, hh * 2);
  }
  ctx.fillStyle = rgba(m.r, m.g, m.b, m.a);
  ctx.fillRect(-hw, -hh, hw * 2, hh * 2);
  if (m.keyline > 0) {
    ctx.strokeStyle = rgba(m.lr, m.lg, m.lb, 0.95);
    ctx.lineWidth = Math.max(1.5, m.keyline * unit);
    ctx.strokeRect(-hw, -hh, hw * 2, hh * 2);
  }
}

function paintSplatter(
  ctx: CanvasRenderingContext2D,
  m: Mark,
  x: number,
  y: number,
  len: number,
  thick: number,
  rng: () => number,
) {
  const count = 10 + Math.floor(rng() * 26);
  for (let i = 0; i < count; i++) {
    const ang = rng() * Math.PI * 2;
    const rad = Math.pow(rng(), 0.6) * len;
    const s = thick * (0.15 + rng() * 0.85);
    ctx.fillStyle = rgba(m.r, m.g, m.b, m.a * (0.45 + rng() * 0.55));
    ctx.beginPath();
    ctx.arc(x + Math.cos(ang) * rad, y + Math.sin(ang) * rad, s, 0, Math.PI * 2);
    ctx.fill();
  }
}

function paintDrip(
  ctx: CanvasRenderingContext2D,
  m: Mark,
  x: number,
  y: number,
  len: number,
  thick: number,
  rng: () => number,
) {
  const endX = x + (rng() - 0.5) * thick * 3;
  const endY = y + len * (1.6 + rng() * 0.9);
  const midX = x + (rng() - 0.5) * thick * 4;
  const midY = y + (endY - y) * 0.55;
  ctx.lineCap = "round";
  ctx.strokeStyle = rgba(m.r, m.g, m.b, m.a * 0.28);
  ctx.lineWidth = Math.max(2, thick * 1.4);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(midX, midY, endX, endY);
  ctx.stroke();
  ctx.strokeStyle = rgba(m.r, m.g, m.b, m.a * 0.85);
  ctx.lineWidth = Math.max(1, thick * 0.42);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(midX, midY, endX, endY);
  ctx.stroke();
  ctx.fillStyle = rgba(m.r, m.g, m.b, m.a * 0.75);
  ctx.beginPath();
  ctx.ellipse(endX, endY, thick * 0.85, thick * 1.35, 0, 0, Math.PI * 2);
  ctx.fill();
}

function paintDots(
  ctx: CanvasRenderingContext2D,
  m: Mark,
  x: number,
  y: number,
  len: number,
  thick: number,
  rng: () => number,
) {
  const count = 8 + Math.floor(rng() * 16);
  for (let i = 0; i < count; i++) {
    const ang = rng() * Math.PI * 2;
    const rad = rng() * len * 0.85;
    ctx.fillStyle = rgba(m.r, m.g, m.b, m.a);
    ctx.beginPath();
    ctx.arc(x + Math.cos(ang) * rad, y + Math.sin(ang) * rad, Math.max(0.8, thick * (0.25 + rng() * 0.5)), 0, Math.PI * 2);
    ctx.fill();
  }
}

function paintHatch(
  ctx: CanvasRenderingContext2D,
  m: Mark,
  x: number,
  y: number,
  len: number,
  thick: number,
  rng: () => number,
) {
  ctx.translate(x, y);
  ctx.rotate(m.rot);
  ctx.beginPath();
  ctx.rect(-len / 2, -len * 0.38, len, len * 0.76);
  ctx.clip();
  ctx.strokeStyle = rgba(m.r, m.g, m.b, m.a);
  ctx.lineWidth = Math.max(1, thick * 0.35);
  const step = Math.max(3, thick * 1.4);
  const slant = (rng() - 0.5) * 0.2;
  for (let yy = -len; yy < len; yy += step) {
    ctx.beginPath();
    ctx.moveTo(-len, yy);
    ctx.lineTo(len, yy + len * slant);
    ctx.stroke();
  }
}

function paintHalftone(
  ctx: CanvasRenderingContext2D,
  m: Mark,
  x: number,
  y: number,
  len: number,
  thick: number,
) {
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(x, y, len, len * 0.72, m.rot, 0, Math.PI * 2);
  ctx.clip();
  const step = Math.max(6, thick * 1.6);
  ctx.fillStyle = rgba(m.r, m.g, m.b, m.a);
  let dots = 0;
  for (let yy = y - len; yy < y + len && dots < 220; yy += step) {
    for (let xx = x - len; xx < x + len && dots < 220; xx += step) {
      const dx = (xx - x) / len;
      const dy = (yy - y) / (len * 0.72);
      const d = dx * dx + dy * dy;
      if (d > 1) continue;
      ctx.beginPath();
      ctx.arc(xx, yy, step * 0.28 * (1.15 - d), 0, Math.PI * 2);
      ctx.fill();
      dots++;
    }
  }
  ctx.restore();
}

function paintStreak(
  ctx: CanvasRenderingContext2D,
  m: Mark,
  x: number,
  y: number,
  len: number,
  thick: number,
  rng: () => number,
) {
  paintStroke(ctx, m, x, y, len * 1.3, Math.max(1, thick * 0.45), Math.min(len, thick), "stroke");
  for (let i = 0; i < 12; i++) {
    const along = (rng() - 0.5) * len;
    const side = (rng() - 0.5) * thick * 6;
    const px = x + Math.cos(m.rot) * along - Math.sin(m.rot) * side;
    const py = y + Math.sin(m.rot) * along + Math.cos(m.rot) * side;
    ctx.fillStyle = rgba(m.r, m.g, m.b, m.a * rng());
    ctx.beginPath();
    ctx.arc(px, py, Math.max(0.6, thick * rng() * 0.4), 0, Math.PI * 2);
    ctx.fill();
  }
}

function paintScratch(
  ctx: CanvasRenderingContext2D,
  m: Mark,
  x: number,
  y: number,
  len: number,
  thick: number,
  rng: () => number,
) {
  ctx.translate(x, y);
  ctx.rotate(m.rot);
  ctx.strokeStyle = rgba(m.r, m.g, m.b, m.a);
  ctx.lineWidth = Math.max(1, thick * 0.35);
  ctx.lineCap = "butt";
  const lines = 3 + Math.floor(rng() * 4);
  for (let i = 0; i < lines; i++) {
    const yy = (i - lines / 2) * thick * 0.7;
    ctx.setLineDash([Math.max(2, len * 0.12), Math.max(2, len * 0.08)]);
    ctx.beginPath();
    ctx.moveTo(-len / 2, yy);
    ctx.lineTo(len / 2, yy + (rng() - 0.5) * thick);
    ctx.stroke();
  }
}
