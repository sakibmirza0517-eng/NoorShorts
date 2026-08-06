import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  loadYT, searchVideos, QUERIES, buildTasteQuery, inCollection, toggleCollection, addToCollection, likeCount,
  parseLink, isHidden, isQuota, isAllDown, getCachedItems, cacheItems, persistFeed, getPersistedFeed,
} from "./lib";
import { useNoor, useAudio, useBackClose } from "./store";

const FEED_TTL = 3 * 3600 * 1000;

export const EXTRA_CSS = `
.reel.leaving{animation:reelout .32s ease forwards}
@keyframes reelout{to{opacity:0;transform:scale(.92) translateY(-14px)}}
.rail-btn.dislike svg{width:29px;height:29px}
.rail-btn.dislike:active svg{transform:scale(.82) rotate(-8deg)}
.preset-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:14px}
.preset{position:relative;cursor:pointer;text-align:left;padding:14px 13px;border-radius:16px;color:#f3ead5;
  background:linear-gradient(160deg,#10432f,#0c3326);border:1px solid rgba(217,180,91,.2);transition:.22s;overflow:hidden}
.preset:hover{transform:translateY(-2px);border-color:rgba(217,180,91,.5)}
.preset.on{border-color:#d9b45b;box-shadow:0 0 0 1px rgba(217,180,91,.4),0 12px 26px -16px rgba(217,180,91,.6)}
.preset .pem{font-size:1.5rem;display:block;margin-bottom:7px}
.preset .pt{font-size:.84rem;font-weight:800;display:block}
.preset .ps{font-size:.66rem;color:#9fb0a0;display:block;margin-top:2px;line-height:1.3}
.preset .live-dot{position:absolute;top:11px;right:11px;width:8px;height:8px;border-radius:50%;background:#5fe08a;box-shadow:0 0 0 0 rgba(95,224,138,.6);animation:pulseB 1.8s infinite}
@keyframes pulseB{0%{box-shadow:0 0 0 0 rgba(95,224,138,.5)}70%{box-shadow:0 0 0 8px rgba(95,224,138,0)}100%{box-shadow:0 0 0 0 rgba(95,224,138,0)}}
.tm-row{display:flex;align-items:center;gap:10px;padding:9px 11px;border-radius:12px;background:rgba(14,58,44,.45);border:1px solid rgba(217,180,91,.12);margin-bottom:7px;animation:rowin .3s ease}
@keyframes rowin{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:none}}
.tm-kw{flex:1;min-width:0}
.tm-kw b{font-size:.82rem;text-transform:capitalize}
.tm-bar{height:5px;border-radius:3px;background:rgba(217,180,91,.16);margin-top:6px;overflow:hidden}
.tm-bar i{display:block;height:100%;background:linear-gradient(90deg,#a9842f,#e7cd86);border-radius:3px;transition:width .6s cubic-bezier(.3,.8,.3,1)}
.tm-mini{flex:none;font-size:.66rem;color:#7f8d7c;width:26px;text-align:right}
.tm-rm{flex:none;cursor:pointer;border:none;background:none;color:#b9c6b6;width:30px;height:30px;border-radius:8px;display:grid;place-items:center}
.tm-rm:hover{color:#ff8aa0;background:rgba(255,84,112,.1)}
.tm-rm svg{width:15px;height:15px}
.tm-h{font-size:.7rem;letter-spacing:.16em;text-transform:uppercase;color:#d9b45b;margin:20px 0 9px;display:flex;justify-content:space-between;align-items:center}
.tm-h button{font-size:.64rem;letter-spacing:.04em;text-transform:none;font-weight:700;color:#e7cd86;background:rgba(217,180,91,.12);border:1px solid rgba(217,180,91,.25);border-radius:999px;padding:5px 11px;cursor:pointer}
.tm-h button:hover{background:rgba(217,180,91,.2)}
.afloat{position:absolute;top:96px;right:12px;z-index:18;display:flex;align-items:center;gap:6px;padding:6px 7px 6px 10px;
  border-radius:999px;background:rgba(8,38,28,.74);border:1px solid rgba(217,180,91,.32);backdrop-filter:blur(8px);
  box-shadow:0 12px 26px -12px #000;animation:chipin .4s cubic-bezier(.34,1.56,.64,1)}
.af-ico{font-size:1rem;line-height:1;filter:drop-shadow(0 1px 3px rgba(0,0,0,.5))}
.afloat .eq{margin:0 1px}
.af-pp{width:26px;height:26px;border-radius:50%;border:none;cursor:pointer;display:grid;place-items:center;color:#1a1407;
  background:linear-gradient(180deg,#e7cd86,#d9b45b);transition:.18s}
.af-pp:hover{filter:brightness(1.07);transform:scale(1.06)}
.af-pp svg{width:13px;height:13px}
.af-x{width:26px;height:26px;border-radius:50%;border:none;cursor:pointer;display:grid;place-items:center;color:#cdd8cb;
  background:rgba(255,255,255,.07);transition:.22s}
.af-x:hover{color:#ff8aa0;background:rgba(255,84,112,.18);transform:rotate(90deg)}
.af-x svg{width:13px;height:13px}
.np-ctl .stop:hover{background:rgba(255,84,112,.16);color:#ff8aa0}
.np-ctl .stop svg{width:17px;height:17px}
.tbtn.on-sound{color:#e7cd86;border-color:rgba(217,180,91,.55);box-shadow:0 0 0 1px rgba(217,180,91,.25)}
.src-pill{position:absolute;top:100px;left:12px;z-index:18;display:inline-flex;align-items:center;gap:6px;font-size:.6rem;
  letter-spacing:.1em;text-transform:uppercase;font-weight:700;color:#e7cd86;background:rgba(8,38,28,.72);
  border:1px solid rgba(217,180,91,.3);padding:5px 10px;border-radius:999px;backdrop-filter:blur(6px);animation:chipin .4s ease}
.src-pill .d{width:6px;height:6px;border-radius:50%;background:#caa24a;animation:pulseA 1.8s infinite}
@keyframes pulseA{0%{box-shadow:0 0 0 0 rgba(202,162,74,.5)}70%{box-shadow:0 0 0 7px rgba(202,162,74,0)}100%{box-shadow:0 0 0 0 rgba(202,162,74,0)}}
.src-pill.live{color:#bff0d2;border-color:rgba(120,220,160,.4)}
.src-pill.live .d{background:#5fe08a;animation:pulseB 1.8s infinite}
@keyframes beat{0%,100%{transform:scale(.9);opacity:.6}50%{transform:scale(1.1);opacity:1}}
@keyframes glow{0%,100%{text-shadow:0 0 18px rgba(217,180,91,.2)}50%{text-shadow:0 0 32px rgba(217,180,91,.45)}}
.qr{position:absolute;inset:0;display:grid;place-items:center;text-align:center;padding:24px;overflow:auto;
  background:radial-gradient(560px 420px at 50% 28%, rgba(217,180,91,.12), transparent 60%)}
.qr-moon{position:relative;width:118px;height:118px;margin:0 auto 2px}
.qr-moon .glow{position:absolute;inset:-30px;border-radius:50%;background:radial-gradient(circle,rgba(217,180,91,.32),transparent 70%);filter:blur(10px);animation:beat 4s ease-in-out infinite}
.qr-moon svg{position:relative;width:118px;height:118px;filter:drop-shadow(0 8px 24px rgba(217,180,91,.35))}
.qr-ar{font-family:"Amiri",serif;color:#d9b45b;font-size:2.7rem;direction:rtl;line-height:1;margin-top:6px;animation:glow 4.5s ease-in-out infinite}
.qr h2{font-family:"Amiri",serif;font-size:1.5rem;margin:8px 0 6px}
.qr p{color:#b9c6b6;font-size:.85rem;line-height:1.6;max-width:340px;margin:0 auto}
.qr p b{color:#e7cd86}
.qr-clock{margin:18px auto 2px;font-variant-numeric:tabular-nums;font-weight:800;font-size:2rem;letter-spacing:.06em;color:#f3ead5}
.qr-clock small{display:block;font-size:.6rem;letter-spacing:.24em;text-transform:uppercase;color:#9fb0a0;font-weight:700;margin-top:3px}
.qr-tiles{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;max-width:340px;margin:18px auto 0}
.qr-tile{cursor:pointer;padding:13px 8px;border-radius:16px;background:linear-gradient(160deg,#10432f,#0c3326);border:1px solid rgba(217,180,91,.2);transition:.22s;text-align:center}
.qr-tile:hover{transform:translateY(-3px);border-color:rgba(217,180,91,.5);box-shadow:0 16px 30px -16px rgba(0,0,0,.7)}
.qr-tile .e{font-size:1.4rem}
.qr-tile b{display:block;font-size:.74rem;margin-top:6px}
.qr-tile small{display:block;font-size:.58rem;color:#9fb0a0;margin-top:2px;line-height:1.2}
.qr-retry{margin-top:16px}
.endcard{position:relative;height:100%;display:grid;place-items:center;text-align:center;padding:30px;
  background:radial-gradient(480px 360px at 50% 40%, rgba(217,180,91,.1), transparent 60%)}
.endcard .em{font-size:2.4rem;animation:beat 3s ease-in-out infinite}
.endcard h3{font-family:"Amiri",serif;font-size:1.3rem;margin:10px 0 6px}
.endcard p{color:#b9c6b6;font-size:.82rem;line-height:1.6;max-width:300px;margin:0 auto}
.endcard .clk{font-variant-numeric:tabular-nums;color:#e7cd86;font-weight:800}
.ig-toggle{position:absolute;top:140px;right:12px;z-index:18;width:40px;height:40px;border-radius:50%;
  border:1px solid rgba(217,180,91,.32);background:rgba(8,38,28,.74);backdrop-filter:blur(8px);cursor:pointer;
  font-size:1.05rem;display:grid;place-items:center;box-shadow:0 12px 26px -12px #000;transition:.2s;animation:chipin .4s ease}
.ig-toggle:hover{transform:scale(1.08);border-color:#d9b45b}
.ig-card{position:absolute;left:50%;top:45%;transform:translate(-50%,-50%);width:min(86%,410px);height:72%;
  border-radius:22px;overflow:hidden;background:#0b0b0b;border:1px solid rgba(217,180,91,.28);
  box-shadow:0 40px 80px -40px #000,0 0 0 6px rgba(255,255,255,.03)}
.ig-empty{position:absolute;inset:0;display:grid;place-items:center;text-align:center;padding:24px}
.ig-empty .ig-logo{font-size:3rem;filter:drop-shadow(0 8px 20px rgba(217,180,91,.3));animation:beat 3s ease-in-out infinite}
.ig-empty h3{font-family:"Amiri",serif;font-size:1.5rem;margin:10px 0 8px}
.ig-empty p{color:#b9c6b6;font-size:.85rem;line-height:1.6;max-width:330px;margin:0 auto 18px}
.ig-empty p b{color:#e7cd86}
`;

const I = {
  play: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>,
  pause: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>,
  heart: (f) => <svg viewBox="0 0 24 24" fill={f ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" /></svg>,
  nope: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-4.6-9.3-9A5.2 5.2 0 0 1 12 6.6 5.2 5.2 0 0 1 21.3 12C19 16.4 12 21 12 21z" transform="rotate(180 12 12)" /></svg>,
  home: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11l9-8 9 8M5 10v10h14V10" /></svg>,
  study: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 14v-2a9 9 0 0 1 18 0v2M3 14a3 3 0 0 0 3 3h1v-5H6a3 3 0 0 0-3 2zM21 14a3 3 0 0 1-3 3h-1v-5h1a3 3 0 0 1 3 2z" /></svg>,
  saved: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3h12v18l-6-4-6 4z" /></svg>,
  me: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>,
  plus: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M12 5v14M5 12h14" /></svg>,
  bolt: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2 3 14h7l-1 8 10-12h-7z" /></svg>,
  x: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 6l12 12M18 6L6 18" /></svg>,
  back: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>,
  search: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>,
  expand: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 14l5-5 5 5" /></svg>,
  trash: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg>,
  undo: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 14L4 9l5-5M4 9h11a5 5 0 0 1 0 10h-1" /></svg>,
  volOn: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5 6 9H2v6h4l5 4z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14" /></svg>,
  volOff: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5 6 9H2v6h4l5 4z" /><path d="m23 9-6 6M17 9l6 6" /></svg>,
  retry: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5" /></svg>,
};

const isRecitation = (t) => /quran|recit|alafasy|mishary|sudais|maher|abdul|rahman/i.test(t || "");

function msToPTMidnight() {
  try {
    const now = new Date();
    const pt = new Date(now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
    const next = new Date(pt); next.setHours(24, 0, 0, 0);
    return Math.max(0, next.getTime() - pt.getTime());
  } catch { return 0; }
}
function fmtClock(ms) {
  const s = Math.floor(ms / 1000);
  return String(Math.floor(s / 3600)).padStart(2, "0") + ":" + String(Math.floor(s / 60) % 60).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
}
function usePTCountdown() {
  const [ms, setMs] = useState(() => msToPTMidnight());
  useEffect(() => { const t = setInterval(() => setMs(msToPTMidnight()), 1000); return () => clearInterval(t); }, []);
  return ms;
}

function Reel({ item, index, active, mounted, muted, low, onAfter, onDislike, onSkip, total }) {
  const divRef = useRef(null); const pRef = useRef(null); const ready = useRef(false);
  const [saved, setSaved] = useState(() => inCollection(item.id));
  const [pop, setPop] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const isIG = item.source === "instagram";

  useEffect(() => {
    if (isIG || !mounted || !divRef.current) return; let cancel = false;
    loadYT().then(() => {
      if (cancel || !divRef.current) return;
      const p = new window.YT.Player(divRef.current, {
        videoId: item.id,
        playerVars: { autoplay: 0, controls: 0, disablekb: 1, fs: 0, modestbranding: 1, rel: 0, playsinline: 1, loop: 1, playlist: item.id, mute: 1, iv_load_policy: 3 },
        events: {
          onReady: (e) => {
            pRef.current = e.target; ready.current = true;
            if (muted) e.target.mute(); else { e.target.unMute(); e.target.setVolume(100); }
            if (low) { try { e.target.setPlaybackQuality && e.target.setPlaybackQuality("small"); } catch {} }
            if (active) { e.target.seekTo(0, true); e.target.playVideo(); } else e.target.pauseVideo();
          },
          onStateChange: (e) => { if (e.data === window.YT.PlayerState.ENDED) e.target.playVideo(); },
          onError: () => { setTimeout(() => onSkip && onSkip(index), 500); },
        },
      }); pRef.current = p;
    });
    return () => { cancel = true; try { pRef.current && pRef.current.destroy(); } catch {} pRef.current = null; ready.current = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, item.id, isIG]);

  useEffect(() => { if (isIG) return; const p = pRef.current; if (!p || !ready.current) return; try { if (active) { p.seekTo(0, true); p.playVideo(); } else p.pauseVideo(); } catch {} }, [active, isIG]);
  useEffect(() => { if (isIG) return; const p = pRef.current; if (!p || !ready.current) return; try { if (muted) p.mute(); else { p.unMute(); p.setVolume(100); } } catch {} }, [muted, isIG]);

  const onHeart = () => { const now = toggleCollection({ ...item, source: item.source || "youtube" }); setSaved(now); if (now && !isIG) { setPop(true); setTimeout(() => setPop(false), 950); } if (onAfter) onAfter(item, now); };
  const doDislike = () => { setLeaving(true); setTimeout(() => onDislike && onDislike(item), 300); };
  const count = likeCount(item.id) + (saved ? 1 : 0);
  const word = (item.t.split(" ")[0] || "Noor").replace(/[^a-zA-Z]/g, "") || "Noor";

  return (
    <section className={"reel" + (leaving ? " leaving" : "")} data-i={index}>
      <div className="reel-media">
        {isIG ? (
          <div className="ig-card"><iframe title={"ig-" + item.code} src={"https://www.instagram.com/" + item.type + "/" + item.code + "/embed/"} allow="autoplay; encrypted-media" allowFullScreen style={{ width: "100%", height: "100%", border: 0, background: "#0b0b0b" }} /></div>
        ) : mounted ? <div className="yt" ref={divRef} />
          : <div className="poster" style={item.thumb ? { backgroundImage: `url(${item.thumb})` } : undefined}>{!item.thumb && <span className="poster-emoji">🌙</span>}</div>}
        <div className="scrim-top" /><div className="scrim-bot" />
      </div>
      <div className="reel-idx">{index + 1} / {total ?? "∞"}</div>
      <div className="rail">
        <div className="rail-av">{(item.ch || "?").charAt(0).toUpperCase()}</div>
        <button className={"rail-btn" + (saved ? " liked" : "")} onClick={onHeart} aria-label="save">
          {pop && <span className="taste-pop">+🧠</span>}
          {I.heart(saved)}<span>{count >= 1000 ? (count / 1000).toFixed(1) + "K" : count}</span>
        </button>
        {onDislike && (
          <button className="rail-btn dislike" onClick={doDislike} aria-label="not interested" title="Not interested">
            {I.nope}<span style={{ fontSize: ".62rem" }}>nope</span>
          </button>
        )}
        {index === 0 && <div className="scroll-hint"><span /><small>scroll</small></div>}
      </div>
      {isIG ? (
        <div className="caption">
          <div className="cap-ch">Instagram</div>
          <div className="cap-title">Reel · {item.code}</div>
          <div className="cap-tag">#NoorShorts</div>
        </div>
      ) : (
        <div className="caption">
          <div className="cap-ch">@{item.ch}</div>
          <div className="cap-title">{item.t}</div>
          <div className="cap-tag">#{word} · #NoorShorts</div>
        </div>
      )}
    </section>
  );
}

export function ReelScroller({ list, onAfter, startIndex = 0, onClose }) {
  const noor = useNoor();
  const [idx, setIdx] = useState(startIndex);
  const root = useRef(null);
  useEffect(() => {
    setIdx(startIndex);
    const t = setTimeout(() => {
      if (!root.current) return;
      if (startIndex > 0) { const el = root.current.querySelector('.reel[data-i="' + startIndex + '"]'); el && el.scrollIntoView({ block: "start" }); }
      else root.current.scrollTop = 0;
    }, 60);
    return () => clearTimeout(t);
  }, [startIndex, list]);
  useEffect(() => {
    const r = root.current; if (!r) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { const i = parseInt(e.target.getAttribute("data-i"), 10); if (!isNaN(i)) setIdx(i); } }), { root: r, threshold: 0.6 });
    r.querySelectorAll(".reel").forEach((el) => io.observe(el)); return () => io.disconnect();
  }, [list]);
  const skip = (i) => { const el = root.current && root.current.querySelector('.reel[data-i="' + (i + 1) + '"]'); el && el.scrollIntoView({ behavior: "smooth" }); };
  return (
    <div className="scroller" ref={root}>
      {onClose && <button className="back-btn" onClick={onClose} aria-label="back">{I.back}</button>}
      {list.map((it, i) => <Reel key={it.id} item={it} index={i} active={i === idx} mounted={Math.abs(i - idx) <= 1} muted={noor.reelMuted} low={noor.dataSaver} onAfter={onAfter} onSkip={skip} total={list.length} />)}
    </div>
  );
}

function SourcePill({ source }) {
  if (!source) return null;
  const live = source === "piped" || source === "invidious" || source === "youtube";
  const label = source === "cache" ? "cached feed" : source === "youtube" ? "youtube api" : "keyless mirror";
  return <div className={"src-pill" + (live ? " live" : "")}><span className="d" />{live ? "live · " : ""}{label}</div>;
}

function QuotaRest({ onRetry }) {
  const noor = useNoor();
  const ms = usePTCountdown();
  return (
    <div className="qr">
      <div>
        <div className="qr-moon"><div className="glow" /><svg viewBox="0 0 120 120"><path d="M74 22a40 40 0 1 0 0 76 31 31 0 0 1 0-76z" fill="#d9b45b" /><path d="M86 34l5 12 13 1.4-9.8 8.4 3 12.6-11.2-7-11.2 7 3-12.6-9.8-8.4 13-1.4z" fill="#e7cd86" /></svg></div>
        <div className="qr-ar">صبر</div>
        <h2>Sab mirrors ek pal thak gaye</h2>
        <p>Humne keyless mirrors (Piped / Invidious) try kiye, cache dekha, aur YouTube API bhi — abhi sab rest pe hain ya tera network unhe rok raha hai. <b>Koi kharabi nahi.</b> Neeche wale kaam bina quota ke chalte hain.</p>
        <div className="qr-clock">{fmtClock(ms)}<small>youtube quota reset · pacific time</small></div>
        <div className="qr-tiles">
          <div className="qr-tile" onClick={() => noor.setTab("study")}><div className="e">🎧</div><b>Study</b><small>rain + timer</small></div>
          <div className="qr-tile" onClick={() => noor.setTab("saved")}><div className="e">🔖</div><b>Saved</b><small>teri reels</small></div>
          <div className="qr-tile" onClick={() => noor.setImportOpen(true)}><div className="e">＋</div><b>Import</b><small>link paste</small></div>
        </div>
        <div className="qr-retry"><button className="btn btn-ghost" onClick={onRetry}>{I.retry}<span style={{ marginLeft: 6 }}>Retry mirrors</span></button></div>
      </div>
    </div>
  );
}

function EndCard() {
  const ms = usePTCountdown();
  return (
    <div className="endcard">
      <div>
        <div className="em">🌙</div>
        <h3>Bas itni reels abhi</h3>
        <p>Mirror se itni aayin. Aur load hongi thodi der mein ya quota reset pe — <span className="clk">{fmtClock(ms)}</span> (Pacific time). Tab tak Study / Saved enjoy kar.</p>
      </div>
    </div>
  );
}

export function ReelsScreen() {
  const noor = useNoor();
  const audio = useAudio();
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(false);
  const [term, setTerm] = useState("");
  const [idx, setIdx] = useState(0);
  const [source, setSource] = useState(null);
  const [quotaDead, setQuotaDead] = useState(false);
  const [endReached, setEndReached] = useState(false);
  const [igOpen, setIgOpen] = useState(false);
  const root = useRef(null);
  const qPtr = useRef(0); const busy = useRef(false); const loadN = useRef(0);
  const seen = useRef(new Set()); const chan = useRef({});
  const tuneT = useRef(null);
  useBackClose(igOpen, () => setIgOpen(false));

  const vis = (x) => !isHidden(x.id);
  const dedupe = (a) => { const s = new Set(), o = []; for (const x of a) if (x.id && !s.has(x.id)) { s.add(x.id); o.push(x); } return o; };
  const seedSeen = (arr) => (arr || []).forEach((it) => { if (!it) return; seen.current.add(it.id); const c = it.ch || ""; chan.current[c] = (chan.current[c] || 0) + 1; });
  const fresh = (arr) => { const out = []; for (const it of arr) { if (!it || seen.current.has(it.id)) continue; const c = it.ch || ""; if ((chan.current[c] || 0) >= 2) continue; seen.current.add(it.id); chan.current[c] = (chan.current[c] || 0) + 1; out.push(it); } return out; };
  const scopeKey = (kind, payload) => kind === "auto" ? "__auto__" : kind === "creator" ? "cr:" + payload : "q:" + payload;

  const buildList = useCallback(async (kind, payload) => {
    const calls = kind === "search" ? [payload] : kind === "creator" ? [payload + " shorts", payload] : [buildTasteQuery(), QUERIES[0], QUERIES[1]];
    let all = [], src = "cache", made = 0;
    for (const q of calls) {
      if (!q || made >= 2) continue;
      try { const r = await searchVideos(noor.apiKey, q); if (r.items.length) { all = all.concat(r.items); if (r.source !== "cache") src = r.source; made++; } }
      catch (e) { if (isQuota(e) || isAllDown(e)) throw e; }
    }
    return { items: dedupe(all).filter(vis), source: src };
  }, [noor]);

  const run = useCallback(async (kind, payload, force = false) => {
    if (!noor.live) return;
    const ck = scopeKey(kind, payload);
    if (!force) {
      const c = getCachedItems(ck, FEED_TTL);
      if (c && c.length) { seedSeen(c); setFeed(c.filter(vis)); setSource("cache"); setLoading(false); setEndReached(false); return; }
    }
    setLoading(true); setEndReached(false);
    try {
      const { items, source: src } = await buildList(kind, payload);
      seedSeen(items); setFeed(items); setSource(src); cacheItems(ck, items); if (kind === "auto") persistFeed(items); setQuotaDead(false);
    } catch (e) {
      setQuotaDead(true);
      const stale = getCachedItems(ck, null) || (kind === "auto" ? getPersistedFeed() : null);
      seedSeen(stale); setFeed((stale || []).filter(vis)); setSource("cache");
    }
    setLoading(false);
  }, [noor, buildList]);

  useEffect(() => { run(noor.command.kind, noor.command.payload, false); }, [noor.command.nonce, noor.live]);

  const loadMore = useCallback(async () => {
    if (!noor.live || busy.current) return;
    if (quotaDead) { setEndReached(true); return; }
    busy.current = true; setLoading(true);
    let added = false, g = 0;
    while (!added && g < QUERIES.length + 3) {
      g++;
      const q = (loadN.current % 4 === 3) ? (buildTasteQuery() || QUERIES[qPtr.current % QUERIES.length]) : QUERIES[qPtr.current % QUERIES.length];
      qPtr.current++; loadN.current++;
      try {
        const r = await searchVideos(noor.apiKey, q);
        const add = fresh(dedupe(r.items).filter(vis));
        if (add.length) {
          setFeed((f) => { const nf = dedupe(f.concat(add)); cacheItems(scopeKey(noor.command.kind, noor.command.payload), nf); if (noor.command.kind === "auto") persistFeed(nf); return nf; });
          if (r.source !== "cache") setSource(r.source);
          added = true;
        }
      } catch (e) { if (isQuota(e) || isAllDown(e)) setQuotaDead(true); setEndReached(true); break; }
    }
    busy.current = false; setLoading(false);
  }, [noor, quotaDead]);

  useEffect(() => {
    const r = root.current; if (!r) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { const i = parseInt(e.target.getAttribute("data-i"), 10); if (!isNaN(i)) { setIdx(i); if (i >= feed.length - 3) loadMore(); } }
    }), { root: r, threshold: 0.6 });
    r.querySelectorAll(".reel").forEach((el) => io.observe(el)); return () => io.disconnect();
  }, [feed, loadMore]);

  const onAfter = useCallback((item, now) => {
    noor.afterToggle(item, now);
    if (now && noor.live && !noor.creatorMode && !noor.searchActive && !quotaDead) {
      if (tuneT.current) clearTimeout(tuneT.current);
      tuneT.current = setTimeout(async () => { const q = buildTasteQuery(); if (!q) return; try { const r = await searchVideos(noor.apiKey, q); if (r.items.length) { const add = fresh(dedupe(r.items).filter(vis)); if (add.length) setFeed((f) => dedupe(add.concat(f))); } } catch {} }, 1100);
    }
  }, [noor, quotaDead]);

  const onDislike = useCallback((item) => { setFeed((f) => f.filter((x) => x.id !== item.id)); noor.dislike(item); }, [noor]);
  const onSkip = useCallback((i) => { const el = root.current && root.current.querySelector('.reel[data-i="' + (i + 1) + '"]'); el && el.scrollIntoView({ behavior: "smooth" }); }, []);
  const onSearch = (e) => { e.preventDefault(); const v = term.trim(); if (v) noor.playSearch(v); };
  const reload = () => { seen.current = new Set(); chan.current = {}; run(noor.command.kind, noor.command.payload, true); };

  if (!noor.live) return <Onboard />;
  const afArt = audio.track ? (isRecitation(audio.track.t + " " + audio.track.ch) ? "📖" : "🎵") : "🌧️";

  return (
    <>
      <div className="rsearch">
        {I.search}
        <form onSubmit={onSearch}><input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search topic — patience, sabr, quran…" /></form>
      </div>
      {noor.creatorMode && <div className="cchip">📺 <b>{noor.creatorMode}</b><button className="x" onClick={() => { noor.playAuto(); noor.notify("Feed", "ok"); }}>{I.x}</button></div>}
      <button className="ig-toggle" onClick={() => setIgOpen(true)} title="Instagram reels — bina API">📸</button>
      {feed.length > 0 && <SourcePill source={source} />}

      {(audio.track || audio.ambientActive) && (
        <div className="afloat" title="Background audio">
          <span className="af-ico">{afArt}</span>
          {audio.playing && <span className="eq"><i /><i /><i /></span>}
          {audio.track && <button className="af-pp" onClick={audio.toggle} aria-label={audio.playing ? "pause" : "play"}>{audio.playing ? I.pause : I.play}</button>}
          <button className="af-x" onClick={audio.stopAll} aria-label="stop background audio">{I.x}</button>
        </div>
      )}

      {feed.length > 0 ? (
        <div className="scroller" ref={root}>
          {feed.map((it, i) => <Reel key={it.id} item={it} index={i} active={i === idx} mounted={noor.dataSaver ? i === idx : Math.abs(i - idx) <= 1} muted={noor.reelMuted} low={noor.dataSaver} onAfter={onAfter} onDislike={onDislike} onSkip={onSkip} />)}
          {endReached && <EndCard />}
          {loading && !endReached && <div className="reel" style={{ display: "grid", placeItems: "center" }}><div style={{ textAlign: "center", color: "#9fb0a0" }}><div style={{ width: 38, height: 38, border: "3px solid rgba(217,180,91,.25)", borderTopColor: "#d9b45b", borderRadius: "50%", margin: "0 auto 12px", animation: "spin 1s linear infinite" }} />Loading reminders…</div></div>}
        </div>
      ) : quotaDead ? (
        <QuotaRest onRetry={reload} />
      ) : (
        <div className="scroller" ref={root}>
          <div className="reel" style={{ display: "grid", placeItems: "center" }}><div style={{ textAlign: "center", color: "#9fb0a0" }}><div style={{ width: 38, height: 38, border: "3px solid rgba(217,180,91,.25)", borderTopColor: "#d9b45b", borderRadius: "50%", margin: "0 auto 12px", animation: "spin 1s linear infinite" }} />Mirrors se reels laa raha hoon…</div></div>
        </div>
      )}

      {igOpen && <InstagramOverlay onClose={() => setIgOpen(false)} />}
    </>
  );
}

function InstagramOverlay({ onClose }) {
  const noor = useNoor();
  const list = useMemo(() => noor.collection.filter((x) => x.source === "instagram"), [noor.collection]);
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 45, background: "#04140f" }}>
      {list.length === 0 ? (
        <div className="ig-empty">
          <button className="back-btn" onClick={onClose} aria-label="back">{I.back}</button>
          <div>
            <div className="ig-logo">📸</div>
            <h3>Instagram reels — bina API ke</h3>
            <p>Instagram ek <b>walled garden</b> hai: YouTube jaisa koi keyless mirror uska nahi, aur scraping = account ban + legal risk. Isliye <b>auto-discovery</b> possible nahi. Par jo reel ka <b>link</b> tu paste kare, woh official embed se yahan vertical feed mein chalti hai — keyless, legal, safe.</p>
            <button className="btn btn-gold big" onClick={() => noor.setImportOpen(true)}>＋ Pehli IG reel add karo</button>
          </div>
        </div>
      ) : (
        <ReelScroller list={list} onClose={onClose} onAfter={(it, n) => noor.afterToggle(it, n)} />
      )}
    </div>
  );
}

function Onboard() {
  const noor = useNoor();
  return (
    <div className="onboard">
      <div className="ob-glow" />
      <div className="ob-in">
        <div className="ob-ar">بِسْمِ اللَّهِ</div>
        <h2>Your infinite Islamic reel feed</h2>
        <p>Scroll karo, pasand aaye toh <b>❤️</b>, nahi toh <b>👎</b>. Feed <b>keyless mirrors</b> se aati hai — quota ki tension nahi. Study pe <b>Quran + rain</b> background mein.</p>
        <button className="btn btn-gold big" onClick={() => noor.setConnectOpen(true)}>⚡ Connect YouTube (optional)</button>
        <div style={{ marginTop: 12 }}><button className="btn btn-ghost" onClick={() => noor.setImportOpen(true)}>＋ Reel import karo</button></div>
        <div className="ob-pills">{["📖 Quran", "🤲 Dua", "🕌 Seerah", "📜 Hadith", "🎵 Nasheed"].map((t, i) => <span key={t} className="ob-pill" style={{ animationDelay: i * 0.3 + "s" }}>{t}</span>)}</div>
      </div>
    </div>
  );
}

export function StudyScreen() {
  const noor = useNoor(); const audio = useAudio();
  const [mins, setMins] = useState(25); const [left, setLeft] = useState(25 * 60); const [run, setRun] = useState(false);
  const [paste, setPaste] = useState(false); const [draft, setDraft] = useState("");
  const total = mins * 60;

  useEffect(() => { if (!run) return; const t = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000); return () => clearInterval(t); }, [run]);
  useEffect(() => { if (run && left === 0) { setRun(false); audio.chime(); const n = parseInt(localStorage.getItem("noor_sessions") || "0", 10) + 1; localStorage.setItem("noor_sessions", String(n)); noor.notify("Session complete 🤍 — " + n + " sessions", "ok"); } }, [left, run]);
  const setPreset = (m) => { setMins(m); setLeft(m * 60); setRun(false); };
  const mm = String(Math.floor(left / 60)).padStart(2, "0"); const ss = String(left % 60).padStart(2, "0");
  const R = 86, C = 2 * Math.PI * R, off = C * (1 - left / total);

  const playDraft = () => {
    const p = parseLink(draft);
    if (!p || p.source !== "youtube") { noor.notify("YouTube link paste karo (audio ke liye)", "err"); return; }
    const item = { id: p.id, t: "Your track", ch: "YouTube", source: "youtube" };
    audio.playTrack(item);
    if (addToCollection(item)) { noor.syncCol(); noor.notify("Background audio chal raha + Saved ho gaya 🎧", "ok"); }
    else noor.notify("Background audio chal raha 🎧", "ok");
    setDraft("");
  };
  const recOn = audio.track && isRecitation(audio.track.t + " " + audio.track.ch);
  const lecOn = audio.track && !recOn;

  return (
    <div className="scr-pad">
      <div className="study">
        <div className="timer-card">
          <div className="breathe" />
          <div className="ring">
            <svg width="200" height="200" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r={R} fill="none" stroke="rgba(217,180,91,.15)" strokeWidth="6" />
              <circle cx="100" cy="100" r={R} fill="none" stroke="#d9b45b" strokeWidth="6" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={off} style={{ transition: "stroke-dashoffset 1s linear" }} />
            </svg>
            <div className="face"><div className="time">{mm}:{ss}</div><div className="lab">{run ? "focus" : "ready"}</div></div>
          </div>
          <div className="timer-presets">{[15, 25, 50].map((m) => <button key={m} className={m === mins ? "on" : ""} onClick={() => setPreset(m)}>{m} min</button>)}</div>
          <div className="timer-ctl">
            <button className="btn btn-gold big" onClick={() => setRun((r) => !r)}>{run ? "Pause" : left === 0 ? "Reset" : "Start"}</button>
            {left !== total && !run && <button className="btn btn-ghost" onClick={() => setLeft(total)}>Reset</button>}
          </div>
        </div>

        <div className="card">
          <h3>Background audio <span className="ar">خلفية</span></h3>
          <p className="sub">Padhai ke dauran Quran / lecture background mein — tab badalne pe bhi chalta rahega, aur ab paste karte hi <b>Saved</b> bhi ho jaata hai. Band karna ho toh ✕.</p>
          <div className="preset-grid">
            <button className={"preset" + (recOn ? " on" : "")} onClick={audio.playRecitation}>
              {audio.playing && recOn && <span className="live-dot" />}
              <span className="pem">📖</span><span className="pt">Quran Recitation</span><span className="ps">Mishary Alafasy · keyless</span>
            </button>
            <button className={"preset" + (lecOn ? " on" : "")} onClick={audio.playLecture}>
              {audio.playing && lecOn && <span className="live-dot" />}
              <span className="pem">🎙️</span><span className="pt">Lecture / Reminder</span><span className="ps">Mufti Menk · keyless</span>
            </button>
            <button className={"preset" + (paste ? " on" : "")} onClick={() => setPaste((p) => !p)} style={{ gridColumn: "1 / -1" }}>
              <span className="pem">＋</span><span className="pt">Paste your own link</span><span className="ps">Play + auto-save to Saved</span>
            </button>
          </div>
          {paste && <div className="paste-mini"><input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="YouTube link paste karo…" onKeyDown={(e) => { if (e.key === "Enter") playDraft(); }} /><button onClick={playDraft} disabled={!draft.trim()}>Play + Save</button></div>}
        </div>

        <div className="card">
          <h3>Ambient mixer <span className="ar">سكون</span></h3>
          <p className="sub">Browser mein bante sounds — bina internet, bina copyright, bina quota. Rain + drone + chimes ko recitation ke saath mix karo.</p>
          <div className="mixer">
            <div className="mix-row"><div className="ic">🌧️</div><div className="meta"><b>Rain</b><small>soft brown-noise rain</small></div><input type="range" min="0" max="1" step="0.01" value={audio.ambient.rain} onChange={(e) => audio.setRain(parseFloat(e.target.value))} /></div>
            <div className="mix-row"><div className="ic">🎼</div><div className="meta"><b>Calm drone</b><small>warm focus pad</small></div><input type="range" min="0" max="1" step="0.01" value={audio.ambient.pad} onChange={(e) => audio.setPad(parseFloat(e.target.value))} /></div>
            <div className="mix-row"><div className="ic">✨</div><div className="meta"><b>Soft chimes</b><small>gentle bells, kabhi-kabhi</small></div><input type="range" min="0" max="1" step="0.01" value={audio.ambient.chimes} onChange={(e) => audio.setChimes(parseFloat(e.target.value))} /></div>
          </div>
          {audio.ambientActive && <div className="now-line">● Ambient live — volume neeche player mein</div>}
        </div>
      </div>
    </div>
  );
}

export function MeScreen() {
  const noor = useNoor();
  const [seg, setSeg] = useState("saved");
  const [play, setPlay] = useState(null);
  const [cd, setCd] = useState("");
  useBackClose(play !== null, () => setPlay(null));
  const sessions = parseInt(localStorage.getItem("noor_sessions") || "0", 10);
  const maxW = noor.tasteList[0] ? noor.tasteList[0].w : 1;

  return (
    <div className="scr-pad">
      <div className="me-head">
        <div className="me-av">س</div>
        <div>
          <div className="me-name">Sakib · Noor</div>
          <div className="me-stats">
            <div><b>{noor.collection.length}</b>saved</div>
            <div><b>{noor.tasteCount}</b>taste</div>
            <div><b>{sessions}</b>sessions</div>
          </div>
        </div>
      </div>

      <div className="seg">{[["saved", "Saved"], ["taste", "Taste 🧠"], ["creators", "Creators"], ["settings", "Settings"]].map(([k, l]) => <button key={k} className={seg === k ? "on" : ""} onClick={() => setSeg(k)}>{l}</button>)}</div>

      {seg === "saved" && (
        <div className="sg">
          {noor.collection.length === 0 ? <div className="sg-empty">Abhi khaali hai.<br />Reels mein <b>❤️</b> dabao ya ＋ se reel import karo.</div>
            : noor.collection.map((it, i) => (
              <div className="sg-card" key={it.id} onClick={() => setPlay(i)}>
                <span className="sg-src">{it.source === "instagram" ? "IG" : "YT"}</span>
                {it.thumb ? <img src={it.thumb} alt="" /> : <div className="sg-ph">{it.source === "instagram" ? "📸" : "🌙"}</div>}
              </div>
            ))}
        </div>
      )}

      {seg === "taste" && (
        <>
          {noor.orbit.length === 0 ? <div className="orbit-empty">Abhi kuch nahi seekha.<br />Reels mein pasand ki reels pe <b>❤️</b> dabao, pasand na aaye toh <b>👎</b> — yahan tera taste ugna shuru hoga.</div>
            : <div className="orbit"><div className="ring2" /><div className="ring3" /><div className="core"><div className="em">🧠</div><div className="ct">{noor.tasteCount} signals</div></div>
              {noor.orbit.map((o, i) => { const a = (i / noor.orbit.length) * Math.PI * 2 - Math.PI / 2; const sz = 0.7 + Math.min(o.w, 8) * 0.06; return <button key={o.k} className="kw" style={{ left: 50 + 38 * Math.cos(a) + "%", top: 50 + 38 * Math.sin(a) + "%", fontSize: sz + "rem", animationDelay: i * 0.3 + "s" }} onClick={() => { noor.forgetTaste(o.k); noor.notify("'" + o.k + "' bhula diya", "ok"); }}>{o.k}</button>; })}
            </div>}

          {noor.tasteList.length > 0 && (
            <>
              <div className="tm-h">Seekha hua (positive) <span style={{ color: "#7f8d7c", fontWeight: 600, letterSpacing: ".04em", textTransform: "none", fontSize: ".66rem" }}>tap ✕ = bhula do</span></div>
              {noor.tasteList.slice(0, 14).map((o) => (
                <div className="tm-row" key={o.k}>
                  <div className="tm-kw"><b>{o.k}</b><div className="tm-bar"><i style={{ width: Math.max(6, Math.min(100, (o.w / maxW) * 100)) + "%" }} /></div></div>
                  <span className="tm-mini">{o.w}</span>
                  <button className="tm-rm" onClick={() => { noor.forgetTaste(o.k); noor.notify("'" + o.k + "' bhula diya", "ok"); }}>{I.x}</button>
                </div>
              ))}
            </>
          )}

          <div className="tm-h">Chhupayi hui reels · {noor.hidden.length} {noor.hidden.length > 0 && <button onClick={noor.unhideEverything}>Sab wapas lao</button>}</div>
          {noor.hidden.length === 0 ? <div style={{ color: "#7f8d7c", fontSize: ".8rem", textAlign: "center", padding: "8px 0" }}>Koi reel hide nahi ki. Reels pe 👎 dabao toh yahan aayengi.</div>
            : noor.hidden.slice(0, 12).map((h) => (
              <div className="tm-row" key={h.id}>
                <div className="tm-kw"><b style={{ textTransform: "none" }}>{h.t || "Reel"}</b><div style={{ fontSize: ".66rem", color: "#7f8d7c", marginTop: 3 }}>{h.ch || h.source}</div></div>
                <button className="tm-rm" title="Wapas lao" onClick={() => { noor.unhide(h.id); noor.notify("Wapas aa gayi", "ok"); }}>{I.undo}</button>
              </div>
            ))}

          <div style={{ textAlign: "center", marginTop: 14 }}>
            <button className="btn btn-gold" onClick={() => { if (!noor.live) { noor.setConnectOpen(true); return; } if (noor.orbit.length === 0) { noor.notify("Pehle ❤️ / 👎 use karo", "err"); return; } noor.playAuto(); noor.setTab("reels"); noor.notify("Feed taste ke hisaab se 🧠", "ok"); }} disabled={noor.orbit.length === 0}>⚡ Taste se feed tune karo</button>
          </div>
        </>
      )}

      {seg === "creators" && (
        <>
          <div className="crail">{noor.creators.map((c) => (
            <div key={c.name} className="ccard" onClick={() => { if (!noor.live) { noor.setConnectOpen(true); return; } noor.selectCreator(c.name); noor.setTab("reels"); }}>
              {c.custom && <button className="rm" onClick={(e) => { e.stopPropagation(); noor.rmCreator(c.name); }}>{I.x}</button>}
              <div className="cav">{c.name.charAt(0).toUpperCase()}</div>
              <div className="cname">{c.name}</div>
            </div>
          ))}</div>
          <div className="addrow"><input value={cd} onChange={(e) => setCd(e.target.value)} placeholder="Creator / channel ka naam…" onKeyDown={(e) => { if (e.key === "Enter" && noor.addCreator(cd)) setCd(""); }} /><button onClick={() => { if (noor.addCreator(cd)) setCd(""); }}>+ Add</button></div>
        </>
      )}

      {seg === "settings" && (
        <>
          <div className="set-row" onClick={() => noor.setConnectOpen(true)}><div><b>{noor.live ? "YouTube connected (optional)" : "Connect YouTube (optional)"}</b><small>{noor.live ? "Backup source on" : "Feed keyless mirrors se chalti hai; key sirf backup hai"}</small></div><span className="go">{I.bolt}</span></div>
          <div className="set-row" onClick={() => noor.setImportOpen(true)}><div><b>Reel import karo</b><small>Instagram / YouTube link paste</small></div><span className="go">{I.plus}</span></div>
          <div className="set-row" onClick={noor.toggleDataSaver}><div><b>Data-Saver mode</b><small>{noor.dataSaver ? "ON — sirf active reel load hoti hai, low quality" : "OFF — neighbors preload hote hain"}</small></div><span className="go">{noor.dataSaver ? "🐢" : "⚡"}</span></div>
          <div className="set-row" onClick={() => { if (confirm("Saara taste clear karein?")) { localStorage.removeItem("noor_taste"); noor.forgetTaste("__noop__"); noor.notify("Taste clear", "ok"); } }}><div><b>Clear taste</b><small>Seekha hua bhula do</small></div><span className="go">{I.trash}</span></div>
          <p style={{ color: "#7f8d7c", fontSize: ".72rem", lineHeight: 1.6, marginTop: 14, textAlign: "center" }}>NoorShorts · نور — crafted by Sakib<br />Phone pe "Add to Home Screen" karo → app jaisa khulega.</p>
        </>
      )}

      {play !== null && noor.collection[play] && (
        <div style={{ position: "absolute", inset: 0, zIndex: 40, background: "#04140f" }}>
          <ReelScroller list={noor.collection} startIndex={play} onClose={() => setPlay(null)} onAfter={(item, now) => noor.afterToggle(item, now)} />
        </div>
      )}
    </div>
  );
}

export function TopBar() {
  const noor = useNoor();
  const audio = useAudio();
  const onSound = () => {
    const turningOn = noor.reelMuted;
    noor.toggleReelMuted();
    if (turningOn && audio.track && audio.playing) noor.notify("Reel sound on 🔊 · mix ho toh ✕ se background band karo", "ok");
    else if (turningOn) noor.notify("Reel sound on 🔊", "ok");
    else noor.notify("Reel sound mute 🔇", "ok");
  };
  return (
    <div className="topbar">
      <div className="brand"><svg viewBox="0 0 24 24"><path d="M20.5 13.2A8.4 8.4 0 1 1 11 3.7a6.6 6.6 0 0 0 9.5 9.5z" fill="#d9b45b" /><path d="M16.8 5.2l.7 1.7 1.8.2-1.4 1.2.4 1.8-1.5-1-1.5 1 .4-1.8-1.4-1.2 1.8-.2z" fill="#e7cd86" /></svg><span>NoorShorts <em>نور</em></span></div>
      <div className="top-r">
        <button className={"tbtn" + (noor.dataSaver ? " on-sound" : "")} onClick={noor.toggleDataSaver} title={noor.dataSaver ? "Data-saver ON" : "Data-saver OFF"}>{noor.dataSaver ? "🐢" : "⚡"}</button>
        <button className={"tbtn" + (noor.reelMuted ? "" : " on-sound")} onClick={onSound} title={noor.reelMuted ? "Reel sound off" : "Reel sound on"}>{noor.reelMuted ? I.volOff : I.volOn}</button>
        <button className={"tbtn" + (noor.live ? " live" : "")} onClick={() => noor.setConnectOpen(true)} title={noor.live ? "Connected (backup)" : "Connect (optional)"}>{I.bolt}</button>
      </div>
    </div>
  );
}

export function NowPlaying({ onExpand }) {
  const audio = useAudio();
  if (!audio.track && !audio.ambientActive) return null;
  const art = audio.track ? (isRecitation(audio.track.t + " " + audio.track.ch) ? "📖" : "🎵") : "🌧️";
  const title = audio.track ? audio.track.t : "Ambient focus";
  const sub = audio.track ? audio.track.ch : [audio.ambient.rain > 0.01 && "rain", audio.ambient.pad > 0.01 && "drone", audio.ambient.chimes > 0.01 && "chimes"].filter(Boolean).join(" + ");
  return (
    <div className={"np" + (audio.playing ? " playing" : "")}>
      <div className="np-art">{art}</div>
      <div className="np-meta">
        <b>{title}</b>
        <span>{audio.playing && <span className="eq"><i /><i /><i /><i /></span>}{sub}</span>
      </div>
      <div className="np-ctl">
        {audio.track && <button className="play" onClick={audio.toggle} aria-label="play">{audio.playing ? I.pause : I.play}</button>}
        <input className="np-vol" type="range" min="0" max="1" step="0.01" value={audio.volume} onChange={(e) => audio.setVolume(parseFloat(e.target.value))} />
        <button onClick={onExpand} aria-label="open study">{I.expand}</button>
        <button className="stop" onClick={audio.stopAll} aria-label="stop background audio">{I.x}</button>
      </div>
    </div>
  );
}

export function BottomNav() {
  const noor = useNoor();
  const Item = ({ id, icon, label }) => <button className={"nitem" + (noor.tab === id ? " on" : "")} onClick={() => noor.setTab(id)}>{icon}<small>{label}</small></button>;
  return (
    <div className="nav">
      <Item id="reels" icon={I.home} label="Reels" />
      <Item id="study" icon={I.study} label="Study" />
      <div className="ncenter"><button onClick={() => noor.setImportOpen(true)} aria-label="import">{I.plus}</button></div>
      <Item id="saved" icon={I.saved} label="Saved" />
      <Item id="me" icon={I.me} label="You" />
    </div>
  );
}

export function ImportSheet() {
  const noor = useNoor(); const [draft, setDraft] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const add = async () => { setBusy(true); const r = await noor.doImport(draft); setBusy(false); if (r.ok) { setDraft(""); noor.notify("Saved mein add ✨", "ok"); } else setErr(r.msg); };
  return (
    <aside className={"sheet" + (noor.importOpen ? " open" : "")}>
      <div className="grab" />
      <h3>Reel import karo <span className="ar">أضف</span><button className="x" onClick={() => noor.setImportOpen(false)}>{I.x}</button></h3>
      <p className="lead">Instagram ya YouTube ki reel ka <b>link paste</b> karo — seedha <b>Saved</b> mein. Koi key / login / quota nahi.</p>
      <div className="paste-mini"><input value={draft} onChange={(e) => { setDraft(e.target.value); setErr(""); }} placeholder="instagram.com/reel/…  ya  youtu.be/…" onKeyDown={(e) => { if (e.key === "Enter") add(); }} /><button onClick={add} disabled={busy || !draft.trim()}>{busy ? "…" : "Add"}</button></div>
      <div style={{ color: "#ff8aa0", fontSize: ".76rem", minHeight: "1em", marginTop: 6 }}>{err}</div>
      <div style={{ marginTop: 14, borderTop: "1px solid rgba(217,180,91,.16)", paddingTop: 12 }}>
        <div style={{ fontSize: ".7rem", letterSpacing: ".16em", textTransform: "uppercase", color: "#d9b45b", marginBottom: 8 }}>Saved · {noor.collection.length}</div>
        {noor.collection.length === 0 ? <div style={{ color: "#7f8d7c", fontSize: ".8rem", textAlign: "center", padding: "8px 0" }}>Khaali hai — upar paste karo.</div>
          : noor.collection.slice(0, 6).map((it) => (
            <div key={it.id} style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 9px", borderRadius: 11, background: "rgba(14,58,44,.45)", border: "1px solid rgba(217,180,91,.12)", marginBottom: 7 }}>
              <span style={{ fontSize: ".58rem", fontWeight: 800, padding: "3px 7px", borderRadius: 5, color: "#e7cd86", background: "rgba(217,180,91,.16)" }}>{it.source === "instagram" ? "IG" : "YT"}</span>
              <span style={{ flex: 1, fontSize: ".78rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.t}</span>
              <button onClick={() => noor.removeSaved(it.id)} style={{ background: "none", border: "none", color: "#b9c6b6", cursor: "pointer" }}>{I.trash}</button>
            </div>
          ))}
      </div>
    </aside>
  );
}

export function ConnectDrawer() {
  const noor = useNoor(); const [k, setK] = useState("");
  useEffect(() => { if (noor.connectOpen) setK(noor.apiKey); }, [noor.connectOpen]);
  const ENV = !!(import.meta.env && import.meta.env.VITE_YOUTUBE_API_KEY);
  return (
    <aside className={"drawer" + (noor.connectOpen ? " open" : "")}>
      <h3>YouTube key <span className="ar">اختياري</span> <span style={{ fontSize: ".7rem", color: "#9fb0a0", fontFamily: "Manrope", fontWeight: 600 }}>(optional)</span></h3>
      <p className="sub">Feed <b>keyless mirrors</b> (Piped / Invidious) se chalti hai — quota ki zaroorat nahi. Yeh key sirf <b>backup</b> hai agar mirrors down hon.</p>
      <label>YouTube API Key</label>
      <input type="password" value={k} onChange={(e) => setK(e.target.value)} placeholder="AIza…" readOnly={ENV} style={ENV ? { opacity: .75 } : undefined} />
      {ENV ? <p className="env-note">✓ Key teri <b>.env</b> file se aa rahi hai (backup).</p>
        : <div className="steps">1. <a href="https://console.cloud.google.com/" target="_blank" rel="noopener">Google Cloud Console</a> → new project<br />2. Library → enable <b>YouTube Data API v3</b><br />3. Credentials → Create → <b>API Key</b> → paste. (Optional.)</div>}
      <div className="actions">
        {noor.live && !ENV && <button className="btn btn-ghost" onClick={noor.disconnect}>Remove key</button>}
        {!ENV && <button className="btn btn-gold" onClick={() => { const v = k.trim(); if (!v) { noor.notify("Paste key first.", "err"); return; } noor.saveKey(v); }}>{noor.live ? "Reconnect" : "Save as backup"}</button>}
      </div>
    </aside>
  );
}