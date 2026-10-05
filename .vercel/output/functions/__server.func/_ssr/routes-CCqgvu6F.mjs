import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as ChevronLeft } from "../_libs/lucide-react.mjs";
import { t as create } from "../_libs/zustand.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { t as format } from "../_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CCqgvu6F.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var KEY = "sps-songs-v1";
var SEED_SONGS = [
	{
		id: "cholla",
		title: "Arizona Cholla Girls",
		subtitle: "Desert set",
		lyrics: "",
		updatedAt: 0
	},
	{
		id: "phoenix-sky",
		title: "She Rides the Phoenix Sky",
		subtitle: "Night drive",
		lyrics: "",
		updatedAt: 0
	},
	{
		id: "county-9",
		title: "County Road 9",
		subtitle: "Story song",
		lyrics: "",
		updatedAt: 0
	},
	{
		id: "annetoya",
		title: "Annetoya Girls",
		subtitle: "",
		lyrics: "",
		updatedAt: 0
	},
	{
		id: "iowa-boys",
		title: "Iowa Boys",
		subtitle: "",
		lyrics: "",
		updatedAt: 0
	},
	{
		id: "butterfly",
		title: "Carolina Butterfly",
		subtitle: "Don't You Kill My Crush",
		lyrics: "",
		updatedAt: 0
	},
	{
		id: "page-guide",
		title: "Page guide",
		subtitle: "How a page is typed",
		lyrics: "[Verse]\nBig type for the room.\nShort lines, the way you sing them.\n\n[Chorus]\nThe chorus gets the same ink.\nBlank lines make a breath.\n\n[Bridge]\nTuner and tempo live one screen back.",
		updatedAt: 0
	}
];
function loadSongs() {
	if (typeof localStorage === "undefined") return SEED_SONGS;
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) {
			localStorage.setItem(KEY, JSON.stringify(SEED_SONGS));
			return SEED_SONGS;
		}
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return SEED_SONGS;
		return parsed;
	} catch {
		return SEED_SONGS;
	}
}
function persistSongs(songs) {
	try {
		localStorage.setItem(KEY, JSON.stringify(songs));
	} catch {}
}
var DEFAULT_CONFIG = {
	styleId: "watercolor",
	genreId: "desert",
	paletteId: "blacklight",
	subject: "UFO",
	seconds: 60,
	source: "mic"
};
var SILENT_FRAME = {
	rms: 0,
	level: 0,
	sounding: false,
	onset: false,
	strength: 0,
	rate: 0,
	speed: 0,
	freq: 0,
	midi: null,
	pitchNorm: .5,
	note: "",
	octave: null,
	cents: 0,
	clarity: 0,
	mood: 0,
	staccato: .35,
	gallop: false
};
var useStudio = create((set) => ({
	stack: [{ name: "home" }],
	draft: DEFAULT_CONFIG,
	bpm: null,
	songs: SEED_SONGS,
	push: (screen) => set((state) => ({ stack: [...state.stack, screen] })),
	pop: () => set((state) => ({ stack: state.stack.length > 1 ? state.stack.slice(0, -1) : state.stack })),
	replaceTop: (screen) => set((state) => ({ stack: [...state.stack.slice(0, -1), screen] })),
	showPiece: (id) => set({ stack: [
		{ name: "home" },
		{ name: "gallery" },
		{
			name: "piece",
			id
		}
	] }),
	setDraft: (patch) => set((state) => ({ draft: {
		...state.draft,
		...patch
	} })),
	resetDraft: () => set({ draft: DEFAULT_CONFIG }),
	setBpm: (bpm) => set({ bpm }),
	setSongs: (songs) => set({ songs })
}));
var DB_NAME = "sour-paint-canvas";
var DB_VERSION = 1;
var memory = /* @__PURE__ */ new Map();
var dbPromise = null;
var idbOk = true;
function openDb() {
	if (!dbPromise) dbPromise = new Promise((resolve, reject) => {
		if (typeof indexedDB === "undefined") {
			reject(/* @__PURE__ */ new Error("no idb"));
			return;
		}
		const req = indexedDB.open(DB_NAME, DB_VERSION);
		req.onupgradeneeded = () => {
			const db = req.result;
			if (!db.objectStoreNames.contains("meta")) db.createObjectStore("meta", { keyPath: "id" });
			if (!db.objectStoreNames.contains("blobs")) db.createObjectStore("blobs", { keyPath: "id" });
		};
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error ?? /* @__PURE__ */ new Error("idb"));
	});
	return dbPromise;
}
function request(req) {
	return new Promise((resolve, reject) => {
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error ?? /* @__PURE__ */ new Error("idb"));
	});
}
async function savePainting(record) {
	memory.set(record.id, record);
	if (!idbOk) return;
	try {
		const db = await openDb();
		const meta = {
			id: record.id,
			createdAt: record.createdAt,
			title: record.title,
			config: record.config,
			styleName: record.styleName,
			genreName: record.genreName,
			paletteName: record.paletteName,
			hasVideo: record.video != null,
			hasAudio: record.hasAudio,
			thumb: record.thumb
		};
		const blobs = {
			id: record.id,
			png: record.png,
			video: record.video
		};
		await new Promise((resolve, reject) => {
			const tx = db.transaction(["meta", "blobs"], "readwrite");
			tx.objectStore("meta").put(meta);
			tx.objectStore("blobs").put(blobs);
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error ?? /* @__PURE__ */ new Error("idb"));
		});
	} catch {
		idbOk = false;
	}
}
async function listPaintings() {
	if (!idbOk) return [...memory.values()].sort((a, b) => b.createdAt - a.createdAt);
	try {
		return (await request((await openDb()).transaction("meta").objectStore("meta").getAll())).sort((a, b) => b.createdAt - a.createdAt);
	} catch {
		idbOk = false;
		return [...memory.values()].sort((a, b) => b.createdAt - a.createdAt);
	}
}
async function getPainting(id) {
	const cached = memory.get(id);
	if (!idbOk) return cached ?? null;
	try {
		const db = await openDb();
		const meta = await request(db.transaction("meta").objectStore("meta").get(id));
		const blobs = await request(db.transaction("blobs").objectStore("blobs").get(id));
		if (!meta || !blobs) return cached ?? null;
		return {
			...meta,
			png: blobs.png,
			video: blobs.video
		};
	} catch {
		idbOk = false;
		return cached ?? null;
	}
}
async function deletePainting(id) {
	memory.delete(id);
	if (!idbOk) return;
	try {
		const db = await openDb();
		await new Promise((resolve, reject) => {
			const tx = db.transaction(["meta", "blobs"], "readwrite");
			tx.objectStore("meta").delete(id);
			tx.objectStore("blobs").delete(id);
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error ?? /* @__PURE__ */ new Error("idb"));
		});
	} catch {
		idbOk = false;
	}
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonStyles = cva("inline-flex items-center justify-center gap-2 rounded-full font-medium transition-transform duration-150 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40", {
	variants: {
		variant: {
			primary: "h-12 bg-brand px-5 text-ink shadow-glow",
			signal: "h-12 bg-signal px-5 text-ink",
			ghost: "h-12 border border-line bg-transparent px-4 text-foreground",
			soft: "h-11 border border-line bg-elevated px-4 text-foreground",
			text: "h-11 px-2 text-muted"
		},
		full: { true: "w-full" }
	},
	defaultVariants: { variant: "primary" }
});
function Button({ className, variant, full, type = "button", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type,
		className: cn(buttonStyles({
			variant,
			full
		}), className),
		...props
	});
}
function TopBar({ title, onBack, action }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "pt-safe flex items-center gap-2 px-3 pb-3 pt-4",
		children: [
			onBack ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: onBack,
				className: "flex h-11 items-center gap-1 rounded-full pr-3 pl-1",
				"aria-label": "Back",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm",
					children: "Back"
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "w-11" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "min-w-0 flex-1 truncate text-center font-display text-4xl leading-none",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex min-w-11 justify-end",
				children: action
			})
		]
	});
}
function GlowRule({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("glow-rule", className) });
}
function GalleryScreen() {
	const pop = useStudio((state) => state.pop);
	const push = useStudio((state) => state.push);
	const [cards, setCards] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let dead = false;
		const urls = [];
		listPaintings().then((rows) => {
			if (dead) return;
			const next = rows.map((row) => {
				const url = URL.createObjectURL(row.thumb);
				urls.push(url);
				return {
					...row,
					url
				};
			});
			setCards(next);
		}).catch(() => {
			if (!dead) setCards([]);
		});
		return () => {
			dead = true;
			urls.forEach((url) => URL.revokeObjectURL(url));
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-dvh w-full max-w-3xl flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
			title: "Canvas",
			onBack: pop,
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "primary",
				className: "h-11 px-4",
				onClick: () => push({ name: "setup" }),
				children: "New"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex-1 px-4 pb-8",
			children: cards == null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "pt-10 text-center text-muted",
				children: "Opening the drawer…"
			}) : cards.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-start gap-4 pt-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "max-w-xs text-lg",
					children: "No paintings yet. The first one starts when you play."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => push({ name: "setup" }),
					children: "New painting"
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-3 sm:grid-cols-3",
				children: cards.map((card) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => push({
						name: "piece",
						id: card.id
					}),
					className: "overflow-hidden rounded-2xl border border-line bg-elevated text-left",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block aspect-[9/16]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: card.url,
								alt: "",
								className: "h-full w-full object-cover"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block truncate px-3 py-2 text-sm",
							children: card.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block truncate px-3 pb-3 text-xs text-subtle",
							children: card.styleName
						})
					]
				}, card.id))
			})
		})]
	});
}
function clamp(n, min, max) {
	return Math.max(min, Math.min(max, n));
}
function hexToRgb(hex) {
	const h = hex.replace("#", "");
	return {
		r: Number.parseInt(h.slice(0, 2), 16),
		g: Number.parseInt(h.slice(2, 4), 16),
		b: Number.parseInt(h.slice(4, 6), 16)
	};
}
function mix(a, b, t) {
	return {
		r: a.r + (b.r - a.r) * t,
		g: a.g + (b.g - a.g) * t,
		b: a.b + (b.b - a.b) * t
	};
}
function lighten(c, t) {
	return mix(c, {
		r: 255,
		g: 255,
		b: 255
	}, t);
}
function darken(c, t) {
	return mix(c, {
		r: 0,
		g: 0,
		b: 0
	}, t);
}
function samplePalette(colors, t) {
	if (colors.length === 0) return {
		r: 255,
		g: 255,
		b: 255
	};
	if (colors.length === 1) return colors[0];
	const x = clamp(t, 0, 1) * (colors.length - 1);
	const i = Math.floor(x);
	const f = x - i;
	return mix(colors[i], colors[Math.min(colors.length - 1, i + 1)], f);
}
function mulberry32(seed) {
	let a = seed >>> 0;
	return function rand() {
		a = a + 1831565813 | 0;
		let t = Math.imul(a ^ a >>> 15, 1 | a);
		t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
function hashString(s) {
	let h = 2166136261;
	for (let i = 0; i < s.length; i++) {
		h ^= s.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
}
function createMark(p) {
	return {
		len: .12,
		thick: .02,
		rot: 0,
		r: 255,
		g: 255,
		b: 255,
		a: .8,
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
		hardness: .5,
		echo: 0,
		...p
	};
}
function rgba(r, g, b, a) {
	return `rgba(${Math.max(0, Math.min(255, Math.round(r)))}, ${Math.max(0, Math.min(255, Math.round(g)))}, ${Math.max(0, Math.min(255, Math.round(b)))}, ${Math.max(0, Math.min(1, a))})`;
}
function drawVignette(ctx, amount, w, h) {
	if (amount < .04) return;
	const g = ctx.createRadialGradient(w * .5, h * .46, Math.min(w, h) * .18, w * .5, h * .5, Math.max(w, h) * .72);
	g.addColorStop(0, "rgba(0,0,0,0)");
	g.addColorStop(1, `rgba(0,0,0,${.72 * amount})`);
	ctx.save();
	ctx.fillStyle = g;
	ctx.fillRect(0, 0, w, h);
	ctx.restore();
}
function drawSignature(ctx, w, h) {
	const size = Math.max(11, Math.round(w * .026));
	ctx.save();
	ctx.font = `600 ${size}px Outfit, sans-serif`;
	ctx.textAlign = "right";
	ctx.textBaseline = "bottom";
	const x = w * .94;
	const y = h * .975;
	ctx.fillStyle = "rgba(0,0,0,0.45)";
	ctx.fillText("SOUR PAINT STUDIOS", x + 1, y + 1);
	ctx.fillStyle = "rgba(243,246,234,0.84)";
	ctx.fillText("SOUR PAINT STUDIOS", x, y);
	ctx.restore();
}
function drawMark(ctx, m, w, h) {
	const unit = Math.min(w, h);
	const x = m.x * w;
	const y = m.y * h;
	const len = Math.max(1.5, m.len * unit);
	const thick = Math.max(1, m.thick * unit);
	const rng = mulberry32(m.seed || 1);
	ctx.save();
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
		default: paintStroke(ctx, m, x, y, len, thick, unit, "stroke");
	}
	ctx.restore();
}
function paintGrain(ctx, m, w, h, rng) {
	ctx.fillStyle = rgba(m.r, m.g, m.b, .14);
	for (let i = 0; i < 380; i++) {
		const s = .6 + rng() * 1.6;
		ctx.fillRect(rng() * w, rng() * h, s, s);
	}
}
function paintWash(ctx, m, x, y, len, _thick, unit) {
	ctx.translate(x, y);
	ctx.rotate(m.rot);
	const ry = len * (.42 + m.bleed * .35);
	const inner = len * (.05 + m.hardness * .45);
	const g = ctx.createRadialGradient(0, 0, inner, 0, 0, len);
	g.addColorStop(0, rgba(m.r, m.g, m.b, m.a));
	g.addColorStop(.62, rgba(m.r, m.g, m.b, m.a * .45));
	g.addColorStop(1, rgba(m.r, m.g, m.b, 0));
	ctx.fillStyle = g;
	ctx.beginPath();
	ctx.ellipse(0, 0, len, ry, 0, 0, Math.PI * 2);
	ctx.fill();
	if (m.bleed > .3) {
		ctx.fillStyle = rgba(m.r2, m.g2, m.b2, m.a * .28);
		ctx.beginPath();
		ctx.ellipse(unit * .004, ry * .15, len * (1.15 + m.bleed * .25), ry * 1.2, 0, 0, Math.PI * 2);
		ctx.fill();
	}
}
function paintPool(ctx, m, x, y, len, thick) {
	ctx.translate(x, y);
	ctx.rotate(m.rot);
	ctx.fillStyle = rgba(m.r, m.g, m.b, m.a * .55);
	ctx.beginPath();
	ctx.ellipse(0, 0, len, len * .62, 0, 0, Math.PI * 2);
	ctx.fill();
	ctx.strokeStyle = rgba(m.r * .55, m.g * .55, m.b * .55, Math.min(1, m.a + .15));
	ctx.lineWidth = Math.max(2, thick * .85);
	ctx.beginPath();
	ctx.ellipse(0, len * .08, len * .92, len * .55, 0, .15, Math.PI - .15);
	ctx.stroke();
}
function paintStroke(ctx, m, x, y, len, thick, unit, kind) {
	const glow = m.bleed > .55 && kind !== "drybrush";
	ctx.save();
	ctx.translate(x, y);
	ctx.rotate(m.rot);
	if (glow) {
		ctx.shadowColor = rgba(m.r, m.g, m.b, .95);
		ctx.shadowBlur = thick * 3.2;
	}
	ctx.strokeStyle = rgba(m.r, m.g, m.b, kind === "outline" ? Math.min(1, m.a) : m.a);
	ctx.lineWidth = kind === "outline" ? Math.max(thick * 1.7, m.keyline * unit || thick) : thick;
	ctx.lineCap = "round";
	ctx.lineJoin = "round";
	const gap = kind === "drybrush" || m.breakUp > .2 ? Math.max(2, thick * (.4 + m.breakUp * 2.4)) : 0;
	if (gap > 0) ctx.setLineDash([Math.max(2, thick * (1.4 - m.breakUp)), gap]);
	ctx.beginPath();
	const bow = len * (kind === "outline" ? .28 : .16);
	ctx.moveTo(-len / 2, 0);
	ctx.quadraticCurveTo(0, bow, len / 2, 0);
	ctx.stroke();
	if (kind !== "outline" && m.keyline > 0) {
		ctx.shadowBlur = 0;
		ctx.strokeStyle = rgba(m.lr, m.lg, m.lb, .9);
		ctx.lineWidth = Math.max(1.5, m.keyline * unit);
		ctx.setLineDash([]);
		ctx.stroke();
	}
	ctx.restore();
}
function paintBristle(ctx, m, x, y, len, thick, rng) {
	ctx.translate(x, y);
	ctx.rotate(m.rot);
	const n = Math.max(3, m.bristles);
	const spread = thick * 1.8;
	for (let i = 0; i < n; i++) {
		const t = n === 1 ? 0 : i / (n - 1) - .5;
		const jitter = (rng() - .5) * 22;
		ctx.strokeStyle = rgba(m.r + jitter, m.g + jitter * .6, m.b + jitter * .3, m.a);
		ctx.lineWidth = Math.max(1, thick * 1.3 / n);
		ctx.lineCap = "round";
		ctx.beginPath();
		const y0 = t * spread;
		ctx.moveTo(-len / 2, y0);
		ctx.quadraticCurveTo(len * .05, y0 + len * .08 * (rng() - .4), len / 2, y0 + (rng() - .5) * thick);
		ctx.stroke();
	}
	if (m.a > .8) {
		ctx.strokeStyle = rgba(m.r2, m.g2, m.b2, .85);
		ctx.lineWidth = Math.max(1, thick * .18);
		ctx.beginPath();
		ctx.moveTo(-len * .35, -spread * .35);
		ctx.lineTo(len * .4, -spread * .2);
		ctx.stroke();
	}
}
function paintDab(ctx, m, x, y, len, thick, unit, rng) {
	ctx.translate(x, y);
	ctx.rotate(m.rot + (rng() - .5) * .4);
	const rx = len * (.7 + rng() * .4);
	const ry = Math.max(thick * 2.2, len * .45);
	if (m.echo > 0) {
		ctx.fillStyle = rgba(m.r2, m.g2, m.b2, m.a * .8);
		ctx.beginPath();
		ctx.ellipse(m.echo * unit, m.echo * unit * .3, rx, ry, 0, 0, Math.PI * 2);
		ctx.fill();
	}
	ctx.fillStyle = rgba(m.r, m.g, m.b, m.a);
	ctx.beginPath();
	ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
	ctx.fill();
	if (m.keyline > 0) {
		ctx.strokeStyle = rgba(m.lr, m.lg, m.lb, .95);
		ctx.lineWidth = Math.max(1.5, m.keyline * unit);
		ctx.stroke();
	}
}
function paintKnife(ctx, m, x, y, len, thick, rng) {
	ctx.translate(x, y);
	ctx.rotate(m.rot);
	const L = len;
	const T = Math.max(thick * 3.4, len * .28);
	const j = () => (rng() - .5) * T * .18;
	const path = () => {
		ctx.beginPath();
		ctx.moveTo(-L * .5, -T * .32 + j());
		ctx.lineTo(L * .5, -T * .48 + j());
		ctx.lineTo(L * .38, T * .5 + j());
		ctx.lineTo(-L * .46, T * .22 + j());
		ctx.closePath();
	};
	ctx.fillStyle = rgba(m.r * .62, m.g * .62, m.b * .62, m.a);
	ctx.save();
	ctx.translate(T * .08, T * .1);
	path();
	ctx.fill();
	ctx.restore();
	ctx.fillStyle = rgba(m.r, m.g, m.b, m.a);
	path();
	ctx.fill();
}
function paintBlock(ctx, m, x, y, len, thick, unit) {
	ctx.translate(x, y);
	ctx.rotate(m.rot);
	const hw = len;
	const hh = Math.max(thick * 2.4, len * .55);
	if (m.echo > 0) {
		ctx.fillStyle = rgba(m.r2, m.g2, m.b2, m.a * .85);
		ctx.fillRect(-hw + m.echo * unit, -hh + m.echo * unit * .4, hw * 2, hh * 2);
	}
	ctx.fillStyle = rgba(m.r, m.g, m.b, m.a);
	ctx.fillRect(-hw, -hh, hw * 2, hh * 2);
	if (m.keyline > 0) {
		ctx.strokeStyle = rgba(m.lr, m.lg, m.lb, .95);
		ctx.lineWidth = Math.max(1.5, m.keyline * unit);
		ctx.strokeRect(-hw, -hh, hw * 2, hh * 2);
	}
}
function paintSplatter(ctx, m, x, y, len, thick, rng) {
	const count = 10 + Math.floor(rng() * 26);
	for (let i = 0; i < count; i++) {
		const ang = rng() * Math.PI * 2;
		const rad = Math.pow(rng(), .6) * len;
		const s = thick * (.15 + rng() * .85);
		ctx.fillStyle = rgba(m.r, m.g, m.b, m.a * (.45 + rng() * .55));
		ctx.beginPath();
		ctx.arc(x + Math.cos(ang) * rad, y + Math.sin(ang) * rad, s, 0, Math.PI * 2);
		ctx.fill();
	}
}
function paintDrip(ctx, m, x, y, len, thick, rng) {
	const endX = x + (rng() - .5) * thick * 2;
	const endY = y + len * (1.3 + rng() * .8);
	ctx.strokeStyle = rgba(m.r, m.g, m.b, m.a);
	ctx.lineWidth = Math.max(1, thick * .55);
	ctx.lineCap = "round";
	ctx.beginPath();
	ctx.moveTo(x, y);
	ctx.quadraticCurveTo(x + (rng() - .5) * 10, (y + endY) / 2, endX, endY);
	ctx.stroke();
	ctx.fillStyle = rgba(m.r, m.g, m.b, m.a);
	ctx.beginPath();
	ctx.ellipse(endX, endY, thick * .7, thick * 1.05, 0, 0, Math.PI * 2);
	ctx.fill();
}
function paintDots(ctx, m, x, y, len, thick, rng) {
	const count = 8 + Math.floor(rng() * 16);
	for (let i = 0; i < count; i++) {
		const ang = rng() * Math.PI * 2;
		const rad = rng() * len * .85;
		ctx.fillStyle = rgba(m.r, m.g, m.b, m.a);
		ctx.beginPath();
		ctx.arc(x + Math.cos(ang) * rad, y + Math.sin(ang) * rad, Math.max(.8, thick * (.25 + rng() * .5)), 0, Math.PI * 2);
		ctx.fill();
	}
}
function paintHatch(ctx, m, x, y, len, thick, rng) {
	ctx.translate(x, y);
	ctx.rotate(m.rot);
	ctx.beginPath();
	ctx.rect(-len / 2, -len * .38, len, len * .76);
	ctx.clip();
	ctx.strokeStyle = rgba(m.r, m.g, m.b, m.a);
	ctx.lineWidth = Math.max(1, thick * .35);
	const step = Math.max(3, thick * 1.4);
	const slant = (rng() - .5) * .2;
	for (let yy = -len; yy < len; yy += step) {
		ctx.beginPath();
		ctx.moveTo(-len, yy);
		ctx.lineTo(len, yy + len * slant);
		ctx.stroke();
	}
}
function paintHalftone(ctx, m, x, y, len, thick) {
	ctx.save();
	ctx.beginPath();
	ctx.ellipse(x, y, len, len * .72, m.rot, 0, Math.PI * 2);
	ctx.clip();
	const step = Math.max(6, thick * 1.6);
	ctx.fillStyle = rgba(m.r, m.g, m.b, m.a);
	let dots = 0;
	for (let yy = y - len; yy < y + len && dots < 220; yy += step) for (let xx = x - len; xx < x + len && dots < 220; xx += step) {
		const dx = (xx - x) / len;
		const dy = (yy - y) / (len * .72);
		const d = dx * dx + dy * dy;
		if (d > 1) continue;
		ctx.beginPath();
		ctx.arc(xx, yy, step * .28 * (1.15 - d), 0, Math.PI * 2);
		ctx.fill();
		dots++;
	}
	ctx.restore();
}
function paintStreak(ctx, m, x, y, len, thick, rng) {
	paintStroke(ctx, m, x, y, len * 1.3, Math.max(1, thick * .45), Math.min(len, thick), "stroke");
	for (let i = 0; i < 12; i++) {
		const along = (rng() - .5) * len;
		const side = (rng() - .5) * thick * 6;
		const px = x + Math.cos(m.rot) * along - Math.sin(m.rot) * side;
		const py = y + Math.sin(m.rot) * along + Math.cos(m.rot) * side;
		ctx.fillStyle = rgba(m.r, m.g, m.b, m.a * rng());
		ctx.beginPath();
		ctx.arc(px, py, Math.max(.6, thick * rng() * .4), 0, Math.PI * 2);
		ctx.fill();
	}
}
function paintScratch(ctx, m, x, y, len, thick, rng) {
	ctx.translate(x, y);
	ctx.rotate(m.rot);
	ctx.strokeStyle = rgba(m.r, m.g, m.b, m.a);
	ctx.lineWidth = Math.max(1, thick * .35);
	ctx.lineCap = "butt";
	const lines = 3 + Math.floor(rng() * 4);
	for (let i = 0; i < lines; i++) {
		const yy = (i - lines / 2) * thick * .7;
		ctx.setLineDash([Math.max(2, len * .12), Math.max(2, len * .08)]);
		ctx.beginPath();
		ctx.moveTo(-len / 2, yy);
		ctx.lineTo(len / 2, yy + (rng() - .5) * thick);
		ctx.stroke();
	}
}
function defineStyle(s) {
	return {
		alpha: [.55, .92],
		size: 1,
		length: 1,
		hardness: .55,
		cover: .75,
		bleed: .08,
		drip: 0,
		bristles: 5,
		breakUp: 0,
		keyline: 0,
		axis: "free",
		spare: false,
		allover: false,
		pitchMap: true,
		density: 1,
		echo: 0,
		reveal: false,
		ground: "wash",
		...s
	};
}
var STYLE_GROUPS = [
	"Water",
	"Oil",
	"Opaque",
	"Ink",
	"Draw",
	"Print",
	"Street"
];
var STYLES = [
	defineStyle({
		id: "watercolor",
		name: "Watercolor",
		group: "Water",
		blurb: "Translucent blooms, soft edges, pooling, and the occasional drip.",
		marks: [
			{
				kind: "wash",
				w: 5
			},
			{
				kind: "pool",
				w: 3
			},
			{
				kind: "stroke",
				w: 1
			},
			{
				kind: "drip",
				w: 2
			}
		],
		alpha: [.2, .46],
		size: 1.35,
		length: 1.2,
		hardness: .08,
		cover: .2,
		bleed: .85,
		drip: .5,
		density: .85,
		ground: "wash"
	}),
	defineStyle({
		id: "wet-on-wet",
		name: "Wet on wet",
		group: "Water",
		blurb: "Paint into paint that is still open. Edges melt.",
		marks: [
			{
				kind: "wash",
				w: 5
			},
			{
				kind: "dab",
				w: 3
			},
			{
				kind: "stroke",
				w: 2
			}
		],
		alpha: [.28, .55],
		size: 1.2,
		hardness: .12,
		cover: .4,
		bleed: .7,
		ground: "wash"
	}),
	defineStyle({
		id: "glaze",
		name: "Glaze",
		group: "Water",
		blurb: "Thin luminous skins. The ground keeps showing through.",
		marks: [{
			kind: "glaze",
			w: 6
		}, {
			kind: "wash",
			w: 3
		}],
		alpha: [.1, .24],
		size: 1.8,
		length: 1.45,
		hardness: .05,
		cover: .15,
		bleed: .45,
		density: .7,
		ground: "glaze"
	}),
	defineStyle({
		id: "acrylic-pour",
		name: "Acrylic pour",
		group: "Water",
		blurb: "Rivulets, pools, and gravity. The paint moves after the hand.",
		marks: [
			{
				kind: "streak",
				w: 3
			},
			{
				kind: "wash",
				w: 4
			},
			{
				kind: "pool",
				w: 3
			},
			{
				kind: "drip",
				w: 3
			}
		],
		alpha: [.45, .75],
		size: 1.25,
		hardness: .14,
		bleed: .6,
		drip: .9,
		ground: "wash"
	}),
	defineStyle({
		id: "dust",
		name: "Dust wash",
		group: "Water",
		blurb: "A veil. The form shows through the dirt.",
		marks: [
			{
				kind: "wash",
				w: 4
			},
			{
				kind: "drybrush",
				w: 4
			},
			{
				kind: "dot",
				w: 2
			}
		],
		alpha: [.18, .4],
		size: 1.35,
		hardness: .12,
		cover: .28,
		bleed: .4,
		ground: "wash"
	}),
	defineStyle({
		id: "fresco",
		name: "Fresco",
		group: "Water",
		blurb: "Chalky and broad, like color sitting in plaster.",
		marks: [
			{
				kind: "wash",
				w: 3
			},
			{
				kind: "drybrush",
				w: 4
			},
			{
				kind: "block",
				w: 2
			}
		],
		alpha: [.4, .72],
		hardness: .4,
		cover: .55,
		breakUp: .35,
		ground: "wash"
	}),
	defineStyle({
		id: "alla-prima",
		name: "Alla prima",
		group: "Oil",
		blurb: "Opaque dabs in one wet pass. The bristles stay in the paint.",
		marks: [
			{
				kind: "bristle",
				w: 6
			},
			{
				kind: "dab",
				w: 3
			},
			{
				kind: "stroke",
				w: 1
			}
		],
		alpha: [.94, 1],
		size: 1.05,
		length: .68,
		hardness: .74,
		cover: .97,
		bristles: 7,
		ground: "bristle"
	}),
	defineStyle({
		id: "palette-knife",
		name: "Palette knife",
		group: "Oil",
		blurb: "Flat slabs. Hard edges. No blend, no bristle.",
		marks: [{
			kind: "knife",
			w: 8
		}, {
			kind: "block",
			w: 2
		}],
		alpha: [1, 1],
		size: 1.35,
		length: .9,
		hardness: 1,
		cover: 1,
		ground: "knife"
	}),
	defineStyle({
		id: "impasto",
		name: "Impasto",
		group: "Oil",
		blurb: "Paint thick enough to cast a ridge.",
		marks: [
			{
				kind: "bristle",
				w: 4
			},
			{
				kind: "dab",
				w: 4
			},
			{
				kind: "knife",
				w: 2
			}
		],
		alpha: [.96, 1],
		size: 1.28,
		length: .72,
		hardness: .86,
		cover: 1,
		bristles: 8,
		ground: "dab"
	}),
	defineStyle({
		id: "bob-ross",
		name: "Wet fan",
		group: "Oil",
		blurb: "Soft fan dabs blended into a wet ground. Loaded, then tapped.",
		marks: [
			{
				kind: "dab",
				w: 5
			},
			{
				kind: "stroke",
				w: 3
			},
			{
				kind: "wash",
				w: 2
			}
		],
		alpha: [.72, .95],
		size: .92,
		length: .78,
		hardness: .28,
		cover: .82,
		bleed: .28,
		bristles: 9,
		ground: "wash"
	}),
	defineStyle({
		id: "scumble",
		name: "Scumble",
		group: "Oil",
		blurb: "A dry light dragged over a darker body.",
		marks: [
			{
				kind: "drybrush",
				w: 6
			},
			{
				kind: "glaze",
				w: 2
			},
			{
				kind: "scratch",
				w: 1
			}
		],
		alpha: [.28, .52],
		hardness: .58,
		cover: .35,
		breakUp: .7,
		ground: "drybrush"
	}),
	defineStyle({
		id: "encaustic",
		name: "Encaustic",
		group: "Oil",
		blurb: "Waxy slabs, a little translucent, fused at the edges.",
		marks: [
			{
				kind: "block",
				w: 3
			},
			{
				kind: "glaze",
				w: 3
			},
			{
				kind: "dab",
				w: 3
			}
		],
		alpha: [.55, .86],
		hardness: .46,
		cover: .7,
		bleed: .22,
		ground: "block"
	}),
	defineStyle({
		id: "fingerpaint",
		name: "Fingerpaint",
		group: "Oil",
		blurb: "Blunt fingers. No fine line.",
		marks: [
			{
				kind: "dab",
				w: 6
			},
			{
				kind: "wash",
				w: 2
			},
			{
				kind: "stroke",
				w: 2
			}
		],
		alpha: [.7, .95],
		size: 1.5,
		hardness: .34,
		cover: .78,
		bleed: .3,
		ground: "dab"
	}),
	defineStyle({
		id: "gouache",
		name: "Gouache",
		group: "Opaque",
		blurb: "Matte, flat, and covering. Light sits on top of dark.",
		marks: [
			{
				kind: "block",
				w: 4
			},
			{
				kind: "dab",
				w: 4
			},
			{
				kind: "stroke",
				w: 1
			}
		],
		alpha: [.9, 1],
		hardness: .82,
		cover: .95,
		ground: "block"
	}),
	defineStyle({
		id: "tempera",
		name: "Tempera",
		group: "Opaque",
		blurb: "Flat decorative shapes with a thin dark contour.",
		marks: [
			{
				kind: "block",
				w: 4
			},
			{
				kind: "outline",
				w: 3
			},
			{
				kind: "dot",
				w: 2
			}
		],
		alpha: [.9, 1],
		hardness: .9,
		cover: .9,
		keyline: .008,
		ground: "block"
	}),
	defineStyle({
		id: "oil-pastel",
		name: "Oil pastel",
		group: "Opaque",
		blurb: "Waxy, broken color. The paper tooth shows in the stroke.",
		marks: [
			{
				kind: "stroke",
				w: 4
			},
			{
				kind: "dab",
				w: 3
			},
			{
				kind: "drybrush",
				w: 3
			}
		],
		alpha: [.75, .96],
		hardness: .6,
		cover: .8,
		breakUp: .48,
		ground: "drybrush"
	}),
	defineStyle({
		id: "marker",
		name: "Marker",
		group: "Opaque",
		blurb: "Flat bands with a streak where the ink ran thin.",
		marks: [{
			kind: "stroke",
			w: 6
		}, {
			kind: "block",
			w: 2
		}],
		alpha: [.8, .96],
		size: .88,
		hardness: .86,
		cover: .9,
		breakUp: .14,
		ground: "stroke"
	}),
	defineStyle({
		id: "ink-wash",
		name: "Ink wash",
		group: "Ink",
		blurb: "High contrast, wet spread, and drips that run downhill.",
		marks: [
			{
				kind: "wash",
				w: 3
			},
			{
				kind: "drip",
				w: 5
			},
			{
				kind: "stroke",
				w: 3
			},
			{
				kind: "splatter",
				w: 1
			}
		],
		alpha: [.5, .92],
		size: 1.12,
		hardness: .36,
		cover: .72,
		bleed: .55,
		drip: .88,
		ground: "wash"
	}),
	defineStyle({
		id: "sumi",
		name: "Sumi-e",
		group: "Ink",
		blurb: "A few loaded strokes. Most of the sheet stays empty.",
		marks: [
			{
				kind: "stroke",
				w: 7
			},
			{
				kind: "wash",
				w: 2
			},
			{
				kind: "drip",
				w: 1
			}
		],
		alpha: [.78, 1],
		size: 1.55,
		length: 1.5,
		hardness: .5,
		cover: .86,
		drip: .28,
		spare: true,
		density: .32,
		ground: "wash"
	}),
	defineStyle({
		id: "calligraphy",
		name: "Calligraphy",
		group: "Ink",
		blurb: "Pressure in the stroke. Thick, thin, then a tail.",
		marks: [{
			kind: "stroke",
			w: 8
		}, {
			kind: "drip",
			w: 2
		}],
		alpha: [.88, 1],
		size: .82,
		length: 1.35,
		hardness: .62,
		drip: .32,
		spare: true,
		density: .45,
		ground: "stroke"
	}),
	defineStyle({
		id: "ink-stick",
		name: "Ink and stick",
		group: "Ink",
		blurb: "A stick dragged through ink. Dots where it hopped.",
		marks: [
			{
				kind: "stroke",
				w: 5
			},
			{
				kind: "dot",
				w: 3
			},
			{
				kind: "wash",
				w: 1
			}
		],
		alpha: [.82, 1],
		size: .7,
		hardness: .62,
		ground: "stroke"
	}),
	defineStyle({
		id: "ballpoint",
		name: "Ballpoint",
		group: "Ink",
		blurb: "Dense hatching. The picture is built from pressure, not fill.",
		marks: [{
			kind: "hatch",
			w: 8
		}, {
			kind: "stroke",
			w: 3
		}],
		alpha: [.55, .88],
		size: .55,
		length: .72,
		hardness: .95,
		cover: .65,
		breakUp: .16,
		density: 1.35,
		ground: "hatch"
	}),
	defineStyle({
		id: "art-nouveau",
		name: "Art nouveau",
		group: "Ink",
		blurb: "Whiplash curves and a clean contour.",
		marks: [
			{
				kind: "stroke",
				w: 5
			},
			{
				kind: "outline",
				w: 4
			},
			{
				kind: "dot",
				w: 1
			}
		],
		alpha: [.86, 1],
		length: 1.25,
		hardness: .76,
		keyline: .006,
		ground: "stroke"
	}),
	defineStyle({
		id: "charcoal",
		name: "Charcoal",
		group: "Draw",
		blurb: "Smudged darks, a wiped highlight, soft dirty edges.",
		marks: [
			{
				kind: "drybrush",
				w: 4
			},
			{
				kind: "wash",
				w: 4
			},
			{
				kind: "scratch",
				w: 2
			}
		],
		alpha: [.32, .68],
		hardness: .2,
		cover: .4,
		bleed: .35,
		breakUp: .42,
		ground: "wash"
	}),
	defineStyle({
		id: "conte",
		name: "Conte",
		group: "Draw",
		blurb: "A dry crayon. Grainy, warm, and a little harsh.",
		marks: [
			{
				kind: "drybrush",
				w: 5
			},
			{
				kind: "hatch",
				w: 3
			},
			{
				kind: "stroke",
				w: 2
			}
		],
		alpha: [.62, .92],
		hardness: .5,
		cover: .7,
		breakUp: .42,
		ground: "drybrush"
	}),
	defineStyle({
		id: "pastel",
		name: "Pastel",
		group: "Draw",
		blurb: "Soft dust on tooth. Nothing is fully wet.",
		marks: [
			{
				kind: "drybrush",
				w: 5
			},
			{
				kind: "stroke",
				w: 2
			},
			{
				kind: "hatch",
				w: 2
			},
			{
				kind: "dot",
				w: 1
			}
		],
		alpha: [.45, .78],
		hardness: .22,
		cover: .5,
		bleed: .16,
		breakUp: .55,
		ground: "drybrush"
	}),
	defineStyle({
		id: "pencil",
		name: "Colored pencil",
		group: "Draw",
		blurb: "Hatched, layered, and a little scratchy.",
		marks: [{
			kind: "hatch",
			w: 7
		}, {
			kind: "stroke",
			w: 2
		}],
		alpha: [.48, .82],
		size: .6,
		hardness: .88,
		cover: .6,
		breakUp: .2,
		density: 1.25,
		ground: "hatch"
	}),
	defineStyle({
		id: "scratchboard",
		name: "Scratchboard",
		group: "Draw",
		blurb: "A dark field opened with light scratches.",
		marks: [
			{
				kind: "scratch",
				w: 7
			},
			{
				kind: "stroke",
				w: 2
			},
			{
				kind: "block",
				w: 1
			}
		],
		alpha: [.92, 1],
		hardness: 1,
		cover: 1,
		reveal: true,
		density: 1.15,
		ground: "block"
	}),
	defineStyle({
		id: "sgraffito",
		name: "Sgraffito",
		group: "Draw",
		blurb: "Scraped back through a coat of paint.",
		marks: [
			{
				kind: "knife",
				w: 2
			},
			{
				kind: "scratch",
				w: 6
			},
			{
				kind: "stroke",
				w: 2
			}
		],
		alpha: [.75, 1],
		hardness: .82,
		cover: .75,
		ground: "knife"
	}),
	defineStyle({
		id: "pointillism",
		name: "Pointillism",
		group: "Draw",
		blurb: "Only dots. The form arrives when you lean back.",
		marks: [{
			kind: "dot",
			w: 10
		}],
		alpha: [.88, 1],
		size: .72,
		hardness: 1,
		cover: .92,
		density: 1.55,
		ground: "dot"
	}),
	defineStyle({
		id: "stipple",
		name: "Stipple",
		group: "Draw",
		blurb: "A tighter dot, more drawing than mosaic.",
		marks: [{
			kind: "dot",
			w: 8
		}, {
			kind: "hatch",
			w: 1
		}],
		alpha: [.7, .95],
		size: .46,
		hardness: .92,
		density: 1.4,
		ground: "dot"
	}),
	defineStyle({
		id: "crosshatch",
		name: "Crosshatch",
		group: "Draw",
		blurb: "Parallel families of lines. Value is how close they sit.",
		marks: [{
			kind: "hatch",
			w: 8
		}, {
			kind: "stroke",
			w: 2
		}],
		alpha: [.55, .88],
		size: .8,
		hardness: .9,
		ground: "hatch"
	}),
	defineStyle({
		id: "drybrush",
		name: "Dry brush",
		group: "Draw",
		blurb: "A starved brush. The stroke breaks on the tooth.",
		marks: [{
			kind: "drybrush",
			w: 8
		}, {
			kind: "scratch",
			w: 2
		}],
		alpha: [.58, .92],
		hardness: .66,
		cover: .6,
		breakUp: .78,
		ground: "drybrush"
	}),
	defineStyle({
		id: "comic",
		name: "Comic book",
		group: "Print",
		blurb: "Flat color, a heavy keyline, halftone in the shadow.",
		marks: [
			{
				kind: "block",
				w: 4
			},
			{
				kind: "outline",
				w: 5
			},
			{
				kind: "halftone",
				w: 3
			}
		],
		alpha: [.96, 1],
		hardness: 1,
		cover: 1,
		keyline: .012,
		ground: "block"
	}),
	defineStyle({
		id: "woodblock",
		name: "Woodblock",
		group: "Print",
		blurb: "Flat shapes and a key line, registered a hair off.",
		marks: [{
			kind: "block",
			w: 5
		}, {
			kind: "outline",
			w: 4
		}],
		alpha: [1, 1],
		hardness: 1,
		cover: 1,
		keyline: .01,
		echo: .012,
		ground: "block"
	}),
	defineStyle({
		id: "linocut",
		name: "Linocut",
		group: "Print",
		blurb: "Gouged and high contrast. The cut is the drawing.",
		marks: [
			{
				kind: "block",
				w: 5
			},
			{
				kind: "scratch",
				w: 3
			},
			{
				kind: "outline",
				w: 2
			}
		],
		alpha: [1, 1],
		hardness: 1,
		cover: 1,
		keyline: .011,
		ground: "block"
	}),
	defineStyle({
		id: "screenprint",
		name: "Screen print",
		group: "Print",
		blurb: "Flat passes, a little halftone, a misregistered second hit.",
		marks: [{
			kind: "block",
			w: 6
		}, {
			kind: "halftone",
			w: 2
		}],
		alpha: [1, 1],
		hardness: 1,
		cover: 1,
		echo: .014,
		ground: "block"
	}),
	defineStyle({
		id: "collage",
		name: "Collage",
		group: "Print",
		blurb: "Hard-edged scraps dropped on the sheet.",
		marks: [{
			kind: "block",
			w: 7
		}, {
			kind: "stroke",
			w: 1
		}],
		alpha: [1, 1],
		size: 1.4,
		length: .55,
		hardness: 1,
		cover: 1,
		ground: "block"
	}),
	defineStyle({
		id: "roller",
		name: "Roller",
		group: "Print",
		blurb: "A loaded roller. Bands, skips, and a hard stop.",
		marks: [
			{
				kind: "block",
				w: 4
			},
			{
				kind: "streak",
				w: 3
			},
			{
				kind: "drybrush",
				w: 2
			}
		],
		alpha: [.72, .95],
		size: 1.2,
		length: 1.15,
		hardness: .76,
		cover: .82,
		breakUp: .28,
		axis: "horiz",
		ground: "block"
	}),
	defineStyle({
		id: "spray",
		name: "Spray",
		group: "Street",
		blurb: "Overspray, drips, and a soft stencil edge.",
		marks: [
			{
				kind: "splatter",
				w: 5
			},
			{
				kind: "streak",
				w: 4
			},
			{
				kind: "drip",
				w: 3
			},
			{
				kind: "dot",
				w: 2
			}
		],
		alpha: [.55, .88],
		size: 1.1,
		hardness: .25,
		drip: .55,
		ground: "splatter"
	}),
	defineStyle({
		id: "stencil",
		name: "Stencil",
		group: "Street",
		blurb: "A hard mask with paint creeping past the edge.",
		marks: [
			{
				kind: "block",
				w: 5
			},
			{
				kind: "splatter",
				w: 3
			},
			{
				kind: "outline",
				w: 1
			}
		],
		alpha: [.82, 1],
		hardness: 1,
		cover: .95,
		drip: .25,
		ground: "block"
	}),
	defineStyle({
		id: "graffiti",
		name: "Graffiti",
		group: "Street",
		blurb: "Long kinetic sprays and drips running off the form.",
		marks: [
			{
				kind: "streak",
				w: 4
			},
			{
				kind: "drip",
				w: 4
			},
			{
				kind: "splatter",
				w: 3
			},
			{
				kind: "outline",
				w: 2
			}
		],
		alpha: [.8, 1],
		length: 1.2,
		hardness: .45,
		drip: .72,
		ground: "streak"
	}),
	defineStyle({
		id: "neon-tube",
		name: "Neon tube",
		group: "Street",
		blurb: "A thin bright core and a halo that blooms off it.",
		marks: [
			{
				kind: "stroke",
				w: 6
			},
			{
				kind: "wash",
				w: 3
			},
			{
				kind: "outline",
				w: 1
			}
		],
		alpha: [.9, 1],
		size: .55,
		length: 1.15,
		hardness: .16,
		bleed: .85,
		ground: "wash"
	}),
	defineStyle({
		id: "airbrush",
		name: "Airbrush",
		group: "Street",
		blurb: "Seamless gradients. Almost no edge at all.",
		marks: [{
			kind: "wash",
			w: 8
		}, {
			kind: "streak",
			w: 2
		}],
		alpha: [.16, .4],
		size: 1.55,
		hardness: .02,
		cover: .25,
		bleed: .92,
		ground: "wash"
	}),
	defineStyle({
		id: "pollock",
		name: "All-over drip",
		group: "Street",
		blurb: "Flung paint across the whole sheet. The subject sits underneath.",
		marks: [
			{
				kind: "splatter",
				w: 6
			},
			{
				kind: "drip",
				w: 5
			},
			{
				kind: "streak",
				w: 2
			}
		],
		alpha: [.78, 1],
		size: .8,
		hardness: .7,
		drip: .78,
		allover: true,
		density: 1.7,
		ground: "splatter"
	}),
	defineStyle({
		id: "fauve",
		name: "Fauve",
		group: "Street",
		blurb: "Color chosen for heat, not for the note. Still inside the palette.",
		marks: [
			{
				kind: "dab",
				w: 5
			},
			{
				kind: "stroke",
				w: 4
			},
			{
				kind: "block",
				w: 1
			}
		],
		alpha: [.9, 1],
		size: 1.15,
		hardness: .8,
		cover: .92,
		pitchMap: false,
		ground: "dab"
	}),
	defineStyle({
		id: "slash",
		name: "Slash",
		group: "Street",
		blurb: "Diagonal cuts. The arm, not the wrist.",
		marks: [{
			kind: "stroke",
			w: 8
		}, {
			kind: "drybrush",
			w: 2
		}],
		alpha: [.86, 1],
		size: .9,
		length: 1.4,
		hardness: .72,
		cover: .88,
		axis: "diag",
		ground: "stroke"
	}),
	defineStyle({
		id: "automatism",
		name: "Automatism",
		group: "Street",
		blurb: "The hand moving faster than the plan.",
		marks: [
			{
				kind: "stroke",
				w: 4
			},
			{
				kind: "splatter",
				w: 3
			},
			{
				kind: "scratch",
				w: 2
			},
			{
				kind: "drip",
				w: 1
			}
		],
		alpha: [.55, .9],
		hardness: .4,
		drip: .3,
		allover: true,
		density: 1.2,
		ground: "stroke"
	}),
	defineStyle({
		id: "sponge",
		name: "Sponge",
		group: "Street",
		blurb: "Dabbed texture. Stippled, not stroked.",
		marks: [
			{
				kind: "splatter",
				w: 4
			},
			{
				kind: "dot",
				w: 4
			},
			{
				kind: "dab",
				w: 2
			}
		],
		alpha: [.4, .72],
		size: 1.1,
		hardness: .3,
		breakUp: .5,
		ground: "splatter"
	}),
	defineStyle({
		id: "mixed",
		name: "Mixed media",
		group: "Street",
		blurb: "Knife, wash, hatch, splatter, scrap. The playing picks the tool.",
		marks: [
			{
				kind: "knife",
				w: 2
			},
			{
				kind: "wash",
				w: 2
			},
			{
				kind: "hatch",
				w: 2
			},
			{
				kind: "splatter",
				w: 2
			},
			{
				kind: "block",
				w: 2
			}
		],
		alpha: [.62, .96],
		hardness: .6,
		cover: .75,
		drip: .22,
		density: 1.15,
		ground: "wash"
	})
];
function styleById(id) {
	return STYLES.find((s) => s.id === id) ?? STYLES[0];
}
var GENRES = [
	{
		id: "desert",
		name: "Desert / Southwest",
		blurb: "A low horizon, a big sky, heat sitting on the ground.",
		flow: 0,
		focus: {
			x: .68,
			y: .3
		},
		bands: {
			sky: .48,
			mid: .16,
			ground: .36
		},
		horizon: .62,
		vignette: .22,
		symmetry: .1,
		diagonal: .08,
		radial: .12,
		value: "full"
	},
	{
		id: "landscape",
		name: "Landscape",
		blurb: "Sky above a horizon, ground below, marks moving sideways.",
		flow: 0,
		focus: {
			x: .32,
			y: .34
		},
		bands: {
			sky: .4,
			mid: .2,
			ground: .4
		},
		horizon: .58,
		vignette: .16,
		symmetry: .15,
		diagonal: .05,
		radial: .08,
		value: "full"
	},
	{
		id: "frazetta",
		name: "Frazetta",
		blurb: "A dark mass and one bright focal light on a diagonal.",
		flow: .35,
		focus: {
			x: .6,
			y: .4
		},
		bands: {
			sky: .28,
			mid: .5,
			ground: .22
		},
		horizon: null,
		vignette: .84,
		symmetry: .05,
		diagonal: .88,
		radial: .18,
		value: "low"
	},
	{
		id: "rock-poster",
		name: "Rock poster",
		blurb: "A centered blast. Marks radiate. Saturation stays up.",
		flow: .25,
		focus: {
			x: .5,
			y: .44
		},
		bands: {
			sky: .2,
			mid: .62,
			ground: .18
		},
		horizon: null,
		vignette: .48,
		symmetry: .84,
		diagonal: .15,
		radial: .94,
		value: "poster"
	},
	{
		id: "album-cover",
		name: "Album cover",
		blurb: "One strong center, a vignette, the corners held back.",
		flow: .1,
		focus: {
			x: .5,
			y: .46
		},
		bands: {
			sky: .18,
			mid: .68,
			ground: .14
		},
		horizon: null,
		vignette: .58,
		symmetry: .72,
		diagonal: .1,
		radial: .5,
		value: "poster"
	},
	{
		id: "comic-book",
		name: "Comic book",
		blurb: "A poster value structure. The figure owns the middle.",
		flow: .08,
		focus: {
			x: .5,
			y: .46
		},
		bands: {
			sky: .22,
			mid: .58,
			ground: .2
		},
		horizon: null,
		vignette: .18,
		symmetry: .35,
		diagonal: .2,
		radial: .22,
		value: "poster"
	},
	{
		id: "cosmic",
		name: "Cosmic",
		blurb: "Deep field, a bright event, lots of sky.",
		flow: .12,
		focus: {
			x: .5,
			y: .36
		},
		bands: {
			sky: .7,
			mid: .2,
			ground: .1
		},
		horizon: null,
		vignette: .7,
		symmetry: .2,
		diagonal: .12,
		radial: .36,
		value: "low"
	},
	{
		id: "abstract",
		name: "Abstract",
		blurb: "No horizon. The marks negotiate the whole sheet.",
		flow: .18,
		focus: {
			x: .5,
			y: .5
		},
		bands: {
			sky: .34,
			mid: .33,
			ground: .33
		},
		horizon: null,
		vignette: .1,
		symmetry: .05,
		diagonal: .2,
		radial: .1,
		value: "full"
	},
	{
		id: "portrait",
		name: "Portrait",
		blurb: "The head sits high. The edges fall off.",
		flow: .05,
		focus: {
			x: .5,
			y: .38
		},
		bands: {
			sky: .22,
			mid: .62,
			ground: .16
		},
		horizon: null,
		vignette: .56,
		symmetry: .55,
		diagonal: .08,
		radial: .15,
		value: "full"
	},
	{
		id: "noir",
		name: "Noir",
		blurb: "Low key, a hard diagonal, the light is a small permission.",
		flow: .32,
		focus: {
			x: .4,
			y: .4
		},
		bands: {
			sky: .2,
			mid: .36,
			ground: .44
		},
		horizon: .72,
		vignette: .8,
		symmetry: .05,
		diagonal: .72,
		radial: .1,
		value: "low"
	},
	{
		id: "folk",
		name: "Folk",
		blurb: "A simple horizon, a centered sun, nothing fussy.",
		flow: 0,
		focus: {
			x: .5,
			y: .32
		},
		bands: {
			sky: .42,
			mid: .2,
			ground: .38
		},
		horizon: .6,
		vignette: .08,
		symmetry: .7,
		diagonal: .02,
		radial: .12,
		value: "high"
	},
	{
		id: "still-life",
		name: "Still life",
		blurb: "A table line and the weight sitting just above it.",
		flow: .02,
		focus: {
			x: .5,
			y: .56
		},
		bands: {
			sky: .14,
			mid: .4,
			ground: .46
		},
		horizon: .7,
		vignette: .36,
		symmetry: .4,
		diagonal: .06,
		radial: .08,
		value: "full"
	},
	{
		id: "mural",
		name: "Street mural",
		blurb: "Big symmetric masses, meant to be read from across the room.",
		flow: .06,
		focus: {
			x: .5,
			y: .48
		},
		bands: {
			sky: .3,
			mid: .4,
			ground: .3
		},
		horizon: null,
		vignette: .2,
		symmetry: .82,
		diagonal: .1,
		radial: .2,
		value: "poster"
	},
	{
		id: "eerie",
		name: "Eerie",
		blurb: "The light is off-center and the corners close in.",
		flow: .22,
		focus: {
			x: .44,
			y: .4
		},
		bands: {
			sky: .46,
			mid: .34,
			ground: .2
		},
		horizon: null,
		vignette: .76,
		symmetry: .05,
		diagonal: .4,
		radial: .16,
		value: "low"
	},
	{
		id: "western-night",
		name: "Western night",
		blurb: "A high dark sky, a low land, one light in the distance.",
		flow: 0,
		focus: {
			x: .74,
			y: .24
		},
		bands: {
			sky: .58,
			mid: .14,
			ground: .28
		},
		horizon: .7,
		vignette: .62,
		symmetry: .1,
		diagonal: .12,
		radial: .1,
		value: "low"
	},
	{
		id: "figure",
		name: "Figure in motion",
		blurb: "The body cuts a diagonal through the middle band.",
		flow: .34,
		focus: {
			x: .56,
			y: .48
		},
		bands: {
			sky: .18,
			mid: .64,
			ground: .18
		},
		horizon: null,
		vignette: .4,
		symmetry: .1,
		diagonal: .78,
		radial: .12,
		value: "full"
	}
];
var PALETTES = [
	{
		id: "blacklight",
		name: "Blacklight",
		paper: "#0c1208",
		colors: [
			"#10210a",
			"#1d4a14",
			"#6fbe1e",
			"#c6ff3d",
			"#f4ff6a",
			"#f7ffe4"
		]
	},
	{
		id: "desert-dusk",
		name: "Desert dusk",
		paper: "#24160f",
		colors: [
			"#1a0c08",
			"#6b2e28",
			"#c4652a",
			"#e8a04a",
			"#f2d2a2",
			"#f7efe2"
		]
	},
	{
		id: "cholla-gold",
		name: "Cholla gold",
		paper: "#1c140c",
		colors: [
			"#2a1a0c",
			"#6a4420",
			"#c4892a",
			"#e6c15a",
			"#f3e2a8",
			"#fff6d8"
		]
	},
	{
		id: "cadmium",
		name: "Cadmium night",
		paper: "#1a100c",
		colors: [
			"#140c08",
			"#5c1a12",
			"#c4311a",
			"#e86820",
			"#f0c14a",
			"#f6e6c8"
		]
	},
	{
		id: "bone-soot",
		name: "Bone and soot",
		paper: "#d7d0c4",
		colors: [
			"#1a1816",
			"#3a342e",
			"#6e655c",
			"#a3988c",
			"#d9d0c4",
			"#f4efe6"
		]
	},
	{
		id: "sumi-paper",
		name: "Sumi paper",
		paper: "#efe6d6",
		colors: [
			"#12110e",
			"#2c2a26",
			"#5c5852",
			"#8d877e",
			"#cfc6b6",
			"#f7f1e6"
		]
	},
	{
		id: "frazetta-bronze",
		name: "Frazetta bronze",
		paper: "#140e0c",
		colors: [
			"#1a0808",
			"#4a1c14",
			"#8a3a22",
			"#c47a3a",
			"#e8c07a",
			"#f6e6c8"
		]
	},
	{
		id: "cosmic-night",
		name: "Cosmic night",
		paper: "#070814",
		colors: [
			"#12081c",
			"#3a1860",
			"#6a3ad4",
			"#d24a8a",
			"#f2c14a",
			"#efeaff"
		]
	},
	{
		id: "rock-poster",
		name: "Rock poster",
		paper: "#0e0e12",
		colors: [
			"#14141c",
			"#e21b4c",
			"#1d4ed8",
			"#f2d000",
			"#f4f4f6",
			"#ff5fa8"
		]
	},
	{
		id: "minor-key",
		name: "Minor key",
		paper: "#10141c",
		colors: [
			"#0c1018",
			"#1a3050",
			"#3a5a78",
			"#7a98b0",
			"#c5d4e0",
			"#eef3f7"
		]
	},
	{
		id: "major-key",
		name: "Major key",
		paper: "#1c140c",
		colors: [
			"#3a1808",
			"#a84810",
			"#e88820",
			"#f2c14a",
			"#ffe9a8",
			"#fff8e8"
		]
	},
	{
		id: "southwest-clay",
		name: "Southwest clay",
		paper: "#c4a88a",
		colors: [
			"#3a241c",
			"#7a4030",
			"#c46a48",
			"#e0a070",
			"#f0d2b4",
			"#f8efe4"
		]
	},
	{
		id: "sea-glass",
		name: "Sea glass",
		paper: "#10201c",
		colors: [
			"#0c2420",
			"#1a5c54",
			"#3aaa98",
			"#8ed9c4",
			"#d5f3ea",
			"#f4fffb"
		]
	},
	{
		id: "blood-moon",
		name: "Blood moon",
		paper: "#14080c",
		colors: [
			"#1a0608",
			"#6e1020",
			"#c42030",
			"#e86048",
			"#f0b0a0",
			"#f8e8e4"
		]
	},
	{
		id: "neon-alley",
		name: "Neon alley",
		paper: "#080a10",
		colors: [
			"#10121a",
			"#ff2d78",
			"#6a4cff",
			"#3dffe8",
			"#f4ff6a",
			"#ffffff"
		]
	},
	{
		id: "happy-little",
		name: "Happy little",
		paper: "#163040",
		colors: [
			"#0e1c28",
			"#1d4e3a",
			"#3d7a48",
			"#c4a15a",
			"#e8dcb8",
			"#f4f0e4"
		]
	},
	{
		id: "pastel-dust",
		name: "Pastel dust",
		paper: "#2a2c32",
		colors: [
			"#3a3038",
			"#d98ea2",
			"#f2c14a",
			"#7ec8c3",
			"#cbb6ea",
			"#fff6ee"
		]
	},
	{
		id: "dust-storm",
		name: "Dust storm",
		paper: "#8a7a68",
		colors: [
			"#2a241c",
			"#5c4a3a",
			"#8a7058",
			"#c4a888",
			"#e6d6c4",
			"#f6f0e8"
		]
	}
];
var JAM_SUBJECTS = [
	"UFO",
	"desert wolf",
	"cholla",
	"guitar",
	"moon",
	"mesa",
	"skull",
	"raven",
	"cowboy",
	"county road",
	"phoenix",
	"horse",
	"portrait"
];
function genreById(id) {
	return GENRES.find((g) => g.id === id) ?? GENRES[0];
}
function paletteById(id) {
	return PALETTES.find((p) => p.id === id) ?? PALETTES[0];
}
function paletteSwatch(palette) {
	return palette.colors[Math.min(3, palette.colors.length - 1)];
}
function rollJam(source = "mic") {
	const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
	const seconds = pick([
		30,
		60,
		90
	]);
	return {
		styleId: pick(STYLES).id,
		genreId: pick(GENRES).id,
		paletteId: pick(PALETTES).id,
		subject: pick(JAM_SUBJECTS),
		seconds,
		source
	};
}
function g(partial) {
	return partial;
}
var UFO = [
	g({
		kind: "disc",
		x: .5,
		y: .36,
		rx: .28,
		ry: .05,
		rot: -.05,
		weight: 1,
		bright: true
	}),
	g({
		kind: "dome",
		x: .5,
		y: .318,
		rx: .1,
		ry: .045,
		rot: 0,
		weight: .8,
		bright: true
	}),
	g({
		kind: "beam",
		x: .38,
		y: .52,
		rx: .02,
		ry: .14,
		rot: Math.PI / 2 + .18,
		weight: .7,
		bright: true
	}),
	g({
		kind: "beam",
		x: .5,
		y: .56,
		rx: .028,
		ry: .18,
		rot: Math.PI / 2,
		weight: 1,
		bright: true
	}),
	g({
		kind: "beam",
		x: .62,
		y: .52,
		rx: .02,
		ry: .14,
		rot: Math.PI / 2 - .18,
		weight: .7,
		bright: true
	}),
	g({
		kind: "glow",
		x: .5,
		y: .8,
		rx: .24,
		ry: .035,
		rot: 0,
		weight: .5,
		bright: true
	}),
	g({
		kind: "scatter",
		x: .5,
		y: .14,
		rx: .42,
		ry: .08,
		rot: 0,
		weight: .3
	})
];
var WOLF = [
	g({
		kind: "mass",
		x: .46,
		y: .58,
		rx: .2,
		ry: .09,
		rot: -.08,
		weight: 1
	}),
	g({
		kind: "mass",
		x: .7,
		y: .5,
		rx: .09,
		ry: .07,
		rot: .15,
		weight: .9
	}),
	g({
		kind: "ridge",
		x: .8,
		y: .52,
		rx: .07,
		ry: .015,
		rot: .25,
		weight: .5
	}),
	g({
		kind: "peak",
		x: .66,
		y: .43,
		rx: .025,
		ry: .045,
		rot: -.5,
		weight: .4
	}),
	g({
		kind: "peak",
		x: .74,
		y: .42,
		rx: .025,
		ry: .05,
		rot: .3,
		weight: .4
	}),
	g({
		kind: "leg",
		x: .34,
		y: .74,
		rx: .015,
		ry: .09,
		rot: 1.5,
		weight: .45
	}),
	g({
		kind: "leg",
		x: .42,
		y: .75,
		rx: .015,
		ry: .1,
		rot: 1.55,
		weight: .45
	}),
	g({
		kind: "leg",
		x: .54,
		y: .75,
		rx: .015,
		ry: .1,
		rot: 1.6,
		weight: .45
	}),
	g({
		kind: "leg",
		x: .62,
		y: .74,
		rx: .014,
		ry: .08,
		rot: 1.5,
		weight: .4
	}),
	g({
		kind: "eye",
		x: .73,
		y: .485,
		rx: .012,
		ry: .012,
		rot: 0,
		weight: .5,
		bright: true
	})
];
var CACTUS = [
	g({
		kind: "leg",
		x: .5,
		y: .64,
		rx: .04,
		ry: .2,
		rot: Math.PI / 2,
		weight: 1
	}),
	g({
		kind: "ridge",
		x: .36,
		y: .52,
		rx: .12,
		ry: .02,
		rot: -.35,
		weight: .75
	}),
	g({
		kind: "ridge",
		x: .66,
		y: .5,
		rx: .12,
		ry: .02,
		rot: .45,
		weight: .75
	}),
	g({
		kind: "peak",
		x: .5,
		y: .4,
		rx: .03,
		ry: .045,
		rot: 0,
		weight: .4
	})
];
var GUITAR = [
	g({
		kind: "mass",
		x: .4,
		y: .7,
		rx: .14,
		ry: .16,
		rot: .45,
		weight: 1
	}),
	g({
		kind: "disc",
		x: .38,
		y: .68,
		rx: .04,
		ry: .05,
		rot: .45,
		weight: .45,
		dark: true
	}),
	g({
		kind: "ridge",
		x: .58,
		y: .42,
		rx: .22,
		ry: .012,
		rot: -.95,
		weight: .9
	}),
	g({
		kind: "mass",
		x: .76,
		y: .2,
		rx: .05,
		ry: .04,
		rot: -.8,
		weight: .4
	})
];
var MOON = [
	g({
		kind: "orb",
		x: .64,
		y: .28,
		rx: .13,
		ry: .13,
		rot: 0,
		weight: 1,
		bright: true
	}),
	g({
		kind: "ridge",
		x: .42,
		y: .72,
		rx: .28,
		ry: .015,
		rot: .04,
		weight: .35
	}),
	g({
		kind: "mass",
		x: .32,
		y: .8,
		rx: .16,
		ry: .06,
		rot: 0,
		weight: .4,
		dark: true
	})
];
var SUN = [
	g({
		kind: "orb",
		x: .62,
		y: .32,
		rx: .12,
		ry: .12,
		rot: 0,
		weight: 1,
		bright: true
	}),
	g({
		kind: "scatter",
		x: .62,
		y: .32,
		rx: .28,
		ry: .2,
		rot: 0,
		weight: .4,
		bright: true
	}),
	g({
		kind: "ridge",
		x: .5,
		y: .7,
		rx: .46,
		ry: .015,
		rot: 0,
		weight: .4
	})
];
var MESA = [
	g({
		kind: "mass",
		x: .42,
		y: .64,
		rx: .26,
		ry: .1,
		rot: 0,
		weight: 1
	}),
	g({
		kind: "ridge",
		x: .42,
		y: .54,
		rx: .26,
		ry: .012,
		rot: 0,
		weight: .55
	}),
	g({
		kind: "mass",
		x: .78,
		y: .68,
		rx: .1,
		ry: .07,
		rot: 0,
		weight: .5
	}),
	g({
		kind: "orb",
		x: .72,
		y: .28,
		rx: .07,
		ry: .07,
		rot: 0,
		weight: .4,
		bright: true
	})
];
var TREE = [
	g({
		kind: "leg",
		x: .5,
		y: .74,
		rx: .02,
		ry: .14,
		rot: Math.PI / 2,
		weight: .7
	}),
	g({
		kind: "mass",
		x: .5,
		y: .46,
		rx: .16,
		ry: .14,
		rot: 0,
		weight: 1
	}),
	g({
		kind: "mass",
		x: .36,
		y: .5,
		rx: .08,
		ry: .07,
		rot: 0,
		weight: .5
	}),
	g({
		kind: "mass",
		x: .64,
		y: .48,
		rx: .09,
		ry: .08,
		rot: 0,
		weight: .5
	})
];
var SKULL = [
	g({
		kind: "mass",
		x: .5,
		y: .42,
		rx: .16,
		ry: .18,
		rot: 0,
		weight: 1
	}),
	g({
		kind: "eye",
		x: .43,
		y: .4,
		rx: .035,
		ry: .04,
		rot: 0,
		weight: .7,
		dark: true
	}),
	g({
		kind: "eye",
		x: .57,
		y: .4,
		rx: .035,
		ry: .04,
		rot: 0,
		weight: .7,
		dark: true
	}),
	g({
		kind: "ridge",
		x: .5,
		y: .5,
		rx: .035,
		ry: .012,
		rot: 0,
		weight: .35,
		dark: true
	}),
	g({
		kind: "peak",
		x: .5,
		y: .64,
		rx: .08,
		ry: .05,
		rot: Math.PI,
		weight: .4
	})
];
var EYE = [
	g({
		kind: "orb",
		x: .5,
		y: .46,
		rx: .2,
		ry: .1,
		rot: 0,
		weight: 1
	}),
	g({
		kind: "disc",
		x: .5,
		y: .46,
		rx: .07,
		ry: .07,
		rot: 0,
		weight: .8,
		dark: true
	}),
	g({
		kind: "eye",
		x: .53,
		y: .45,
		rx: .018,
		ry: .018,
		rot: 0,
		weight: .5,
		bright: true
	})
];
var FACE = [
	g({
		kind: "mass",
		x: .5,
		y: .46,
		rx: .16,
		ry: .2,
		rot: 0,
		weight: 1
	}),
	g({
		kind: "eye",
		x: .43,
		y: .42,
		rx: .02,
		ry: .014,
		rot: 0,
		weight: .5,
		dark: true
	}),
	g({
		kind: "eye",
		x: .57,
		y: .42,
		rx: .02,
		ry: .014,
		rot: 0,
		weight: .5,
		dark: true
	}),
	g({
		kind: "ridge",
		x: .5,
		y: .56,
		rx: .05,
		ry: .01,
		rot: .04,
		weight: .35
	}),
	g({
		kind: "mass",
		x: .5,
		y: .74,
		rx: .18,
		ry: .1,
		rot: 0,
		weight: .35
	})
];
var BIRD = [
	g({
		kind: "mass",
		x: .48,
		y: .5,
		rx: .07,
		ry: .045,
		rot: -.2,
		weight: .8
	}),
	g({
		kind: "ridge",
		x: .3,
		y: .48,
		rx: .14,
		ry: .016,
		rot: -.45,
		weight: .75
	}),
	g({
		kind: "ridge",
		x: .66,
		y: .46,
		rx: .14,
		ry: .016,
		rot: .35,
		weight: .75
	}),
	g({
		kind: "peak",
		x: .58,
		y: .5,
		rx: .04,
		ry: .012,
		rot: .2,
		weight: .3
	})
];
var HORSE = [
	g({
		kind: "mass",
		x: .46,
		y: .58,
		rx: .18,
		ry: .08,
		rot: 0,
		weight: 1
	}),
	g({
		kind: "mass",
		x: .7,
		y: .44,
		rx: .055,
		ry: .09,
		rot: .35,
		weight: .7
	}),
	g({
		kind: "ridge",
		x: .78,
		y: .38,
		rx: .06,
		ry: .012,
		rot: .45,
		weight: .35
	}),
	g({
		kind: "leg",
		x: .34,
		y: .74,
		rx: .012,
		ry: .1,
		rot: Math.PI / 2,
		weight: .4
	}),
	g({
		kind: "leg",
		x: .44,
		y: .75,
		rx: .012,
		ry: .1,
		rot: Math.PI / 2,
		weight: .4
	}),
	g({
		kind: "leg",
		x: .56,
		y: .75,
		rx: .012,
		ry: .1,
		rot: Math.PI / 2,
		weight: .4
	}),
	g({
		kind: "leg",
		x: .64,
		y: .74,
		rx: .012,
		ry: .09,
		rot: Math.PI / 2,
		weight: .4
	})
];
var FLOWER = [
	g({
		kind: "disc",
		x: .5,
		y: .4,
		rx: .055,
		ry: .055,
		rot: 0,
		weight: .6,
		bright: true
	}),
	g({
		kind: "peak",
		x: .5,
		y: .28,
		rx: .04,
		ry: .06,
		rot: 0,
		weight: .5
	}),
	g({
		kind: "peak",
		x: .62,
		y: .36,
		rx: .04,
		ry: .06,
		rot: 1.1,
		weight: .5
	}),
	g({
		kind: "peak",
		x: .56,
		y: .52,
		rx: .04,
		ry: .06,
		rot: 2.2,
		weight: .5
	}),
	g({
		kind: "peak",
		x: .4,
		y: .5,
		rx: .04,
		ry: .06,
		rot: 3.6,
		weight: .5
	}),
	g({
		kind: "peak",
		x: .36,
		y: .36,
		rx: .04,
		ry: .06,
		rot: 4.7,
		weight: .5
	}),
	g({
		kind: "leg",
		x: .5,
		y: .7,
		rx: .01,
		ry: .14,
		rot: Math.PI / 2,
		weight: .35
	})
];
var CITY = [
	g({
		kind: "leg",
		x: .22,
		y: .62,
		rx: .04,
		ry: .16,
		rot: Math.PI / 2,
		weight: .7
	}),
	g({
		kind: "leg",
		x: .36,
		y: .56,
		rx: .05,
		ry: .22,
		rot: Math.PI / 2,
		weight: .9
	}),
	g({
		kind: "leg",
		x: .5,
		y: .64,
		rx: .045,
		ry: .14,
		rot: Math.PI / 2,
		weight: .6
	}),
	g({
		kind: "leg",
		x: .66,
		y: .54,
		rx: .055,
		ry: .24,
		rot: Math.PI / 2,
		weight: 1
	}),
	g({
		kind: "leg",
		x: .8,
		y: .62,
		rx: .04,
		ry: .15,
		rot: Math.PI / 2,
		weight: .6
	}),
	g({
		kind: "orb",
		x: .78,
		y: .22,
		rx: .07,
		ry: .07,
		rot: 0,
		weight: .4,
		bright: true
	}),
	g({
		kind: "ridge",
		x: .5,
		y: .84,
		rx: .46,
		ry: .01,
		rot: 0,
		weight: .3
	})
];
var RIDER = [
	g({
		kind: "mass",
		x: .48,
		y: .62,
		rx: .18,
		ry: .07,
		rot: 0,
		weight: 1
	}),
	g({
		kind: "mass",
		x: .58,
		y: .46,
		rx: .05,
		ry: .07,
		rot: 0,
		weight: .6
	}),
	g({
		kind: "peak",
		x: .58,
		y: .38,
		rx: .06,
		ry: .02,
		rot: 0,
		weight: .35
	}),
	g({
		kind: "leg",
		x: .36,
		y: .76,
		rx: .012,
		ry: .08,
		rot: Math.PI / 2,
		weight: .35
	}),
	g({
		kind: "leg",
		x: .48,
		y: .76,
		rx: .012,
		ry: .08,
		rot: Math.PI / 2,
		weight: .35
	}),
	g({
		kind: "leg",
		x: .6,
		y: .76,
		rx: .012,
		ry: .08,
		rot: Math.PI / 2,
		weight: .35
	})
];
var ROAD = [
	g({
		kind: "ridge",
		x: .5,
		y: .62,
		rx: .48,
		ry: .01,
		rot: 0,
		weight: .3
	}),
	g({
		kind: "ridge",
		x: .38,
		y: .78,
		rx: .2,
		ry: .012,
		rot: -1.05,
		weight: .8
	}),
	g({
		kind: "ridge",
		x: .62,
		y: .78,
		rx: .2,
		ry: .012,
		rot: 1.05,
		weight: .8
	}),
	g({
		kind: "orb",
		x: .72,
		y: .28,
		rx: .06,
		ry: .06,
		rot: 0,
		weight: .3,
		bright: true
	})
];
var HEART = [
	g({
		kind: "mass",
		x: .4,
		y: .4,
		rx: .1,
		ry: .09,
		rot: -.4,
		weight: .8,
		bright: true
	}),
	g({
		kind: "mass",
		x: .6,
		y: .4,
		rx: .1,
		ry: .09,
		rot: .4,
		weight: .8,
		bright: true
	}),
	g({
		kind: "peak",
		x: .5,
		y: .62,
		rx: .16,
		ry: .14,
		rot: Math.PI,
		weight: .9,
		bright: true
	})
];
var CROSS = [g({
	kind: "ridge",
	x: .5,
	y: .48,
	rx: .02,
	ry: .22,
	rot: Math.PI / 2,
	weight: 1
}), g({
	kind: "ridge",
	x: .5,
	y: .4,
	rx: .14,
	ry: .018,
	rot: 0,
	weight: .8
})];
var WAVE = [
	g({
		kind: "ridge",
		x: .5,
		y: .42,
		rx: .42,
		ry: .02,
		rot: .08,
		weight: .7
	}),
	g({
		kind: "ridge",
		x: .48,
		y: .54,
		rx: .4,
		ry: .02,
		rot: -.06,
		weight: .8
	}),
	g({
		kind: "ridge",
		x: .52,
		y: .66,
		rx: .44,
		ry: .025,
		rot: .05,
		weight: .9
	}),
	g({
		kind: "ridge",
		x: .5,
		y: .78,
		rx: .46,
		ry: .02,
		rot: -.04,
		weight: .6
	})
];
var HAND = [
	g({
		kind: "mass",
		x: .48,
		y: .62,
		rx: .12,
		ry: .1,
		rot: .1,
		weight: 1
	}),
	g({
		kind: "ridge",
		x: .36,
		y: .4,
		rx: .1,
		ry: .012,
		rot: -1.2,
		weight: .55
	}),
	g({
		kind: "ridge",
		x: .44,
		y: .36,
		rx: .12,
		ry: .012,
		rot: -1.45,
		weight: .6
	}),
	g({
		kind: "ridge",
		x: .52,
		y: .35,
		rx: .12,
		ry: .012,
		rot: -1.55,
		weight: .6
	}),
	g({
		kind: "ridge",
		x: .6,
		y: .4,
		rx: .1,
		ry: .012,
		rot: -1.3,
		weight: .5
	})
];
var FIGURE = [
	g({
		kind: "mass",
		x: .52,
		y: .28,
		rx: .06,
		ry: .07,
		rot: .1,
		weight: .6
	}),
	g({
		kind: "mass",
		x: .5,
		y: .48,
		rx: .1,
		ry: .12,
		rot: .3,
		weight: 1
	}),
	g({
		kind: "ridge",
		x: .34,
		y: .46,
		rx: .12,
		ry: .015,
		rot: .7,
		weight: .45
	}),
	g({
		kind: "leg",
		x: .44,
		y: .72,
		rx: .016,
		ry: .12,
		rot: 1.3,
		weight: .5
	}),
	g({
		kind: "leg",
		x: .58,
		y: .72,
		rx: .016,
		ry: .12,
		rot: 1.8,
		weight: .5
	})
];
var RECIPES = [
	{
		name: "UFO",
		test: /\bufo\b|\bsaucer\b|\bspacecraft\b|flying saucer/,
		guides: UFO
	},
	{
		name: "Wolf",
		test: /\bwolf\b|\bcoyote\b|\bdog\b|\bhound\b/,
		guides: WOLF
	},
	{
		name: "Cholla",
		test: /\bcholla\b|\bcactus\b|\bsaguaro\b/,
		guides: CACTUS
	},
	{
		name: "Guitar",
		test: /\bguitar\b/,
		guides: GUITAR
	},
	{
		name: "Moon",
		test: /\bmoon\b|\bluna\b/,
		guides: MOON
	},
	{
		name: "Sun",
		test: /\bsun\b/,
		guides: SUN
	},
	{
		name: "Mesa",
		test: /\bmesa\b|\bmountain\b|\bbutte\b|\bpeak\b/,
		guides: MESA
	},
	{
		name: "Tree",
		test: /\btree\b|\bpine\b|\bcottonwood\b/,
		guides: TREE
	},
	{
		name: "Skull",
		test: /\bskull\b/,
		guides: SKULL
	},
	{
		name: "Eye",
		test: /\beye\b/,
		guides: EYE
	},
	{
		name: "Portrait",
		test: /\bface\b|\bportrait\b|\bwoman\b|\bman\b|\bgirl\b|\bboy\b/,
		guides: FACE
	},
	{
		name: "Bird",
		test: /\braven\b|\beagle\b|\bbird\b|\bowl\b/,
		guides: BIRD
	},
	{
		name: "Horse",
		test: /\bhorse\b/,
		guides: HORSE
	},
	{
		name: "Flower",
		test: /\bflower\b|\brose\b|\bbloom\b/,
		guides: FLOWER
	},
	{
		name: "Phoenix",
		test: /\bphoenix\b|\bcity\b|\bskyline\b|\btown\b/,
		guides: CITY
	},
	{
		name: "Cowboy",
		test: /\bcowboy\b|\brider\b/,
		guides: RIDER
	},
	{
		name: "Road",
		test: /\broad\b|\bhighway\b|county road/,
		guides: ROAD
	},
	{
		name: "Heart",
		test: /\bheart\b/,
		guides: HEART
	},
	{
		name: "Cross",
		test: /\bcross\b/,
		guides: CROSS
	},
	{
		name: "Wave",
		test: /\bwave\b|\bocean\b|\bsea\b/,
		guides: WAVE
	},
	{
		name: "Hand",
		test: /\bhand\b/,
		guides: HAND
	},
	{
		name: "Figure",
		test: /\bfigure\b|\bdancer\b|\bperson\b|\bbody\b/,
		guides: FIGURE
	}
];
function subjectRecipe(subject) {
	const text = subject.trim().toLowerCase();
	if (!text) return null;
	return RECIPES.find((recipe) => recipe.test.test(text))?.name ?? null;
}
function genreSkeleton(genre) {
	const guides = [];
	if (genre.horizon != null) {
		guides.push(g({
			kind: "ridge",
			x: .5,
			y: genre.horizon,
			rx: .48,
			ry: .012,
			rot: 0,
			weight: .4
		}));
		guides.push(g({
			kind: "mass",
			x: .5,
			y: Math.min(.9, genre.horizon + .14),
			rx: .38,
			ry: .07,
			rot: 0,
			weight: .45
		}));
	}
	guides.push(g({
		kind: genre.radial > .5 ? "disc" : "glow",
		x: genre.focus.x,
		y: genre.focus.y,
		rx: genre.radial > .5 ? .14 : .16,
		ry: genre.radial > .5 ? .1 : .11,
		rot: 0,
		weight: .7,
		bright: true
	}));
	if (genre.radial > .5) guides.push(g({
		kind: "scatter",
		x: genre.focus.x,
		y: genre.focus.y,
		rx: .32,
		ry: .24,
		rot: 0,
		weight: .5
	}));
	return guides;
}
function unknownGuides(text, genre) {
	const rng = mulberry32(hashString(text));
	const guides = genreSkeleton(genre);
	const n = 3 + hashString(text) % 3;
	for (let i = 0; i < n; i++) guides.push(g({
		kind: i === 0 ? "mass" : rng() > .5 ? "ridge" : "mass",
		x: .28 + rng() * .44,
		y: .3 + rng() * .36,
		rx: .08 + rng() * .12,
		ry: .045 + rng() * .09,
		rot: rng() * Math.PI,
		weight: .5 + rng() * .5
	}));
	return guides;
}
function guidesFor(subject, genre) {
	const text = subject.trim().toLowerCase();
	if (!text) return genreSkeleton(genre);
	for (const recipe of RECIPES) if (recipe.test.test(text)) return recipe.guides;
	return unknownGuides(text, genre);
}
var PREFER = {
	disc: [
		"dab",
		"bristle",
		"knife",
		"block",
		"wash",
		"stroke"
	],
	dome: [
		"stroke",
		"outline",
		"bristle",
		"wash",
		"dab"
	],
	beam: [
		"wash",
		"streak",
		"stroke",
		"drip",
		"knife",
		"block"
	],
	glow: [
		"wash",
		"glaze",
		"pool"
	],
	mass: [
		"dab",
		"block",
		"wash",
		"bristle",
		"knife"
	],
	ridge: [
		"stroke",
		"drybrush",
		"bristle",
		"knife"
	],
	peak: [
		"knife",
		"stroke",
		"block",
		"dab"
	],
	leg: [
		"stroke",
		"block",
		"bristle",
		"knife"
	],
	eye: [
		"dab",
		"dot",
		"block"
	],
	scatter: [
		"dot",
		"splatter",
		"stroke"
	],
	orb: [
		"wash",
		"glaze",
		"dab",
		"block"
	]
};
function weighted(style, rng) {
	let sum = 0;
	for (const item of style.marks) sum += item.w;
	let r = rng() * sum;
	for (const item of style.marks) {
		r -= item.w;
		if (r <= 0) return item.kind;
	}
	return style.marks[0]?.kind ?? "stroke";
}
function pickKind(style, prefer, rng) {
	const have = prefer.filter((kind) => style.marks.some((m) => m.kind === kind));
	if (have.length && rng() < .82) return have[Math.floor(rng() * have.length)];
	return weighted(style, rng);
}
var Painter = class {
	paper;
	vignette;
	marks = [];
	queue = [];
	paint = null;
	pctx = null;
	rng;
	perf = 0;
	perfMax;
	lastSustain = 0;
	lastX = .5;
	lastY = .5;
	gallopFlip = false;
	lastMusical = 0;
	lastRelease = 0;
	born = 0;
	dirty = true;
	seconds;
	style;
	genre;
	guides;
	colors;
	line;
	w;
	h;
	constructor(config, seed, live = false) {
		this.style = styleById(config.styleId);
		this.genre = genreById(config.genreId);
		const palette = paletteById(config.paletteId);
		this.paper = palette.paper;
		this.vignette = this.genre.vignette;
		this.colors = palette.colors.map(hexToRgb);
		this.line = darken(this.colors[0] ?? {
			r: 0,
			g: 0,
			b: 0
		}, .55);
		this.guides = guidesFor(config.subject, this.genre);
		this.rng = mulberry32(seed || 1);
		this.perfMax = Math.max(18, Math.round(config.seconds * 1.35 * this.style.density));
		this.seconds = config.seconds;
		this.w = 720;
		this.h = 1280;
		if (live && typeof document !== "undefined") {
			this.paint = document.createElement("canvas");
			this.paint.width = this.w;
			this.paint.height = this.h;
			this.pctx = this.paint.getContext("2d");
		}
	}
	begin() {
		if (this.pctx && this.paint) {
			this.pctx.fillStyle = this.paper;
			this.pctx.fillRect(0, 0, this.paint.width, this.paint.height);
		}
		const paperRgb = hexToRgb(this.paper);
		const grain = mix(paperRgb, this.colors[Math.min(2, this.colors.length - 1)] ?? paperRgb, .35);
		this.commit(createMark({
			kind: "grain",
			x: .5,
			y: .5,
			r: grain.r,
			g: grain.g,
			b: grain.b,
			a: .2,
			seed: this.nextSeed()
		}));
		for (const mark of this.groundMarks()) this.commit(mark);
		this.queue = this.skeletonMarks();
	}
	flush() {
		while (this.queue.length) {
			const mark = this.queue.shift();
			if (mark) this.commit(mark);
		}
	}
	tick(now, frame) {
		if (!this.born) this.born = now;
		if (this.queue.length && now - this.lastRelease > 36) {
			const mark = this.queue.shift();
			if (mark) this.commit(mark);
			this.lastRelease = now;
		}
		if (!frame) return;
		const elapsed = Math.min(1, (now - this.born) / (this.seconds * 1e3));
		const allowed = Math.max(6, Math.ceil(this.perfMax * Math.min(1, elapsed + .08)));
		if (this.perf >= this.perfMax || this.perf >= allowed) return;
		const musical = frame.midi != null && frame.clarity >= .88 && frame.sounding;
		const gate = musical && frame.onset;
		const sustain = musical && !frame.onset && frame.speed < .55 && frame.level > .18 && now - this.lastMusical < 1100 && now - this.lastSustain > 680;
		if (!gate && !sustain) return;
		if (gate) this.lastMusical = now;
		if (sustain) this.lastSustain = now;
		this.addPerformance(frame, sustain);
	}
	composite(ctx, w, h) {
		ctx.clearRect(0, 0, w, h);
		if (this.paint) ctx.drawImage(this.paint, 0, 0, w, h);
		else this.paintMarks(ctx, w, h);
		drawVignette(ctx, this.vignette, w, h);
		drawSignature(ctx, w, h);
	}
	renderFull(ctx, w, h) {
		this.paintMarks(ctx, w, h);
		drawVignette(ctx, this.vignette, w, h);
		drawSignature(ctx, w, h);
	}
	async exportBlob(type, w, h, quality) {
		if (typeof document !== "undefined" && document.fonts?.ready) try {
			await document.fonts.ready;
		} catch {}
		const canvas = document.createElement("canvas");
		canvas.width = w;
		canvas.height = h;
		const ctx = canvas.getContext("2d");
		if (!ctx) throw new Error("Could not export the painting.");
		this.renderFull(ctx, w, h);
		const blob = await new Promise((resolve) => canvas.toBlob(resolve, type, quality));
		if (!blob) throw new Error("Could not export the painting.");
		return blob;
	}
	paintMarks(ctx, w, h) {
		ctx.fillStyle = this.paper;
		ctx.fillRect(0, 0, w, h);
		for (const mark of this.marks) drawMark(ctx, mark, w, h);
	}
	commit(mark) {
		this.marks.push(mark);
		this.dirty = true;
		if (this.pctx && this.paint) drawMark(this.pctx, mark, this.paint.width, this.paint.height);
	}
	consumeDirty() {
		const changed = this.dirty;
		this.dirty = false;
		return changed;
	}
	nextSeed() {
		return this.rng() * 1e9 >>> 0;
	}
	tone(guide, t) {
		if (this.style.reveal) return samplePalette(this.colors, .72 + t * .28);
		if (guide?.dark) return this.colors[0] ?? {
			r: 10,
			g: 10,
			b: 10
		};
		if (guide?.bright) return this.colors[Math.max(0, this.colors.length - 2)] ?? {
			r: 255,
			g: 255,
			b: 255
		};
		return samplePalette(this.colors, t);
	}
	stamp(kind, x, y, len, thick, rot, rgb, alpha) {
		const alt = lighten(rgb, .28);
		return createMark({
			kind,
			x,
			y,
			len,
			thick,
			rot,
			r: rgb.r,
			g: rgb.g,
			b: rgb.b,
			a: alpha,
			r2: alt.r,
			g2: alt.g,
			b2: alt.b,
			seed: this.nextSeed(),
			bristles: this.style.bristles,
			bleed: this.style.bleed,
			breakUp: this.style.breakUp,
			keyline: this.style.keyline,
			lr: this.line.r,
			lg: this.line.g,
			lb: this.line.b,
			hardness: this.style.hardness,
			echo: this.style.echo
		});
	}
	groundMarks() {
		const style = this.style;
		const genre = this.genre;
		const marks = [];
		const alpha = clamp((style.alpha[0] + style.alpha[1]) / 2, .18, 1);
		const kind = style.ground;
		if (style.reveal) {
			marks.push(this.stamp("block", .5, .5, .72, 1.15, 0, this.colors[0] ?? {
				r: 8,
				g: 8,
				b: 8
			}, 1));
			return marks;
		}
		const sky = this.colors[Math.max(0, this.colors.length - 2)] ?? {
			r: 200,
			g: 200,
			b: 200
		};
		const mid = samplePalette(this.colors, .55);
		const land = this.colors[Math.min(1, this.colors.length - 1)] ?? mid;
		if (genre.horizon != null) {
			for (let i = 0; i < 4; i++) marks.push(this.stamp(kind === "block" || kind === "knife" ? kind : "wash", .2 + i * .2, genre.horizon * (.25 + i * .14), .34, .05, 0, i % 2 ? sky : mid, alpha * .85));
			for (let i = 0; i < 3; i++) marks.push(this.stamp(kind, .3 + i * .18, genre.horizon + .08 + i * .08, .42, .035, .02, land, Math.min(1, alpha)));
			return marks;
		}
		if (genre.radial > .55) {
			for (let i = 0; i < 9; i++) {
				const ang = i / 9 * Math.PI * 2;
				marks.push(this.stamp(kind === "wash" ? "streak" : kind, genre.focus.x + Math.cos(ang) * .12, genre.focus.y + Math.sin(ang) * .1, .28, .02, ang, i % 2 ? sky : mid, alpha));
			}
			marks.push(this.stamp("wash", genre.focus.x, genre.focus.y, .2, .08, 0, sky, alpha * .8));
			return marks;
		}
		for (let i = 0; i < 4; i++) marks.push(this.stamp(kind, .28 + this.rng() * .44, .22 + this.rng() * .5, .26 + this.rng() * .12, .04, this.rng() * Math.PI, i % 2 ? mid : land, alpha));
		return marks;
	}
	skeletonMarks() {
		const out = [];
		const cap = this.style.spare ? 16 : 42;
		for (const guide of this.guides) {
			if (out.length >= cap) break;
			this.emitGuide(guide, out, cap);
		}
		return out;
	}
	lineKind() {
		if (this.style.reveal) return "scratch";
		for (const kind of [
			"stroke",
			"bristle",
			"drybrush",
			"outline",
			"knife",
			"hatch",
			"streak",
			"dab"
		]) if (this.style.marks.some((mark) => mark.kind === kind)) return kind;
		return this.style.marks[0]?.kind ?? "stroke";
	}
	ink(guide, baseAlpha) {
		if (guide.bright) return Math.max(baseAlpha, .86);
		if (guide.dark) return Math.max(baseAlpha, .72);
		return Math.max(baseAlpha, .5);
	}
	axisLen(nx) {
		return nx * this.w / Math.min(this.w, this.h);
	}
	axisThick(ny) {
		return ny * this.h / Math.min(this.w, this.h);
	}
	emitGuide(guide, out, cap) {
		const style = this.style;
		const prefer = style.reveal ? [
			"scratch",
			"stroke",
			"drybrush"
		] : PREFER[guide.kind];
		const baseAlpha = clamp((style.alpha[0] + style.alpha[1]) / 2, .15, 1);
		const rgb = this.tone(guide, guide.bright ? .9 : guide.dark ? .08 : .62);
		const ink = this.ink(guide, baseAlpha);
		const push = (mark) => {
			if (out.length < cap) out.push(mark);
		};
		const line = this.lineKind();
		if (guide.kind === "disc" || guide.kind === "orb" || guide.kind === "dome") {
			const count = guide.kind === "dome" ? 8 : guide.kind === "orb" ? 12 : 16;
			const span = guide.kind === "dome" ? Math.PI : Math.PI * 2;
			const a0 = guide.kind === "dome" ? Math.PI : 0;
			const chord = guide.kind === "orb" ? this.axisLen(guide.rx) * .42 : this.axisLen(guide.rx) * .2;
			const rim = Math.max(.006, this.axisThick(guide.ry) * (guide.kind === "orb" ? .16 : .28));
			for (let i = 0; i < count; i++) {
				const a = a0 + (i + .5) / count * span;
				push(this.stamp(line, guide.x + Math.cos(a) * guide.rx * .92, guide.y + Math.sin(a) * guide.ry * .92, Math.max(.03, chord), rim, a + Math.PI / 2, rgb, ink));
			}
			push(this.stamp(line, guide.x, guide.y, this.axisLen(guide.rx) * (guide.kind === "dome" ? 1.15 : 1.85), Math.max(.007, this.axisThick(guide.ry) * .22), guide.rot, rgb, ink));
			push(this.stamp(pickKind(style, [
				"wash",
				"glaze",
				"pool",
				"dab",
				"block"
			], this.rng), guide.x, guide.y, this.axisLen(guide.rx) * (guide.kind === "dome" ? .55 : .42), Math.max(.02, this.axisThick(guide.ry) * .7), guide.rot, rgb, ink * .62));
			return;
		}
		if (guide.kind === "beam" || guide.kind === "ridge" || guide.kind === "leg") {
			const unit = Math.min(this.w, this.h);
			const along = Math.max(guide.rx * this.w, guide.ry * this.h) * 2 / unit;
			const across = Math.max(.008, Math.min(guide.rx * this.w, guide.ry * this.h) * 1.6 / unit);
			push(this.stamp(line, guide.x, guide.y, along, across, guide.rot, rgb, ink));
			if (guide.kind === "beam") push(this.stamp("wash", guide.x, guide.y, along * .42, across * 1.8, guide.rot, this.tone(guide, .96), Math.min(.5, ink)));
			return;
		}
		if (guide.kind === "glow") {
			push(this.stamp("wash", guide.x, guide.y, Math.max(guide.rx, .12), guide.ry, 0, rgb, baseAlpha * .75));
			return;
		}
		if (guide.kind === "scatter") {
			const dots = style.spare ? 4 : 8;
			for (let i = 0; i < dots; i++) push(this.stamp(pickKind(style, [
				"dot",
				"splatter",
				"dab",
				"stroke"
			], this.rng), guide.x + (this.rng() - .5) * guide.rx * 2, guide.y + (this.rng() - .5) * guide.ry * 2, .03 + this.rng() * .04, .008, this.rng() * Math.PI, this.tone(guide, .4 + this.rng() * .5), baseAlpha));
			return;
		}
		if (guide.kind === "eye") {
			push(this.stamp("dab", guide.x, guide.y, guide.rx * 2.2, guide.ry, 0, this.tone(guide, guide.dark ? .05 : .9), 1));
			return;
		}
		const count = style.spare ? 2 : 4;
		for (let i = 0; i < count; i++) push(this.stamp(pickKind(style, prefer, this.rng), guide.x + (this.rng() - .5) * guide.rx, guide.y + (this.rng() - .5) * guide.ry, Math.max(.05, guide.rx * (.6 + this.rng() * .5)), Math.max(.012, guide.ry * .4) * style.size, guide.rot + (this.rng() - .5) * .6, rgb, baseAlpha));
	}
	addPerformance(frame, sustain) {
		const style = this.style;
		const genre = this.genre;
		const kind = weighted(style, this.rng);
		let t = style.pitchMap ? frame.pitchNorm : this.rng();
		if (style.reveal) t = .62 + frame.pitchNorm * .38;
		if (frame.mood < -.15) t *= .72;
		if (frame.mood > .2) t = .22 + t * .78;
		let rgb = samplePalette(this.colors, t);
		if (frame.mood < -.15) {
			rgb = mix(rgb, this.colors[0] ?? rgb, Math.min(.5, -frame.mood * .45));
			rgb = {
				r: rgb.r * .9,
				g: rgb.g * .96,
				b: Math.min(255, rgb.b * 1.08 + 6)
			};
		} else if (frame.mood > .2) rgb = mix(rgb, this.colors[Math.min(this.colors.length - 1, 3)] ?? rgb, .22);
		const pos = this.place(frame);
		const energy = frame.onset ? Math.max(frame.level, frame.strength * .85) : frame.level * .5;
		let len = .05 * style.length * (.5 + (1 - frame.staccato) * .95) * (.55 + energy);
		let thick = .012 * style.size * (.4 + energy * 1.45);
		if (frame.speed > .7) {
			len *= .7;
			thick *= .78;
		}
		if (sustain) {
			len *= 1.12;
			thick *= .7;
		}
		if (frame.gallop) {
			this.gallopFlip = !this.gallopFlip;
			if (this.gallopFlip) {
				len *= .48;
				thick *= .62;
			}
		}
		if (kind === "wash" || kind === "glaze" || kind === "pool") len *= 1.45;
		if (kind === "dot" || kind === "splatter") len *= .8;
		if (kind === "knife" || kind === "block") {
			len *= 1.05;
			thick *= 1.35;
		}
		if (kind === "drip") len *= 1.35;
		const late = this.perf / this.perfMax;
		const fade = 1 - late * .4;
		len = clamp(len * (1 - late * .15), .02, .36);
		thick = clamp(thick, .004, .09);
		let alpha = style.alpha[0] + (style.alpha[1] - style.alpha[0]) * energy;
		if (frame.mood < -.2) alpha *= .82;
		if (sustain) alpha *= .65;
		alpha = clamp(alpha * fade, .05, 1);
		let rot = genre.flow * Math.PI;
		if (style.axis === "horiz") rot = 0;
		else if (style.axis === "vert") rot = Math.PI / 2;
		else if (style.axis === "diag") rot = -.85;
		if (genre.diagonal > .65) rot = -.9;
		if (genre.radial > .7) rot = Math.atan2(pos.y - genre.focus.y, pos.x - genre.focus.x);
		rot += (this.rng() - .5) * (style.axis === "free" ? .7 : .16);
		const dx = pos.x - this.lastX;
		const dy = pos.y - this.lastY;
		if (Math.hypot(dx, dy) < .025 && frame.strength < .8 && this.rng() < .65) {
			pos.x = clamp(pos.x + (this.rng() - .5) * .12, .04, .96);
			pos.y = clamp(pos.y + (this.rng() - .5) * .12, .05, .92);
		}
		this.lastX = pos.x;
		this.lastY = pos.y;
		this.commit(this.stamp(kind, pos.x, pos.y, len, thick, rot, rgb, alpha));
		this.perf += 1;
		if (style.drip > .45 && this.rng() < style.drip * .45 && this.perf < this.perfMax) {
			this.commit(this.stamp("drip", pos.x, pos.y, len * 1.1, thick * .8, Math.PI / 2, rgb, alpha));
			this.perf += 1;
		}
	}
	place(frame) {
		const { style, genre, guides } = this;
		const note = frame.midi == null ? Math.floor(frame.pitchNorm * 12) : (Math.round(frame.midi) % 12 + 12) % 12;
		const snap = style.allover ? .2 : guides.length ? .7 : 0;
		if (guides.length && this.rng() < snap) {
			const guide = guides[(note + Math.floor(frame.pitchNorm * 5)) % guides.length];
			return {
				x: clamp(guide.x + (this.rng() - .5) * guide.rx * 1.7, .04, .96),
				y: clamp(guide.y + (this.rng() - .5) * guide.ry * 1.9, .05, .92)
			};
		}
		if (genre.radial > .55) {
			const ang = this.rng() * Math.PI * 2;
			const rad = .04 + this.rng() * .38 * (.45 + frame.level);
			return {
				x: clamp(genre.focus.x + Math.cos(ang) * rad * .72, .04, .96),
				y: clamp(genre.focus.y + Math.sin(ang) * rad, .05, .92)
			};
		}
		if (genre.diagonal > .6) {
			const along = frame.pitchNorm * .75 + this.rng() * .2;
			return {
				x: clamp(.12 + along * .76, .04, .96),
				y: clamp(.84 - along * .62, .05, .92)
			};
		}
		const bands = genre.bands;
		const ticket = this.rng() * (bands.sky + bands.mid + bands.ground);
		let y;
		if (ticket < bands.sky) y = .05 + this.rng() * .28;
		else if (ticket < bands.sky + bands.mid) y = .34 + this.rng() * .3;
		else y = .66 + this.rng() * .26;
		y -= (frame.pitchNorm - .5) * .1;
		let x = .08 + this.rng() * .84;
		if (genre.symmetry > .6 && this.rng() < .5) x = genre.focus.x - (x - genre.focus.x);
		return {
			x: clamp(x, .04, .96),
			y: clamp(y, .05, .92)
		};
	}
};
function renderStill(canvas, config, seed) {
	const painter = new Painter(config, seed, false);
	painter.begin();
	painter.flush();
	const ctx = canvas.getContext("2d");
	if (!ctx) return;
	painter.renderFull(ctx, canvas.width, canvas.height);
}
function HomeScreen() {
	const push = useStudio((state) => state.push);
	const canvasRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		canvas.width = 720;
		canvas.height = 1280;
		renderStill(canvas, DEFAULT_CONFIG, 481516);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex h-dvh w-full max-w-md flex-col px-4 pt-safe pb-safe",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "shrink-0 pt-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "track-brand text-[11px] text-brand",
						children: "DANIEL LEE"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "display mt-1",
						children: [
							"SOUR",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							"PAINT"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-[2.15rem] leading-none text-signal sm:text-5xl",
						children: "STUDIOS"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GlowRule, { className: "mt-2" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1.5 text-sm text-muted",
						children: "Play it. The playing paints."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto mt-2 flex min-h-0 w-full flex-1 items-center justify-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "aspect-[9/16] h-full max-h-full overflow-hidden rounded-3xl border border-line shadow-glow",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
						ref: canvasRef,
						className: "h-full w-full",
						"aria-label": "Still of a watercolor UFO over the desert"
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1.5 shrink-0 text-center text-[11px] leading-snug text-subtle",
				children: "Watercolor · Desert · UFO. Yours changes when you play."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 grid shrink-0 gap-2 pb-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => push({ name: "gallery" }),
					className: "rounded-2xl border border-line bg-elevated px-4 py-2.5 text-left shadow-glow",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block font-display text-4xl leading-none text-brand",
						children: "CANVAS"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-0.5 block text-sm text-muted",
						children: "Perform to paint"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => push({ name: "book" }),
					className: "door-signal rounded-2xl border border-line bg-elevated px-4 py-2.5 text-left",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block font-display text-4xl leading-none text-signal",
						children: "SONGBOOK"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-0.5 block text-sm text-muted",
						children: "Lyrics, tap tempo, tuner"
					})]
				})]
			})
		]
	});
}
function slug(value) {
	return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "painting";
}
function downloadBlob(blob, filename) {
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	window.setTimeout(() => URL.revokeObjectURL(url), 4e3);
}
async function shareOrDownload(blob, filename, title) {
	const file = new File([blob], filename, { type: blob.type || "application/octet-stream" });
	const nav = navigator;
	if (nav.share && nav.canShare?.({ files: [file] })) {
		await nav.share({
			files: [file],
			title
		});
		return;
	}
	downloadBlob(blob, filename);
}
function PieceScreen({ id }) {
	const pop = useStudio((state) => state.pop);
	const push = useStudio((state) => state.push);
	const setDraft = useStudio((state) => state.setDraft);
	const [record, setRecord] = (0, import_react.useState)(null);
	const [missing, setMissing] = (0, import_react.useState)(false);
	const [imageUrl, setImageUrl] = (0, import_react.useState)(null);
	const [videoUrl, setVideoUrl] = (0, import_react.useState)(null);
	const [view, setView] = (0, import_react.useState)("image");
	const [confirm, setConfirm] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		let dead = false;
		let image = null;
		let video = null;
		getPainting(id).then((found) => {
			if (dead) return;
			if (!found) {
				setMissing(true);
				return;
			}
			image = URL.createObjectURL(found.png);
			video = found.video ? URL.createObjectURL(found.video) : null;
			setRecord(found);
			setImageUrl(image);
			setVideoUrl(video);
		}).catch(() => {
			if (!dead) setMissing(true);
		});
		return () => {
			dead = true;
			if (image) URL.revokeObjectURL(image);
			if (video) URL.revokeObjectURL(video);
		};
	}, [id]);
	const base = slug(`${record?.title ?? "painting"}-${record?.styleName ?? "canvas"}`);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-dvh w-full max-w-3xl flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
			title: record?.title ?? "Painting",
			onBack: pop
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex-1 space-y-4 px-4 pb-8",
			children: [
				missing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "pt-8 text-muted",
					children: "That painting is not on this device."
				}),
				!missing && !record && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "pt-8 text-muted",
					children: "Opening…"
				}),
				record && imageUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [
							record.styleName,
							" · ",
							record.genreName,
							" · ",
							record.paletteName,
							record.config.subject ? ` · ${record.config.subject}` : ""
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-subtle",
						children: format(record.createdAt, "MMM d, h:mm a")
					}),
					record.hasAudio && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "The video has the mic from this take."
					}),
					videoUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-2",
						role: "tablist",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setView("image"),
							className: view === "image" ? "h-11 rounded-full bg-brand text-ink" : "h-11 rounded-full border border-line",
							children: "Image"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setView("video"),
							className: view === "video" ? "h-11 rounded-full bg-brand text-ink" : "h-11 rounded-full border border-line",
							children: "Video"
						})]
					}),
					view === "image" || !videoUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: imageUrl,
						alt: record.title,
						className: "mx-auto max-h-[62dvh] w-full rounded-3xl object-contain"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
						src: videoUrl,
						controls: true,
						playsInline: true,
						className: "mx-auto max-h-[62dvh] w-full rounded-3xl bg-black"
					}),
					!record.hasVideo && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "This browser did not record video. The PNG is saved."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "primary",
								onClick: () => downloadBlob(record.png, `${base}.png`),
								children: "PNG"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								disabled: !record.video,
								onClick: () => record.video && downloadBlob(record.video, `${base}.webm`),
								children: "Video"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "soft",
								onClick: () => void shareOrDownload(record.png, `${base}.png`, `Sour Paint Studios — ${record.title}`),
								children: "Share image"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "soft",
								disabled: !record.video,
								onClick: () => record.video && void shareOrDownload(record.video, `${base}.webm`, `Sour Paint Studios — ${record.title}`),
								children: "Share video"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						full: true,
						onClick: () => {
							setDraft(record.config);
							push({ name: "setup" });
						},
						children: "Paint again"
					}),
					confirm ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							onClick: () => setConfirm(false),
							children: "Keep"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => {
								deletePainting(id).then(pop);
							},
							children: "Delete"
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setConfirm(true),
						className: "h-11 text-sm text-subtle",
						children: "Delete painting"
					})
				] })
			]
		})]
	});
}
/**
* Sour Paint Studios listener.
* Pitch (McLeod / NSDF), onset, level, and speed follow the studio's proven
* engine. Mood, staccato, and gallop are painter-only additions.
*/
var SHARPS = [
	"C",
	"C#",
	"D",
	"D#",
	"E",
	"F",
	"F#",
	"G",
	"G#",
	"A",
	"A#",
	"B"
];
var mpmScratch = null;
function detectPitchMPM(buf, W, sr, minLag, maxLag) {
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
		nsdf[tau] = m > 1e-12 ? 2 * r / m : 0;
	}
	const peaks = [];
	let tau = 1;
	while (tau < maxLag && nsdf[tau] > 0) tau++;
	let inPos = false;
	let best = 0;
	let bestTau = -1;
	for (; tau < maxLag; tau++) if (!inPos) {
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
	if (inPos && bestTau > 0 && bestTau < maxLag - 1) peaks.push(bestTau);
	let highest = 0;
	for (let i = 0; i < peaks.length; i++) if (peaks[i] >= minLag && nsdf[peaks[i]] > highest) highest = nsdf[peaks[i]];
	if (highest <= 0) return null;
	let chosen = -1;
	for (let i = 0; i < peaks.length; i++) if (peaks[i] >= minLag && nsdf[peaks[i]] >= .9 * highest) {
		chosen = peaks[i];
		break;
	}
	if (chosen < 1) return null;
	const a = nsdf[chosen - 1];
	const b = nsdf[chosen];
	const c = nsdf[chosen + 1];
	const denom = a - 2 * b + c;
	let shift = denom !== 0 ? .5 * (a - c) / denom : 0;
	if (shift > 1 || shift < -1) shift = 0;
	return {
		freq: sr / (chosen + shift),
		clarity: b - .25 * (a - c) * shift
	};
}
function freqToMidi(f, a4 = 440) {
	return 69 + 12 * Math.log(f / a4) / Math.LN2;
}
function midiToFreq(m, a4 = 440) {
	return a4 * Math.pow(2, (m - 69) / 12);
}
function median(arr) {
	const s = arr.slice().sort((x, y) => x - y);
	return s[Math.floor(s.length / 2)] ?? 0;
}
function gallopOf(times) {
	if (times.length < 5) return false;
	const iois = [];
	for (let i = times.length - 4; i < times.length; i++) {
		if (i <= 0) continue;
		iois.push(times[i] - times[i - 1]);
	}
	if (iois.length < 4) return false;
	const [a, b, c, d] = iois;
	const shortLong = (x, y) => x < y * .72 && x > 40 && y < 700;
	return shortLong(a, b) && shortLong(c, d) && Math.abs(a - c) < Math.max(30, a * .5);
}
var SourPaintListener = class {
	a4;
	minClarity;
	onFrame = null;
	running = false;
	ctx = null;
	stream = null;
	source = null;
	analyser = null;
	buf = null;
	fbuf = null;
	W = 0;
	minLag = 0;
	maxLag = 0;
	raf = 0;
	hist = [];
	rhist = [];
	onsets = [];
	peak = .1;
	prevR = 0;
	rate = 0;
	lastOnset = 0;
	lastPitchTs = 0;
	lastHeard = 0;
	pitchNorm = .5;
	midi = null;
	freq = 0;
	clarity = 0;
	mood = 0;
	staccato = .35;
	noteStart = 0;
	notePeak = 0;
	holding = false;
	loop = (ts) => {
		if (!this.running) return;
		this.raf = requestAnimationFrame(this.loop);
		this.tick(ts);
	};
	constructor(opts) {
		this.a4 = opts?.a4 ?? 440;
		this.minClarity = opts?.minClarity ?? .88;
	}
	start(onFrame) {
		if (onFrame) this.onFrame = onFrame;
		if (this.running) return Promise.resolve();
		const Ctx = window.AudioContext || window.webkitAudioContext;
		if (!Ctx || !navigator.mediaDevices?.getUserMedia) return Promise.reject(/* @__PURE__ */ new Error("Microphone not supported on this page (needs HTTPS)."));
		this.ctx = new Ctx();
		if (this.ctx.state === "suspended") this.ctx.resume();
		return navigator.mediaDevices.getUserMedia({
			audio: {
				echoCancellation: false,
				noiseSuppression: false,
				autoGainControl: false
			},
			video: false
		}).then((stream) => {
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
			while (W < ctx.sampleRate * .04) W *= 2;
			an.fftSize = W;
			an.smoothingTimeConstant = 0;
			src.connect(hp);
			hp.connect(lp);
			lp.connect(an);
			this.source = src;
			this.analyser = an;
			this.W = W;
			this.buf = new Float32Array(/* @__PURE__ */ new ArrayBuffer(W * 4));
			this.fbuf = new Float32Array(/* @__PURE__ */ new ArrayBuffer(an.frequencyBinCount * 4));
			this.minLag = Math.floor(ctx.sampleRate / 1400);
			this.maxLag = Math.min(W - 2, Math.ceil(ctx.sampleRate / 58));
			this.running = true;
			this.raf = requestAnimationFrame(this.loop);
		});
	}
	mediaStream() {
		return this.stream;
	}
	stop() {
		this.running = false;
		if (this.raf) cancelAnimationFrame(this.raf);
		this.raf = 0;
		try {
			this.source?.disconnect();
		} catch {}
		this.stream?.getTracks().forEach((track) => track.stop());
		try {
			this.ctx?.close();
		} catch {}
		this.ctx = null;
		this.stream = null;
		this.source = null;
		this.analyser = null;
		this.onFrame = null;
	}
	tick(ts) {
		const buf = this.buf;
		const analyser = this.analyser;
		const ctx = this.ctx;
		if (!buf || !analyser || !ctx) return;
		analyser.getFloatTimeDomainData(buf);
		const n = buf.length;
		const tail = Math.min(512, n);
		let sum = 0;
		for (let i = n - tail; i < n; i++) sum += buf[i] * buf[i];
		const rms = Math.sqrt(sum / tail);
		this.peak = Math.max(rms, this.peak * .9993, .03);
		const level = Math.min(1, rms / this.peak);
		const sounding = rms > .006;
		const now = Date.now();
		const rh = this.rhist;
		rh.push(rms);
		if (rh.length > 6) rh.shift();
		const ref = rh.length >= 5 ? Math.min(rh[rh.length - 4] ?? rms, rh[rh.length - 3] ?? rms, rh[rh.length - 2] ?? rms) : rms;
		const onset = sounding && rms - ref > Math.max(.008, .1 * this.peak) && rms > ref * 1.25 && rms > this.prevR && now - this.lastOnset > 70;
		this.prevR = rms;
		let strength = 0;
		if (onset) {
			this.lastOnset = now;
			this.onsets.push(now);
			strength = Math.max(.15, Math.min(1, level * .8 + (rms - ref) * 2));
			this.holding = true;
			this.noteStart = now;
			this.notePeak = rms;
		}
		if (this.holding) {
			const age = now - this.noteStart;
			if (!sounding || rms < this.notePeak * .42) {
				const chop = age < 140 ? .95 : age < 280 ? .55 : .12;
				this.staccato += (chop - this.staccato) * .45;
				this.holding = false;
			} else if (age > 520) {
				this.staccato += (.08 - this.staccato) * .15;
				this.holding = false;
			}
		}
		const cutoff = now - 2500;
		while (this.onsets.length && this.onsets[0] < cutoff) this.onsets.shift();
		this.rate += (this.onsets.length / 2.5 - this.rate) * .05;
		const speed = Math.max(0, Math.min(1, (this.rate - .8) / 5.5));
		if (ts - this.lastPitchTs >= 30) {
			this.lastPitchTs = ts;
			if (sounding) {
				const p = detectPitchMPM(buf, this.W, ctx.sampleRate, this.minLag, this.maxLag);
				if (p && p.clarity >= .8 && p.freq >= 60 && p.freq <= 1400) {
					this.clarity = p.clarity;
					const midiFloat = freqToMidi(p.freq, this.a4);
					this.pitchNorm = Math.max(0, Math.min(1, (midiFloat - 40) / 48));
					if (p.clarity >= this.minClarity) {
						const h = this.hist;
						if (h.length && Math.abs(midiFloat - median(h)) > .6) h.length = 0;
						h.push(midiFloat);
						if (h.length > 7) h.shift();
						this.lastHeard = now;
						if (h.length >= 2) {
							this.midi = median(h);
							this.freq = midiToFreq(this.midi, this.a4);
						}
					}
				} else this.clarity *= .82;
				this.senseMood();
			}
			if (this.lastHeard && now - this.lastHeard > 1500) {
				this.lastHeard = 0;
				this.hist.length = 0;
				this.midi = null;
				this.freq = 0;
			}
			if (!sounding) this.mood += (0 - this.mood) * .04;
		}
		const midi = this.midi;
		let name = "";
		let oct = null;
		let cents = 0;
		if (midi !== null) {
			const nearest = Math.round(midi);
			name = SHARPS[(nearest % 12 + 12) % 12] ?? "";
			oct = Math.floor(nearest / 12) - 1;
			cents = (midi - nearest) * 100;
		}
		this.onFrame?.({
			rms,
			level,
			sounding,
			onset,
			strength,
			rate: this.rate,
			speed,
			freq: this.freq,
			midi,
			pitchNorm: this.pitchNorm,
			note: name,
			octave: oct,
			cents,
			clarity: this.clarity,
			mood: this.mood,
			staccato: this.staccato,
			gallop: gallopOf(this.onsets)
		});
	}
	senseMood() {
		const analyser = this.analyser;
		const ctx = this.ctx;
		const fbuf = this.fbuf;
		if (!analyser || !ctx || !fbuf) return;
		analyser.getFloatFrequencyData(fbuf);
		const chroma = /* @__PURE__ */ new Float32Array(12);
		const binHz = ctx.sampleRate / analyser.fftSize;
		for (let i = 2; i < fbuf.length; i++) {
			const hz = i * binHz;
			if (hz < 70 || hz > 1800) continue;
			const db = fbuf[i];
			if (db < -58) continue;
			const mag = Math.pow(10, db / 20);
			const pc = (Math.round(freqToMidi(hz, this.a4)) % 12 + 12) % 12;
			chroma[pc] += mag;
		}
		let root = 0;
		for (let i = 1; i < 12; i++) if (chroma[i] > chroma[root]) root = i;
		const maj = chroma[(root + 4) % 12];
		const min = chroma[(root + 3) % 12];
		const third = maj + min;
		if (third < .02) return;
		const raw = (maj - min) / third;
		this.mood += (raw - this.mood) * .12;
	}
};
var primed = null;
var primedReady = null;
function primeMic() {
	cancelPrimed();
	const ear = new SourPaintListener();
	primed = ear;
	primedReady = ear.start().then(() => true).catch(() => {
		ear.stop();
		if (primed === ear) {
			primed = null;
			primedReady = null;
		}
		return false;
	});
}
function cancelPrimed() {
	primed?.stop();
	primed = null;
	primedReady = null;
}
function takePrimed() {
	const listener = primed;
	const ready = primedReady ?? Promise.resolve(false);
	primed = null;
	primedReady = null;
	return {
		listener,
		ready
	};
}
var SUBJECTS = [
	"UFO",
	"desert wolf",
	"cholla",
	"guitar",
	"moon",
	"mesa",
	"skull",
	"raven",
	"cowboy",
	"portrait"
];
var LENGTHS = [
	30,
	60,
	90
];
function restRotation(index, count) {
	const slice = 360 / count;
	return (360 - (index * slice + slice / 2)) % 360;
}
function PaletteWheel({ paletteId, locked, onLock, onPick }) {
	const count = PALETTES.length;
	const index = Math.max(0, PALETTES.findIndex((palette) => palette.id === paletteId));
	const [rotation, setRotation] = (0, import_react.useState)(() => restRotation(index, count));
	const [spinning, setSpinning] = (0, import_react.useState)(false);
	const pending = (0, import_react.useRef)(index);
	const palette = PALETTES[index] ?? PALETTES[0];
	(0, import_react.useEffect)(() => {
		if (spinning) return;
		setRotation(restRotation(index, count));
	}, [
		index,
		count,
		spinning
	]);
	function spin() {
		if (locked || spinning) return;
		let next = Math.floor(Math.random() * count);
		if (count > 1 && next === index) next = (next + 1) % count;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			onPick(PALETTES[next].id);
			setRotation(restRotation(next, count));
			return;
		}
		pending.current = next;
		const currentMod = (rotation % 360 + 360) % 360;
		let delta = restRotation(next, count) - currentMod;
		if (delta < 0) delta += 360;
		setSpinning(true);
		setRotation(rotation + 1440 + delta);
	}
	const stops = PALETTES.map((item, i) => {
		return `${paletteSwatch(item)} ${i / count * 360}deg ${(i + 1) / count * 360}deg`;
	}).join(", ");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative mx-auto h-52 w-52",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute top-0 left-1/2 z-10 h-4 w-4 -translate-x-1/2 -translate-y-1 bg-signal",
					style: { clipPath: "polygon(50% 100%, 0 0, 100% 0)" }
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "spin-wheel h-full w-full rounded-full border border-line",
					onTransitionEnd: () => {
						if (!spinning) return;
						setSpinning(false);
						const landed = PALETTES[pending.current];
						if (landed) onPick(landed.id);
					},
					style: {
						background: `conic-gradient(${stops})`,
						transform: `rotate(${rotation}deg)`,
						transition: spinning ? "transform 2.6s cubic-bezier(0.12, 0.62, 0.08, 1)" : "none"
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute inset-[28%] flex items-center justify-center rounded-full bg-background px-2 text-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs leading-tight",
						children: spinning ? "Spinning" : palette.name
					})
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 flex justify-center gap-1",
			children: palette.colors.map((color) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "h-6 w-6 rounded-full border border-line",
				style: { background: color }
			}, color))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				full: true,
				onClick: spin,
				disabled: locked || spinning,
				children: "Spin"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: locked ? "primary" : "soft",
				onClick: () => onLock(!locked),
				children: locked ? "Locked" : "Lock"
			})]
		})
	] });
}
function Still({ config }) {
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const canvas = ref.current;
		if (!canvas) return;
		const timer = window.setTimeout(() => {
			canvas.width = 360;
			canvas.height = 640;
			renderStill(canvas, config, hashString(`${config.styleId}|${config.genreId}|${config.paletteId}|${config.subject.trim().toLowerCase()}`) || 1);
		}, 360);
		return () => window.clearTimeout(timer);
	}, [config]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref,
		className: "h-full w-full",
		"aria-label": "Preview of the subject in this style"
	});
}
function SetupScreen() {
	const pop = useStudio((state) => state.pop);
	const push = useStudio((state) => state.push);
	const draft = useStudio((state) => state.draft);
	const setDraft = useStudio((state) => state.setDraft);
	const resetDraft = useStudio((state) => state.resetDraft);
	const [group, setGroup] = (0, import_react.useState)(styleById(draft.styleId).group);
	const [query, setQuery] = (0, import_react.useState)("");
	const [locked, setLocked] = (0, import_react.useState)(false);
	const style = styleById(draft.styleId);
	const genre = genreById(draft.genreId);
	const shown = STYLES.filter((item) => {
		const q = query.trim().toLowerCase();
		if (q) return item.name.toLowerCase().includes(q) || item.blurb.toLowerCase().includes(q);
		return item.group === group;
	});
	function start(config) {
		if (config.source === "mic") primeMic();
		push({
			name: "stage",
			config
		});
	}
	function jam() {
		const config = rollJam(draft.source);
		if (locked) config.paletteId = draft.paletteId;
		if (config.source === "mic") primeMic();
		setDraft(config);
		push({
			name: "splash",
			config
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-dvh w-full max-w-3xl flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
				title: "Setup",
				onBack: pop
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 space-y-6 overflow-y-auto px-4 pb-40",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "All four picks are optional. Skip them and it still paints."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mx-auto aspect-[9/16] h-[28dvh] overflow-hidden rounded-3xl border border-line",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Still, { config: draft })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-3xl bg-elevated p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-baseline justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display text-3xl",
									children: "Style"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-subtle",
									children: STYLES.length
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "field mt-3",
								value: query,
								onChange: (event) => setQuery(event.target.value),
								placeholder: "Search styles",
								"aria-label": "Search styles"
							}),
							!query && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 flex gap-2 overflow-x-auto pb-1",
								children: STYLE_GROUPS.map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setGroup(name),
									className: name === group ? "h-10 shrink-0 rounded-full bg-brand px-3 text-sm text-ink" : "h-10 shrink-0 rounded-full border border-line px-3 text-sm",
									children: name
								}, name))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex flex-wrap gap-2",
								children: [shown.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setDraft({ styleId: item.id }),
									className: item.id === draft.styleId ? "h-10 rounded-full bg-brand px-3 text-sm text-ink" : "h-10 rounded-full border border-line px-3 text-sm",
									children: item.name
								}, item.id)), shown.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted",
									children: "No style by that name."
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm text-muted",
								children: style.blurb
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-3xl bg-elevated p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-3xl",
								children: "Genre"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 flex flex-wrap gap-2",
								children: GENRES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setDraft({ genreId: item.id }),
									className: item.id === draft.genreId ? "h-10 rounded-full bg-brand px-3 text-sm text-ink" : "h-10 rounded-full border border-line px-3 text-sm",
									children: item.name
								}, item.id))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm text-muted",
								children: genre.blurb
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-3xl bg-elevated p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-3xl",
								children: "Palette"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted",
								children: "Spin it. It ticks through the studio palettes and lands."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaletteWheel, {
									paletteId: draft.paletteId,
									locked,
									onLock: setLocked,
									onPick: (paletteId) => setDraft({ paletteId })
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-3xl bg-elevated p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-3xl",
								children: "Subject"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted",
								children: "Type one, or tap a word. The field starts as UFO. Tap it and it selects, so the next word replaces it."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "field mt-3",
								value: draft.subject,
								onChange: (event) => setDraft({ subject: event.target.value }),
								onFocus: (event) => event.currentTarget.select(),
								placeholder: "UFO, desert wolf, cholla",
								"aria-label": "Subject"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-signal",
								children: subjectRecipe(draft.subject) ? `Skeleton locked: ${subjectRecipe(draft.subject)}.` : draft.subject.trim() ? "No named skeleton for that word. It still builds a shape from the letters." : "Blank uses the genre shape."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 flex flex-wrap gap-2",
								children: SUBJECTS.map((subject) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setDraft({ subject }),
									className: "h-10 rounded-full border border-line px-3 text-sm",
									children: subject
								}, subject))
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-3xl bg-elevated p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-3xl",
								children: "Length"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 grid grid-cols-3 gap-2",
								role: "radiogroup",
								"aria-label": "Length",
								children: LENGTHS.map((seconds) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									role: "radio",
									"aria-checked": draft.seconds === seconds,
									onClick: () => setDraft({ seconds }),
									className: draft.seconds === seconds ? "h-12 rounded-full bg-brand text-ink" : "h-12 rounded-full border border-line",
									children: [seconds, "s"]
								}, seconds))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm text-muted",
								children: "Fits a reel. Done ends it early."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-3xl bg-elevated p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-3xl",
								children: "Input"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted",
								children: "Mic is the real brush. Tender and Hard are written parts, so the same subject can be compared without a guitar."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 grid grid-cols-3 gap-2",
								children: [
									["mic", "Mic"],
									["tender", "Tender"],
									["hard", "Hard"]
								].map(([source, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-pressed": draft.source === source,
									onClick: () => setDraft({ source }),
									className: draft.source === source ? "h-12 rounded-full bg-brand text-sm text-ink" : "h-12 rounded-full border border-line text-sm",
									children: label
								}, source))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: resetDraft,
								className: "mt-4 h-11 text-sm text-muted",
								children: "Reset picks"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "pb-safe fixed inset-x-0 bottom-0 border-t border-line bg-background px-4 pt-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto grid max-w-3xl gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						full: true,
						onClick: () => start(draft),
						children: "Start painting"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						full: true,
						onClick: jam,
						children: "Get to the jam"
					})]
				})
			})
		]
	});
}
function SplashScreen({ config }) {
	const replaceTop = useStudio((state) => state.replaceTop);
	const pop = useStudio((state) => state.pop);
	const style = styleById(config.styleId);
	const genre = genreById(config.genreId);
	const palette = paletteById(config.paletteId);
	(0, import_react.useEffect)(() => {
		const timer = window.setTimeout(() => replaceTop({
			name: "stage",
			config
		}), 1200);
		return () => window.clearTimeout(timer);
	}, [config, replaceTop]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-dvh flex-col justify-between px-6 pt-safe pb-safe",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => {
					cancelPrimed();
					pop();
				},
				className: "mt-4 h-11 self-start text-sm text-muted",
				children: "Back"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "track-brand text-xs text-brand",
					children: "GET TO THE JAM"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-3 font-display text-6xl leading-none",
					children: style.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-xl",
					children: genre.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xl text-signal",
					children: palette.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-lg text-muted",
					children: config.subject || "No subject"
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "pb-6 text-sm text-subtle",
				children: [
					config.seconds,
					" seconds · ",
					config.source === "mic" ? "Microphone" : config.source === "hard" ? "Hard practice" : "Tender practice"
				]
			})
		]
	});
}
function BookScreen() {
	const pop = useStudio((state) => state.pop);
	const push = useStudio((state) => state.push);
	const songs = useStudio((state) => state.songs);
	const setSongs = useStudio((state) => state.setSongs);
	const [title, setTitle] = (0, import_react.useState)("");
	function add() {
		const name = title.trim();
		if (!name) return;
		const song = {
			id: crypto.randomUUID(),
			title: name,
			subtitle: "",
			lyrics: "",
			updatedAt: Date.now()
		};
		const next = [song, ...songs];
		setSongs(next);
		persistSongs(next);
		setTitle("");
		push({
			name: "read",
			id: song.id
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-dvh w-full max-w-3xl flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
			title: "Songbook",
			onBack: pop
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4 px-4 pb-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						onClick: () => push({ name: "tuner" }),
						children: "Tuner"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						onClick: () => push({ name: "tempo" }),
						children: "Tap tempo"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "field",
						value: title,
						onChange: (event) => setTitle(event.target.value),
						placeholder: "New song title",
						"aria-label": "New song title",
						onKeyDown: (event) => {
							if (event.key === "Enter") add();
						}
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: add,
						children: "Add"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "space-y-2",
					children: [songs.map((song) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => push({
							name: "read",
							id: song.id
						}),
						className: "w-full rounded-3xl border border-line bg-elevated px-4 py-4 text-left",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-lg",
							children: song.title
						}), song.subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-1 block text-sm text-subtle",
							children: song.subtitle
						})]
					}) }, song.id)), songs.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "text-muted",
						children: "The book is empty. Add a title."
					})]
				})
			]
		})]
	});
}
function ReaderScreen({ id }) {
	const pop = useStudio((state) => state.pop);
	const songs = useStudio((state) => state.songs);
	const setSongs = useStudio((state) => state.setSongs);
	const bpm = useStudio((state) => state.bpm);
	const song = songs.find((item) => item.id === id);
	const [editing, setEditing] = (0, import_react.useState)(!song?.lyrics);
	const [size, setSize] = (0, import_react.useState)(1.35);
	const scroller = (0, import_react.useRef)(null);
	const [rolling, setRolling] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!rolling) return;
		let raf = 0;
		let last = performance.now();
		const step = (now) => {
			const node = scroller.current;
			if (!node) return;
			node.scrollTop += (now - last) / 1e3 * 22;
			last = now;
			if (node.scrollTop + node.clientHeight < node.scrollHeight - 2) raf = requestAnimationFrame(step);
			else setRolling(false);
		};
		raf = requestAnimationFrame(step);
		return () => cancelAnimationFrame(raf);
	}, [rolling]);
	if (!song) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "px-4 pt-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-muted",
			children: "That page is gone."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			className: "mt-4",
			variant: "ghost",
			onClick: pop,
			children: "Back"
		})]
	});
	function write(lyrics) {
		if (!song) return;
		const next = songs.map((item) => item.id === song.id ? {
			...item,
			lyrics,
			updatedAt: Date.now()
		} : item);
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-dvh w-full max-w-3xl flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
				title: song.title,
				onBack: pop,
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "h-11 px-2 text-sm text-brand",
					onClick: () => setEditing((value) => !value),
					children: editing ? "Read" : "Edit"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 px-4 pb-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "h-11 rounded-full border border-line px-3",
						onClick: () => setSize((value) => Math.max(1.05, value - .2)),
						children: "A-"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "h-11 rounded-full border border-line px-3",
						onClick: () => setSize((value) => Math.min(2.4, value + .2)),
						children: "A+"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "h-11 rounded-full border border-line px-3",
						onClick: () => setRolling((value) => !value),
						children: rolling ? "Stop roll" : "Roll"
					}),
					bpm != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "num ml-auto text-sm text-signal",
						children: [bpm, " bpm"]
					})
				]
			}),
			editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-4 pb-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					className: "area",
					value: song.lyrics,
					onChange: (event) => write(event.target.value),
					placeholder: "[Verse]\nWrite it the way you sing it.",
					"aria-label": "Lyrics"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "mt-4 h-11 text-sm text-subtle",
					onClick: remove,
					children: "Delete song"
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				ref: scroller,
				className: "flex-1 overflow-y-auto px-5 pb-16",
				children: [
					song.subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-4 text-sm text-subtle",
						children: song.subtitle
					}),
					lines.map((line, index) => {
						const section = /^\[(.+)]$/.exec(line.trim());
						if (section) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "track-brand mt-6 mb-2 text-xs text-brand",
							children: section[1]
						}, index);
						if (!line.trim()) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-4" }, index);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "leading-snug",
							style: { fontSize: `${size}rem` },
							children: line
						}, index);
					}),
					!song.lyrics.trim() && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-muted",
						children: "No words yet. Edit the page and type them in."
					})
				]
			})
		]
	});
}
function TunerScreen() {
	const pop = useStudio((state) => state.pop);
	const earRef = (0, import_react.useRef)(null);
	const frameRef = (0, import_react.useRef)(SILENT_FRAME);
	const [frame, setFrame] = (0, import_react.useState)(SILENT_FRAME);
	const [live, setLive] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!live) return;
		let raf = 0;
		let last = 0;
		const loop = (now) => {
			if (now - last > 80) {
				last = now;
				setFrame(frameRef.current);
			}
			raf = requestAnimationFrame(loop);
		};
		raf = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(raf);
	}, [live]);
	(0, import_react.useEffect)(() => () => earRef.current?.stop(), []);
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
		ear.start().then(() => setLive(true)).catch((err) => {
			setError(err instanceof Error ? err.message : "Mic didn't open.");
			setLive(false);
		});
	}
	const cents = frame.note ? Math.max(-50, Math.min(50, frame.cents)) : 0;
	const inTune = frame.note && Math.abs(frame.cents) < 8;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-dvh w-full max-w-3xl flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
			title: "Tuner",
			onBack: pop
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-1 flex-col items-center px-6 pt-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-8xl leading-none text-brand",
					children: frame.note || "—"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "num mt-2 text-2xl text-muted",
					children: frame.octave ?? ""
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative mt-10 h-3 w-full max-w-sm rounded-full bg-elevated",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute top-0 left-1/2 h-full w-px bg-signal" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: inTune ? "absolute top-1/2 h-6 w-1 -translate-y-1/2 bg-brand" : "absolute top-1/2 h-6 w-1 -translate-y-1/2 bg-foreground",
						style: { left: `${50 + cents}%` }
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "num mt-4 text-sm text-subtle",
					children: frame.note ? `${frame.cents > 0 ? "+" : ""}${Math.round(frame.cents)} cents` : "Play a string"
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-center text-sm text-muted",
					children: error
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-8",
					onClick: listen,
					children: live ? "Stop" : "Listen"
				})
			]
		})]
	});
}
function TempoScreen() {
	const pop = useStudio((state) => state.pop);
	const bpm = useStudio((state) => state.bpm);
	const setBpm = useStudio((state) => state.setBpm);
	const taps = (0, import_react.useRef)([]);
	const audioRef = (0, import_react.useRef)(null);
	const [clicking, setClicking] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!clicking || !bpm) return;
		const audio = audioRef.current;
		if (!audio) return;
		let timer = 0;
		const beat = () => {
			const osc = audio.createOscillator();
			const gain = audio.createGain();
			osc.frequency.value = 1760;
			gain.gain.setValueAtTime(1e-4, audio.currentTime);
			gain.gain.exponentialRampToValueAtTime(.18, audio.currentTime + .004);
			gain.gain.exponentialRampToValueAtTime(1e-4, audio.currentTime + .05);
			osc.connect(gain);
			gain.connect(audio.destination);
			osc.start();
			osc.stop(audio.currentTime + .06);
		};
		beat();
		timer = window.setInterval(beat, 6e4 / bpm);
		return () => window.clearInterval(timer);
	}, [clicking, bpm]);
	(0, import_react.useEffect)(() => () => void audioRef.current?.close(), []);
	function tap() {
		const now = performance.now();
		const recent = taps.current.filter((time) => now - time < 2500);
		recent.push(now);
		taps.current = recent.slice(-8);
		if (taps.current.length < 2) return;
		let sum = 0;
		for (let i = 1; i < taps.current.length; i++) sum += taps.current[i] - taps.current[i - 1];
		const next = Math.round(6e4 / (sum / (taps.current.length - 1)));
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
		audio.resume();
		setClicking(true);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-dvh w-full max-w-3xl flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
			title: "Tap tempo",
			onBack: pop
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-1 flex-col px-4 pb-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: tap,
				className: "mt-4 flex flex-1 items-center justify-center rounded-3xl border border-line bg-elevated shadow-glow",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block font-display text-7xl text-brand",
							children: "TAP"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "num mt-2 block text-3xl",
							children: bpm ? `${bpm}` : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-1 block text-sm text-subtle",
							children: "bpm"
						})
					]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid grid-cols-2 gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					onClick: toggleClick,
					disabled: !bpm,
					children: clicking ? "Stop click" : "Start click"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "soft",
					onClick: () => {
						taps.current = [];
						setBpm(null);
						setClicking(false);
					},
					children: "Reset"
				})]
			})]
		})]
	});
}
var NAMES = [
	"C",
	"C#",
	"D",
	"D#",
	"E",
	"F",
	"F#",
	"G",
	"G#",
	"A",
	"A#",
	"B"
];
function buildTender(ms) {
	const notes = [];
	const beat = 6e4 / 64;
	const scale = [
		57,
		60,
		62,
		64,
		67,
		69,
		67,
		64,
		62,
		60,
		69,
		72,
		69,
		64
	];
	let t = 420;
	let i = 0;
	while (t < ms) {
		notes.push({
			t,
			dur: beat * 1.65,
			midi: scale[i % scale.length] + (i % 11 === 0 ? -12 : 0),
			vel: .28 + i % 5 * .03
		});
		t += beat * 2;
		i++;
	}
	return notes;
}
function buildHard(ms) {
	const notes = [];
	const eighth = 200;
	const midis = [
		40,
		47,
		52,
		47,
		40,
		55,
		52,
		47
	];
	const pattern = [
		.55,
		.55,
		1.15
	];
	let t = 220;
	let i = 0;
	while (t < ms) {
		notes.push({
			t,
			dur: eighth * .32,
			midi: midis[i % midis.length] + (i % 16 > 11 ? 12 : 0),
			vel: .8 + i % 4 * .045
		});
		t += eighth * pattern[i % 3];
		i++;
	}
	return notes;
}
var PracticePlayer = class {
	origin = 0;
	cursor = 0;
	activeUntil = -1;
	active = null;
	lastNorm = .55;
	notes;
	hard;
	constructor(mode) {
		this.hard = mode === "hard";
		this.notes = this.hard ? buildHard(95e3) : buildTender(95e3);
		this.lastNorm = this.hard ? .18 : .62;
	}
	start(now) {
		this.origin = now;
		this.cursor = 0;
	}
	frame(now) {
		const t = now - this.origin;
		let onset = false;
		let strength = 0;
		while (this.cursor < this.notes.length && this.notes[this.cursor].t <= t) {
			const note = this.notes[this.cursor];
			this.cursor += 1;
			if (t - note.t < 48) {
				onset = true;
				strength = note.vel;
				this.active = note;
				this.activeUntil = note.t + note.dur;
				this.lastNorm = Math.max(0, Math.min(1, (note.midi - 40) / 48));
			}
		}
		const sounding = this.active != null && t < this.activeUntil;
		const midi = sounding && this.active ? this.active.midi : null;
		const nearest = midi == null ? 0 : Math.round(midi);
		return {
			rms: sounding ? .08 : 0,
			level: sounding ? this.active?.vel ?? 0 : 0,
			sounding,
			onset,
			strength: onset ? strength : 0,
			rate: this.hard ? 6.2 : .55,
			speed: this.hard ? .88 : .06,
			freq: midi == null ? 0 : midiToFreq(midi),
			midi,
			pitchNorm: this.lastNorm,
			note: midi == null ? "" : NAMES[(nearest % 12 + 12) % 12] ?? "",
			octave: midi == null ? null : Math.floor(nearest / 12) - 1,
			cents: 0,
			clarity: sounding ? .95 : 0,
			mood: this.hard ? .84 : -.74,
			staccato: this.hard ? .92 : .12,
			gallop: this.hard
		};
	}
};
function startRecorder(canvas, audio) {
	if (typeof MediaRecorder === "undefined") return null;
	const mime = [
		"video/webm;codecs=vp9,opus",
		"video/webm;codecs=vp8,opus",
		"video/webm;codecs=vp9",
		"video/webm;codecs=vp8",
		"video/webm",
		"video/mp4"
	].find((type) => MediaRecorder.isTypeSupported(type));
	if (!mime) return null;
	const stream = canvas.captureStream(30);
	const clones = [];
	if (audio) for (const track of audio.getAudioTracks()) {
		if (track.readyState !== "live") continue;
		const clone = track.clone();
		clones.push(clone);
		stream.addTrack(clone);
	}
	const hasAudio = clones.length > 0;
	let rec;
	try {
		rec = new MediaRecorder(stream, {
			mimeType: mime,
			videoBitsPerSecond: 45e5,
			...hasAudio ? { audioBitsPerSecond: 128e3 } : {}
		});
	} catch {
		clones.forEach((track) => track.stop());
		stream.getVideoTracks().forEach((track) => track.stop());
		if (hasAudio) return startRecorder(canvas, null);
		return null;
	}
	const chunks = [];
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
		stop() {
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
		}
	};
}
function StageScreen({ config }) {
	const pop = useStudio((state) => state.pop);
	const showPiece = useStudio((state) => state.showPiece);
	const canvasRef = (0, import_react.useRef)(null);
	const finishRef = (0, import_react.useRef)(() => {});
	const swapRef = (0, import_react.useRef)(null);
	const [hud, setHud] = (0, import_react.useState)(SILENT_FRAME);
	const [left, setLeft] = (0, import_react.useState)(config.seconds);
	const [banner, setBanner] = (0, import_react.useState)(null);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [askLeave, setAskLeave] = (0, import_react.useState)(false);
	const [hint, setHint] = (0, import_react.useState)(false);
	const style = styleById(config.styleId);
	const genre = genreById(config.genreId);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		let dead = false;
		let saved = false;
		let listener = null;
		let practice = null;
		const frames = [];
		const painter = new Painter(config, Math.random() * 1e9 >>> 0 || 1, true);
		painter.begin();
		painter.composite(ctx, canvas.width, canvas.height);
		let recorder = null;
		let recording = false;
		const started = performance.now();
		const endAt = started + config.seconds * 1e3;
		let quietSince = started;
		let lastHud = 0;
		let raf = 0;
		let lastFrame = SILENT_FRAME;
		const pushFrame = (frame) => {
			if (frame.onset || frames.length === 0) frames.push(frame);
			else frames[frames.length - 1] = frame;
			if (frames.length > 12) frames.splice(0, frames.length - 12);
		};
		const beginRec = (audio) => {
			if (recorder || dead) return;
			recorder = startRecorder(canvas, audio);
			recording = true;
		};
		const armPractice = (mode, message) => {
			listener?.stop();
			listener = null;
			practice = new PracticePlayer(mode);
			practice.start(performance.now());
			if (message) setBanner(message);
			setHint(false);
			beginRec(null);
		};
		if (config.source === "mic") {
			const taken = takePrimed();
			const bind = (ear) => {
				listener = ear;
				ear.onFrame = pushFrame;
			};
			const kick = (ok) => {
				if (dead || recording) return;
				if (!ok || !listener?.mediaStream()) {
					armPractice("tender", "Mic didn't open. Painting with the tender practice brush. That video stays silent.");
					return;
				}
				beginRec(listener.mediaStream());
			};
			if (taken.listener) {
				bind(taken.listener);
				if (taken.listener.mediaStream()) kick(true);
				else {
					const timer = window.setTimeout(() => kick(Boolean(listener?.mediaStream())), 900);
					taken.ready.then((ok) => {
						window.clearTimeout(timer);
						kick(ok && Boolean(listener?.mediaStream()));
					});
				}
			} else {
				const ear = new SourPaintListener();
				bind(ear);
				const timer = window.setTimeout(() => kick(false), 900);
				ear.start().then(() => {
					window.clearTimeout(timer);
					kick(true);
				}).catch(() => {
					window.clearTimeout(timer);
					kick(false);
				});
			}
		} else {
			practice = new PracticePlayer(config.source);
			practice.start(started);
			beginRec(null);
		}
		let videoBlob = null;
		let videoDone = false;
		const finish = async () => {
			if (dead || saved) return;
			saved = true;
			setSaving(true);
			cancelAnimationFrame(raf);
			try {
				if (!videoDone) {
					videoDone = true;
					videoBlob = await recorder?.stop() ?? null;
				}
				listener?.stop();
				listener = null;
				const png = await painter.exportBlob("image/png", 1440, 2560);
				const thumb = await painter.exportBlob("image/jpeg", 360, 640, .72);
				const title = config.subject.trim() || genre.name;
				const id = crypto.randomUUID();
				await savePainting({
					id,
					createdAt: Date.now(),
					title,
					config,
					styleName: style.name,
					genreName: genre.name,
					paletteName: paletteById(config.paletteId).name,
					hasVideo: videoBlob != null,
					hasAudio: recorder?.hasAudio ?? false,
					thumb,
					png,
					video: videoBlob
				});
				if (!dead) showPiece(id);
			} catch (error) {
				listener?.stop();
				listener = null;
				saved = false;
				setSaving(false);
				setBanner(error instanceof Error ? error.message : "Could not save the painting.");
			}
		};
		finishRef.current = () => {
			finish();
		};
		const loop = (now) => {
			if (dead || saved) return;
			if (swapRef.current) {
				const mode = swapRef.current;
				swapRef.current = null;
				armPractice(mode, mode === "hard" ? "Hard practice brush." : "Tender practice brush.");
			}
			if (practice) frames.push(practice.frame(now));
			if (frames.length === 0) painter.tick(now, null);
			while (frames.length) {
				const frame = frames.shift();
				if (!frame) break;
				lastFrame = frame;
				painter.tick(now, frame);
			}
			if (painter.consumeDirty()) painter.composite(ctx, canvas.width, canvas.height);
			if (config.source === "mic" && !practice) {
				if (lastFrame.midi != null && lastFrame.clarity >= .88) quietSince = now;
				else if (now - quietSince > 5e3) setHint(true);
			}
			if (now - lastHud > 100) {
				lastHud = now;
				setHud(lastFrame);
				setLeft(Math.max(0, (endAt - now) / 1e3));
			}
			if (now >= endAt) {
				finish();
				return;
			}
			raf = requestAnimationFrame(loop);
		};
		raf = requestAnimationFrame(loop);
		const previous = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			dead = true;
			document.body.style.overflow = previous;
			if (!saved) {
				cancelAnimationFrame(raf);
				recorder?.cancel();
				listener?.stop();
			}
		};
	}, [
		config,
		genre.name,
		showPiece,
		style.name
	]);
	const note = hud.note ? `${hud.note}${hud.octave ?? ""}` : "—";
	const mood = hud.mood > .22 ? "Major" : hud.mood < -.22 ? "Minor" : "—";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: canvasRef,
				width: 720,
				height: 1280,
				className: "h-full w-full object-contain"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-none absolute inset-0 flex flex-col justify-between pt-safe pb-safe",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pointer-events-auto flex items-start justify-between gap-3 px-3 pt-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setAskLeave(true),
							className: "h-11 rounded-full bg-background/80 px-3 text-sm",
							children: "Back"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-full bg-background/80 px-3 py-2 text-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "num text-lg",
								children: [Math.ceil(left), "s"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-subtle",
								children: style.name
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "h-11 min-w-11 rounded-full bg-background/80 px-3 py-2 text-right",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm text-brand",
								children: note
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-subtle",
								children: mood
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pointer-events-auto space-y-3 px-3 pb-3",
					children: [
						banner && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "rounded-2xl bg-background/85 px-3 py-2 text-sm",
							children: banner
						}),
						hint && !saving && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "soft",
								full: true,
								onClick: () => swapRef.current = "tender",
								children: "Tender brush"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "soft",
								full: true,
								onClick: () => swapRef.current = "hard",
								children: "Hard brush"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-2 overflow-hidden rounded-full bg-elevated",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-full bg-brand",
								style: { width: `${Math.round(hud.level * 100)}%` }
							})
						}),
						config.source === "mic" && !hud.note && !saving && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "rounded-2xl bg-background/85 px-3 py-2 text-sm",
							children: "Play a note. The fan and the room stay off the canvas. The mic is in the video."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							full: true,
							onClick: () => finishRef.current(),
							disabled: saving,
							children: saving ? "Locking the painting…" : "Done"
						})
					]
				})]
			}),
			askLeave && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 flex items-end bg-background/70 p-4 pb-safe",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full rounded-3xl bg-elevated p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-lg",
						children: "Leave this painting? It will not be saved."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid grid-cols-2 gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							onClick: () => setAskLeave(false),
							children: "Stay"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => {
								setAskLeave(false);
								pop();
							},
							children: "Leave"
						})]
					})]
				})
			})
		]
	});
}
function Studio() {
	const screen = useStudio((state) => state.stack[state.stack.length - 1] ?? { name: "home" });
	const setSongs = useStudio((state) => state.setSongs);
	(0, import_react.useEffect)(() => {
		setSongs(loadSongs());
	}, [setSongs]);
	if (screen.name === "gallery") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GalleryScreen, {});
	if (screen.name === "setup") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SetupScreen, {});
	if (screen.name === "splash") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SplashScreen, { config: screen.config });
	if (screen.name === "stage") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StageScreen, { config: screen.config });
	if (screen.name === "piece") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PieceScreen, { id: screen.id });
	if (screen.name === "book") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookScreen, {});
	if (screen.name === "read") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReaderScreen, { id: screen.id });
	if (screen.name === "tuner") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TunerScreen, {});
	if (screen.name === "tempo") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TempoScreen, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HomeScreen, {});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Studio, {});
}
//#endregion
export { Home as component };
