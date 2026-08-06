import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  ENV_KEY, getCollection, toggleCollection, removeFromCollection, getTaste, addTasteSignalsFromItem, addTaste,
  removeTasteKeyword, topTasteKeywords, getCustomCreators, addCustomCreator, removeCustomCreator, CURATED_CREATORS,
  parseLink, AmbientEngine, fetchAudioTrack, getHidden, hideReel, unhideReel, unhideAll as unhideAllFn,
} from "./lib";

const KEY = "noor_yt_key", SEEN = "noor_onboarded";
const NoorCtx = createContext(null);
export const useNoor = () => useContext(NoorCtx);

/* hardware/back button closes the topmost overlay instead of exiting the app */
export function useBackClose(open, close) {
  useEffect(() => {
    if (!open) return;
    const onPop = () => { history.pushState(null, ""); close(); };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [open, close]);
}

export function NoorProvider({ children }) {
  const [apiKey, setApiKey] = useState(() => ENV_KEY || localStorage.getItem(KEY) || "");
  const [live, setLive] = useState(false);
  const [collection, setCollection] = useState(() => getCollection());
  const [tasteV, setTasteV] = useState(0);
  const [hiddenV, setHiddenV] = useState(0);
  const [custom, setCustom] = useState(() => getCustomCreators());
  const [toast, setToast] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [connectOpen, setConnectOpen] = useState(false);
  const [tab, setTab] = useState("reels");
  const [creatorMode, setCreatorMode] = useState(null);
  const [searchActive, setSearchActive] = useState(null);
  const [command, setCommand] = useState({ kind: "auto", payload: null, nonce: 0 });
  const [reelMuted, setReelMuted] = useState(() => { try { const v = localStorage.getItem("noor_reel_muted"); return v === null ? true : v === "1"; } catch { return true; } });
  const [dataSaver, setDataSaver] = useState(() => { try { return localStorage.getItem("noor_datasaver") === "1"; } catch { return false; } });

  const notify = useCallback((m, k) => setToast({ m, k: k || "", id: Date.now() }), []);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); }, [toast]);

  const syncCol = useCallback(() => setCollection(getCollection()), []);
  const afterToggle = useCallback((item, now) => {
    syncCol();
    if (now && item && item.source !== "instagram") { addTasteSignalsFromItem(item); setTasteV((v) => v + 1); }
  }, [syncCol]);

  const dislike = useCallback((item) => {
    hideReel(item); addTaste(item, -1);
    setHiddenV((v) => v + 1); setTasteV((v) => v + 1);
    notify("Noted 👎 — aisi reels kam aayengi", "ok");
  }, [notify]);

  const toggleReelMuted = useCallback(() => {
    setReelMuted((m) => { const nv = !m; try { localStorage.setItem("noor_reel_muted", nv ? "1" : "0"); } catch {} return nv; });
  }, []);
  const toggleDataSaver = useCallback(() => {
    setDataSaver((v) => { const nv = !v; try { localStorage.setItem("noor_datasaver", nv ? "1" : "0"); } catch {} return nv; });
  }, []);

  const saveKey = useCallback((k) => {
    localStorage.setItem(KEY, k); localStorage.setItem(SEEN, "1");
    setApiKey(k); setLive(true); setConnectOpen(false); setCreatorMode(null); setSearchActive(null);
    setCommand((c) => ({ kind: "auto", payload: null, nonce: c.nonce + 1 }));
    notify("Connected! Feed load ho raha hai…", "ok");
  }, [notify]);
  const disconnect = useCallback(() => { localStorage.removeItem(KEY); setApiKey(""); setLive(false); setConnectOpen(false); notify("Disconnected.", "ok"); }, [notify]);

  const doImport = useCallback(async (raw) => {
    const parsed = parseLink(raw);
    if (!parsed) return { ok: false, msg: "Link samajh nahi aaya — Instagram reel ya YouTube link paste karo." };
    const item = parsed.source === "instagram"
      ? { id: parsed.id, source: "instagram", type: parsed.type, code: parsed.code, t: "Instagram Reel", ch: "Instagram" }
      : { id: parsed.id, source: "youtube", t: "YouTube Reel", ch: "YouTube" };
    const added = toggleCollection(item);
    if (!added) return { ok: false, msg: "Yeh reel pehle se Saved mein hai." };
    if (parsed.source === "youtube") { addTasteSignalsFromItem(item); setTasteV((v) => v + 1); }
    syncCol(); return { ok: true };
  }, [syncCol]);

  const playAuto = useCallback(() => { setCreatorMode(null); setSearchActive(null); setCommand((c) => ({ kind: "auto", payload: null, nonce: c.nonce + 1 })); }, []);
  const playSearch = useCallback((q) => { setCreatorMode(null); setSearchActive(q); setCommand((c) => ({ kind: "search", payload: q, nonce: c.nonce + 1 })); }, []);
  const selectCreator = useCallback((name) => { setCreatorMode(name); setSearchActive(null); setCommand((c) => ({ kind: "creator", payload: name, nonce: c.nonce + 1 })); }, []);
  const addCreator = useCallback((n) => { if (addCustomCreator(n)) { setCustom(getCustomCreators()); notify("Creator add ho gaya ✨", "ok"); return true; } notify("Yeh naam pehle se hai ya khaali", "err"); return false; }, [notify]);
  const rmCreator = useCallback((n) => { removeCustomCreator(n); setCustom(getCustomCreators()); }, []);
  const forgetTaste = useCallback((k) => { removeTasteKeyword(k); setTasteV((v) => v + 1); }, []);
  const unhide = useCallback((id) => { unhideReel(id); setHiddenV((v) => v + 1); }, []);
  const unhideEverything = useCallback(() => { unhideAllFn(); setHiddenV((v) => v + 1); notify("Sab wapas aa gayi", "ok"); }, [notify]);

  const orbit = useMemo(() => topTasteKeywords(7), [tasteV]);
  const tasteList = useMemo(() => topTasteKeywords(40), [tasteV]);
  const tasteCount = useMemo(() => Object.keys(getTaste()).length, [tasteV]);
  const hidden = useMemo(() => getHidden(), [hiddenV]);
  const creators = useMemo(() => [...CURATED_CREATORS.map((n) => ({ name: n, custom: false })), ...custom.map((n) => ({ name: n, custom: true }))], [custom]);

  useEffect(() => {
    const k = ENV_KEY || localStorage.getItem(KEY);
    if (k) { setApiKey(k); setLive(true); setCommand((c) => ({ ...c, nonce: c.nonce + 1 })); }
    else if (!localStorage.getItem(SEEN)) setConnectOpen(true);
  }, []);

  const value = {
    apiKey, live, collection, tab, setTab, creatorMode, searchActive, command,
    reelMuted, toggleReelMuted, dataSaver, toggleDataSaver,
    toast, importOpen, setImportOpen, connectOpen, setConnectOpen,
    orbit, tasteList, tasteCount, hidden, creators,
    notify, syncCol, afterToggle, dislike, saveKey, disconnect, doImport,
    removeSaved: (id) => { removeFromCollection(id); syncCol(); notify("Hata di gayi", "ok"); },
    playAuto, playSearch, selectCreator, addCreator, rmCreator, forgetTaste, unhide, unhideEverything,
  };
  return <NoorCtx.Provider value={value}>{children}</NoorCtx.Provider>;
}

/* ---------- persistent audio (survives tab switches) + MediaSession + background-resume ---------- */
const AudioCtx = createContext(null);
export const useAudio = () => useContext(AudioCtx);

export function AudioProvider({ children }) {
  const noor = useNoor();
  const [track, setTrack] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.8);
  const [ambient, setAmbient] = useState({ rain: 0, pad: 0, chimes: 0 });
  const engine = useRef(null);
  const player = useRef(null);
  const mount = useRef(null);
  const volRef = useRef(0.8);

  useEffect(() => { engine.current = new AmbientEngine(); return () => { try { engine.current.ctx && engine.current.ctx.close(); } catch {} }; }, []);

  const ensurePlayer = useCallback((id) => {
    import("./lib").then(({ loadYT }) => loadYT()).then(() => {
      if (!mount.current) return;
      if (player.current) { try { player.current.loadVideoById(id); } catch {} return; }
      player.current = new window.YT.Player(mount.current, {
        videoId: id,
        playerVars: { controls: 0, modestbranding: 1, playsinline: 1, rel: 0, iv_load_policy: 3 },
        events: {
          onReady: (e) => { e.target.setVolume(volRef.current * 100); e.target.playVideo(); },
          onStateChange: (e) => {
            const S = window.YT.PlayerState;
            if (e.data === S.PLAYING) setPlaying(true);
            if (e.data === S.PAUSED) setPlaying(false);
            if (e.data === S.ENDED) e.target.playVideo();
          },
          onError: () => { noor.notify("Track unavailable — doosra link paste karo", "err"); setPlaying(false); },
        },
      });
    });
  }, [noor]);

  const playTrack = useCallback((item) => { setTrack(item); ensurePlayer(item.id); }, [ensurePlayer]);
  const toggle = useCallback(() => {
    if (!player.current) return;
    if (playing) player.current.pauseVideo(); else { player.current.playVideo(); engine.current && engine.current.resume(); }
  }, [playing]);
  const setVolume = useCallback((v) => { setVolumeState(v); volRef.current = v; try { player.current && player.current.setVolume(v * 100); } catch {} try { engine.current && engine.current.setMaster(v); } catch {} }, []);
  const setRain = useCallback((v) => { setAmbient((a) => ({ ...a, rain: v })); engine.current.setRain(v); }, []);
  const setPad = useCallback((v) => { setAmbient((a) => ({ ...a, pad: v })); engine.current.setPad(v); }, []);
  const setChimes = useCallback((v) => { setAmbient((a) => ({ ...a, chimes: v })); engine.current.setChimes(v); }, []);
  const chime = useCallback(() => engine.current && engine.current.chime(), []);

  const stopAll = useCallback(() => {
    try { player.current && player.current.stopVideo && player.current.stopVideo(); } catch {}
    setTrack(null); setPlaying(false);
    setAmbient({ rain: 0, pad: 0, chimes: 0 });
    try { engine.current.setRain(0); engine.current.setPad(0); engine.current.setChimes(0); } catch {}
    noor.notify("Background audio band 🤫", "ok");
  }, [noor]);

  const playRecitation = useCallback(async () => {
    if (!noor.live) { noor.notify("Pehle YouTube connect karo ⚡", "err"); noor.setConnectOpen(true); return; }
    noor.notify("Quran recitation load ho rahi hai…", "ok");
    const t = await fetchAudioTrack(noor.apiKey, "Mishary Rashid Alafasy Quran recitation calm");
    if (t && t.id) { playTrack(t); noor.notify("Quran recitation chal rahi 📖", "ok"); }
    else noor.notify("Recitation load nahi hui — link paste karo", "err");
  }, [noor, playTrack]);

  const playLecture = useCallback(async () => {
    if (!noor.live) { noor.notify("Pehle YouTube connect karo ⚡", "err"); noor.setConnectOpen(true); return; }
    noor.notify("Lecture / reminder load ho raha hai…", "ok");
    const t = await fetchAudioTrack(noor.apiKey, "Mufti Menk islamic reminder short");
    if (t && t.id) { playTrack(t); noor.notify("Lecture chal raha 🎙️", "ok"); }
    else noor.notify("Lecture load nahi hua — link paste karo", "err");
  }, [noor, playTrack]);

  const ambientActive = ambient.rain > 0.01 || ambient.pad > 0.01 || ambient.chimes > 0.01;

  // MediaSession: OS ko batao ki yeh ek real media session hai → lock-screen controls + background mein zinda rahe
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    const ms = navigator.mediaSession;
    try {
      if (track) ms.metadata = new MediaMetadata({ title: track.t || "NoorShorts audio", artist: track.ch || "NoorShorts", album: "NoorShorts · Study" });
      else if (ambientActive) ms.metadata = new MediaMetadata({ title: "Focus Ambience", artist: "NoorShorts", album: "Study" });
      else ms.metadata = null;
      ms.playbackState = playing || ambientActive ? "playing" : "paused";
      const play = () => { if (track && player.current) player.current.playVideo(); engine.current && engine.current.resume(); };
      const pause = () => { if (track && player.current) player.current.pauseVideo(); };
      ms.setActionHandler("play", play);
      ms.setActionHandler("pause", pause);
      ms.setActionHandler("stop", pause);
      ms.setActionHandler("seekbackward", (d) => { try { if (track && player.current) player.current.seekTo(Math.max(0, player.current.getCurrentTime() - (d || 10)), true); } catch {} });
      ms.setActionHandler("seekforward", (d) => { try { if (track && player.current) player.current.seekTo(player.current.getCurrentTime() + (d || 10), true); } catch {} });
    } catch {}
  }, [track, playing, ambientActive]);

  // App pe wapas aate hi audio ko phir se zinda karo (mobile hidden tab ko suspend kar deta hai)
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") {
        engine.current && engine.current.resume();
        if (track && playing) { try { player.current && player.current.playVideo(); } catch {} }
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [track, playing]);

  return (
    <AudioCtx.Provider value={{ track, playing, volume, ambient, ambientActive, playTrack, toggle, setVolume, setRain, setPad, setChimes, chime, playRecitation, playLecture, stopAll }}>
      {children}
      <div style={{ position: "fixed", width: 1, height: 1, overflow: "hidden", opacity: 0, pointerEvents: "none", left: 0, top: 0, zIndex: -1 }}>
        <div ref={mount} style={{ width: 320, height: 180 }} />
      </div>
    </AudioCtx.Provider>
  );
}