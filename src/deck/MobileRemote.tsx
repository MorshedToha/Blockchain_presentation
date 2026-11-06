import { useEffect, useRef, useState } from "react";
import { ACTS, PRESENTERS } from "@/deck/ui";
import { SLIDES, contentNo } from "@/slides";
import { cn } from "@/utils/cn";
import { mmss } from "./stage";
import { RemoteSync, type RemoteCmd, type RemoteState } from "./remoteSync";

export function MobileRemote() {
  const params = new URLSearchParams(window.location.search);
  const hashRoom = window.location.hash.match(/room=([a-zA-Z0-9_-]+)/)?.[1];
  const room = params.get("room") || hashRoom || "topic33";

  const [connected, setConnected] = useState(false);
  const [pcState, setPcState] = useState<RemoteState>({
    index: 0,
    step: 0,
    blank: false,
    elapsed: 0,
    room,
    ts: Date.now(),
  });

  // Local browsing mode: peer can preview other slides without affecting PC
  const [browseIndex, setBrowseIndex] = useState<number | null>(null);
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg" | "xl">("lg");
  const [showSlidePicker, setShowSlidePicker] = useState(false);
  const [lastVibe, setLastVibe] = useState(0);

  const syncRef = useRef<RemoteSync | null>(null);
  const notesContainerRef = useRef<HTMLDivElement>(null);

  // Initialize Remote Sync
  useEffect(() => {
    document.title = "📱 Remote Controller — Blockchain Topic #33";
    const sync = new RemoteSync(room, false, {
      onState: (state) => {
        setPcState(state);
      },
      onStatus: (conn) => {
        setConnected(conn);
      },
    });
    syncRef.current = sync;

    return () => {
      sync.destroy();
    };
  }, [room]);

  const vibrate = (ms = 25) => {
    try {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(ms);
      }
      setLastVibe(Date.now());
    } catch (_) {}
  };

  const send = (cmd: RemoteCmd) => {
    vibrate(30);
    // Exit browse mode if sending live navigation
    if (browseIndex !== null) setBrowseIndex(null);
    syncRef.current?.sendCmd(cmd);
  };

  const currentIdx = browseIndex !== null ? browseIndex : pcState.index;
  const slide = SLIDES[currentIdx] || SLIDES[0];
  const isBrowsing = browseIndex !== null && browseIndex !== pcState.index;

  const activeStep = isBrowsing ? 0 : pcState.step;
  const actInfo = slide.act && slide.act <= 4 ? ACTS[slide.act - 1] : null;
  const presenterInfo = slide.act && slide.act <= 4 ? PRESENTERS[slide.act - 1] : null;
  const nextSlide = SLIDES[currentIdx + 1];

  // Auto-scroll to active note
  useEffect(() => {
    if (!isBrowsing) {
      notesContainerRef.current?.querySelector("[data-active='true']")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [pcState.index, pcState.step, isBrowsing]);

  const fontClass = {
    sm: "text-[15px] leading-relaxed",
    md: "text-[17px] leading-relaxed",
    lg: "text-[19px] leading-relaxed",
    xl: "text-[22px] leading-relaxed",
  }[fontSize];

  return (
    <div className="flex h-[100dvh] w-full flex-col bg-[#0b0c0e] text-[#f4f4f0] select-none font-sans overflow-hidden">
      {/* ---------------- Top Status Bar ---------------- */}
      <header className="shrink-0 border-b border-white/10 bg-[#121316] px-4 py-3">
        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.14em]">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-block h-2 w-2 rounded-full",
                connected ? "bg-[#10b981] shadow-[0_0_8px_#10b981]" : "bg-[#f59e0b] animate-pulse"
              )}
            />
            <span className={connected ? "text-[#10b981]" : "text-[#f59e0b]"}>
              {connected ? "Live Synced" : "Connecting..."}
            </span>
            <span className="text-white/30">|</span>
            <span className="text-white/60">Room: #{room}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const nextSize: Record<string, "sm" | "md" | "lg" | "xl"> = {
                  sm: "md",
                  md: "lg",
                  lg: "xl",
                  xl: "sm",
                };
                setFontSize(nextSize[fontSize]);
              }}
              className="rounded bg-white/10 px-2 py-1 text-[11px] font-bold text-white/80 active:bg-white/20"
            >
              Font {fontSize.toUpperCase()}
            </button>
            <span className="tabnum font-bold text-white/90">⏱ {mmss(pcState.elapsed)}</span>
          </div>
        </div>

        {/* Presenter Pill */}
        <div className="mt-2 flex items-center justify-between rounded bg-white/5 px-3 py-2 border border-white/5">
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#084BC5]">
              Act {slide.act || "—"} · {actInfo?.title || "Overview"}
            </div>
            <div className="truncate text-[13px] font-bold text-white">
              {presenterInfo ? `${presenterInfo.id} · ${presenterInfo.name}` : "Team Blockchain"}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-medium uppercase tracking-[0.1em] text-white/50">Target</div>
            <div className="text-[12px] font-bold text-white/80">{mmss(slide.ends)}</div>
          </div>
        </div>

        {/* Browse Alert Banner if inspecting other slides */}
        {isBrowsing && (
          <div className="mt-2 flex items-center justify-between rounded bg-[#084BC5]/20 border border-[#084BC5] px-3 py-1.5 text-[11px]">
            <span className="text-[#3b82f6] font-semibold">
              👀 Previewing Slide {currentIdx + 1}
            </span>
            <button
              type="button"
              onClick={() => setBrowseIndex(null)}
              className="rounded bg-[#084BC5] px-2.5 py-0.5 font-bold uppercase tracking-wider text-white"
            >
              Back to Live
            </button>
          </div>
        )}
      </header>

      {/* ---------------- Slide Headline & Progress ---------------- */}
      <div className="shrink-0 border-b border-white/10 bg-[#15171c] px-4 py-2.5">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="tabnum font-display text-[20px] font-black text-white">
              {contentNo(currentIdx) ? String(contentNo(currentIdx)).padStart(2, "0") : "—"}
            </span>
            <span className="text-[12px] font-semibold uppercase tracking-[0.1em] text-white/50">/ 12</span>
            <span className="truncate text-[14px] font-bold text-white/90 pl-1">{slide.title}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowSlidePicker(true)}
            className="text-[11px] font-bold uppercase tracking-wider text-[#3b82f6] hover:underline"
          >
            All Slides ▾
          </button>
        </div>

        {/* Build progress ticks */}
        {slide.builds > 0 && (
          <div className="mt-2 flex gap-1.5">
            {Array.from({ length: slide.builds + 1 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-all duration-300",
                  i === activeStep
                    ? "bg-[#084BC5] shadow-[0_0_6px_#084BC5]"
                    : i < activeStep
                    ? "bg-white/60"
                    : "bg-white/15"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* ---------------- Live Speaker Notes Prompter (Center) ---------------- */}
      <main ref={notesContainerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {slide.notes && slide.notes.length > 0 ? (
          slide.notes.map((note, i) => {
            const isActive = i === activeStep;
            const isPast = i < activeStep;
            return (
              <div
                key={i}
                data-active={isActive}
                className={cn(
                  "rounded-lg p-3.5 transition-all duration-300 border",
                  isActive
                    ? "bg-white/10 border-[#084BC5] shadow-lg ring-1 ring-[#084BC5]/50"
                    : isPast
                    ? "bg-black/20 border-white/5 opacity-40"
                    : "bg-black/10 border-white/5 opacity-70"
                )}
              >
                <div className="mb-1 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                  <span className={isActive ? "text-[#3b82f6]" : "text-white/40"}>
                    {i === 0 ? "Initial View" : `Click ${i}`}
                  </span>
                  {isActive && (
                    <span className="rounded bg-[#084BC5] px-1.5 py-0.5 text-[9px] font-black text-white">
                      CURRENT CUE
                    </span>
                  )}
                </div>
                <p className={cn(fontClass, isActive ? "text-white font-medium" : "text-white/80")}>
                  {note}
                </p>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center text-white/40 italic">
            No specific speaker notes for this slide. Speak naturally to the headline.
          </div>
        )}

        {/* Up Next Preview */}
        {nextSlide && (
          <div className="mt-6 rounded-lg border border-dashed border-white/20 p-3 bg-white/[0.02]">
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/50">
              Up Next ↗
            </div>
            <div className="text-[13px] font-bold text-white/90 mt-0.5">{nextSlide.title}</div>
            {nextSlide.notes?.[0] && (
              <div className="mt-1 line-clamp-2 text-[12px] text-white/50 italic">
                "{nextSlide.notes[0]}"
              </div>
            )}
          </div>
        )}
      </main>

      {/* ---------------- Slide 11 Quick Voting Bar (If on Slide 11) ---------------- */}
      {currentIdx === 10 && (
        <div className="shrink-0 bg-[#0e1628] border-t border-[#084BC5]/30 px-3 py-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#3b82f6] text-center mb-1">
            Slide 11 Live Audience Interaction
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => send({ type: "vote", choice: "pow" })}
              className="rounded bg-black/60 border border-white/20 py-2 text-[12px] font-bold text-white active:bg-white/20"
            >
              ⚡ +1 Vote PoW
            </button>
            <button
              type="button"
              onClick={() => send({ type: "vote", choice: "pos" })}
              className="rounded bg-black/60 border border-white/20 py-2 text-[12px] font-bold text-white active:bg-white/20"
            >
              🌱 +1 Vote PoS
            </button>
          </div>
        </div>
      )}

      {/* ---------------- Bottom Thumb Controls (Big Tap Targets) ---------------- */}
      <footer className="shrink-0 border-t border-white/10 bg-[#121316] p-3 space-y-2">
        {/* Main Prev / Next Buttons */}
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={() => send({ type: "cmd", cmd: "prev" })}
            className="flex-1 rounded-xl border-2 border-white/20 bg-[#1b1c20] py-4 text-center font-display text-[17px] font-extrabold uppercase tracking-wider text-white active:bg-white/20 active:scale-[0.98] transition-all"
          >
            ← Prev
          </button>

          <button
            type="button"
            onClick={() => send({ type: "cmd", cmd: "next" })}
            className="flex-[2] rounded-xl bg-[#084BC5] py-4 text-center font-display text-[19px] font-black uppercase tracking-wider text-white shadow-[0_4px_16px_rgba(8,75,197,0.4)] active:brightness-125 active:scale-[0.98] transition-all"
          >
            Next Cue →
          </button>
        </div>

        {/* Secondary Utility Row */}
        <div className="flex items-center justify-between gap-2 pt-1 text-[11px] font-bold uppercase">
          <button
            type="button"
            onClick={() => send({ type: "cmd", cmd: "blank" })}
            className={cn(
              "flex-1 rounded py-2 text-center border transition-all active:scale-95",
              pcState.blank
                ? "bg-[#ef4444] border-[#ef4444] text-white"
                : "bg-white/5 border-white/10 text-white/70"
            )}
          >
            {pcState.blank ? "Show Screen" : "⚫ Blackout"}
          </button>

          <button
            type="button"
            onClick={() => send({ type: "resetTimer" })}
            className="flex-1 rounded py-2 text-center bg-white/5 border border-white/10 text-white/70 active:scale-95"
          >
            ⏱ Reset Timer
          </button>

          <button
            type="button"
            onClick={() => setShowSlidePicker(true)}
            className="flex-1 rounded py-2 text-center bg-white/5 border border-white/10 text-[#3b82f6] active:scale-95"
          >
            📋 Jump
          </button>
        </div>
      </footer>

      {/* ---------------- Slide Picker Sheet Modal ---------------- */}
      {showSlidePicker && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/95 p-4 text-white">
          <div className="mb-4 flex items-center justify-between border-b border-white/20 pb-3">
            <h2 className="font-display text-[18px] font-black uppercase tracking-wider">
              Jump to Any Slide
            </h2>
            <button
              type="button"
              onClick={() => setShowSlidePicker(false)}
              className="rounded-full bg-white/10 px-3 py-1 text-[12px] font-bold uppercase"
            >
              Close ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {SLIDES.map((s, idx) => {
              const isCurrent = idx === pcState.index;
              const p = s.act && s.act <= 4 ? PRESENTERS[s.act - 1] : null;
              return (
                <div
                  key={idx}
                  className={cn(
                    "flex items-center justify-between rounded-lg border p-3 transition-colors",
                    isCurrent
                      ? "border-[#084BC5] bg-[#084BC5]/20"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  )}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-[#3b82f6]">
                        {contentNo(idx) ? String(contentNo(idx)).padStart(2, "0") : "·"}
                      </span>
                      <span className="truncate font-bold text-[14px] text-white">{s.title}</span>
                    </div>
                    {p && (
                      <div className="text-[11px] text-white/50">
                        {p.name} · Act {s.act}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setBrowseIndex(idx);
                        setShowSlidePicker(false);
                      }}
                      className="rounded bg-white/10 px-2 py-1 text-[10px] font-bold uppercase text-white/80 active:bg-white/20"
                    >
                      Read Notes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        send({ type: "goto", index: idx, step: 0 });
                        setShowSlidePicker(false);
                      }}
                      className="rounded bg-[#084BC5] px-2.5 py-1 text-[10px] font-black uppercase text-white active:bg-blue-600"
                    >
                      Present ↗
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
