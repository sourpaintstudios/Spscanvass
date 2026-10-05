import { useEffect, useState } from "react";
import { listPaintings, type PaintingMeta } from "@/lib/paint/db";
import { useStudio } from "@/lib/studio";
import { Button, TopBar } from "@/components/ui";

type Card = PaintingMeta & { url: string };

export function GalleryScreen() {
  const pop = useStudio((state) => state.pop);
  const push = useStudio((state) => state.push);
  const [cards, setCards] = useState<Card[] | null>(null);

  useEffect(() => {
    let dead = false;
    const urls: string[] = [];
    listPaintings()
      .then((rows) => {
        if (dead) return;
        const next = rows.map((row) => {
          const url = URL.createObjectURL(row.thumb);
          urls.push(url);
          return { ...row, url };
        });
        setCards(next);
      })
      .catch(() => {
        if (!dead) setCards([]);
      });
    return () => {
      dead = true;
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col">
      <TopBar
        title="Canvas"
        onBack={pop}
        action={
          <Button variant="primary" className="h-11 px-4" onClick={() => push({ name: "setup" })}>
            New
          </Button>
        }
      />
      <div className="flex-1 px-4 pb-8">
        {cards == null ? (
          <p className="pt-10 text-center text-muted">Opening the drawer…</p>
        ) : cards.length === 0 ? (
          <div className="flex flex-col items-start gap-4 pt-10">
            <p className="max-w-xs text-lg">No paintings yet. The first one starts when you play.</p>
            <Button onClick={() => push({ name: "setup" })}>New painting</Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {cards.map((card) => (
              <button
                key={card.id}
                type="button"
                onClick={() => push({ name: "piece", id: card.id })}
                className="overflow-hidden rounded-2xl border border-line bg-elevated text-left"
              >
                <span className="block aspect-[9/16]">
                  <img src={card.url} alt="" className="h-full w-full object-cover" />
                </span>
                <span className="block truncate px-3 py-2 text-sm">{card.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
