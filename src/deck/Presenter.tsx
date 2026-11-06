import { useEffect, useMemo, useRef, useState } from "react";
import { DeckContext, type DeckApi } from "@/deck/DeckContext";
import { ACTS, PRESENTERS, themeBg } from "@/deck/ui";
import { SLIDES, contentNo } from "@/slides";
import { cn } from "@/utils/cn";
import { H, W, StaticSlide, mmss, nextState, useFit, type AudienceMsg, type PresenterBody, type PresenterCmd } from "./stage";

function send(msg: PresenterBody) {
  window.opener?.postMessage({ src: "bc-presenter", ...msg }, "*");
}

function LiveSlide({ index, step }: { index: number; step: number }) {
  const s = SLIDES[index];
  const ref = useRef<HTMLDivElement>(null);
  const scale = useFit(ref);
  const api: DeckApi = useMemo(
    () => ({ step, builds: s.builds, dir: "fwd", goTo: () => {}, startAnim: () => {}, finishTick: 0, reduced: false, isStatic: false, slideNo: contentNo(index), act: s.act }),
    [step, s, index],
  );
  const C = s.Component;
  return (
    <div ref={ref} className="relative flex h-full w-full items-center justify-center">
      <div style={{ width: W * scale, height: H * scale }} className="relative">
        <div
          className={cn("absolute left-0 top-0 cursor-pointer overflow-hidden", themeBg[s.theme])}
          style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: "0 0" }}
          onClick={() => send({ type: "cmd", cmd: "next" })}
        >
          <DeckContext.Provider value={api}>
            <C key={index} />
          </DeckContext.Provider>
        </div>
      </div>
    </div>
  );
}

export function PresenterView() {
  const [[index, step], setPos] = useState<[number, number]>([0, 0]);
  const [blank, setBlank] = useState(false);
  const [linked, setLinked] = useState(false);
  const [t0, setT0] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const notesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = "Presenter View — Blockchain";
    const onMsg = (e: MessageEvent) => {
      const d = e.data as AudienceMsg;
      if (d?.src !== "bc-audience" || d.type !== "state") return;
      setLinked(true);
      setPos([d.index, d.step]);
      setBlank(d.blank);
    };
    window.addEventListener("message", onMsg);
    send({ type: "hello" });
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.removeEventListener("message", onMsg);
      window.clearInterval(t);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const map: Record<string, PresenterCmd> = {
        ArrowRight: "next", ArrowDown: "next", PageDown: "next", " ": "next", Enter: "next",
        ArrowLeft: "prev", ArrowUp: "prev", PageUp: "prev", Backspace: "prev",
        ".": "blank", Home: "first", End: "last",
      };
      const cmd = map[e.key];
      if (cmd) {
        e.preventDefault();
        send({ type: "cmd", cmd });
      } else if (e.key.length === 1) {
        send({ type: "key", key: e.key });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    notesRef.current?.querySelector("[data-active='true']")?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [index, step]);

  const s = SLIDES[index];
  const nx = nextState(index, step);
  const elapsed = Math.floor((now - t0) / 1000);
  const diff = elapsed - s.ends;
  const act = s.act ? ACTS[s.act - 1] : null;
  const speaker = s.act ? PRESENTERS[s.act - 1].name : "";
  const clock = new Date(now).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const btn = "focus-ring border-2 border-paper/60 px-5 py-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-paper hover:bg-paper hover:text-ink";

  if (!window.opener) {
    return (
      <div className="flex h-full items-center justify-center bg-ink p-10 text-center text-paper">
        <div>
          <div className="font-display text-[40px] font-extrabold uppercase">Presenter View</div>
          <p className="mt-3 text-[18px] text-paper/80">Open this from the main presentation window by pressing P.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-ink text-paper">
      {/* Top bar */}
      <header className="flex items-end justify-between border-b border-paper/20 px-8 py-4">
        <div className="flex items-end gap-8">
          <button type="button" onClick={() => { setT0(Date.now()); setNow(Date.now()); }} title="Restart timer" className="focus-ring tabnum font-display text-[44px] font-extrabold leading-none tracking-[-0.02em] hover:text-[#7FA6EE]">
            {mmss(elapsed)}
          </button>
          <div className="pb-1 text-[13px] font-semibold uppercase tracking-[0.12em]">
            <div className="text-paper/60">Target for this slide</div>
            <div className={cn("tabnum", diff > 15 ? "text-[#FF8F80]" : "text-[#7FA6EE]")}>
              {mmss(s.ends)} {diff > 15 ? `· ${mmss(diff)} behind` : diff < -60 ? "· ahead" : "· on time"}
            </div>
          </div>
        </div>
        <div className="pb-1 text-right text-[13px] font-semibold uppercase tracking-[0.12em]">
          <div className="text-paper/60">{act ? `Act 0${act.n} · ${act.title}` : "Bookend"}</div>
          <div>{speaker || s.title}</div>
        </div>
        <div className="tabnum pb-1 text-[13px] font-semibold uppercase tracking-[0.12em] text-paper/60">
          {linked ? "● Linked" : "○ Waiting for main window"} · {clock}
        </div>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-[1.65fr_1fr] gap-6 p-6">
        {/* Current */}
        <section className="flex min-h-0 flex-col">
          <div className="mb-2 flex justify-between text-[13px] font-semibold uppercase tracking-[0.12em] text-paper/60">
            <span>
              Now · {contentNo(index) ? `${String(contentNo(index)).padStart(2, "0")} / 12` : s.title} · click {step}/{s.builds}
            </span>
            {blank && <span className="text-[#FF8F80]">Audience screen is black (press .)</span>}
          </div>
          <div className={cn("min-h-0 flex-1", blank && "opacity-40")}>
            <LiveSlide index={index} step={step} />
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button type="button" className={btn} onClick={() => send({ type: "cmd", cmd: "prev" })}>← Prev</button>
            <button type="button" className={cn(btn, "bg-paper text-ink")} onClick={() => send({ type: "cmd", cmd: "next" })}>Next →</button>
            <button type="button" className={btn} onClick={() => send({ type: "cmd", cmd: "blank" })}>{blank ? "Show screen" : "Black screen"}</button>
            <div className="ml-auto flex gap-[3px]">
              {SLIDES.map((sl, i) => (
                <span key={i} className={cn("h-[6px]", sl.kind === "content" ? "w-[22px]" : "w-[8px]", i < index ? "bg-paper/70" : i === index ? "bg-[#7FA6EE]" : "bg-paper/20")} />
              ))}
            </div>
          </div>
        </section>

        {/* Next + notes */}
        <section className="flex min-h-0 flex-col">
          <div className="mb-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-paper/60">
            {nx ? (nx[0] === index ? "Next click" : `Next slide · ${SLIDES[nx[0]].title}`) : "End of presentation"}
          </div>
          <div className="border border-paper/25">{nx ? <StaticSlide i={nx[0]} step={nx[1]} /> : <div className="aspect-video" />}</div>
          <div ref={notesRef} className="mt-5 min-h-0 flex-1 overflow-y-auto pr-2">
            {s.notes.map((n, i) => (
              <p
                key={i}
                data-active={i === step}
                className={cn("mb-4 border-l-[3px] pl-4 text-[20px] leading-[1.5] transition-colors", i === step ? "border-[#7FA6EE] text-paper" : i < step ? "border-transparent text-paper/35" : "border-transparent text-paper/60")}
              >
                {n}
              </p>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
