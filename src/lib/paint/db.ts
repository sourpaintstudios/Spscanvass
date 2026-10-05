import type { SessionConfig } from "@/lib/paint/types";

export type PaintingMeta = {
  id: string;
  createdAt: number;
  title: string;
  config: SessionConfig;
  styleName: string;
  genreName: string;
  paletteName: string;
  hasVideo: boolean;
  hasAudio?: boolean;
  thumb: Blob;
};

type BlobRecord = {
  id: string;
  png: Blob;
  video: Blob | null;
  video30?: Blob | null;
  video60?: Blob | null;
  video90?: Blob | null;
};

export type PaintingRecord = PaintingMeta & {
  png: Blob;
  video: Blob | null;
  video30?: Blob | null;
  video60?: Blob | null;
  video90?: Blob | null;
};

const DB_NAME = "sour-paint-canvas";
const DB_VERSION = 1;

const memory = new Map<string, PaintingRecord>();
let dbPromise: Promise<IDBDatabase> | null = null;
let idbOk = true;

function openDb() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === "undefined") {
        reject(new Error("no idb"));
        return;
      }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains("meta")) db.createObjectStore("meta", { keyPath: "id" });
        if (!db.objectStoreNames.contains("blobs")) db.createObjectStore("blobs", { keyPath: "id" });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error ?? new Error("idb"));
    });
  }
  return dbPromise;
}

function request<T>(req: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("idb"));
  });
}

export async function savePainting(record: PaintingRecord) {
  memory.set(record.id, record);
  if (!idbOk) return;
  try {
    const db = await openDb();
    const meta: PaintingMeta = {
      id: record.id,
      createdAt: record.createdAt,
      title: record.title,
      config: record.config,
      styleName: record.styleName,
      genreName: record.genreName,
      paletteName: record.paletteName,
      hasVideo: record.video != null,
      hasAudio: record.hasAudio,
      thumb: record.thumb,
    };
    const blobs: BlobRecord = {
      id: record.id,
      png: record.png,
      video: record.video,
      video30: record.video30 ?? null,
      video60: record.video60 ?? null,
      video90: record.video90 ?? null,
    };
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(["meta", "blobs"], "readwrite");
      tx.objectStore("meta").put(meta);
      tx.objectStore("blobs").put(blobs);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error("idb"));
    });
  } catch {
    idbOk = false;
  }
}

export async function listPaintings(): Promise<PaintingMeta[]> {
  if (!idbOk) return [...memory.values()].sort((a, b) => b.createdAt - a.createdAt);
  try {
    const db = await openDb();
    const rows = await request(db.transaction("meta").objectStore("meta").getAll() as IDBRequest<PaintingMeta[]>);
    return rows.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    idbOk = false;
    return [...memory.values()].sort((a, b) => b.createdAt - a.createdAt);
  }
}

export async function getPainting(id: string): Promise<PaintingRecord | null> {
  const cached = memory.get(id);
  if (!idbOk) return cached ?? null;
  try {
    const db = await openDb();
    const meta = await request(db.transaction("meta").objectStore("meta").get(id) as IDBRequest<PaintingMeta | undefined>);
    const blobs = await request(db.transaction("blobs").objectStore("blobs").get(id) as IDBRequest<BlobRecord | undefined>);
    if (!meta || !blobs) return cached ?? null;
    return {
      ...meta,
      png: blobs.png,
      video: blobs.video,
      video30: blobs.video30 ?? null,
      video60: blobs.video60 ?? null,
      video90: blobs.video90 ?? null,
    };
  } catch {
    idbOk = false;
    return cached ?? null;
  }
}

export async function deletePainting(id: string) {
  memory.delete(id);
  if (!idbOk) return;
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(["meta", "blobs"], "readwrite");
      tx.objectStore("meta").delete(id);
      tx.objectStore("blobs").delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error("idb"));
    });
  } catch {
    idbOk = false;
  }
}
