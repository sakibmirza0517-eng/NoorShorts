export const CSS = `
.shell{position:relative;width:min(480px,100vw);height:100%;display:flex;flex-direction:column;overflow:hidden;
  background:linear-gradient(180deg,#06231a,#0a3025 55%,#072a20);box-shadow:0 0 90px rgba(0,0,0,.55)}
.shell::before{content:"";position:absolute;inset:0;pointer-events:none;z-index:0;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='70' height='70'%3E%3Cg fill='none' stroke='%23d9b45b' stroke-opacity='0.05'%3E%3Crect x='18' y='18' width='34' height='34'/%3E%3Crect x='18' y='18' width='34' height='34' transform='rotate(45 35 35)'/%3E%3C/g%3E%3C/svg%3E");background-size:70px 70px}
.motes{position:absolute;inset:0;z-index:1;pointer-events:none;overflow:hidden}
.mote{position:absolute;bottom:-10px;border-radius:50%;opacity:0;background:radial-gradient(circle,#e7cd86,transparent 70%);animation:rise linear infinite}
@keyframes rise{0%{transform:translateY(0) scale(.6);opacity:0}12%{opacity:.7}88%{opacity:.4}100%{transform:translateY(-105vh) scale(1.1);opacity:0}}

/* top bar */
.topbar{position:absolute;top:0;left:0;right:0;z-index:30;display:flex;align-items:center;justify-content:space-between;
  padding:12px 16px;background:linear-gradient(180deg,rgba(4,20,15,.82),transparent);backdrop-filter:blur(3px)}
.brand{display:flex;align-items:center;gap:9px;font-family:"Amiri",serif;font-weight:700;font-size:1.25rem}
.brand em{font-style:normal;color:#d9b45b;margin-left:4px}
.brand svg{width:22px;height:22px}
.top-r{display:flex;gap:9px}
.tbtn{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;cursor:pointer;color:#f3ead5;
  background:rgba(8,38,28,.5);border:1px solid rgba(217,180,91,.25);backdrop-filter:blur(6px);transition:.2s}
.tbtn svg{width:19px;height:19px}
.tbtn:hover{border-color:#d9b45b;color:#e7cd86}
.tbtn.live{color:#06231a;background:linear-gradient(180deg,#e7cd86,#d9b45b);border-color:transparent}

/* main + dock */
.main{position:relative;flex:1;overflow:hidden;z-index:2}
.scr-pad{position:absolute;inset:0;overflow-y:auto;overflow-x:hidden;padding:60px 16px 16px;scrollbar-width:none}
.scr-pad::-webkit-scrollbar{display:none}
.dock{position:relative;z-index:20;flex:none}

/* bottom nav */
.nav{display:flex;align-items:flex-end;justify-content:space-around;padding:8px 6px calc(8px + env(safe-area-inset-bottom));
  background:linear-gradient(0deg,rgba(4,20,15,.97),rgba(6,35,26,.92));border-top:1px solid rgba(217,180,91,.18)}
.nitem{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;color:#9fb0a0;background:none;border:none;transition:.2s}
.nitem svg{width:25px;height:25px}
.nitem small{font-size:.6rem;font-weight:700;letter-spacing:.04em}
.nitem.on{color:#e7cd86}
.nitem.on svg{filter:drop-shadow(0 0 8px rgba(217,180,91,.5))}
.ncenter{flex:1;display:flex;justify-content:center}
.ncenter button{width:50px;height:50px;margin-top:-22px;border-radius:50%;border:3px solid #06231a;cursor:pointer;
  display:grid;place-items:center;color:#1a1407;background:linear-gradient(180deg,#e7cd86,#d9b45b);box-shadow:0 8px 20px -8px rgba(217,180,91,.8);transition:.2s}
.ncenter button:hover{transform:translateY(-2px) scale(1.05)}
.ncenter button svg{width:24px;height:24px}

/* now playing */
.np{display:flex;align-items:center;gap:11px;padding:9px 12px;margin:0 8px 6px;border-radius:16px;
  background:linear-gradient(120deg,#10432f,#0c3326);border:1px solid rgba(217,180,91,.28);box-shadow:0 -6px 20px -12px #000;animation:npin .35s ease}
@keyframes npin{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.np-art{width:40px;height:40px;border-radius:11px;flex:none;display:grid;place-items:center;font-size:1.2rem;
  background:radial-gradient(circle at 30% 25%,#15523c,#0a2e22);border:1px solid rgba(217,180,91,.25);position:relative;overflow:hidden}
.np.playing .np-art::after{content:"";position:absolute;inset:0;background:linear-gradient(120deg,transparent,rgba(217,180,91,.25),transparent);animation:shine 2.4s linear infinite}
@keyframes shine{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
.np-meta{flex:1;min-width:0}
.np-meta b{display:block;font-size:.82rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.np-meta span{font-size:.68rem;color:#9fb0a0;display:flex;align-items:center;gap:6px}
.eq{display:inline-flex;gap:2px;align-items:flex-end;height:11px}
.eq i{width:2px;background:#5fe08a;border-radius:1px;animation:eq 1s ease-in-out infinite}
.eq i:nth-child(2){animation-delay:.2s}.eq i:nth-child(3){animation-delay:.4s}.eq i:nth-child(4){animation-delay:.1s}
@keyframes eq{0%,100%{height:3px}50%{height:11px}}
.np-ctl{display:flex;align-items:center;gap:8px}
.np-ctl button{background:none;border:none;cursor:pointer;color:#f3ead5;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;transition:.18s}
.np-ctl button:hover{background:rgba(217,180,91,.12);color:#e7cd86}
.np-ctl button svg{width:20px;height:20px}
.np-ctl .play{background:linear-gradient(180deg,#e7cd86,#d9b45b);color:#1a1407}
.np-ctl .play:hover{filter:brightness(1.06)}
.np-vol{width:62px;accent-color:#d9b45b}

/* reels */
.scroller{position:absolute;inset:0;overflow-y:scroll;scroll-snap-type:y mandatory;scrollbar-width:none}
.scroller::-webkit-scrollbar{display:none}
.reel{position:relative;height:100%;width:100%;scroll-snap-align:start;scroll-snap-stop:always;overflow:hidden}
.reel-media{position:absolute;inset:0;background:#04140f}
.reel-media .yt,.reel-media .yt iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
.poster{position:absolute;inset:0;background-size:cover;background-position:center;display:grid;place-items:center}
.poster::after{content:"";position:absolute;inset:0;background:linear-gradient(160deg,#0e3a2c,#10432f)}
.poster-emoji{position:relative;font-size:4rem;filter:drop-shadow(0 6px 14px rgba(0,0,0,.5))}
.scrim-top{position:absolute;top:0;left:0;right:0;height:28%;background:linear-gradient(180deg,rgba(3,15,11,.5),transparent);pointer-events:none}
.scrim-bot{position:absolute;bottom:0;left:0;right:0;height:52%;background:linear-gradient(0deg,rgba(3,15,11,.92),transparent);pointer-events:none}
.reel-idx{position:absolute;top:62px;left:50%;transform:translateX(-50%);z-index:10;font-size:.64rem;letter-spacing:.14em;
  color:rgba(243,234,213,.8);background:rgba(8,38,28,.5);border:1px solid rgba(217,180,91,.25);padding:4px 11px;border-radius:999px}
.rail{position:absolute;right:11px;bottom:30px;z-index:10;display:flex;flex-direction:column;align-items:center;gap:16px}
.rail-av{width:46px;height:46px;border-radius:50%;display:grid;place-items:center;font-weight:800;color:#1a1407;
  background:linear-gradient(180deg,#e7cd86,#d9b45b);border:2px solid rgba(255,255,255,.85);box-shadow:0 6px 16px -6px #000}
.rail-btn{position:relative;display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;color:#fff;background:none;border:none;text-shadow:0 1px 4px rgba(0,0,0,.6)}
.rail-btn svg{width:33px;height:33px;filter:drop-shadow(0 2px 6px rgba(0,0,0,.5));transition:.18s}
.rail-btn:active svg{transform:scale(.85)}
.rail-btn.liked svg{color:#ff5470;fill:#ff5470}
.rail-btn span{font-size:.72rem;font-weight:700}
.taste-pop{position:absolute;top:-8px;left:50%;transform:translateX(-50%);font-size:.7rem;font-weight:800;color:#e7cd86;pointer-events:none;text-shadow:0 1px 6px #000;animation:tpop .95s ease-out forwards;white-space:nowrap}
@keyframes tpop{0%{opacity:0;transform:translate(-50%,4px)}20%{opacity:1}100%{opacity:0;transform:translate(-50%,-30px)}}
.scroll-hint{display:flex;flex-direction:column;align-items:center;gap:5px;margin-top:4px;color:#e7cd86}
.scroll-hint span{width:20px;height:32px;border:2px solid #e7cd86;border-radius:12px;position:relative}
.scroll-hint span::after{content:"";position:absolute;left:50%;top:6px;width:4px;height:6px;border-radius:2px;background:#e7cd86;transform:translateX(-50%);animation:dot 1.5s infinite}
@keyframes dot{0%{opacity:0;transform:translate(-50%,0)}40%{opacity:1}100%{opacity:0;transform:translate(-50%,9px)}}
.scroll-hint small{font-size:.58rem;letter-spacing:.2em;text-transform:uppercase}
.caption{position:absolute;left:15px;right:80px;bottom:26px;z-index:10}
.cap-ch{font-weight:800;font-size:.92rem;margin-bottom:5px}
.cap-title{font-size:.9rem;line-height:1.4;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;text-shadow:0 1px 6px rgba(0,0,0,.7)}
.cap-tag{margin-top:7px;font-size:.72rem;color:#e7cd86;font-weight:600}
.back-btn{position:absolute;top:58px;left:12px;z-index:20;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;cursor:pointer;
  color:#f3ead5;background:rgba(8,38,28,.6);border:1px solid rgba(217,180,91,.3);backdrop-filter:blur(6px)}
.back-btn svg{width:20px;height:20px}

/* onboard */
.onboard{position:absolute;inset:0;display:grid;place-items:center;text-align:center;padding:24px;
  background:radial-gradient(600px 460px at 50% 32%, rgba(217,180,91,.14), transparent 60%)}
.ob-glow{position:absolute;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(217,180,91,.32),transparent 70%);filter:blur(18px);animation:beat 4s ease-in-out infinite}
@keyframes beat{0%,100%{transform:scale(.9);opacity:.6}50%{transform:scale(1.1);opacity:1}}
.ob-in{position:relative;max-width:360px}
.ob-ar{font-family:"Amiri",serif;color:#d9b45b;font-size:2.2rem;direction:rtl;margin-bottom:12px}
.ob-in h2{font-family:"Amiri",serif;font-size:1.7rem;line-height:1.15;margin-bottom:10px}
.ob-in p{color:#b9c6b6;line-height:1.6;margin-bottom:20px}
.ob-in b{color:#e7cd86}
.btn{cursor:pointer;border:none;font-weight:800;border-radius:999px;transition:.25s;display:inline-flex;align-items:center;gap:8px}
.btn-gold{background:linear-gradient(180deg,#e7cd86,#d9b45b);color:#1a1407;box-shadow:0 10px 26px -10px rgba(217,180,91,.8)}
.btn-gold:hover{transform:translateY(-2px)}
.btn-gold.big{padding:14px 24px;font-size:.95rem}
.btn-ghost{background:transparent;color:#f3ead5;border:1px solid rgba(217,180,91,.3);padding:11px 17px}
.btn-ghost:hover{border-color:#d9b45b;color:#e7cd86}
.ob-pills{display:flex;flex-wrap:wrap;gap:7px;justify-content:center;margin-top:18px}
.ob-pill{font-size:.72rem;font-weight:700;padding:6px 12px;border-radius:999px;color:#e7cd86;border:1px solid rgba(217,180,91,.3);background:rgba(14,58,44,.5);animation:obfloat 4s ease-in-out infinite}
@keyframes obfloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}

/* reels search + creator chip */
.rsearch{position:absolute;top:54px;left:12px;right:12px;z-index:15}
.rsearch input{width:100%;font-size:.85rem;color:#f3ead5;padding:11px 14px 11px 38px;border-radius:999px;background:rgba(8,38,28,.62);border:1px solid rgba(217,180,91,.25);outline:none;backdrop-filter:blur(6px)}
.rsearch input:focus{border-color:#d9b45b}
.rsearch svg{position:absolute;left:13px;top:50%;transform:translateY(-50%);width:16px;height:16px;color:#d9b45b}
.cchip{position:absolute;top:98px;left:50%;transform:translateX(-50%);z-index:15;display:inline-flex;align-items:center;gap:7px;font-size:.72rem;font-weight:700;color:#1a1407;background:linear-gradient(180deg,#e7cd86,#d9b45b);padding:6px 7px 6px 13px;border-radius:999px;box-shadow:0 8px 20px -10px rgba(217,180,91,.8);animation:chipin .4s cubic-bezier(.34,1.56,.64,1)}
@keyframes chipin{from{opacity:0;transform:translate(-50%,-10px)}to{opacity:1;transform:translate(-50%,0)}}
.cchip b{font-family:"Amiri",serif;font-size:.92rem}
.cchip .x{cursor:pointer;border:none;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;background:rgba(26,20,7,.25);color:#1a1407}
.cchip .x svg{width:12px;height:12px}

/* study screen */
.study{display:flex;flex-direction:column;gap:16px;padding-bottom:8px}
.timer-card{position:relative;border-radius:24px;padding:26px 18px;text-align:center;overflow:hidden;
  background:radial-gradient(420px 300px at 50% 0%, rgba(217,180,91,.12), transparent 70%),linear-gradient(180deg,#0e3a2c,#0c3326);border:1px solid rgba(217,180,91,.22)}
.breathe{position:absolute;left:50%;top:42%;transform:translate(-50%,-50%);width:230px;height:230px;border-radius:50%;
  background:radial-gradient(circle,rgba(95,224,138,.12),transparent 65%);animation:breathe 8s ease-in-out infinite}
@keyframes breathe{0%,100%{transform:translate(-50%,-50%) scale(.82);opacity:.5}50%{transform:translate(-50%,-50%) scale(1.08);opacity:1}}
.ring{position:relative;width:200px;height:200px;margin:0 auto}
.ring svg{transform:rotate(-90deg)}
.ring .face{position:absolute;inset:0;display:grid;place-items:center;text-align:center}
.ring .time{font-family:"Amiri",serif;font-size:2.6rem;color:#f3ead5;line-height:1}
.ring .lab{font-size:.66rem;letter-spacing:.22em;text-transform:uppercase;color:#9fb0a0;margin-top:4px}
.timer-presets{display:flex;gap:8px;justify-content:center;margin:18px 0 14px}
.timer-presets button{cursor:pointer;font-weight:700;font-size:.78rem;padding:7px 14px;border-radius:999px;color:#b9c6b6;background:rgba(14,58,44,.6);border:1px solid rgba(217,180,91,.2);transition:.2s}
.timer-presets button.on{color:#1a1407;background:linear-gradient(180deg,#e7cd86,#d9b45b);border-color:transparent}
.timer-ctl{display:flex;gap:10px;justify-content:center}
.card{border-radius:22px;padding:18px;background:linear-gradient(180deg,#0e3a2c,#0c3326);border:1px solid rgba(217,180,91,.2)}
.card h3{font-family:"Amiri",serif;font-size:1.2rem;margin-bottom:4px;display:flex;align-items:center;gap:8px}
.card h3 .ar{color:#d9b45b;font-size:1.05rem}
.card .sub{font-size:.78rem;color:#9fb0a0;line-height:1.5;margin-bottom:14px}
.audio-row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}
.audio-row button{cursor:pointer;font-weight:700;font-size:.78rem;padding:9px 13px;border-radius:12px;color:#e7cd86;background:rgba(14,58,44,.6);border:1px solid rgba(217,180,91,.25);transition:.2s;display:inline-flex;align-items:center;gap:6px}
.audio-row button:hover{border-color:#d9b45b;transform:translateY(-1px)}
.audio-row button.on{color:#1a1407;background:linear-gradient(180deg,#e7cd86,#d9b45b);border-color:transparent}
.paste-mini{display:flex;gap:8px;margin-bottom:6px}
.paste-mini input{flex:1;font-size:.82rem;color:#f3ead5;padding:11px 12px;border-radius:12px;background:rgba(6,35,26,.85);border:1px solid rgba(217,180,91,.25);outline:none}
.paste-mini input:focus{border-color:#d9b45b}
.paste-mini button{flex:none;border:none;cursor:pointer;font-weight:800;font-size:.78rem;padding:0 15px;border-radius:12px;color:#1a1407;background:linear-gradient(180deg,#e7cd86,#d9b45b)}
.paste-mini button:disabled{opacity:.4;cursor:not-allowed}
.mixer{display:flex;flex-direction:column;gap:14px}
.mix-row{display:flex;align-items:center;gap:12px}
.mix-row .ic{width:34px;height:34px;border-radius:10px;flex:none;display:grid;place-items:center;font-size:1.1rem;background:rgba(217,180,91,.1);border:1px solid rgba(217,180,91,.22)}
.mix-row .meta{flex:1}
.mix-row .meta b{font-size:.82rem;display:block}
.mix-row .meta small{font-size:.66rem;color:#7f8d7c}
.mix-row input[type=range]{flex:1;accent-color:#d9b45b}
.now-line{font-size:.74rem;color:#5fe08a;margin-top:4px;display:flex;align-items:center;gap:6px}

/* me screen */
.me-head{display:flex;align-items:center;gap:14px;margin-bottom:16px}
.me-av{width:62px;height:62px;border-radius:50%;display:grid;place-items:center;font-family:"Amiri",serif;font-size:1.6rem;color:#1a1407;background:linear-gradient(180deg,#e7cd86,#d9b45b);box-shadow:inset 0 0 16px rgba(255,255,255,.25)}
.me-name{font-family:"Amiri",serif;font-size:1.4rem}
.me-stats{display:flex;gap:18px;margin-top:6px}
.me-stats div{font-size:.74rem;color:#9fb0a0}
.me-stats b{display:block;font-size:1.1rem;color:#f3ead5;font-family:"Amiri",serif}
.seg{display:flex;gap:7px;margin:6px 0 16px;overflow-x:auto;scrollbar-width:none}
.seg::-webkit-scrollbar{display:none}
.seg button{flex:none;cursor:pointer;font-weight:700;font-size:.78rem;padding:8px 15px;border-radius:999px;color:#9fb0a0;background:rgba(14,58,44,.5);border:1px solid rgba(217,180,91,.18);transition:.2s}
.seg button.on{color:#1a1407;background:linear-gradient(180deg,#e7cd86,#d9b45b);border-color:transparent}
.sg{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
.sg-card{position:relative;aspect-ratio:9/16;border-radius:12px;overflow:hidden;cursor:pointer;background:#0a2e22;border:1px solid rgba(217,180,91,.15);transition:.2s}
.sg-card:hover{transform:scale(1.03);border-color:rgba(217,180,91,.5)}
.sg-card img{width:100%;height:100%;object-fit:cover}
.sg-ph{position:absolute;inset:0;display:grid;place-items:center;font-size:2rem;background:linear-gradient(150deg,#0e3a2c,#10432f)}
.sg-card .sg-src{position:absolute;top:6px;left:6px;font-size:.54rem;font-weight:800;letter-spacing:.1em;padding:3px 6px;border-radius:5px;color:#1a1407;background:linear-gradient(180deg,#e7cd86,#d9b45b)}
.sg-empty{grid-column:1/-1;text-align:center;color:#7f8d7c;padding:30px 0;font-size:.85rem;line-height:1.6}
.sg-empty b{color:#e7cd86}
.orbit{position:relative;width:230px;height:230px;margin:4px auto}
.orbit .ring2{position:absolute;inset:14px;border:1px dashed rgba(217,180,91,.16);border-radius:50%;animation:spin 44s linear infinite}
.orbit .ring3{position:absolute;inset:52px;border:1px dashed rgba(217,180,91,.1);border-radius:50%;animation:spin 28s linear infinite reverse}
@keyframes spin{to{transform:rotate(360deg)}}
.orbit .core{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);text-align:center;pointer-events:none}
.orbit .core .em{font-size:1.8rem;animation:beat 2.6s ease-in-out infinite}
.orbit .core .ct{font-size:.6rem;letter-spacing:.16em;text-transform:uppercase;color:#9fb0a0;margin-top:2px}
.kw{position:absolute;transform:translate(-50%,-50%);padding:5px 10px;border-radius:999px;background:rgba(14,58,44,.8);border:1px solid rgba(217,180,91,.3);color:#e7cd86;font-weight:700;white-space:nowrap;cursor:pointer;animation:kwfloat 4s ease-in-out infinite;transition:.18s}
.kw:hover{border-color:#ff8aa0;color:#fff;background:rgba(255,84,112,.18)}
@keyframes kwfloat{0%,100%{margin-top:0}50%{margin-top:-5px}}
.orbit-empty{text-align:center;color:#7f8d7c;font-size:.82rem;padding:24px 8px;line-height:1.6}
.orbit-empty b{color:#e7cd86}
.crail{display:flex;gap:11px;overflow-x:auto;padding:4px 2px 10px;scrollbar-width:none}
.crail::-webkit-scrollbar{display:none}
.ccard{flex:none;width:108px;cursor:pointer;text-align:center;padding:13px 9px;border-radius:15px;background:rgba(14,58,44,.5);border:1px solid rgba(217,180,91,.15);transition:.22s;position:relative}
.ccard:hover{transform:translateY(-3px);border-color:rgba(217,180,91,.5)}
.ccard .cav{width:42px;height:42px;border-radius:50%;margin:0 auto 7px;display:grid;place-items:center;font-weight:800;color:#1a1407;background:linear-gradient(180deg,#e7cd86,#d9b45b)}
.ccard .cname{font-size:.74rem;font-weight:700;line-height:1.2;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:1.9em}
.ccard .rm{position:absolute;top:5px;right:5px;width:18px;height:18px;border-radius:50%;border:none;cursor:pointer;background:rgba(6,35,26,.7);color:#b9c6b6;display:grid;place-items:center;opacity:0;transition:.2s}
.ccard:hover .rm{opacity:1}
.ccard .rm svg{width:10px;height:10px}
.addrow{display:flex;gap:8px;margin-top:4px}
.addrow input{flex:1;font-size:.82rem;color:#f3ead5;padding:10px 12px;border-radius:12px;background:rgba(6,35,26,.85);border:1px solid rgba(217,180,91,.25);outline:none}
.addrow button{flex:none;border:none;cursor:pointer;font-weight:800;font-size:.78rem;padding:0 15px;border-radius:12px;color:#1a1407;background:linear-gradient(180deg,#e7cd86,#d9b45b)}
.set-row{display:flex;align-items:center;justify-content:space-between;padding:13px 14px;border-radius:14px;background:rgba(14,58,44,.45);border:1px solid rgba(217,180,91,.14);margin-bottom:9px;cursor:pointer;transition:.2s}
.set-row:hover{border-color:rgba(217,180,91,.4)}
.set-row b{font-size:.85rem}
.set-row small{display:block;color:#7f8d7c;font-size:.68rem;margin-top:2px}
.set-row .go{color:#9fb0a0}

/* sheets / drawer / scrim / toast */
.scrim{position:absolute;inset:0;z-index:55;background:rgba(3,15,11,.6);opacity:0;visibility:hidden;transition:.3s}
.scrim.open{opacity:1;visibility:visible}
.sheet{position:absolute;left:0;right:0;bottom:0;z-index:72;max-height:86%;overflow:auto;border-radius:24px 24px 0 0;padding:16px 18px 24px;
  background:linear-gradient(180deg,#0c3326,#072a20);border-top:1px solid rgba(217,180,91,.3);box-shadow:0 -30px 60px -30px #000;
  transform:translateY(110%);transition:transform .4s cubic-bezier(.32,.72,.24,1)}
.sheet.open{transform:none}
.sheet .grab{width:42px;height:4px;border-radius:2px;background:rgba(217,180,91,.4);margin:0 auto 12px}
.sheet h3{font-family:"Amiri",serif;font-size:1.35rem;display:flex;align-items:center;justify-content:space-between}
.sheet h3 .ar{color:#d9b45b}
.sheet h3 .x{cursor:pointer;color:#b9c6b6;background:none;border:none;width:32px;height:32px;border-radius:50%;display:grid;place-items:center}
.sheet h3 .x:hover{color:#e7cd86;background:rgba(217,180,91,.1)}
.sheet h3 .x svg{width:17px;height:17px}
.sheet .lead{color:#b9c6b6;font-size:.82rem;line-height:1.6;margin:6px 0 14px}
.sheet .lead b{color:#e7cd86}
.drawer{position:absolute;top:0;right:0;bottom:0;width:88%;z-index:72;padding:24px 22px;display:flex;flex-direction:column;
  background:linear-gradient(180deg,#0a3025,#072a20);border-left:1px solid rgba(217,180,91,.25);box-shadow:-30px 0 60px -30px #000;
  transform:translateX(105%);transition:transform .35s cubic-bezier(.4,0,.2,1)}
.drawer.open{transform:none}
.drawer h3{font-family:"Amiri",serif;font-size:1.4rem}
.drawer h3 .ar{color:#d9b45b}
.drawer .sub{font-size:.82rem;color:#b9c6b6;line-height:1.6;margin:10px 0 20px}
.drawer .sub b{color:#e7cd86}
.drawer label{font-size:.7rem;letter-spacing:.16em;text-transform:uppercase;color:#d9b45b;font-weight:700}
.drawer input{width:100%;margin:8px 0 6px;font-size:.85rem;padding:13px 14px;border-radius:12px;background:rgba(6,35,26,.8);border:1px solid rgba(217,180,91,.25);color:#f3ead5;outline:none}
.drawer input:focus{border-color:#d9b45b}
.drawer .steps{font-size:.76rem;color:#b9c6b6;line-height:1.8;margin:14px 0;padding:13px;border-radius:12px;border:1px solid rgba(217,180,91,.22);background:rgba(14,58,44,.4)}
.drawer .steps a{color:#e7cd86}
.drawer .env-note{margin:8px 0 0;color:#5fe08a;font-size:.78rem;line-height:1.5}
.drawer .actions{display:flex;gap:10px;margin-top:auto}
.drawer .actions .btn{flex:1;justify-content:center}
.toast{position:absolute;left:50%;bottom:84px;transform:translateX(-50%) translateY(30px);z-index:90;max-width:88%;text-align:center;
  background:#0a3025;border:1px solid rgba(217,180,91,.25);color:#f3ead5;padding:12px 18px;border-radius:14px;font-size:.82rem;
  box-shadow:0 18px 40px -18px #000;opacity:0;transition:.35s;pointer-events:none}
.toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
.toast.ok{border-color:rgba(95,224,138,.5)}
.toast.err{border-color:rgba(224,120,95,.5)}
`;