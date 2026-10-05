export type EarSample = {
  rms: number;
  onset: number;
  centroid: number;
  f0: number;
  conf: number;
  lowE: number;
  highE: number;
  chroma: number[];
};

const WORKLET = `
class SourEar extends AudioWorkletProcessor {
  constructor() {
    super();
    this.N = 2048;
    this.hop = 512;
    this.buf = new Float32Array(this.N);
    this.n = 0;
    this.re = new Float32Array(1024);
    this.im = new Float32Array(1024);
    this.mag = new Float32Array(512);
    this.prev = new Float32Array(512);
    this.hasPrev = false;
    this.d = new Float32Array(700);
    this.cm = new Float32Array(700);
    this.chroma = new Float32Array(12);
    this.hops = 0;
  }
  process(inputs) {
    const ch = inputs[0] && inputs[0][0];
    if (!ch) return true;
    for (let i = 0; i < ch.length; i++) {
      this.buf[this.n++] = ch[i];
      if (this.n >= this.N) {
        this.hops++;
        this.analyze(this.hops % 2 === 0);
        this.buf.copyWithin(0, this.hop);
        this.n = this.N - this.hop;
      }
    }
    return true;
  }
  analyze(doPitch) {
    const sr = sampleRate;
    let e = 0;
    for (let i = 0; i < this.N; i++) e += this.buf[i] * this.buf[i];
    const rms = Math.sqrt(e / this.N);
    const mag = this.spectrum();
    let flux = 0;
    let num = 0;
    let den = 0;
    let low = 0;
    let high = 0;
    const chroma = this.chroma;
    chroma.fill(0);
    for (let k = 1; k < 512; k++) {
      const f = (k * sr) / 1024;
      const m = mag[k];
      if (this.hasPrev) {
        const d = m - this.prev[k];
        if (d > 0) flux += d;
      }
      this.prev[k] = m;
      num += f * m;
      den += m;
      if (f >= 80 && f < 800) low += m;
      else if (f >= 800 && f <= 4000) high += m;
      if (f > 70 && f < 2500 && m > 0) {
        const pc = Math.round(12 * Math.log2(f / 440)) % 12;
        chroma[(pc + 12) % 12] += m;
      }
    }
    this.hasPrev = true;
    let cmax = 0;
    for (let i = 0; i < 12; i++) if (chroma[i] > cmax) cmax = chroma[i];
    if (cmax > 0) for (let i = 0; i < 12; i++) chroma[i] /= cmax;
    const centroid = den > 0 ? Math.max(0, Math.min(1, (num / den - 80) / 4000)) : 0;
    const onset = Math.max(0, Math.min(1, flux / (den * 0.35 + 1e-4)));
    let f0 = 0;
    let conf = 0;
    if (doPitch && rms > 0.004) {
      const hit = this.yin(sr);
      f0 = hit.f0;
      conf = hit.conf;
    }
    this.port.postMessage({
      rms, onset, centroid, f0, conf, lowE: low, highE: high,
      chroma: Array.from(chroma),
    });
  }
  spectrum() {
    const n = 1024;
    const off = this.N - n;
    const re = this.re;
    const im = this.im;
    for (let i = 0; i < n; i++) {
      const w = 0.5 * (1 - Math.cos((6.28318530718 * i) / (n - 1)));
      re[i] = this.buf[off + i] * w;
      im[i] = 0;
    }
    for (let i = 1, j = 0; i < n; i++) {
      let bit = n >> 1;
      for (; j & bit; bit >>= 1) j ^= bit;
      j ^= bit;
      if (i < j) {
        const tr = re[i]; re[i] = re[j]; re[j] = tr;
      }
    }
    for (let len = 2; len <= n; len <<= 1) {
      const ang = (-6.28318530718) / len;
      const wr0 = Math.cos(ang);
      const wi0 = Math.sin(ang);
      for (let i = 0; i < n; i += len) {
        let wr = 1, wi = 0;
        const half = len >> 1;
        for (let j = 0; j < half; j++) {
          const ur = re[i + j], ui = im[i + j];
          const vr = re[i + j + half] * wr - im[i + j + half] * wi;
          const vi = re[i + j + half] * wi + im[i + j + half] * wr;
          re[i + j] = ur + vr;
          im[i + j] = ui + vi;
          re[i + j + half] = ur - vr;
          im[i + j + half] = ui - vi;
          const nwr = wr * wr0 - wi * wi0;
          wi = wr * wi0 + wi * wr0;
          wr = nwr;
        }
      }
    }
    const mag = this.mag;
    for (let i = 0; i < 512; i++) mag[i] = Math.hypot(re[i], im[i]);
    return mag;
  }
  yin(sr) {
    const tauMax = Math.min(680, Math.floor(sr / 75));
    const tauMin = Math.max(8, Math.floor(sr / 1400));
    const d = this.d;
    const span = this.N - tauMax;
    for (let tau = tauMin; tau < tauMax; tau++) {
      let sum = 0;
      for (let i = 0; i < span; i += 4) {
        const diff = this.buf[i] - this.buf[i + tau];
        sum += diff * diff;
      }
      d[tau] = sum;
    }
    const cm = this.cm;
    let run = 0;
    let best = -1;
    let bestCm = 1;
    for (let tau = tauMin; tau < tauMax; tau++) {
      run += d[tau];
      cm[tau] = (d[tau] * (tau - tauMin + 1)) / (run || 1);
      if (cm[tau] < 0.18 && (best < 0 || cm[tau] < bestCm)) {
        best = tau;
        bestCm = cm[tau];
      }
    }
    if (best < 0) return { f0: 0, conf: 0 };
    return { f0: sr / best, conf: Math.max(0, Math.min(1, 1 - bestCm)) };
  }
}
registerProcessor("sour-ear", SourEar);
`;

export class FluidEar {
  private ctx: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private node: AudioWorkletNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  onSample: ((sample: EarSample) => void) | null = null;

  async attach(stream: MediaStream) {
    this.stream = stream;
    const ctx = new AudioContext();
    this.ctx = ctx;
    if (ctx.state === "suspended") await ctx.resume();
    const url = URL.createObjectURL(new Blob([WORKLET], { type: "text/javascript" }));
    try {
      await ctx.audioWorklet.addModule(url);
      const node = new AudioWorkletNode(ctx, "sour-ear");
      this.node = node;
      node.port.onmessage = (event: MessageEvent<EarSample>) => {
        this.onSample?.(event.data);
      };
      const source = ctx.createMediaStreamSource(stream);
      this.source = source;
      source.connect(node);
    } catch {
      this.fallback(ctx, stream);
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  private fallback(ctx: AudioContext, stream: MediaStream) {
    const source = ctx.createMediaStreamSource(stream);
    this.source = source;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);
    const time = new Float32Array(analyser.fftSize);
    const freq = new Float32Array(analyser.frequencyBinCount);
    const chroma = new Array<number>(12).fill(0);
    let prev = 0;
    const tick = () => {
      if (!this.ctx) return;
      analyser.getFloatTimeDomainData(time);
      analyser.getFloatFrequencyData(freq);
      let e = 0;
      for (let i = 0; i < time.length; i++) e += time[i] * time[i];
      const rms = Math.sqrt(e / time.length);
      let peakF = 0;
      let peakM = 0;
      let num = 0;
      let den = 0;
      let low = 0;
      let high = 0;
      chroma.fill(0);
      const sr = ctx.sampleRate;
      for (let k = 2; k < freq.length; k++) {
        const db = freq[k] ?? -100;
        const m = db < -90 ? 0 : Math.pow(10, db / 20);
        const f = (k * sr) / analyser.fftSize;
        num += f * m;
        den += m;
        if (f >= 80 && f < 800) low += m;
        else if (f >= 800 && f <= 4000) high += m;
        if (f >= 70 && f <= 1400 && m > peakM) {
          peakM = m;
          peakF = f;
        }
        if (f > 70 && f < 2500 && m > 0) {
          const pc = Math.round(12 * Math.log2(f / 440));
          chroma[(pc % 12 + 12) % 12] += m;
        }
      }
      let cmax = 0;
      for (let i = 0; i < 12; i++) if ((chroma[i] ?? 0) > cmax) cmax = chroma[i] ?? 0;
      if (cmax > 0) for (let i = 0; i < 12; i++) chroma[i] = (chroma[i] ?? 0) / cmax;
      const onset = Math.max(0, Math.min(1, (rms - prev) / (prev + 0.01)));
      prev = rms * 0.7 + prev * 0.3;
      this.onSample?.({
        rms,
        onset,
        centroid: den > 0 ? Math.max(0, Math.min(1, (num / den - 80) / 4000)) : 0,
        f0: peakF,
        conf: 0,
        lowE: low,
        highE: high,
        chroma: chroma.slice(),
      });
      window.setTimeout(tick, 32);
    };
    tick();
  }

  stop() {
    this.node?.disconnect();
    this.source?.disconnect();
    this.node = null;
    this.source = null;
    void this.ctx?.close();
    this.ctx = null;
  }
}
