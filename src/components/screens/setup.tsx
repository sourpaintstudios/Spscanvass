import { useEffect } from "react";
import { primeMic, cancelPrimed } from "@/lib/paint/listener";
import type { SessionConfig } from "@/lib/paint/types";
import { rollJam } from "@/lib/paint/world";
import { useStudio } from "@/lib/studio";
import { Button, TopBar } from "@/components/ui";

const LENGTHS = [30, 60, 90] as const;

export function SetupScreen() {
  const pop = useStudio((state) => state.pop);
  const push = useStudio((state) => state.push);
  const draft = useStudio((state) => state.draft);
  const setDraft = useStudio((state) => state.setDraft);

  function start(config: SessionConfig) {
    const next = { ...config, source: "mic" as const };
    primeMic();
    push({ name: "stage", config: next });
  }

  function jam() {
    const config = rollJam("mic", draft.subject);
    primeMic();
    setDraft(config);
    push({ name: "splash", config });
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col">
      <TopBar title="Setup" onBack={pop} />
      <div className="flex-1 space-y-6 overflow-y-auto px-4 pb-40">
        <p className="text-sm text-muted">No preset styles. The playing makes the picture. A title is only a name.</p>
        <section className="rounded-3xl bg-elevated p-3">
          <h2 className="font-display text-3xl">Title</h2>
          <p className="mt-1 text-sm text-muted">
            Type whatever this piece is called. It names the painting. It does not try to draw the words.
          </p>
          <input
            className="field mt-3"
            value={draft.subject}
            onChange={(event) => setDraft({ subject: event.target.value })}
            placeholder="County Road 9"
            aria-label="Title"
          />
        </section>
        <section className="rounded-3xl bg-elevated p-3">
          <h2 className="font-display text-3xl">Length</h2>
          <div className="mt-3 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Length">
            {LENGTHS.map((seconds) => (
              <button
                key={seconds}
                type="button"
                role="radio"
                aria-checked={draft.seconds === seconds}
                onClick={() => setDraft({ seconds })}
                className={
                  draft.seconds === seconds
                    ? "h-12 rounded-full bg-brand text-ink"
                    : "h-12 rounded-full border border-line"
                }
              >
                {seconds}s
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted">Let a take run 90 seconds and it keeps the 30, the 60, and the 90. Done ends it early.</p>
        </section>
        <section className="rounded-3xl bg-elevated p-3">
          <h2 className="font-display text-3xl">Microphone</h2>
          <p className="mt-1 text-sm text-muted">The mic is the brush. Play, and it paints. The take records picture and sound.</p>
        </section>
      </div>
      <footer className="pb-safe fixed inset-x-0 bottom-0 border-t border-line bg-background px-4 pt-3">
        <div className="mx-auto grid max-w-3xl gap-2">
          <Button full onClick={() => start(draft)}>
            Start painting
          </Button>
          <Button variant="ghost" full onClick={jam}>
            Get to the jam
          </Button>
        </div>
      </footer>
    </main>
  );
}

export function SplashScreen({ config }: { config: SessionConfig }) {
  const replaceTop = useStudio((state) => state.replaceTop);
  const pop = useStudio((state) => state.pop);

  useEffect(() => {
    const timer = window.setTimeout(() => replaceTop({ name: "stage", config }), 1200);
    return () => window.clearTimeout(timer);
  }, [config, replaceTop]);

  return (
    <main className="flex min-h-dvh flex-col justify-between px-6 pt-safe pb-safe">
      <button
        type="button"
        onClick={() => {
          cancelPrimed();
          pop();
        }}
        className="mt-4 h-11 self-start text-sm text-muted"
      >
        Back
      </button>
      <div>
        <p className="track-brand text-xs text-brand">GET TO THE JAM</p>
        <h1 className="mt-3 font-display text-6xl leading-none">{config.subject.trim() || "Untitled"}</h1>
        <p className="mt-4 text-xl text-muted">The playing makes the picture.</p>
      </div>
      <p className="pb-6 text-sm text-subtle">{config.seconds} seconds · Microphone</p>
    </main>
  );
}
