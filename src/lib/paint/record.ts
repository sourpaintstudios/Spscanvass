export type TakeRecorder = {
  hasAudio: boolean;
  stop(): Promise<Blob | null>;
  cancel(): void;
};

export function startRecorder(canvas: HTMLCanvasElement, audio?: MediaStream | null): TakeRecorder | null {
  if (typeof MediaRecorder === "undefined") return null;
  const types = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
    "video/mp4",
  ];
  const mime = types.find((type) => MediaRecorder.isTypeSupported(type));
  if (!mime) return null;
  const stream = canvas.captureStream(30);
  const clones: MediaStreamTrack[] = [];
  if (audio) {
    for (const track of audio.getAudioTracks()) {
      if (track.readyState !== "live") continue;
      const clone = track.clone();
      clones.push(clone);
      stream.addTrack(clone);
    }
  }
  const hasAudio = clones.length > 0;
  let rec: MediaRecorder;
  try {
    rec = new MediaRecorder(stream, {
      mimeType: mime,
      videoBitsPerSecond: 4_500_000,
      ...(hasAudio ? { audioBitsPerSecond: 128_000 } : {}),
    });
  } catch {
    clones.forEach((track) => track.stop());
    stream.getVideoTracks().forEach((track) => track.stop());
    if (hasAudio) return startRecorder(canvas, null);
    return null;
  }
  const chunks: Blob[] = [];
  rec.ondataavailable = (event) => {
    if (event.data.size) chunks.push(event.data);
  };
  try {
    rec.start(250);
  } catch {
    clones.forEach((track) => track.stop());
    stream.getVideoTracks().forEach((track) => track.stop());
    if (hasAudio) return startRecorder(canvas, null);
    return null;
  }
  const release = () => {
    stream.getVideoTracks().forEach((track) => track.stop());
    clones.forEach((track) => track.stop());
  };
  return {
    hasAudio,
    stop(): Promise<Blob | null> {
      return new Promise((resolve) => {
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          release();
          resolve(chunks.length ? new Blob(chunks, { type: rec.mimeType || mime }) : null);
        };
        rec.onerror = finish;
        rec.onstop = finish;
        if (rec.state === "recording") rec.stop();
        else finish();
        window.setTimeout(finish, 2500);
      });
    },
    cancel() {
      rec.onstop = release;
      rec.onerror = release;
      if (rec.state === "recording") rec.stop();
      else release();
    },
  };
}

export type TakeCuts = {
  full: Blob | null;
  s30: Blob | null;
  s60: Blob | null;
  s90: Blob | null;
};

export type SessionRecorder = {
  hasAudio: boolean;
  note(elapsedMs: number): void;
  stop(): Promise<TakeCuts>;
  cancel(): void;
};

type Cut = {
  at: number;
  key: "s30" | "s60" | "s90";
  rec: MediaRecorder;
  chunks: Blob[];
  stopped: boolean;
  done: Promise<Blob | null>;
};

export function startSessionRecorder(
  canvas: HTMLCanvasElement,
  audio: MediaStream | null | undefined,
  seconds: number,
): SessionRecorder | null {
  if (typeof MediaRecorder === "undefined") return null;
  const types = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
    "video/mp4",
  ];
  const mime = types.find((type) => MediaRecorder.isTypeSupported(type));
  if (!mime) return null;
  const stream = canvas.captureStream(30);
  const clones: MediaStreamTrack[] = [];
  if (audio) {
    for (const track of audio.getAudioTracks()) {
      if (track.readyState !== "live") continue;
      const clone = track.clone();
      clones.push(clone);
      stream.addTrack(clone);
    }
  }
  const hasAudio = clones.length > 0;
  const plan: { at: number; key: Cut["key"] }[] = [{ at: Math.max(30, seconds) * 1000, key: seconds >= 90 ? "s90" : seconds >= 60 ? "s60" : "s30" }];
  const cuts: Cut[] = [];
  for (const item of plan) {
    try {
      const rec = new MediaRecorder(stream, {
        mimeType: mime,
        videoBitsPerSecond: 2_500_000,
        ...(hasAudio ? { audioBitsPerSecond: 96_000 } : {}),
      });
      const chunks: Blob[] = [];
      rec.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      const done = new Promise<Blob | null>((resolve) => {
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          resolve(chunks.length ? new Blob(chunks, { type: rec.mimeType || mime }) : null);
        };
        rec.onstop = finish;
        rec.onerror = finish;
      });
      rec.start(250);
      cuts.push({ at: item.at, key: item.key, rec, chunks, stopped: false, done });
    } catch {
      if (cuts.length === 0 && hasAudio) {
        stream.getVideoTracks().forEach((track) => track.stop());
        clones.forEach((track) => track.stop());
        return startSessionRecorder(canvas, null, seconds);
      }
      break;
    }
  }
  if (cuts.length === 0) {
    stream.getVideoTracks().forEach((track) => track.stop());
    clones.forEach((track) => track.stop());
    return null;
  }
  let elapsed = 0;
  let released = false;
  const release = () => {
    if (released) return;
    released = true;
    stream.getVideoTracks().forEach((track) => track.stop());
    clones.forEach((track) => track.stop());
  };
  const halt = (cut: Cut) => {
    if (cut.stopped) return;
    cut.stopped = true;
    if (cut.rec.state === "recording") cut.rec.stop();
  };
  return {
    hasAudio,
    note(elapsedMs: number) {
      elapsed = elapsedMs;
      for (const cut of cuts) {
        if (!cut.stopped && elapsedMs >= cut.at) halt(cut);
      }
    },
    stop() {
      for (const cut of cuts) halt(cut);
      return Promise.all(
        cuts.map((cut) => Promise.race([cut.done, new Promise<Blob | null>((resolve) => window.setTimeout(() => resolve(null), 2500))])),
      ).then((blobs) => {
        release();
        const out: TakeCuts = { full: null, s30: null, s60: null, s90: null };
        let longest: Blob | null = null;
        let longestAt = -1;
        cuts.forEach((cut, index) => {
          const blob = blobs[index];
          if (!blob) return;
          if (cut.at >= longestAt) {
            longestAt = cut.at;
            longest = blob;
          }
          if (elapsed + 800 >= cut.at) out[cut.key] = blob;
        });
        out.full = longest;
        return out;
      });
    },
    cancel() {
      for (const cut of cuts) halt(cut);
      release();
    },
  };
}

