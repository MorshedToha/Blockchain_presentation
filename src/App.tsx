import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { DeckContext, type DeckApi, type Dir } from "@/deck/DeckContext";
import { themeBg, type Theme } from "@/deck/ui";
import { SLIDES, contentNo } from "@/slides";
import { cn } from "@/utils/cn";
import { PresenterView } from "@/deck/Presenter";
import { MobileRemote } from "@/deck/MobileRemote";
import { RemoteModal } from "@/deck/RemoteModal";
import { RemoteSync } from "@/deck/remoteSync";
import { H, StaticSlide, W, mmss, useFit, type AudienceMsg, type PresenterMsg } from "@/deck/stage";

const params = new URLSearchParams(window.location.search);
const IS_PRESENTER = params.has("presenter");
const IS_REMOTE = params.has("remote");

const BUILD_MS = 650;
const SLIDE_MS = 480;

function parseHash(): [number, number] {
  const m = window.location.hash.match(/^#\/?(\d+)(?:\.(\d+))?/);
  if (!m) return [0, 0];
  const i = Math.min(SLIDES.length - 1, Math.max(0, parseInt(m[1], 10) - 1));
  const s = Math.min(SLIDES[i].builds, Math.max(0, parseInt(m[2] ?? "0", 10)));
  return [i, s];
}

function SlideEnter({ children, dir, k }: { children: ReactNode; dir: Dir; k: number }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    setOn(false);
    const r = requestAnimationFrame(() => requestAnimationFrame(() => setOn(true)));
    return () => cancelAnimationFrame(r);
  }, [k]);
  return (
    <div
      className="absolute inset-0"
      style={{
        opacity: on ? 1 : 0,
        transform: on ? "none" : `translateX(${dir === "fwd" ? 36 : -36}px)`,
        transition: `opacity ${SLIDE_MS}ms cubic-bezier(.2,.7,.1,1), transform ${SLIDE_MS}ms cubic-bezier(.2,.7,.1,1)`,
      }}
    >
      {children}
    </div>
  );
}

export default function App() {
  if (IS_REMOTE) return <MobileRemote />;
  if (IS_PRESENTER) return <PresenterView />;
  return <Deck />;
}

function Deck() {
  const [[index, step], setPos] = useState<[number, number]>(parseHash);
  const [dir, setDir] = useState<Dir>("fwd");
  const [overview, setOverview] = useState(false);
  const [notes, setNotes] = useState(false);
  const [remoteModalOpen, setRemoteModalOpen] = useState(false);
  const [connectedPeers, setConnectedPeers] = useState<string[]>([]);
  const [isMqttConnected, setIsMqttConnected] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  // Mobile & Orientation state
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined"
      ? window.innerWidth < 1024 || window.innerHeight < 650 || "ontouchstart" in window
      : false
  );
  const [isPortrait, setIsPortrait] = useState(() =>
    typeof window !== "undefined" ? window.innerHeight > window.innerWidth : false
  );
  const [forceRotate, setForceRotate] = useState(false);
  const [dismissRotateTip, setDismissRotateTip] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      const portrait = window.innerHeight > window.innerWidth;
      setIsPortrait(portrait);
      setIsMobile(window.innerWidth < 1024 || window.innerHeight < 650 || "ontouchstart" in window);
      if (!portrait) {
        setForceRotate(false); // cancel software rotation if physically landscape
      }
    };
    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);
    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
    };
  }, []);

  const [reduced, setReduced] = useState(() => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);
  const [skip, setSkip] = useState(false);
  const [finishTick, setFinishTick] = useState(0);
  const [fs, setFs] = useState(false);
  const [resetN, setResetN] = useState(0);
  const [t0, setT0] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());

  const hashRoom = window.location.hash.match(/room=([a-zA-Z0-9_-]+)/)?.[1];
  const room = params.get("room") || hashRoom || "33";

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const elapsed = Math.floor((now - t0) / 1000);
  const resetTimer = useCallback(() => {
    setT0(Date.now());
    setNow(Date.now());
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastMsg(null), 2500);
  }, []);

  const [blank, setBlank] = useState(false);
  const presenterWin = useRef<Window | null>(null);
  const syncRef = useRef<RemoteSync | null>(null);
  const animEnd = useRef(0);
  const skipTimer = useRef<number | undefined>(undefined);

  const slide = SLIDES[index];

  const startAnim = useCallback(
    (ms: number) => {
      if (reduced) return;
      animEnd.current = Math.max(animEnd.current, performance.now() + ms);
    },
    [reduced],
  );

  const finish = useCallback(() => {
    animEnd.current = 0;
    setSkip(true);
    setFinishTick((t) => t + 1);
    window.clearTimeout(skipTimer.current);
    skipTimer.current = window.setTimeout(() => setSkip(false), 120);
  }, []);

  const animating = () => performance.now() < animEnd.current;

  const next = useCallback(() => {
    if (animating()) return finish();
    const s = SLIDES[index];
    if (step < s.builds) {
      setDir("fwd");
      setPos([index, step + 1]);
      startAnim(BUILD_MS);
    } else if (index < SLIDES.length - 1) {
      setDir("fwd");
      setPos([index + 1, 0]);
      startAnim(SLIDE_MS);
    }
  }, [index, step, finish, startAnim]);

  const prev = useCallback(() => {
    if (animating()) finish();
    if (step > 0) {
      setDir("back");
      setPos([index, step - 1]);
    } else if (index > 0) {
      setDir("back");
      setPos([index - 1, SLIDES[index - 1].builds]);
      startAnim(SLIDE_MS);
    }
  }, [index, step, finish, startAnim]);

  const goSlide = useCallback(
    (i: number, s = 0) => {
      setDir(i >= index ? "fwd" : "back");
      setPos([i, s]);
      startAnim(SLIDE_MS);
    },
    [index, startAnim],
  );

  const goTo = useCallback(
    (n: number) => {
      const c = Math.max(0, Math.min(SLIDES[index].builds, n));
      setDir(c >= step ? "fwd" : "back");
      setPos([index, c]);
      startAnim(BUILD_MS);
    },
    [index, step, startAnim],
  );

  const toggleFs = useCallback(() => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.();
  }, []);

  useEffect(() => {
    const on = () => setFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", on);
    return () => document.removeEventListener("fullscreenchange", on);
  }, []);

  // Respond to manual hash edits
  useEffect(() => {
    const on = () => {
      const [i, st] = parseHash();
      setPos((cur) => (cur[0] === i && cur[1] === st ? cur : [i, st]));
    };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);

  // URL hash sync
  useEffect(() => {
    const h = `#/${index + 1}${step ? "." + step : ""}`;
    if (window.location.hash !== h) window.history.replaceState(null, "", h);
    document.title = `${slide.title} — Blockchain`;
  }, [index, step, slide.title]);

  // Touch Swipe Handling on Mobile
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) next();
      else prev();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Presenter View link
  const openPresenter = useCallback(() => {
    const url = window.location.href.split("#")[0].split("?")[0] + "?presenter";
    presenterWin.current = window.open(url, "bc-presenter", "width=1440,height=900");
  }, []);

  const postState = useCallback(() => {
    const w = presenterWin.current;
    if (w && !w.closed) w.postMessage({ src: "bc-audience", type: "state", index, step, blank } satisfies AudienceMsg, "*");
  }, [index, step, blank]);

  useEffect(postState, [postState]);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const d = e.data as PresenterMsg;
      if (d?.src !== "bc-presenter") return;
      if (e.source && e.source !== window) presenterWin.current = e.source as Window;
      if (d.type === "hello") postState();
      else if (d.type === "key") window.dispatchEvent(new KeyboardEvent("keydown", { key: d.key }));
      else if (d.cmd === "next") next();
      else if (d.cmd === "prev") prev();
      else if (d.cmd === "blank") setBlank((b) => !b);
      else if (d.cmd === "first") goSlide(0);
      else if (d.cmd === "last") goSlide(SLIDES.length - 1, SLIDES[SLIDES.length - 1].builds);
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [next, prev, goSlide, postState]);

  // Mobile Remote Sync Host
  useEffect(() => {
    const sync = new RemoteSync(room, true, {
      onCmd: (cmd) => {
        if (cmd.type === "cmd") {
          if (cmd.cmd === "next") {
            next();
            showToast("📱 Remote: Next Cue →");
          } else if (cmd.cmd === "prev") {
            prev();
            showToast("📱 Remote: ← Prev");
          } else if (cmd.cmd === "blank") {
            setBlank((b) => !b);
            showToast("📱 Remote: Blackout Toggled");
          } else if (cmd.cmd === "first") {
            goSlide(0);
            showToast("📱 Remote: Jumped to First Slide");
          } else if (cmd.cmd === "last") {
            goSlide(SLIDES.length - 1, SLIDES[SLIDES.length - 1].builds);
            showToast("📱 Remote: Jumped to Last Slide");
          }
        } else if (cmd.type === "goto") {
          goSlide(cmd.index, cmd.step ?? 0);
          showToast(`📱 Remote: Jumped to Slide ${cmd.index + 1}`);
        } else if (cmd.type === "resetTimer") {
          resetTimer();
          showToast("📱 Remote: Timer Reset");
        } else if (cmd.type === "vote") {
          const key = cmd.choice === "pow" ? "a" : "b";
          window.dispatchEvent(new KeyboardEvent("keydown", { key }));
          showToast(`📱 Remote: Vote ${cmd.choice.toUpperCase()}`);
        } else if (cmd.type === "hello") {
          sync.sendState({ index, step, blank, elapsed });
        }
      },
      onPeerJoin: (peer) => {
        setConnectedPeers((prev) => Array.from(new Set([...prev, peer])));
        showToast(`📱 Phone Connected: ${peer}`);
        sync.sendState({ index, step, blank, elapsed });
      },
      onStatus: (conn) => {
        setIsMqttConnected(conn);
      },
    });
    syncRef.current = sync;

    return () => {
      sync.destroy();
    };
  }, [room, next, prev, goSlide, resetTimer, showToast, index, step, blank, elapsed]);

  // Broadcast live state updates to phones
  useEffect(() => {
    syncRef.current?.sendState({ index, step, blank, elapsed });
  }, [index, step, blank, elapsed]);

  // Keyboard controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const onButton = t?.tagName === "BUTTON";
      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
        case "PageDown":
          e.preventDefault();
          next();
          break;
        case " ":
        case "Enter":
          if (onButton) return;
          e.preventDefault();
          if (overview) setOverview(false);
          else next();
          break;
        case "ArrowLeft":
        case "ArrowUp":
        case "PageUp":
        case "Backspace":
          e.preventDefault();
          prev();
          break;
        case "Home":
          goSlide(0);
          break;
        case "End":
          goSlide(SLIDES.length - 1, SLIDES[SLIDES.length - 1].builds);
          break;
        case "f":
        case "F":
          toggleFs();
          break;
        case "n":
        case "N":
          setNotes((v) => !v);
          break;
        case "g":
        case "G":
        case "o":
        case "O":
          setOverview((v) => !v);
          break;
        case "m":
        case "M":
          setRemoteModalOpen((v) => !v);
          break;
        case "r":
        case "R":
          animEnd.current = 0;
          setDir("fwd");
          setPos(([i]) => [i, 0]);
          setResetN((n) => n + 1);
          break;
        case "p":
        case "P":
          openPresenter();
          break;
        case ".":
          setBlank((b) => !b);
          break;
        case "Escape":
          setOverview(false);
          setBlank(false);
          setRemoteModalOpen(false);
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, goSlide, toggleFs, overview, openPresenter]);

  const api: DeckApi = useMemo(
    () => ({ step, builds: slide.builds, dir, goTo, startAnim, finishTick, reduced, isStatic: false, slideNo: contentNo(index), act: slide.act }),
    [step, slide.builds, dir, goTo, startAnim, finishTick, reduced, index],
  );

  const stageBox = useRef<HTMLDivElement>(null);
  const scale = useFit(stageBox);
  const Cmp = slide.Component;

  const isFrameless = fs || isMobile;

  return (
    <div
      className={cn(
        "flex h-full w-full overflow-hidden select-none",
        isFrameless ? "bg-ink" : "bg-sheet"
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className={cn("relative flex min-w-0 flex-1 flex-col overflow-hidden", isFrameless ? "p-0" : "p-6 pb-3")}>
        {/* Rotate Tip for Mobile Portrait */}
        {!dismissRotateTip && isMobile && isPortrait && !forceRotate && (
          <div className="absolute top-3 left-3 right-3 z-50 flex items-center justify-between rounded-lg bg-[#084BC5] px-3.5 py-2 text-[12px] font-bold uppercase tracking-wider text-white shadow-xl animate-pulse">
            <div className="flex items-center gap-2">
              <span className="text-[17px]">🔄</span>
              <span>Rotate phone sideways for full screen</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setForceRotate(true)}
                className="rounded bg-white/20 px-2.5 py-1 text-[11px] font-black uppercase text-white hover:bg-white/30 active:scale-95"
              >
                Rotate 90°
              </button>
              <button
                type="button"
                onClick={() => setDismissRotateTip(true)}
                className="px-1.5 py-0.5 text-white/70 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Forced 90 degree button if active */}
        {forceRotate && (
          <button
            type="button"
            onClick={() => setForceRotate(false)}
            className="absolute top-3 right-3 z-50 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase text-white backdrop-blur-md"
          >
            ↩ Normal View
          </button>
        )}

        {/* Presentation Stage Box */}
        <div
          className={cn(
            "relative flex min-h-0 flex-1 items-center justify-center transition-all duration-300",
            forceRotate && "origin-center transform rotate-90"
          )}
          style={
            forceRotate
              ? {
                  width: "100vh",
                  height: "100vw",
                  position: "absolute",
                  left: "calc(50% - 50vh)",
                  top: "calc(50% - 50vw)",
                }
              : undefined
          }
        >
          <div ref={stageBox} className="relative flex h-full w-full items-center justify-center">
            <div style={{ width: W * scale, height: H * scale }} className="relative shadow-2xl">
              <div
                className={cn("absolute left-0 top-0 overflow-hidden", themeBg[slide.theme], skip && "skip", reduced && "reduced")}
                style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: "0 0" }}
                onClick={(e) => {
                  const t = e.target as HTMLElement;
                  if (t.closest("button, input, textarea, select, a, label, nav")) return;
                  if (window.getSelection()?.toString()) return;

                  // On mobile touch: tap right 60% = next, tap left 40% = prev
                  if (isMobile) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    if (clickX < rect.width * 0.38) {
                      prev();
                      return;
                    }
                  }
                  next();
                }}
                role="region"
                aria-roledescription="slide"
                aria-label={`Slide ${index + 1} of ${SLIDES.length}: ${slide.title}`}
              >
                <ProgressLine index={index} step={step} theme={slide.theme} />
                <DeckContext.Provider value={api}>
                  <SlideEnter dir={dir} k={index}>
                    <Cmp key={`${index}-${resetN}`} />
                  </SlideEnter>
                </DeckContext.Provider>
                <div
                  className="pointer-events-none absolute inset-0 z-[60] bg-ink transition-opacity duration-300"
                  style={{ opacity: blank ? 1 : 0 }}
                  aria-hidden
                />
                {!fs && !isMobile && (
                  <Controls
                    hidden
                    theme={slide.theme}
                    index={index}
                    step={step}
                    builds={slide.builds}
                    onPrev={prev}
                    onNext={next}
                    onGrid={() => setOverview(true)}
                    onNotes={() => setNotes((v) => !v)}
                    onRemote={() => setRemoteModalOpen(true)}
                    onFs={toggleFs}
                    fs={fs}
                    notes={notes}
                    connectedCount={connectedPeers.length}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Landscape Floating HUD (Discreet, semi-transparent) */}
        {isMobile && (!isPortrait || forceRotate) && (
          <div className="pointer-events-none absolute bottom-2 left-3 right-3 z-40 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-white/80">
            <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 backdrop-blur-md border border-white/10">
              <span className="font-display text-[13px] text-white">
                {contentNo(index) ? String(contentNo(index)).padStart(2, "0") : "—"}{" "}
                <span className="text-white/50">/ 12</span>
              </span>
              <a href="?remote#room=33" className="text-[#3b82f6] hover:underline pl-1">
                📱 Notes
              </a>
            </div>

            <div className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-black/60 p-1 backdrop-blur-md border border-white/10">
              <button
                type="button"
                onClick={prev}
                className="rounded-full bg-white/10 px-2.5 py-1 text-white active:bg-white/30"
              >
                ←
              </button>
              <button
                type="button"
                onClick={next}
                className="rounded-full bg-[#084BC5] px-3 py-1 font-black text-white active:bg-blue-600"
              >
                Next →
              </button>
              <button
                type="button"
                onClick={toggleFs}
                className="rounded-full bg-white/10 px-2 py-1 text-white/70"
              >
                {fs ? "Exit" : "⛶"}
              </button>
            </div>
          </div>
        )}

        {/* Mobile Portrait Bottom Navigation Bar */}
        {isMobile && isPortrait && !forceRotate && (
          <div className="shrink-0 flex items-center justify-between border-t border-white/10 bg-[#121316] px-3 py-2.5 text-white z-40">
            <a
              href="?remote#room=33"
              className="rounded bg-[#084BC5] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white flex items-center gap-1.5 shadow-md"
            >
              <span>📱 Notes Remote</span>
            </a>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prev}
                className="rounded bg-white/10 px-3 py-1.5 text-[12px] font-bold uppercase text-white active:bg-white/25"
              >
                ← Prev
              </button>
              <span className="tabnum font-display text-[14px] font-bold text-white/90 px-1">
                {contentNo(index) ? String(contentNo(index)).padStart(2, "0") : "—"} / 12
              </span>
              <button
                type="button"
                onClick={next}
                className="rounded bg-white/10 px-3 py-1.5 text-[12px] font-bold uppercase text-white active:bg-white/25"
              >
                Next →
              </button>
            </div>
            <button
              type="button"
              onClick={toggleFs}
              className="rounded bg-white/5 px-2.5 py-1.5 text-[11px] font-bold text-white/70 active:bg-white/20"
            >
              {fs ? "Exit" : "Full ⛶"}
            </button>
          </div>
        )}

        {/* Subtle toast for mobile remote events */}
        {toastMsg && (
          <div className="fixed top-6 right-6 z-[90] flex items-center gap-2 rounded-full border-2 border-cobalt bg-paper px-4 py-2 font-display text-[13px] font-bold uppercase tracking-wider text-ink shadow-[4px_4px_0px_#084BC5] transition-all animate-bounce">
            <span className="h-2 w-2 rounded-full bg-cobalt animate-ping" />
            {toastMsg}
          </div>
        )}

        {/* Desktop Footer (hidden on mobile) */}
        {!fs && !isMobile && (
          <div className="flex h-9 shrink-0 items-end justify-between px-1 text-[12px] font-semibold uppercase tracking-[0.12em] text-ink/60">
            <span>
              Click / → next · M mobile remote · N notes · P presenter view · F fullscreen · G overview · . black screen · R restart
            </span>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setRemoteModalOpen(true)}
                className="focus-ring flex items-center gap-1.5 font-bold uppercase text-cobalt hover:underline"
              >
                <span>📱 Mobile Remote</span>
                {connectedPeers.length > 0 && (
                  <span className="rounded bg-cobalt px-1.5 py-0.2 text-[10px] text-paper">
                    {connectedPeers.length} Paired
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setReduced((v) => !v)}
                className="focus-ring uppercase hover:text-ink"
              >
                Motion: {reduced ? "Reduced" : "Full"}
              </button>
            </div>
          </div>
        )}

        {fs && notes && <NotesPanel index={index} step={step} overlay elapsed={elapsed} onReset={resetTimer} />}
      </div>

      {!fs && notes && <NotesPanel index={index} step={step} elapsed={elapsed} onReset={resetTimer} />}

      {overview && (
        <Overview
          current={index}
          onPick={(i) => {
            setOverview(false);
            goSlide(i);
          }}
          onClose={() => setOverview(false)}
        />
      )}

      {/* Mobile Remote Pairing Modal */}
      <RemoteModal
        room={room}
        isOpen={remoteModalOpen}
        onClose={() => setRemoteModalOpen(false)}
        connectedPeers={connectedPeers}
        isMqttConnected={isMqttConnected}
      />
    </div>
  );
}

/* ---------------- Controls (inside the slide, discreet) ---------------- */
function Controls(p: {
  hidden?: boolean;
  theme: Theme;
  index: number;
  step: number;
  builds: number;
  onPrev: () => void;
  onNext: () => void;
  onGrid: () => void;
  onNotes: () => void;
  onRemote: () => void;
  onFs: () => void;
  fs: boolean;
  notes: boolean;
  connectedCount: number;
}) {
  const light = p.theme !== "white";
  const col = light ? "text-paper/70 hover:text-paper" : "text-mute hover:text-ink";
  const b = cn("focus-ring px-2 py-1 text-[17px] font-semibold uppercase tracking-[0.12em] transition-colors", col);

  return (
    <nav
      aria-label="Presentation controls"
      className={cn(
        "absolute bottom-[32px] right-[96px] z-50 flex items-center gap-3 transition-opacity duration-300",
        p.hidden && "opacity-0 hover:opacity-100 focus-within:opacity-100"
      )}
    >
      <button type="button" className={b} onClick={p.onGrid}>
        Overview
      </button>
      <button
        type="button"
        className={cn(b, p.notes && (light ? "text-paper" : "text-ink"))}
        onClick={p.onNotes}
        aria-pressed={p.notes}
      >
        Notes
      </button>
      <button
        type="button"
        className={cn(b, p.connectedCount > 0 && "text-cobalt font-bold")}
        onClick={p.onRemote}
        title="Open Mobile Remote QR Code (M)"
      >
        📱 Remote {p.connectedCount > 0 ? `(${p.connectedCount})` : ""}
      </button>
      <button type="button" className={b} onClick={p.onFs}>
        {p.fs ? "Exit full" : "Full"}
      </button>
      <span className={cn("mx-3 h-6 w-px", light ? "bg-paper/30" : "bg-rule")} />
      <button type="button" className={b} onClick={p.onPrev} aria-label="Previous">
        ← Prev
      </button>
      <div className={cn("flex min-w-[118px] flex-col items-center", light ? "text-paper" : "text-ink")}>
        <span className="tabnum font-display text-[22px] font-bold">
          {contentNo(p.index) ? String(contentNo(p.index)).padStart(2, "0") : "—"}{" "}
          <span className="opacity-50">/ 12</span>
        </span>
        <span className="mt-1 flex gap-[5px]" aria-label={`Build ${p.step} of ${p.builds}`}>
          {Array.from({ length: p.builds }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-[3px] w-[14px] transition-colors duration-300",
                i < p.step ? (light ? "bg-paper" : "bg-cobalt") : light ? "bg-paper/25" : "bg-rule"
              )}
            />
          ))}
        </span>
      </div>
      <button type="button" className={b} onClick={p.onNext} aria-label="Next">
        Next →
      </button>
    </nav>
  );
}

/* ---------------- Speaker notes ---------------- */
function ProgressLine({ index, step, theme }: { index: number; step: number; theme: string }) {
  const total = SLIDES.reduce((a, s) => a + s.builds + 1, 0);
  const done = SLIDES.slice(0, index).reduce((a, s) => a + s.builds + 1, 0) + step + 1;
  const k = SLIDES[index].kind;
  if (k === "title" || index === SLIDES.length - 1) return null;
  return (
    <div className="pointer-events-none absolute left-0 right-0 top-0 z-40 h-[4px]" aria-hidden>
      <div
        className={cn("h-full transition-[width] duration-500", theme === "white" ? "bg-cobalt" : "bg-paper")}
        style={{ width: `${(done / total) * 100}%` }}
      />
    </div>
  );
}

function NotesPanel({
  index,
  step,
  overlay,
  elapsed,
  onReset,
}: {
  index: number;
  step: number;
  overlay?: boolean;
  elapsed: number;
  onReset: () => void;
}) {
  const s = SLIDES[index];
  const diff = elapsed - s.ends;
  const nx = SLIDES[index + 1];
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.querySelector("[data-active='true']")?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [index, step]);

  return (
    <aside
      className={cn(
        "flex flex-col bg-paper text-ink",
        overlay ? "fixed bottom-0 left-0 right-0 z-50 max-h-[34vh] border-t-2 border-ink" : "w-[400px] shrink-0 border-l border-ink/15"
      )}
      aria-label="Speaker notes"
    >
      <div className="flex items-baseline justify-between border-b border-rule px-6 py-4">
        <span className="flex items-baseline gap-4">
          <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-mute">Act {s.act || "—"}</span>
          <button
            type="button"
            onClick={onReset}
            title="Click to restart the timer"
            className="focus-ring tabnum text-[12px] font-semibold uppercase tracking-[0.14em] text-ink hover:text-cobalt"
          >
            ⏱ {mmss(elapsed)}
          </button>
          <span className={cn("tabnum text-[12px] font-semibold uppercase tracking-[0.14em]", diff > 15 ? "text-alert" : "text-cobalt")}>
            target {mmss(s.ends)} {diff > 15 ? `· ${mmss(diff)} over` : ""}
          </span>
        </span>
        <span className="tabnum text-[12px] font-semibold uppercase tracking-[0.14em] text-mute">
          {contentNo(index) ? String(contentNo(index)).padStart(2, "0") : "·"} · click {step}/{s.builds}
        </span>
      </div>
      <div ref={ref} className="flex-1 overflow-y-auto px-6 py-5">
        <h2 className="font-display text-[22px] font-extrabold uppercase leading-tight tracking-[-0.01em]">{s.title}</h2>
        <div className="mt-4 space-y-4">
          {s.notes.map((n, i) => (
            <p
              key={i}
              data-active={i === step}
              className={cn(
                "border-l-2 pl-3 text-[15px] leading-[1.55] transition-colors",
                i === step ? "border-cobalt text-ink" : i < step ? "border-transparent text-mute" : "border-transparent text-ink/70"
              )}
            >
              {n}
            </p>
          ))}
        </div>
      </div>
      {nx && (
        <div className="border-t border-rule px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-mute">
          Next ↗ <span className="text-ink">{nx.title}</span>
        </div>
      )}
    </aside>
  );
}

/* ---------------- Overview / contact sheet ---------------- */
function Overview({ current, onPick, onClose }: { current: number; onPick: (i: number) => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-sheet" role="dialog" aria-label="Slide overview">
      <div className="mx-auto max-w-[1680px] px-10 py-8">
        <div className="mb-8 flex items-end justify-between border-b border-ink/30 pb-4">
          <h2 className="font-display text-[44px] font-extrabold uppercase leading-none tracking-[-0.03em]">Contact sheet</h2>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring border-2 border-ink px-5 py-2 text-[14px] font-semibold uppercase tracking-[0.12em] hover:bg-ink hover:text-paper"
          >
            Close ↗
          </button>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-3 xl:grid-cols-4">
          {SLIDES.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onPick(i)}
              className={cn("focus-ring group text-left", i === current && "outline outline-[3px] outline-offset-4 outline-cobalt")}
            >
              <StaticSlide i={i} />
              <div className="mt-2 flex items-baseline gap-3">
                <span className="tabnum font-display text-[15px] font-bold">{contentNo(i) ? String(contentNo(i)).padStart(2, "0") : "·"}</span>
                <span className="text-[13px] font-semibold uppercase tracking-[0.1em] text-ink/70 group-hover:text-ink">{s.title}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
