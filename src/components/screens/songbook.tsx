import { useEffect, useRef, useState } from "react";
import { SourPaintListener } from "@/lib/paint/listener";
import type { PaintFrame } from "@/lib/paint/types";
import { SILENT_FRAME } from "@/lib/paint/types";
import { persistSongs, type Song } from "@/lib/songs";
import { useStudio } from "@/lib/studio";
import { Button, TopBar } from "@/components/ui";

export function BookScreen() {
  const pop = useStudio((state) => state.pop);
  const push = useStudio((state) => state.push);
  const songs = useStudio((state) => state.songs);
  const setSongs = useStudio((state) => state.setSongs);
  const [title, setTitle] = useState("");

  function add() {
    const name = title.trim();
    if (!name) return;
    const song: Song = {
      id: crypto.randomUUID(),
      title: name,
      subtitle: "",
      lyrics: "",
      updatedAt: Date.now(),
    };
    const next = [song, ...songs];
    setSongs(next);
    persistSongs(next);
    setTitle("");
    push({ name: "read", id: song.id });
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col">
      <TopBar title="Songbook" onBack={pop} />
      <div className="space-y-4 px-4 pb-8">
        <div className="grid grid-cols-2 gap-2">
          <Button variant="ghost" onClick={() => push({ name: "tuner" })}>
            Tuner
          </Button>
          <Button variant="ghost" onClick={() => push({ name: "tempo" })}>
            Tap tempo
          </Button>
        </div>
        <div className="flex gap-2">
          <input
            className="field"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="New song title"
            aria-label="New song title"
            onKeyDown={(event) => {
              if (event.key === "Enter") add();
            }}
          />
          <Button onClick={add}>Add</Button>
        </div>
        <ul className="space-y-2">
          {songs.map((song) => (
            <li key={song.id}>
              <button
                type="button"
                onClick={() => push({ name: "read", id: song.id })}
                className="w-full rounded-3xl border border-line bg-elevated px-4 py-4 text-left"
              >
                <span className="block text-lg">{song.title}</span>
                {song.subtitle && <span className="mt-1 block text-sm text-subtle">{song.subtitle}</span>}
              </button>
            </li>
          ))}
          {songs.length === 0 && <li className="text-muted">The book is empty. Add a title.</li>}
        </ul>
      </div>
    </main>
  );
}

export function ReaderScreen({ id }: { id: string }) {
  const pop = useStudio((state) => state.pop);
  const songs = useStudio((state) => state.songs);
  const setSongs = useStudio((state) => state.setSongs);
  const bpm = useStudio((state) => state.bpm);
  const song = songs.find((item) => item.id === id);
  const [editing, setEditing] = useState(!song?.lyrics);
  const [size, setSize] = useState(1.35);
  const scroller = useRef<HTMLDivElement>(null);
  const [rolling, setRolling] = useState(false);

  useEffect(() => {
    if (!rolling) return;
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const node = scroller.current;
      if (!node) return;
      node.scrollTop += ((now - last) / 1000) * 22;
      last = now;
      if (node.scrollTop + node.clientHeight < node.scrollHeight - 2) raf = requestAnimationFrame(step);
      else setRolling(false);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [rolling]);

  if (!song) {
    return (
      <main className="px-4 pt-8">
        <p className="text-muted">That page is gone.</p>
        <Button className="mt-4" variant="ghost" onClick={pop}>
          Back
        </Button>
      </main>
    );
  }

  function write(lyrics: string) {
    if (!song) return;
    const next = songs.map((item) => (item.id === song.id ? { ...item, lyrics, updatedAt: Date.now() } : item));
    setSongs(next);
    persistSongs(next);
  }

  function remove() {
    const next = songs.filter((item) => item.id !== id);
    setSongs(next);
    persistSongs(next);
    pop();
  }

  const lines = song.lyrics.split("\n");

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col">
      <TopBar
        title={song.title}
        onBack={pop}
        action={
          <button type="button" className="h-11 px-2 text-sm text-brand" onClick={() => setEditing((value) => !value)}>
            {editing ? "Read" : "Edit"}
          </button>
        }
      />
      <div className="flex items-center gap-2 px-4 pb-3">
        <button type="button" className="h-11 rounded-full border border-line px-3" onClick={() => setSize((value) => Math.max(1.05, value - 0.2))}>
          A-
        </button>
        <button type="button" className="h-11 rounded-full border border-line px-3" onClick={() => setSize((value) => Math.min(2.4, value + 0.2))}>
          A+
        </button>
        <button type="button" className="h-11 rounded-full border border-line px-3" onClick={() => setRolling((value) => !value)}>
          {rolling ? "Stop roll" : "Roll"}
        </button>
        {bpm != null && <span className="num ml-auto text-sm text-signal">{bpm} bpm</span>}
      </div>
      {editing ? (
        <div className="px-4 pb-8">
          <textarea
            className="area"
            value={song.lyrics}
            onChange={(event) => write(event.target.value)}
            placeholder={"[Verse]\nWrite it the way you sing it."}
            aria-label="Lyrics"
          />
          <button type="button" className="mt-4 h-11 text-sm text-subtle" onClick={remove}>
            Delete song
          </button>
        </div>
      ) : (
        <div ref={scroller} className="flex-1 overflow-y-auto px-5 pb-16">
          {song.subtitle && <p className="mb-4 text-sm text-subtle">{song.subtitle}</p>}
          {lines.map((line, index) => {
            const section = /^\[(.+)]$/.exec(line.trim());
            if (section) {
              return (
                <p key={index} className="track-brand mt-6 mb-2 text-xs text-brand">
                  {section[1]}
                </p>
              );
            }
            if (!line.trim()) return <div key={index} className="h-4" />;
            return (
              <p key={index} className="leading-snug" style={{ fontSize: `${size}rem` }}>
                {line}
              </p>
            );
          })}
          {!song.lyrics.trim() && <p className="text-muted">No words yet. Edit the page and type them in.</p>}
        </div>
      )}
    </main>
  );
}

export function TunerScreen() {
  const pop = useStudio((state) => state.pop);
  const earRef = useRef<SourPaintListener | null>(null);
  const frameRef = useRef<PaintFrame>(SILENT_FRAME);
  const [frame, setFrame] = useState<PaintFrame>(SILENT_FRAME);
  const [live, setLive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!live) return;
    let raf = 0;
    let last = 0;
    const loop = (now: number) => {
      if (now - last > 80) {
        last = now;
        setFrame(frameRef.current);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [live]);

  useEffect(() => () => earRef.current?.stop(), []);

  function listen() {
    if (live) {
      earRef.current?.stop();
      earRef.current = null;
      setLive(false);
      return;
    }
    const ear = new SourPaintListener();
    earRef.current = ear;
    ear.onFrame = (next) => {
      frameRef.current = next;
    };
    setError(null);
    void ear.start().then(() => setLive(true)).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Mic didn't open.");
      setLive(false);
    });
  }

  const cents = frame.note ? Math.max(-50, Math.min(50, frame.cents)) : 0;
  const inTune = frame.note && Math.abs(frame.cents) < 8;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col">
      <TopBar title="Tuner" onBack={pop} />
      <div className="flex flex-1 flex-col items-center px-6 pt-8">
        <p className="font-display text-8xl leading-none text-brand">{frame.note || "—"}</p>
        <p className="num mt-2 text-2xl text-muted">{frame.octave ?? ""}</p>
        <div className="relative mt-10 h-3 w-full max-w-sm rounded-full bg-elevated">
          <div className="absolute top-0 left-1/2 h-full w-px bg-signal" />
          <div
            className={inTune ? "absolute top-1/2 h-6 w-1 -translate-y-1/2 bg-brand" : "absolute top-1/2 h-6 w-1 -translate-y-1/2 bg-foreground"}
            style={{ left: `${50 + cents}%` }}
          />
        </div>
        <p className="num mt-4 text-sm text-subtle">{frame.note ? `${frame.cents > 0 ? "+" : ""}${Math.round(frame.cents)} cents` : "Play a string"}</p>
        {error && <p className="mt-4 text-center text-sm text-muted">{error}</p>}
        <Button className="mt-8" onClick={listen}>
          {live ? "Stop" : "Listen"}
        </Button>
      </div>
    </main>
  );
}

export function TempoScreen() {
  const pop = useStudio((state) => state.pop);
  const bpm = useStudio((state) => state.bpm);
  const setBpm = useStudio((state) => state.setBpm);
  const taps = useRef<number[]>([]);
  const audioRef = useRef<AudioContext | null>(null);
  const [clicking, setClicking] = useState(false);

  useEffect(() => {
    if (!clicking || !bpm) return;
    const audio = audioRef.current;
    if (!audio) return;
    let timer = 0;
    const beat = () => {
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.frequency.value = 1760;
      gain.gain.setValueAtTime(0.0001, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.18, audio.currentTime + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(audio.destination);
      osc.start();
      osc.stop(audio.currentTime + 0.06);
    };
    beat();
    timer = window.setInterval(beat, 60000 / bpm);
    return () => window.clearInterval(timer);
  }, [clicking, bpm]);

  useEffect(() => () => void audioRef.current?.close(), []);

  function tap() {
    const now = performance.now();
    const recent = taps.current.filter((time) => now - time < 2500);
    recent.push(now);
    taps.current = recent.slice(-8);
    if (taps.current.length < 2) return;
    let sum = 0;
    for (let i = 1; i < taps.current.length; i++) sum += taps.current[i] - taps.current[i - 1];
    const next = Math.round(60000 / (sum / (taps.current.length - 1)));
    setBpm(Math.max(40, Math.min(240, next)));
  }

  function toggleClick() {
    if (clicking) {
      setClicking(false);
      return;
    }
    if (!bpm) return;
    const audio = audioRef.current ?? new AudioContext();
    audioRef.current = audio;
    void audio.resume();
    setClicking(true);
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col">
      <TopBar title="Tap tempo" onBack={pop} />
      <div className="flex flex-1 flex-col px-4 pb-6">
        <button
          type="button"
          onClick={tap}
          className="mt-4 flex flex-1 items-center justify-center rounded-3xl border border-line bg-elevated shadow-glow"
        >
          <span className="text-center">
            <span className="block font-display text-7xl text-brand">TAP</span>
            <span className="num mt-2 block text-3xl">{bpm ? `${bpm}` : "—"}</span>
            <span className="mt-1 block text-sm text-subtle">bpm</span>
          </span>
        </button>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="ghost" onClick={toggleClick} disabled={!bpm}>
            {clicking ? "Stop click" : "Start click"}
          </Button>
          <Button
            variant="soft"
            onClick={() => {
              taps.current = [];
              setBpm(null);
              setClicking(false);
            }}
          >
            Reset
          </Button>
        </div>
      </div>
    </main>
  );
}
