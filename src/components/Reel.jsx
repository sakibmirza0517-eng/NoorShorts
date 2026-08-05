import { useEffect, useRef, useState } from "react";
import { loadYT, inCollection, toggleCollection, likeCount } from "../lib";

export default function Reel({ item, index, active, mounted, muted, onToggle, total }) {
  const divRef = useRef(null);
  const playerRef = useRef(null);
  const readyRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(() => inCollection(item.id));
  const [pop, setPop] = useState(false);
  const isIG = item.source === "instagram";

  useEffect(() => {
    if (isIG || !mounted || !divRef.current) return;
    let cancelled = false;
    loadYT().then(() => {
      if (cancelled || !divRef.current) return;
      const p = new window.YT.Player(divRef.current, {
        videoId: item.id,
        playerVars: { autoplay: 0, controls: 0, disablekb: 1, fs: 0, modestbranding: 1, rel: 0, playsinline: 1, loop: 1, playlist: item.id, mute: 1, iv_load_policy: 3 },
        events: {
          onReady: (e) => {
            playerRef.current = e.target; readyRef.current = true; setReady(true);
            if (muted) e.target.mute(); else { e.target.unMute(); e.target.setVolume(100); }
            if (active) { e.target.seekTo(0, true); e.target.playVideo(); } else e.target.pauseVideo();
          },
          onStateChange: (e) => { if (e.data === window.YT.PlayerState.ENDED) e.target.playVideo(); },
        },
      });
      playerRef.current = p;
    });
    return () => { cancelled = true; try { playerRef.current && playerRef.current.destroy && playerRef.current.destroy(); } catch {} playerRef.current = null; readyRef.current = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, item.id, isIG]);

  useEffect(() => { if (isIG) return; const p = playerRef.current; if (!p || !readyRef.current) return; try { if (active) { p.seekTo(0, true); p.playVideo(); } else p.pauseVideo(); } catch {} }, [active, isIG]);
  useEffect(() => { if (isIG) return; const p = playerRef.current; if (!p || !readyRef.current) return; try { if (muted) p.mute(); else { p.unMute(); p.setVolume(100); } } catch {} }, [muted, isIG]);

  const onHeart = () => {
    const now = toggleCollection({ ...item, source: item.source || "youtube" });
    setSaved(now);
    if (now && !isIG) { setPop(true); setTimeout(() => setPop(false), 950); }
    if (onToggle) onToggle(item, now);
  };

  const count = likeCount(item.id) + (saved ? 1 : 0);
  const firstWord = (item.t.split(" ")[0] || "Noor").replace(/[^a-zA-Z]/g, "") || "Noor";

  return (
    <section className={"reel" + (active ? " active" : "")} data-i={index}>
      <div className="reel-media">
        {isIG ? (
          <div className="ig-embed"><iframe title={"instagram-" + item.code} src={"https://www.instagram.com/" + item.type + "/" + item.code + "/embed/"} allow="autoplay; encrypted-media" allowFullScreen /></div>
        ) : mounted ? (
          <div className="yt" ref={divRef} />
        ) : (
          <div className="poster" style={item.thumb ? { backgroundImage: `url(${item.thumb})` } : undefined}>{!item.thumb && <span className="poster-emoji">🌙</span>}</div>
        )}
        <div className="scrim-top" /><div className="scrim-bot" />
      </div>

      <div className="reel-index">{index + 1} / {total ?? "∞"}</div>

      {isIG ? (
        <div className="ig-flag"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>Imported · Instagram</div>
      ) : (
        <>
          <div className="rail">
            <div className="rail-av">{(item.ch || "?").charAt(0).toUpperCase()}</div>
            <button className={"rail-btn" + (saved ? " liked" : "")} onClick={onHeart} aria-label="save">
              {pop && <span className="taste-pop" aria-hidden>+🧠</span>}
              <svg viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" /></svg>
              <span>{count >= 1000 ? (count / 1000).toFixed(1) + "K" : count}</span>
            </button>
            <div className="rail-btn" title="channel"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg></div>
            {index === 0 && <div className="scroll-hint"><span /><small>scroll</small></div>}
          </div>
          <div className="caption">
            <div className="cap-ch">@{item.ch}</div>
            <div className="cap-title">{item.t}</div>
            <div className="cap-tag">#{firstWord} · #NoorShorts</div>
          </div>
        </>
      )}
    </section>
  );
}