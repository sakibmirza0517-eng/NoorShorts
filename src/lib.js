// keyless multi-source search (Piped → Invidious → cached → YouTube API) + offline ambient + taste + collection

export const ENV_KEY = (import.meta.env && import.meta.env.VITE_YOUTUBE_API_KEY) || "";

/* public, CORS-open, keyless YouTube frontends (their own frontends force CORS=*). Order = preference. */
const PIPED_HOSTS = [
  "https://pipedapi.kavin.rocks",
  "https://pipedapi.adminforge.de",
  "https://pipedapi.privacy.com.de",
  "https://pipedapi.leptons.xyz",
  "https://pipedapi.r4fo.com",
];
const INVIDIOUS_HOSTS = [
  "https://inv.nadeko.net",
  "https://invidious.fdn.fr",
  "https://yewtu.be",
  "https://inv.tux.pizza",
];

let ytPromise = null;
export function loadYT() {
  if (window.YT && window.YT.Player) return Promise.resolve();
  if (ytPromise) return ytPromise;
  ytPromise = new Promise((res) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { if (prev) prev(); res(); };
    const s = document.createElement("script"); s.src = "https://www.youtube.com/iframe_api"; document.head.appendChild(s);
  });
  return ytPromise;
}

export const QUERIES = [
  "beautiful quran recitation", "sahih hadith reminder", "islamic motivation sabr",
  "powerful dua daily", "prophet muhammad stories", "makkah kaaba",
  "islamic nasheed", "ramadan reminder", "islamic history", "tawheed reminder",
];

export function isQuota(e) { return /quota|quotaExceeded|403|dailyLimit/i.test(String((e && e.message) || e)); }
export function isAllDown(e) { return /ALL_SOURCES_DOWN/i.test(String((e && e.message) || e)); }

function fetchJSON(url, ms = 6000) {
  const c = new AbortController(); const t = setTimeout(() => c.abort(), ms);
  return fetch(url, { signal: c.signal }).then((r) => { clearTimeout(t); if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); }).catch((e) => { clearTimeout(t); throw e; });
}
function normThumb(u) { if (!u) return ""; return u.startsWith("//") ? "https:" + u : u; }

/* ---- YouTube Data API (last resort; costs quota) ---- */
export async function fetchPage(key, q, pageToken) {
  const p = new URLSearchParams({ part: "snippet", type: "video", videoDuration: "short", maxResults: "12", q: q + " #shorts", key });
  if (pageToken) p.set("pageToken", pageToken);
  const r = await fetch("https://www.googleapis.com/youtube/v3/search?" + p);
  if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error((e.error && e.error.message) || ("HTTP " + r.status)); }
  const d = await r.json(); const ta = document.createElement("textarea");
  const items = (d.items || []).map((it) => {
    const sn = it.snippet || {}; const th = (sn.thumbnails && (sn.thumbnails.high || sn.thumbnails.medium || sn.thumbnails.default)) || {};
    ta.innerHTML = sn.title || "";
    return { id: it.id && it.id.videoId, source: "youtube", t: ta.value, ch: sn.channelTitle || "Channel", thumb: th.url || "" };
  }).filter((x) => x.id);
  return { items, next: d.nextPageToken || null };
}
const ytItems = (key, q) => fetchPage(key, q, null).then((r) => r.items);

/* ---- keyless mirrors ---- */
function pipedSearch(host, q) {
  return fetchJSON(host + "/search?q=" + encodeURIComponent(q) + "&filter=videos").then((d) => {
    const arr = Array.isArray(d) ? d : (d.items || []);
    return arr.map((it) => {
      const id = it.videoId || (it.url && ((it.url.match(/[?&]v=([^&]+)/) || [])[1]));
      return id ? { id, source: "youtube", t: it.title || "", ch: it.uploaderName || it.uploader || "Channel", thumb: normThumb(it.thumbnail) } : null;
    }).filter(Boolean);
  });
}
function invidiousSearch(host, q) {
  return fetchJSON(host + "/api/v1/search?q=" + encodeURIComponent(q) + "&type=video").then((d) => {
    const arr = Array.isArray(d) ? d : [];
    return arr.filter((it) => it && it.type === "video" && it.videoId).map((it) => {
      const vts = (it.videoThumbnails || []).slice().sort((a, b) => (b.width || 0) - (a.width || 0));
      return { id: it.videoId, source: "youtube", t: it.title || "", ch: it.author || "Channel", thumb: normThumb(vts[0] && vts[0].url) };
    });
  });
}

/* ---- feed cache : reloads + repeats cost ZERO calls ---- */
const FC = "noor_feed_cache_v1";
const PF = "noor_persist_feed_v1";
export function getCachedItems(ck, ttl) {
  try { const m = JSON.parse(localStorage.getItem(FC) || "{}"); const e = m[ck]; if (!e || !e.items) return null; if (ttl != null && Date.now() - e.t > ttl) return null; return e.items; } catch { return null; }
}
export function cacheItems(ck, items) { try { const m = JSON.parse(localStorage.getItem(FC) || "{}"); m[ck] = { t: Date.now(), items }; localStorage.setItem(FC, JSON.stringify(m)); } catch {} }
export function persistFeed(items) { try { localStorage.setItem(PF, JSON.stringify((items || []).slice(0, 80))); } catch {} }
export function getPersistedFeed() { try { return JSON.parse(localStorage.getItem(PF) || "[]"); } catch { return []; } }

/* ---- THE trick : one search, every source, cached ---- */
export function searchVideos(key, q) {
  const ck = "sv:" + q;
  const cached = getCachedItems(ck, 3600 * 1000);
  if (cached && cached.length) return Promise.resolve({ items: cached, source: "cache" });
  let lastErr;
  const run = async (fn, label) => { try { const items = await fn(); if (items && items.length) { cacheItems(ck, items); return { items, source: label }; } } catch (e) { lastErr = e; } return null; };
  return (async () => {
    for (const h of PIPED_HOSTS) { const r = await run(() => pipedSearch(h, q), "piped"); if (r) return r; }
    for (const h of INVIDIOUS_HOSTS) { const r = await run(() => invidiousSearch(h, q), "invidious"); if (r) return r; }
    if (key) { const r = await run(() => ytItems(key, q), "youtube"); if (r) return r; }
    throw lastErr || new Error("ALL_SOURCES_DOWN");
  })();
}

/* recitation / lecture : keyless first, cached 24h (survives quota & mirror hiccups) */
const AC = "noor_audio_cache_v1";
export async function fetchAudioTrack(key, query) {
  let ac = {}; try { ac = JSON.parse(localStorage.getItem(AC) || "{}"); } catch {}
  const fresh = ac[query];
  if (fresh && fresh.item && Date.now() - fresh.t < 24 * 3600 * 1000) return fresh.item;
  try {
    const { items } = await searchVideos(key, query);
    const item = items && items[0];
    if (item && item.id) { ac[query] = { t: Date.now(), item }; try { localStorage.setItem(AC, JSON.stringify(ac)); } catch {} return item; }
    return fresh ? fresh.item : null;
  } catch { return fresh ? fresh.item : null; }
}

/* ---------- collection (Saved) ---------- */
const CK = "noor_collection";
export const getCollection = () => { try { return JSON.parse(localStorage.getItem(CK) || "[]"); } catch { return []; } };
const saveCol = (a) => localStorage.setItem(CK, JSON.stringify(a));
export const inCollection = (id) => getCollection().some((x) => x.id === id);
export function toggleCollection(item) {
  const a = getCollection(); const i = a.findIndex((x) => x.id === item.id);
  if (i >= 0) { a.splice(i, 1); saveCol(a); return false; } a.unshift(item); saveCol(a); return true;
}
export function addToCollection(item) {
  const a = getCollection();
  if (a.some((x) => x.id === item.id)) return false;
  a.unshift(item); saveCol(a); return true;
}
export const removeFromCollection = (id) => saveCol(getCollection().filter((x) => x.id !== id));
export function likeCount(id) { let h = 0; for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0; return (h % 9000) + 1200; }

/* ---------- link parsing (import) ---------- */
const IG_RE = /instagram\.com\/(reel|p|tv)\/([A-Za-z0-9_-]+)/;
const YT_RE = /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/;
export function parseLink(raw) {
  if (!raw) return null; const u = raw.trim();
  const ig = u.match(IG_RE); if (ig) { const type = ig[1] === "tv" ? "p" : ig[1]; return { source: "instagram", id: "ig_" + ig[2], type, code: ig[2] }; }
  const yt = u.match(YT_RE); if (yt) return { source: "youtube", id: yt[1] }; return null;
}

/* ---------- taste engine (positive + negative) ---------- */
const TK = "noor_taste";
const STOP = new Set(("the and for with you this that from your about will have not but just like one all can how why when what who its our their them than then also very been were was is are am be by at in on to of a an it so do no if or as we he she my me i don't it's that's there here beautiful amazing best top new full hd viral must watch short shorts video youtube channel part episode recitation quran islamic muslim").split(/\s+/));
export const getTaste = () => { try { return JSON.parse(localStorage.getItem(TK) || "{}"); } catch { return {}; } };
const saveTaste = (m) => localStorage.setItem(TK, JSON.stringify(m));
export function addTaste(item, sign = 1) {
  const m = getTaste();
  const bump = (s, w) => s.split(/\s+/).forEach((raw) => {
    const t = raw.replace(/[^a-z]/g, ""); if (t.length < 3 || STOP.has(t)) return;
    const v = (m[t] || 0) + w * sign; if (v <= 0) delete m[t]; else m[t] = v;
  });
  if (item.t) bump(String(item.t).toLowerCase(), 2);
  if (item.ch) bump(String(item.ch).toLowerCase(), 1);
  saveTaste(m);
}
export const addTasteSignalsFromItem = (item) => addTaste(item, 1);
export const removeTasteKeyword = (k) => { const m = getTaste(); delete m[k]; saveTaste(m); };
export const topTasteKeywords = (n) => Object.entries(getTaste()).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, w]) => ({ k, w }));
export const buildTasteQuery = () => { const t = topTasteKeywords(2).map((x) => x.k); return t.length ? t.join(" ") + " islamic" : null; }

/* ---------- hidden / disliked reels ---------- */
const HK = "noor_hidden";
export const getHidden = () => { try { return JSON.parse(localStorage.getItem(HK) || "[]"); } catch { return []; } };
const saveHidden = (a) => localStorage.setItem(HK, JSON.stringify(a));
export const isHidden = (id) => getHidden().some((x) => x.id === id);
export function hideReel(item) {
  const a = getHidden(); if (a.some((x) => x.id === item.id)) return;
  a.unshift({ id: item.id, t: item.t, ch: item.ch, thumb: item.thumb, source: item.source });
  if (a.length > 200) a.length = 200; saveHidden(a);
}
export const unhideReel = (id) => saveHidden(getHidden().filter((x) => x.id !== id));
export const unhideAll = () => saveHidden([]);

/* ---------- creators ---------- */
export const CURATED_CREATORS = ["Mufti Menk", "Nouman Ali Khan", "Omar Suleiman", "Mishary Rashid Alafasy", "Assim Al Hakeem", "Yaqeen Institute", "One Path", "MercifulServant", "Daily Reminder", "Maher Al Muaiqly"];
const CRK = "noor_creators";
export const getCustomCreators = () => { try { return JSON.parse(localStorage.getItem(CRK) || "[]"); } catch { return []; } };
const saveCus = (a) => localStorage.setItem(CRK, JSON.stringify(a));
export function addCustomCreator(name) {
  const n = (name || "").trim(); if (!n) return false; const low = n.toLowerCase(); const c = getCustomCreators();
  if (c.some((x) => x.toLowerCase() === low) || CURATED_CREATORS.some((x) => x.toLowerCase() === low)) return false;
  c.unshift(n); saveCus(c); return true;
}
export const removeCustomCreator = (name) => saveCus(getCustomCreators().filter((c) => c !== name));

/* ---------- offline ambient engine: rain + calm drone + soft chimes (no network, no quota) ---------- */
export class AmbientEngine {
  constructor() { this.ctx = null; this.chimeLevel = 0; this.chimeTimer = null; }
  ensure() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext; this.ctx = new AC();
    this.master = this.ctx.createGain(); this.master.gain.value = 0.9; this.master.connect(this.ctx.destination);
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 2, this.ctx.sampleRate); const d = buf.getChannelData(0); let last = 0;
    for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.2; }
    const noise = this.ctx.createBufferSource(); noise.buffer = buf; noise.loop = true;
    const bp = this.ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1200; bp.Q.value = 0.7;
    const hp = this.ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 420;
    this.rainGain = this.ctx.createGain(); this.rainGain.gain.value = 0;
    noise.connect(bp); bp.connect(hp); hp.connect(this.rainGain); this.rainGain.connect(this.master); noise.start();
    const lp = this.ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 620;
    this.padGain = this.ctx.createGain(); this.padGain.gain.value = 0;
    const mix = this.ctx.createGain(); mix.gain.value = 0.5;
    const o1 = this.ctx.createOscillator(); o1.type = "sine"; o1.frequency.value = 110;
    const o2 = this.ctx.createOscillator(); o2.type = "triangle"; o2.frequency.value = 165; o2.detune.value = 6;
    const o3 = this.ctx.createOscillator(); o3.type = "sine"; o3.frequency.value = 220; o3.detune.value = -8;
    o1.connect(mix); o2.connect(mix); o3.connect(mix); mix.connect(lp); lp.connect(this.padGain); this.padGain.connect(this.master);
    const lfo = this.ctx.createOscillator(); lfo.frequency.value = 0.08; this.lfoGain = this.ctx.createGain(); this.lfoGain.gain.value = 0;
    lfo.connect(this.lfoGain); this.lfoGain.connect(this.padGain.gain);
    o1.start(); o2.start(); o3.start(); lfo.start();
  }
  resume() { if (this.ctx && this.ctx.state === "suspended") this.ctx.resume(); }
  setMaster(v) { this.ensure(); this.master.gain.setTargetAtTime(0.2 + 0.8 * v, this.ctx.currentTime, 0.2); }
  setRain(v) { this.ensure(); this.resume(); this.rainGain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.3); }
  setPad(v) { this.ensure(); this.resume(); this.padGain.gain.setTargetAtTime(v * 0.5, this.ctx.currentTime, 0.3); this.lfoGain.gain.setTargetAtTime(v * 0.12, this.ctx.currentTime, 0.3); }
  setChimes(v) {
    this.ensure(); this.resume(); this.chimeLevel = v;
    if (v > 0.01 && !this.chimeTimer) {
      const tick = () => {
        const lv = this.chimeLevel || 0;
        if (lv > 0.01 && Math.random() < (0.4 + 0.5 * lv)) this._bell(0.05 + 0.12 * lv);
        this.chimeTimer = setTimeout(tick, 2600 - 1600 * lv + Math.random() * 2200);
      };
      this.chimeTimer = setTimeout(tick, 1200);
    } else if (v <= 0.01 && this.chimeTimer) { clearTimeout(this.chimeTimer); this.chimeTimer = null; }
  }
  _bell(vol) {
    const t = this.ctx.currentTime; const notes = [523.25, 659.25, 783.99, 1046.5]; const f = notes[(Math.random() * notes.length) | 0];
    const o = this.ctx.createOscillator(); const g = this.ctx.createGain(); o.type = "sine"; o.frequency.value = f;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0008, t + 2.2);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + 2.3);
  }
  chime() { this.ensure(); this.resume(); [0, 1, 2].forEach((i) => setTimeout(() => this._bell(0.2), i * 180)); }
}