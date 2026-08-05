import { useMemo, useState } from "react";
import { CSS } from "./styles";
import { NoorProvider, AudioProvider, useNoor } from "./store";
import {
  ReelsScreen, StudyScreen, MeScreen, TopBar, BottomNav, NowPlaying,
  ImportSheet, ConnectDrawer, ReelScroller, EXTRA_CSS,
} from "./screens";

function Motes() {
  const m = useMemo(() => Array.from({ length: 12 }).map(() => ({ l: Math.random() * 100, d: 14 + Math.random() * 16, dl: -Math.random() * 30, s: 3 + Math.random() * 4 })), []);
  return <div className="motes">{m.map((x, i) => <span key={i} className="mote" style={{ left: x.l + "%", width: x.s + "px", height: x.s + "px", animationDuration: x.d + "s", animationDelay: x.dl + "s" }} />)}</div>;
}

function SavedTab() {
  const noor = useNoor();
  const [play, setPlay] = useState(null);
  return (
    <div className="scr-pad">
      <div style={{ fontFamily: "Amiri,serif", fontSize: "1.5rem", marginBottom: 4 }}>Saved <span style={{ color: "#d9b45b" }}>المفضّلة</span></div>
      <p style={{ color: "#9fb0a0", fontSize: ".8rem", marginBottom: 14 }}>Teri pasand ki reels — tap karke vertical scroll mein chalao.</p>
      <div className="sg">
        {noor.collection.length === 0 ? <div className="sg-empty">Abhi khaali hai.<br />Reels mein <b>❤️</b> dabao ya ＋ se import karo.</div>
          : noor.collection.map((it, i) => (
            <div className="sg-card" key={it.id} onClick={() => setPlay(i)}>
              <span className="sg-src">{it.source === "instagram" ? "IG" : "YT"}</span>
              {it.thumb ? <img src={it.thumb} alt="" /> : <div className="sg-ph">{it.source === "instagram" ? "📸" : "🌙"}</div>}
            </div>
          ))}
      </div>
      {play !== null && noor.collection[play] && (
        <div style={{ position: "absolute", inset: 0, zIndex: 40, background: "#04140f" }}>
          <ReelScroller list={noor.collection} startIndex={play} onClose={() => setPlay(null)} onAfter={(item, now) => noor.afterToggle(item, now)} />
        </div>
      )}
    </div>
  );
}

function Shell() {
  const noor = useNoor();
  const anyOverlay = noor.importOpen || noor.connectOpen;
  return (
    <div className="shell">
      <style>{CSS}</style>
      <style>{EXTRA_CSS}</style>
      <Motes />
      <TopBar />
      <div className="main">
        {noor.tab === "reels" && <ReelsScreen />}
        {noor.tab === "study" && <StudyScreen />}
        {noor.tab === "saved" && <SavedTab />}
        {noor.tab === "me" && <MeScreen />}
      </div>
      <div className="dock">
        <NowPlaying onExpand={() => noor.setTab("study")} />
        <BottomNav />
      </div>
      <div className={"scrim" + (anyOverlay ? " open" : "")} onClick={() => { noor.setImportOpen(false); noor.setConnectOpen(false); }} />
      <ImportSheet />
      <ConnectDrawer />
      <div className={"toast" + (noor.toast ? " show " + noor.toast.k : "")}>{noor.toast ? noor.toast.m : ""}</div>
    </div>
  );
}

export default function App() {
  return <NoorProvider><AudioProvider><Shell /></AudioProvider></NoorProvider>;
}