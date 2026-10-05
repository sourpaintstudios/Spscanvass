import { useEffect, useRef } from "react";
import { useStudio } from "@/lib/studio";
import { GlowRule } from "@/components/ui";

export function HomeScreen() {
  const push = useStudio((state) => state.push);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 720;
    canvas.height = 1280;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ddd4c6";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  return (
    <main className="mx-auto flex h-dvh w-full max-w-md flex-col px-4 pt-safe pb-safe">
      <header className="shrink-0 pt-3">
        <p className="track-brand text-[11px] text-brand">DANIEL LEE</p>
        <h1 className="display mt-1">
          SOUR
          <br />
          PAINT
        </h1>
        <p className="font-display text-[2.15rem] leading-none text-signal sm:text-5xl">STUDIOS</p>
        <GlowRule className="mt-2" />
        <p className="mt-1.5 text-sm text-muted">Play it. The playing paints.</p>
      </header>
      <div className="mx-auto mt-2 flex min-h-0 w-full flex-1 items-center justify-center">
        <div className="aspect-[9/16] h-full max-h-full overflow-hidden rounded-3xl border border-line shadow-glow">
          <canvas ref={canvasRef} className="h-full w-full" aria-label="Blank canvas" />
        </div>
      </div>
      <p className="mt-1.5 shrink-0 text-center text-[11px] leading-snug text-subtle">
        The canvas starts blank. What you play is what moves the paint.
      </p>
      <div className="mt-2 grid shrink-0 gap-2 pb-1">
        <button
          type="button"
          onClick={() => push({ name: "gallery" })}
          className="rounded-2xl border border-line bg-elevated px-4 py-2.5 text-left shadow-glow"
        >
          <span className="block font-display text-4xl leading-none text-brand">CANVAS</span>
          <span className="mt-0.5 block text-sm text-muted">Perform to paint</span>
        </button>
        <button
          type="button"
          onClick={() => push({ name: "book" })}
          className="door-signal rounded-2xl border border-line bg-elevated px-4 py-2.5 text-left"
        >
          <span className="block font-display text-4xl leading-none text-signal">SONGBOOK</span>
          <span className="mt-0.5 block text-sm text-muted">Lyrics, tap tempo, tuner</span>
        </button>
      </div>
    </main>
  );
}
