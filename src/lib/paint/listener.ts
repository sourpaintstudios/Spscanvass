import type { PaintFrame } from "@/lib/paint/types";

/**
 * Sour Paint Studios listener.
 * Pitch (McLeod / NSDF), onset, level, and speed follow the studio's proven
 * engine. Mood, staccato, and gallop are painter-only additions.
 */

const SHARPS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

let mpmScratch: Float32Array | null = null;

export function detectPitchMPM(buf: Float32Array, W: number, sr: number, minLag: number, maxLag: number) {
  if (maxLag > W - 2) maxLag = W - 2;
  if (!mpmScratch || mpmScratch.length < maxLag + 1) mpmScratch = new Float32Array(maxLag + 1);
  const nsdf = mpmScratch;
  let m = 0;
  for (let j = 0; j < W; j++) m += buf[j] * buf[j];
  m *= 2;
  if (m <= 0) return null;
  for (let tau = 0; tau <= maxLag; tau++) {
    if (tau > 0) m -= buf[tau - 1] * buf[tau - 1] + buf[W - tau] * buf[W - tau];
    let r = 0;
    const n = W - tau;
    for (let k = 0; k < n; k++) r += buf[k] * buf[k + tau];
    nsdf[tau] = m > 1e-12 ? (2 * r) / m : 0;
  }
  const peaks: number[] = [];
  let tau = 1;
  while (tau < maxLag && nsdf[tau] > 0) tau++;
  let inPos = false;
  let best = 0;
  let bestTau = -1;
  for (; tau < maxLag; tau++) {
    if (!inPos) {
      if (nsdf[tau] > 0 && nsdf[tau - 1] <= 0) {
        inPos = true;
        best = nsdf[tau];
        bestTau = tau;
      }
    } else if (nsdf[tau] <= 0) {
      inPos = false;
      peaks.push(bestTau);
    } else if (nsdf[tau] > best) {
      best = nsdf[tau];
      bestTau = tau;
    }
  }
  if (inPos && bestTau > 0 && bestTau < maxLag - 1) peaks.push(bestTau);
  let highest = 0;
  for (let i = 0; i < peaks.length; i++) {
    if (peaks[i] >= minLag && nsdf[peaks[i]] > highest) highest = nsdf[peaks[i]];
  }
  if (highest <= 0) return null;
  let chosen = -1;
  for (let i = 0; i < peaks.length; i++) {
    if (peaks[i] >= minLag && nsdf[peaks[i]] >= 0.9 * highest) {
      chosen = peaks[i];
      break;
    }
  }
  if (chosen < 1) return null;
  const a = nsdf[chosen - 1];
  const b = nsdf[chosen];
  const c = nsdf[chosen + 1];
  const denom = a - 2 * b + c;
  let shift = denom !== 0 ? (0.5 * (a - c)) / denom : 0;
  if (shift > 1 || shift < -1) shift = 0;
  return { freq: sr / (chosen + shift), clarity: b - 0.25 * (a - c) * shift };
}

export function freqToMidi(f: number, a4 = 440) {
  return 69 + (12 * Math.log(f / a4)) / Math.LN2;
}

export function midiToFreq(m: number, a4 = 440) {
  return a4 * Math.pow(2, (m - 69) / 12);
}

function median(arr: number[]) {
  const s = arr.slice().sort((x, y) => x - y);
  return s[Math.floor(s.length / 2)] ?? 0;
}

function gallopOf(times: number[]) {
  if (times.length < 5) return false;
  const iois: number[] = [];
  for (let i = times.length - 4; i < times.length; i++) {
    if (i <= 0) continue;
    iois.push(times[i] - times[i - 1]);
  }
  if (iois.length < 4) return false;
  const [a, b, c, d] = iois;
  const shortLong = (x: number, y: number) => x < y * 0.72 && x > 40 && y < 700;
  return shortLong(a, b) && shortLong(c, d) && Math.abs(a - c) < Math.max(30, a * 0.5);
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function uniquePc(midis: number[]) {
  const out: number[] = [];
  for (const midi of midis) {
    const pc = ((Math.round(midi) % 12) + 12) % 12;
    if (!out.includes(pc)) out.push(pc);
  }
  return out;
}

function judgeChord(pcs: number[]) {
  if (!pcs.length) return { name: "", tension: 0, mood: 0 };
  const root = pcs[0] ?? 0;
  const has = (n: number) => pcs.some((pc) => (pc - root + 12) % 12 === n);
  const span = Math.max(...pcs.map((pc) => (pc - root + 12) % 12));
  if (pcs.length >= 3 && span <= 4) return { name: "Cluster", tension: 0.92, mood: 0 };
  if ((has(1) || has(6) || has(11)) && !((has(4) || has(3)) && has(7))) {
    return { name: "Dissonant", tension: 0.84, mood: 0 };
  }
  if (has(4) && has(7) && (has(10) || has(11))) return { name: "Dominant", tension: 0.78, mood: 0.15 };
  if (has(3) && has(7) && has(10)) return { name: "Minor7", tension: 0.58, mood: -0.45 };
  if (has(4) && has(7)) return { name: "Major", tension: 0.28, mood: 0.82 };
  if (has(3) && has(7)) return { name: "Minor", tension: 0.42, mood: -0.78 };
  if (has(4)) return { name: "Major", tension: 0.34, mood: 0.7 };
  if (has(3)) return { name: "Minor", tension: 0.48, mood: -0.7 };
  if (has(7)) return { name: "Power", tension: 0.16, mood: 0 };
  if (pcs.length >= 4) return { name: "Cluster", tension: 0.8, mood: 0 };
  return { name: "Open", tension: 0.2, mood: 0 };
}

export class SourPaintListener {
  a4: number;
  minClarity: number;
  onFrame: ((frame: PaintFrame) => void) | null = null;
  running = false;
  private ctx: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private analyser: AnalyserNode | null = null;
  private buf: Float32Array<ArrayBuffer> | null = null;
  private fbuf: Float32Array<ArrayBuffer> | null = null;
  private W = 0;
  private minLag = 0;
  private maxLag = 0;
  private raf = 0;
  private hist: number[] = [];
  private rhist: number[] = [];
  private onsets: number[] = [];
  private peak = 0.1;
  private prevR = 0;
  private rate = 0;
  private lastOnset = 0;
  private lastPitchTs = 0;
  private lastHeard = 0;
  private pitchNorm = 0.5;
  private midi: number | null = null;
  private freq = 0;
  private clarity = 0;
  private mood = 0;
  private staccato = 0.35;
  private noteStart = 0;
  private notePeak = 0;
  private holding = false;
  private floor = 0;
  private warm = 0;
  private voiceCount = 0;
  private density = 0;
  private brightness = 0.5;
  private lowW = 0;
  private tone = 0;
  private tension = 0;
  private stable = 0;
  private thin = true;
  private chord = "";
  private chordChanged = false;
  private chromaSm = new Float32Array(12);
  private approach = 0;
  private lift = 0;
  private prevLevel = 0;
  private prevBright = 0.5;
  private named = "";
  private rootPc = -1;
  private notePcs: number[] = [];
  private loop = (ts: number) => {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.loop);
    this.tick(ts);
  };

  constructor(opts?: { a4?: number; minClarity?: number }) {
    this.a4 = opts?.a4 ?? 440;
    this.minClarity = opts?.minClarity ?? 0.88;
  }

  start(onFrame?: (frame: PaintFrame) => void) {
    if (onFrame) this.onFrame = onFrame;
    if (this.running) return Promise.resolve();
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx || !navigator.mediaDevices?.getUserMedia) {
      return Promise.reject(new Error("Microphone not supported on this page (needs HTTPS)."));
    }
    this.ctx = new Ctx();
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.openStream()
      .then((stream) => {
        const ctx = this.ctx;
        if (!ctx) throw new Error("Audio closed before the mic opened.");
        this.stream = stream;
        const src = ctx.createMediaStreamSource(stream);
        const hp = ctx.createBiquadFilter();
        hp.type = "highpass";
        hp.frequency.value = 50;
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 1800;
        const an = ctx.createAnalyser();
        let W = 2048;
        while (W < ctx.sampleRate * 0.04) W *= 2;
        an.fftSize = W;
        an.smoothingTimeConstant = 0;
        src.connect(hp);
        hp.connect(lp);
        lp.connect(an);
        this.source = src;
        this.analyser = an;
        this.W = W;
        this.buf = new Float32Array(new ArrayBuffer(W * 4));
        this.fbuf = new Float32Array(new ArrayBuffer(an.frequencyBinCount * 4));
        this.minLag = Math.floor(ctx.sampleRate / 1400);
        this.maxLag = Math.min(W - 2, Math.ceil(ctx.sampleRate / 58));
        this.running = true;
        this.raf = requestAnimationFrame(this.loop);
      });
  }

  mediaStream() {
    return this.stream;
  }

  private openStream() {
    const devices = navigator.mediaDevices;
    if (!devices?.getUserMedia) return Promise.reject(new Error("Microphone not supported on this page."));
    const strict = {
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false, channelCount: 1 },
      video: false,
    } as const;
    return devices.getUserMedia(strict).catch((error: unknown) => {
      const name = (error as { name?: string }).name ?? "";
      if (name === "NotAllowedError" || name === "SecurityError" || name === "PermissionDeniedError") throw error;
      return devices.getUserMedia({ audio: true, video: false });
    });
  }

  stop() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    try {
      this.source?.disconnect();
    } catch {
      /* already disconnected */
    }
    this.stream?.getTracks().forEach((track) => track.stop());
    try {
      void this.ctx?.close();
    } catch {
      /* already closed */
    }
    this.ctx = null;
    this.stream = null;
    this.source = null;
    this.analyser = null;
    this.onFrame = null;
  }

  private tick(ts: number) {
    const buf = this.buf;
    const analyser = this.analyser;
    const ctx = this.ctx;
    if (!buf || !analyser || !ctx) return;
    analyser.getFloatTimeDomainData(buf);
    const n = buf.length;
    const tail = Math.min(512, n);
    let sum = 0;
    let peakAbs = 0;
    for (let i = n - tail; i < n; i++) {
      const s = buf[i];
      sum += s * s;
      const a = s < 0 ? -s : s;
      if (a > peakAbs) peakAbs = a;
    }
    const rms = Math.sqrt(sum / tail);
    const crest = rms > 1e-5 ? peakAbs / rms : 0;
    if (this.warm < 30) {
      this.warm += 1;
      this.floor = this.warm === 1 ? rms : rms < this.floor ? rms : this.floor * 0.92 + rms * 0.08;
    } else {
      const tau = rms < this.floor ? 0.35 : 12;
      const k = 1 - Math.exp(-(1 / 60) / tau);
      this.floor += (rms - this.floor) * k;
    }
    this.peak = Math.max(rms, this.peak * 0.9993, 0.03);
    const level = Math.min(1, rms / this.peak);
    const sounding = this.warm >= 30 && rms > Math.max(0.02, this.floor * 2.15);
    const now = Date.now();

    const rh = this.rhist;
    rh.push(rms);
    if (rh.length > 6) rh.shift();
    const ref = rh.length >= 5 ? Math.min(rh[rh.length - 4] ?? rms, rh[rh.length - 3] ?? rms, rh[rh.length - 2] ?? rms) : rms;
    const onset =
      sounding &&
      rms - ref > Math.max(0.008, 0.1 * this.peak) &&
      rms > ref * 1.25 &&
      rms > this.prevR &&
      now - this.lastOnset > 70;
    this.prevR = rms;
    let strength = 0;
    if (onset) {
      this.lastOnset = now;
      this.onsets.push(now);
      strength = Math.max(0.15, Math.min(1, level * 0.8 + (rms - ref) * 2));
      this.holding = true;
      this.noteStart = now;
      this.notePeak = rms;
    }
    if (this.holding) {
      const age = now - this.noteStart;
      if (!sounding || rms < this.notePeak * 0.42) {
        const chop = age < 140 ? 0.95 : age < 280 ? 0.55 : 0.12;
        this.staccato += (chop - this.staccato) * 0.45;
        this.holding = false;
      } else if (age > 520) {
        this.staccato += (0.08 - this.staccato) * 0.15;
        this.holding = false;
      }
    }

    const cutoff = now - 2500;
    while (this.onsets.length && this.onsets[0] < cutoff) this.onsets.shift();
    this.rate += (this.onsets.length / 2.5 - this.rate) * 0.05;
    const speed = Math.max(0, Math.min(1, (this.rate - 0.8) / 5.5));

    if (!sounding) {
      this.voiceCount = 0;
      this.thin = true;
      this.chordChanged = false;
      this.density *= 0.85;
      this.stable *= 0.9;
      if (this.density < 0.06) this.chord = "";
      this.mood += (0 - this.mood) * 0.05;
    } else if (ts - this.lastPitchTs >= 30) {
      this.lastPitchTs = ts;
      this.senseBody();
    }

    const rawApproach = Math.max(-1, Math.min(1, (level - this.prevLevel) * 14));
    this.prevLevel = level;
    this.approach += (rawApproach - this.approach) * (sounding ? 0.45 : 0.2);
    if (!sounding) this.approach *= 0.8;
    const rawLift = Math.max(-1, Math.min(1, (this.brightness - this.prevBright) * 7));
    this.prevBright = this.brightness;
    this.lift += (rawLift - this.lift) * (sounding ? 0.4 : 0.15);
    if (!sounding) this.lift *= 0.85;

    this.onFrame?.({
      rms,
      level,
      sounding,
      onset,
      strength,
      rate: this.rate,
      speed,
      freq: 0,
      midi: null,
      pitchNorm: this.brightness,
      note: "",
      octave: null,
      cents: 0,
      clarity: this.tone,
      crest,
      mood: this.mood,
      staccato: this.staccato,
      gallop: gallopOf(this.onsets),
      voices: this.voiceCount,
      density: this.density,
      brightness: this.brightness,
      low: this.lowW,
      tone: this.tone,
      tension: this.tension,
      stable: this.stable,
      thin: this.thin,
      changed: this.chordChanged,
      chord: this.chord,
      approach: this.approach,
      lift: this.lift,
      root: sounding ? this.rootPc : -1,
      notes: sounding ? this.notePcs.slice(0, 4) : [],
    });
  }

  private senseBody() {
    const analyser = this.analyser;
    const ctx = this.ctx;
    const fbuf = this.fbuf;
    if (!analyser || !ctx || !fbuf) return;
    analyser.getFloatFrequencyData(fbuf);
    const binHz = ctx.sampleRate / analyser.fftSize;
    const chroma = new Float32Array(12);
    let lowE = 0;
    let midE = 0;
    let highE = 0;
    let total = 0;
    let cSum = 0;
    let maxMag = 0;
    let magN = 0;
    const peaks: { hz: number; midi: number; mag: number }[] = [];
    for (let i = 2; i < fbuf.length - 1; i++) {
      const hz = i * binHz;
      if (hz < 55 || hz > 5000) continue;
      const db = fbuf[i];
      if (db < -72) continue;
      const mag = Math.pow(10, db / 20);
      total += mag;
      magN += 1;
      if (mag > maxMag) maxMag = mag;
      cSum += hz * mag;
      if (hz < 180) lowE += mag;
      else if (hz < 1400) midE += mag;
      else highE += mag;
      if (hz >= 70 && hz <= 2200) {
        const pc = ((Math.round(freqToMidi(hz, this.a4)) % 12) + 12) % 12;
        chroma[pc] += mag;
      }
      if (db > -50 && db >= fbuf[i - 1] && db > fbuf[i + 1] && hz >= 70 && hz <= 1800) {
        peaks.push({ hz, midi: freqToMidi(hz, this.a4), mag });
      }
    }
    let cmax = 0;
    for (let i = 0; i < 12; i++) if (chroma[i] > cmax) cmax = chroma[i];
    if (cmax > 0) for (let i = 0; i < 12; i++) chroma[i] /= cmax;

    peaks.sort((a, b) => b.mag - a.mag);
    const voices: number[] = [];
    for (let p = 0; p < peaks.length && voices.length < 6; p++) {
      const peak = peaks[p];
      let harmonic = false;
      for (let v = 0; v < voices.length; v++) {
        const base = midiToFreq(voices[v], this.a4);
        const ratio = peak.hz / base;
        const nearest = Math.round(ratio);
        if (nearest >= 2 && nearest <= 6 && Math.abs(ratio - nearest) < 0.04) harmonic = true;
        const semi = Math.abs(peak.midi - voices[v]);
        if (semi < 0.55 || Math.abs(semi - 12) < 0.55 || Math.abs(semi - 24) < 0.55) harmonic = true;
      }
      if (!harmonic) voices.push(peak.midi);
    }

    const root = chroma.indexOf(cmax);
    const strong: number[] = [];
    for (let i = 0; i < 12; i++) if (chroma[i] > 0.42) strong.push(i);
    const realExtras = strong.filter((pc) => {
      const iv = (pc - root + 12) % 12;
      if (iv === 0 || iv === 7) return false;
      return chroma[pc] > 0.5;
    });

    let count = voices.length;
    let pcs = uniquePc(voices);
    if (count <= 1) {
      if (realExtras.length > 0) {
        count = 1 + realExtras.length;
        pcs = strong;
      } else {
        count = cmax > 0 ? 1 : 0;
        pcs = cmax > 0 ? [root] : [];
      }
    }

    const mean = magN > 0 ? total / magN : 0;
    const peakiness = mean > 0 ? maxMag / mean : 0;
    this.tone = clamp01((peakiness - 2) / 16);
    const centroid = total > 0 ? cSum / total : 0;
    this.brightness = clamp01((centroid - 180) / 2600);
    this.lowW = clamp01(lowE / (total + 1e-8) * 1.6);
    this.voiceCount = count;
    this.rootPc = cmax > 0 ? root : this.rootPc;

    const broad = peaks.length >= 6 && this.tone < 0.42 && total > 0;
    if (count <= 1 && realExtras.length === 0 && !broad) {
      this.thin = true;
      this.density = 0.15;
      this.chord = "";
      this.tension = 0.1;
      this.mood += (0 - this.mood) * 0.08;
    } else {
      if (count <= 1 && broad) {
        this.voiceCount = Math.max(3, realExtras.length + 1);
        this.density = Math.max(0.5, this.density);
      } else {
        this.density = clamp01((Math.max(pcs.length, realExtras.length + 1, count) - 1) / 4);
      }
      this.thin = false;
      const judged = judgeChord(pcs.length ? pcs : strong);
      this.chord = judged.name;
      this.tension = judged.tension;
      this.mood += (judged.mood - this.mood) * 0.2;
    }

    const nextName = this.chord;
    if (nextName && nextName !== this.named) {
      this.chordChanged = this.named.length > 0;
      this.named = nextName;
      this.stable = 0.2;
    } else {
      let dist = 0;
      for (let i = 0; i < 12; i++) dist += Math.abs(chroma[i] - this.chromaSm[i]);
      const jumped = dist > 0.5 && this.stable > 0.4 && !this.thin;
      if (jumped) {
        this.stable = 0.12;
        this.chordChanged = true;
      } else {
        this.chordChanged = false;
        if (dist < 0.38) this.stable += (1 - this.stable) * 0.22;
      }
    }
    for (let i = 0; i < 12; i++) this.chromaSm[i] += (chroma[i] - this.chromaSm[i]) * 0.28;
    const heard: number[] = [];
    for (let i = 0; i < 12; i++) if (chroma[i] > 0.28) heard.push(i);
    heard.sort((a, b) => chroma[b] - chroma[a]);
    if (this.thin) this.notePcs = this.rootPc >= 0 ? [this.rootPc] : heard.slice(0, 1);
    else this.notePcs = (heard.length ? heard : this.rootPc >= 0 ? [this.rootPc] : []).slice(0, 4);
  }
}

let primed: SourPaintListener | null = null;
let primedReady: Promise<boolean> | null = null;
let primedError: string | null = null;

export function micReason(error: unknown) {
  const name = (error as { name?: string } | null)?.name ?? "";
  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return "The phone blocked the mic. Allow the microphone for this page, then tap Try the mic.";
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") return "No microphone was found on this phone.";
  if (name === "NotReadableError" || name === "TrackStartError") return "The microphone is busy in another app.";
  if (name === "SecurityError") return "This view blocked the microphone. Allow it for the page, then tap Try the mic.";
  if (name === "OverconstrainedError") return "This mic refused the first setup. Tap Try the mic.";
  return "The mic did not open. Tap Try the mic.";
}

export function primeMic() {
  cancelPrimed();
  const ear = new SourPaintListener();
  primed = ear;
  primedError = null;
  primedReady = ear
    .start()
    .then(() => true)
    .catch((error: unknown) => {
      primedError = micReason(error);
      ear.stop();
      if (primed === ear) {
        primed = null;
        primedReady = null;
      }
      return false;
    });
}

export function cancelPrimed() {
  primed?.stop();
  primed = null;
  primedReady = null;
  primedError = null;
}

export function takePrimed() {
  const listener = primed;
  const ready = primedReady ?? Promise.resolve(false);
  const reason = () => primedError;
  primed = null;
  primedReady = null;
  return { listener, ready, reason };
}
