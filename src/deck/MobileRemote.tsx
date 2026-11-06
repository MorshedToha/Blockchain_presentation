import { useEffect, useRef, useState } from "react";
import { ACTS, PRESENTERS } from "@/deck/ui";
import { SLIDES, contentNo } from "@/slides";
import { cn } from "@/utils/cn";
import { StaticSlide, mmss } from "./stage";
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

  // Screen orientation
  const [isLandscape, setIsLandscape] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth > window.innerHeight : false
  );
  const [showSlideInPortrait, setShowSlideInPortrait] = useState(true);

  // Local browsing mode: peer can preview other slides without affecting PC
  const [browseIndex, setBrowseIndex] = useState<number | null>(null);
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg" | "xl">("lg");
  const [showSlidePicker, setShowSlidePicker] = useState(false);
  const [lastVibe, setLastVibe] = useState(0);

  const syncRef = useRef<RemoteSync | null>(null);
  const notesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    handleOrientation();
    window.addEventListener("resize", handleOrientation);
    window.addEventListener("orientationchange", handleOrientation);
    return () => {
      window.removeEventListener("resize", handleOrientation);
      window.removeEventListener("orientationchange", handleOrientation);
    };
  }, []);

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
  }, [pcState.index, pcState.step, isBrowsing, isLandscape]);

  const fontClass = {
    sm: "text-[14px] leading-relaxed",
    md: "text-[16px] leading-relaxed",
    lg: "text-[18px] sm:text-[20px] leading-relaxed",
    xl: "text-[21px] sm:text-[23px] leading-relaxed",
  }[fontSize];

  /* =========================================================================
     HORIZONTAL LANDSCAPE STUDIO LAYOUT (When user rotates phone sideways)
     ========================================================================= */
  if (isLandscape) {
    return (
      <div className="flex h-[100dvh] w-full bg-[#0b0c0e] text-[#f4f4f0] select-none font-sans overflow-hidden">
        {/* Left Column: Live 16:9 Slide + Thumb Navigation */}
        <div className="flex w-[46%] flex-col border-r border-white/10 bg-[#121316] p-2.5">
          {/* Top Bar for Left Column */}
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-white/70 pb-1.5 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "inline-block h-2 w-2 rounded-full",
                  connected ? "bg-[#10b981] shadow-[0_0_8px_#10b981]" : "bg-[#f59e0b] animate-pulse"
                )}
              />
              <span className="font-display text-[13px] text-white">
                {contentNo(currentIdx) ? String(contentNo(currentIdx)).padStart(2, "0") : "—"}{" "}
                <span className="text-white/40">/ 12</span>
              </span>
              <span className="truncate max-w-[140px] text-white/90 pl-1">{slide.title}</span>
            </div>

            <button
              type="button"
              onClick={() => setShowSlidePicker(true)}
              className="text-[#3b82f6] text-[10px] hover:underline"
            >
              All Slides ▾
            </button>
          </div>

          {/* Live Slide Preview Box (16:9 Aspect Ratio) */}
          <div className="my-auto flex flex-col items-center justify-center py-1">
            <div className="relative aspect-video w-full rounded-lg overflow-hidden border-2 border-white/20 shadow-xl bg-black">
              <StaticSlide i={currentIdx} step={activeStep} />
              {pcState.blank && (
                <div className="absolute inset-0 z-30 bg-black flex items-center justify-center text-white/40 text-[12px] font-bold uppercase tracking-widest">
                  ⚫ SCREEN BLACKOUT
                </div>
              )}
            </div>

            {/* Build Step indicator */}
            {slide.builds > 0 && (
              <div className="mt-1.5 flex w-full gap-1">
                {Array.from({ length: slide.builds + 1 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-all",
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

          {/* Big Thumb Buttons */}
          <div className="shrink-0 space-y-1.5 pt-1">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => send({ type: "cmd", cmd: "prev" })}
                className="flex-1 rounded-lg border border-white/20 bg-white/10 py-3 text-center font-display text-[15px] font-extrabold uppercase tracking-wider text-white active:bg-white/25 transition-all"
              >
                ← Prev
              </button>
              <button
                type="button"
                onClick={() => send({ type: "cmd", cmd: "next" })}
                className="flex-[2] rounded-lg bg-[#084BC5] py-3 text-center font-display text-[17px] font-black uppercase tracking-wider text-white shadow-[0_2px_12px_rgba(8,75,197,0.5)] active:brightness-125 transition-all"
              >
                Next Cue →
              </button>
            </div>

            <div className="flex items-center justify-between gap-1 text-[10px] font-bold uppercase">
              <button
                type="button"
                onClick={() => send({ type: "cmd", cmd: "blank" })}
                className={cn(
                  "flex-1 rounded py-1.5 border transition-all",
                  pcState.blank ? "bg-[#ef4444] border-[#ef4444] text-white" : "bg-white/5 border-white/10 text-white/70"
                )}
              >
                {pcState.blank ? "Show" : "⚫ Black"}
              </button>
              <button
                type="button"
                onClick={() => send({ type: "resetTimer" })}
                className="flex-1 rounded py-1.5 bg-white/5 border border-white/10 text-white/70"
              >
                ⏱ Reset
              </button>
              <button
                type="button"
                onClick={() => setShowSlidePicker(true)}
                className="flex-1 rounded py-1.5 bg-white/5 border border-white/10 text-[#3b82f6]"
              >
                📋 Jump
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Full-Height Live Speaker Notes Prompter */}
        <div className="flex w-[54%] flex-col bg-[#0b0c0e]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-[#15171c] px-3 py-2 text-[11px] shrink-0 font-semibold uppercase tracking-wider">
            <div className="min-w-0">
              <span className="text-[#084BC5] font-bold">Act {slide.act || "—"}:</span>{" "}
              <span className="text-white font-bold">{presenterInfo ? presenterInfo.name : "Speaker"}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const map: Record<string, "sm" | "md" | "lg" | "xl"> = { sm: "md", md: "lg", lg: "xl", xl: "sm" };
                  setFontSize(map[fontSize]);
                }}
                className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white/80"
              >
                A± {fontSize.toUpperCase()}
              </button>
              <span className="font-mono text-white/90">⏱ {mmss(pcState.elapsed)}</span>
            </div>
          </div>

          {/* Notes Scroll Area */}
          <div ref={notesContainerRef} className="flex-1 overflow-y-auto p-3 space-y-3">
            {slide.notes && slide.notes.length > 0 ? (
              slide.notes.map((note, i) => {
                const isActive = i === activeStep;
                const isPast = i < activeStep;
                return (
                  <div
                    key={i}
                    data-active={isActive}
                    className={cn(
                      "rounded-lg p-3 transition-all border",
                      isActive
                        ? "bg-white/15 border-[#084BC5] shadow-lg ring-1 ring-[#084BC5]"
                        : isPast
                        ? "bg-black/20 border-white/5 opacity-40"
                        : "bg-black/10 border-white/5 opacity-70"
                    )}
                  >
                    <div className="mb-1 flex items-center justify-between text-[10px] font-bold uppercase">
                      <span className={isActive ? "text-[#3b82f6]" : "text-white/40"}>
                        {i === 0 ? "Initial View" : `Click ${i}`}
                      </span>
                      {isActive && (
                        <span className="rounded bg-[#084BC5] px-1.5 py-0.2 text-[9px] font-black text-white">
                          SAY NOW
                        </span>
                      )}
                    </div>
                    <p className={cn(fontClass, isActive ? "text-white font-medium" : "text-white/70")}>
                      {note}
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-white/40 italic">
                Speak to the headline naturally.
              </div>
            )}

            {/* Next Slide Preview */}
            {nextSlide && (
              <div className="rounded border border-dashed border-white/20 p-2.5 bg-white/[0.02]">
                <div className="text-[9px] font-bold uppercase tracking-wider text-white/50">Next Slide ↗</div>
                <div className="text-[12px] font-bold text-white/90">{nextSlide.title}</div>
              </div>
            )}
          </div>
        </div>

        {/* Slide Picker Sheet Modal */}
        {showSlidePicker && (
          <SlidePickerModal
            currentIdx={pcState.index}
            onSelect={(idx, present) => {
              if (present) send({ type: "goto", index: idx, step: 0 });
              else setBrowseIndex(idx);
              setShowSlidePicker(false);
            }}
            onClose={() => setShowSlidePicker(false)}
          />
        )}
      </div>
    );
  }

  /* =========================================================================
     PORTRAIT LAYOUT (When user holds phone vertically)
     ========================================================================= */
  return (
    <div className="flex h-[100dvh] w-full flex-col bg-[#0b0c0e] text-[#f4f4f0] select-none font-sans overflow-hidden">
      {/* ---------------- Top Status Bar ---------------- */}
      <header className="shrink-0 border-b border-white/10 bg-[#121316] px-4 py-2.5">
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
            <span className="text-white/60">#{room}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSlideInPortrait((v) => !v)}
              className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white/80 active:bg-white/20"
            >
              {showSlideInPortrait ? "Slide: Visible" : "Slide: Hidden"}
            </button>
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
              className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white/80 active:bg-white/20"
            >
              Font {fontSize.toUpperCase()}
            </button>
            <span className="tabnum font-bold text-white/90">⏱ {mmss(pcState.elapsed)}</span>
          </div>
        </div>

        {/* Presenter Pill */}
        <div className="mt-2 flex items-center justify-between rounded bg-white/5 px-3 py-1.5 border border-white/5">
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

        {/* Rotate Tip */}
        <div className="mt-1.5 flex items-center justify-between rounded bg-white/5 px-2.5 py-1 text-[11px] text-white/60">
          <span>🔄 Rotate sideways for split horizontal view</span>
          <button
            type="button"
            onClick={() => setShowSlidePicker(true)}
            className="text-[#3b82f6] font-bold uppercase text-[10px]"
          >
            All Slides ▾
          </button>
        </div>
      </header>

      {/* ---------------- Mini Live Slide Preview (Collapsible) ---------------- */}
      {showSlideInPortrait && (
        <div className="shrink-0 border-b border-white/10 bg-black/60 p-2">
          <div className="relative aspect-video w-full max-w-[380px] mx-auto rounded-lg overflow-hidden border border-white/20 shadow-md">
            <StaticSlide i={currentIdx} step={activeStep} />
            {pcState.blank && (
              <div className="absolute inset-0 z-30 bg-black flex items-center justify-center text-white/40 text-[11px] font-bold uppercase">
                ⚫ BLACKOUT
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------- Slide Headline & Progress ---------------- */}
      <div className="shrink-0 border-b border-white/10 bg-[#15171c] px-4 py-2">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="tabnum font-display text-[18px] font-black text-white">
              {contentNo(currentIdx) ? String(contentNo(currentIdx)).padStart(2, "0") : "—"}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/50">/ 12</span>
            <span className="truncate text-[13px] font-bold text-white/90 pl-1">{slide.title}</span>
          </div>

          <span className="text-[10px] font-semibold text-white/40 uppercase">
            Step {activeStep}/{slide.builds}
          </span>
        </div>

        {slide.builds > 0 && (
          <div className="mt-1.5 flex gap-1">
            {Array.from({ length: slide.builds + 1 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full transition-all duration-300",
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
      <main ref={notesContainerRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
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
            No specific speaker notes for this slide. Speak naturally.
          </div>
        )}

        {/* Up Next Preview */}
        {nextSlide && (
          <div className="mt-4 rounded-lg border border-dashed border-white/20 p-3 bg-white/[0.02]">
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/50">
              Up Next ↗
            </div>
            <div className="text-[13px] font-bold text-white/90 mt-0.5">{nextSlide.title}</div>
          </div>
        )}
      </main>

      {/* ---------------- Slide 11 Quick Voting Bar (If on Slide 11) ---------------- */}
      {currentIdx === 10 && (
        <div className="shrink-0 bg-[#0e1628] border-t border-[#084BC5]/30 px-3 py-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#3b82f6] text-center mb-1">
            Slide 11 Live Interaction
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => send({ type: "vote", choice: "pow" })}
              className="rounded bg-black/60 border border-white/20 py-1.5 text-[12px] font-bold text-white active:bg-white/20"
            >
              ⚡ Vote PoW (A)
            </button>
            <button
              type="button"
              onClick={() => send({ type: "vote", choice: "pos" })}
              className="rounded bg-black/60 border border-white/20 py-1.5 text-[12px] font-bold text-white active:bg-white/20"
            >
              🌱 Vote PoS (B)
            </button>
          </div>
        </div>
      )}

      {/* ---------------- Bottom Thumb Controls (Big Tap Targets) ---------------- */}
      <footer className="shrink-0 border-t border-white/10 bg-[#121316] p-3 space-y-2">
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={() => send({ type: "cmd", cmd: "prev" })}
            className="flex-1 rounded-xl border-2 border-white/20 bg-[#1b1c20] py-3.5 text-center font-display text-[16px] font-extrabold uppercase tracking-wider text-white active:bg-white/20 transition-all"
          >
            ← Prev
          </button>

          <button
            type="button"
            onClick={() => send({ type: "cmd", cmd: "next" })}
            className="flex-[2] rounded-xl bg-[#084BC5] py-3.5 text-center font-display text-[18px] font-black uppercase tracking-wider text-white shadow-[0_4px_16px_rgba(8,75,197,0.4)] active:brightness-125 transition-all"
          >
            Next Cue →
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 pt-0.5 text-[11px] font-bold uppercase">
          <button
            type="button"
            onClick={() => send({ type: "cmd", cmd: "blank" })}
            className={cn(
              "flex-1 rounded py-1.5 text-center border transition-all",
              pcState.blank ? "bg-[#ef4444] border-[#ef4444] text-white" : "bg-white/5 border-white/10 text-white/70"
            )}
          >
            {pcState.blank ? "Show" : "⚫ Black"}
          </button>

          <button
            type="button"
            onClick={() => send({ type: "resetTimer" })}
            className="flex-1 rounded py-1.5 text-center bg-white/5 border border-white/10 text-white/70"
          >
            ⏱ Reset
          </button>

          <button
            type="button"
            onClick={() => setShowSlidePicker(true)}
            className="flex-1 rounded py-1.5 text-center bg-white/5 border border-white/10 text-[#3b82f6]"
          >
            📋 Jump
          </button>
        </div>
      </footer>

      {/* Slide Picker Sheet Modal */}
      {showSlidePicker && (
        <SlidePickerModal
          currentIdx={pcState.index}
          onSelect={(idx, present) => {
            if (present) send({ type: "goto", index: idx, step: 0 });
            else setBrowseIndex(idx);
            setShowSlidePicker(false);
          }}
          onClose={() => setShowSlidePicker(false)}
        />
      )}
    </div>
  );
}

function SlidePickerModal({
  currentIdx,
  onSelect,
  onClose,
}: {
  currentIdx: number;
  onSelect: (index: number, present: boolean) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 p-4 text-white">
      <div className="mb-3 flex items-center justify-between border-b border-white/20 pb-2">
        <h2 className="font-display text-[17px] font-black uppercase tracking-wider">
          Jump to Slide
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-white/10 px-3 py-1 text-[12px] font-bold uppercase"
        >
          Close ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {SLIDES.map((s, idx) => {
          const isCurrent = idx === currentIdx;
          const p = s.act && s.act <= 4 ? PRESENTERS[s.act - 1] : null;
          return (
            <div
              key={idx}
              className={cn(
                "flex items-center justify-between rounded-lg border p-2.5 transition-colors",
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
                  <span className="truncate font-bold text-[13px] text-white">{s.title}</span>
                </div>
                {p && (
                  <div className="text-[10px] text-white/50">
                    {p.name} · Act {s.act}
                  </div>
                )}
              </div>

              <div className="flex gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onSelect(idx, false)}
                  className="rounded bg-white/10 px-2 py-1 text-[10px] font-bold uppercase text-white/80 active:bg-white/20"
                >
                  Notes
                </button>
                <button
                  type="button"
                  onClick={() => onSelect(idx, true)}
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
  );
}
