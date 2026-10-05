import { format } from "date-fns";
import { useEffect, useState } from "react";
import { deletePainting, getPainting, type PaintingRecord } from "@/lib/paint/db";
import { downloadBlob, shareOrDownload, slug } from "@/lib/download";
import { useStudio } from "@/lib/studio";
import { Button, TopBar } from "@/components/ui";

export function PieceScreen({ id }: { id: string }) {
  const pop = useStudio((state) => state.pop);
  const push = useStudio((state) => state.push);
  const setDraft = useStudio((state) => state.setDraft);
  const [record, setRecord] = useState<PaintingRecord | null>(null);
  const [missing, setMissing] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [cuts, setCuts] = useState<{ id: string; label: string; url: string }[]>([]);
  const [cutId, setCutId] = useState("full");
  const [view, setView] = useState<"image" | "video">("image");
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    let dead = false;
    let image: string | null = null;
    const made: string[] = [];
    getPainting(id)
      .then((found) => {
        if (dead) return;
        if (!found) {
          setMissing(true);
          return;
        }
        image = URL.createObjectURL(found.png);
        const next: { id: string; label: string; url: string }[] = [];
        const add = (key: string, label: string, blob: Blob | null | undefined) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          made.push(url);
          next.push({ id: key, label, url });
        };
        add("30", "30s", found.video30);
        add("60", "60s", found.video60);
        add("90", "90s", found.video90);
        if (!next.length && found.video) add("full", "Video", found.video);
        setRecord(found);
        setImageUrl(image);
        setCuts(next);
        setCutId(next[next.length - 1]?.id ?? "full");
      })
      .catch(() => {
        if (!dead) setMissing(true);
      });
    return () => {
      dead = true;
      if (image) URL.revokeObjectURL(image);
      for (const url of made) URL.revokeObjectURL(url);
    };
  }, [id]);

  const base = slug(`${record?.title ?? "painting"}-${record?.styleName ?? "canvas"}`);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col">
      <TopBar title={record?.title ?? "Painting"} onBack={pop} />
      <div className="flex-1 space-y-4 px-4 pb-8">
        {missing && <p className="pt-8 text-muted">That painting is not on this device.</p>}
        {!missing && !record && <p className="pt-8 text-muted">Opening…</p>}
        {record && imageUrl && (
          <>
            <p className="text-xs text-subtle">{format(record.createdAt, "MMM d, h:mm a")}</p>
            {record.hasAudio && (
              <p className="text-sm text-muted">The video has the mic from this take.</p>
            )}
            {cuts.length > 0 && (
              <div className="grid grid-cols-2 gap-2" role="tablist">
                <button
                  type="button"
                  onClick={() => setView("image")}
                  className={view === "image" ? "h-11 rounded-full bg-brand text-ink" : "h-11 rounded-full border border-line"}
                >
                  Print
                </button>
                <button
                  type="button"
                  onClick={() => setView("video")}
                  className={view === "video" ? "h-11 rounded-full bg-brand text-ink" : "h-11 rounded-full border border-line"}
                >
                  Video
                </button>
              </div>
            )}
            {cuts.length > 1 && view === "video" && (
              <div className="grid grid-cols-3 gap-2">
                {cuts.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCutId(item.id)}
                    className={cutId === item.id ? "h-11 rounded-full bg-brand text-ink" : "h-11 rounded-full border border-line"}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
            {view === "image" || cuts.length === 0 ? (
              <img src={imageUrl} alt={record.title} className="mx-auto max-h-[62dvh] w-full rounded-3xl object-contain" />
            ) : (
              <video
                key={cutId}
                src={cuts.find((item) => item.id === cutId)?.url ?? cuts[0]?.url}
                controls
                playsInline
                className="mx-auto max-h-[62dvh] w-full rounded-3xl bg-black"
              />
            )}
            <p className="text-sm text-muted">The print is the painting. It is saved as large as this phone can hold, up to 16K.</p>
            {!record.hasVideo && (
              <p className="text-sm text-muted">This browser did not record video. The print is saved.</p>
            )}
            <div className="grid grid-cols-2 gap-2">
              <Button variant="primary" onClick={() => downloadBlob(record.png, `${base}-print.png`)}>
                Print PNG
              </Button>
              <Button
                variant="ghost"
                disabled={!record.video && cuts.length === 0}
                onClick={() => {
                  const blob = record.video90 ?? record.video60 ?? record.video30 ?? record.video;
                  if (blob) downloadBlob(blob, `${base}.webm`);
                }}
              >
                Video
              </Button>
              <Button
                variant="soft"
                onClick={() => void shareOrDownload(record.png, `${base}-print.png`, `Sour Paint Studios — ${record.title}`)}
              >
                Share print
              </Button>
              <Button
                variant="soft"
                disabled={!record.video}
                onClick={() =>
                  record.video && void shareOrDownload(record.video, `${base}.webm`, `Sour Paint Studios — ${record.title}`)
                }
              >
                Share video
              </Button>
            </div>
            {cuts.length > 1 && (
              <div className="grid grid-cols-3 gap-2">
                {cuts.map((item) => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    onClick={() => {
                      const blob =
                        item.id === "30" ? record.video30 : item.id === "60" ? record.video60 : record.video90 ?? record.video;
                      if (blob) downloadBlob(blob, `${base}-${item.label}.webm`);
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            )}
            <Button
              full
              onClick={() => {
                downloadBlob(record.png, `${base}-print.png`);
                window.open("https://www.sourpaintstudios.com/category/all-products", "_blank", "noopener,noreferrer");
              }}
            >
              Shirt or print
            </Button>
            <p className="text-sm text-muted">
              The print file downloads. Add it in the shop the same way as any other design.
            </p>
            <Button
              variant="ghost"
              full
              onClick={() => {
                setDraft(record.config);
                push({ name: "setup" });
              }}
            >
              Paint again
            </Button>
            {confirm ? (
              <div className="grid grid-cols-2 gap-2">
                <Button variant="ghost" onClick={() => setConfirm(false)}>
                  Keep
                </Button>
                <Button
                  onClick={() => {
                    void deletePainting(id).then(pop);
                  }}
                >
                  Delete
                </Button>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirm(true)} className="h-11 text-sm text-subtle">
                Delete painting
              </button>
            )}
          </>
        )}
      </div>
    </main>
  );
}
