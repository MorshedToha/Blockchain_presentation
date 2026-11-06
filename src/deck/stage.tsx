import { useLayoutEffect, useRef, useState } from "react";
import { DeckContext, type DeckApi } from "@/deck/DeckContext";
import { themeBg } from "@/deck/ui";
import { SLIDES, contentNo } from "@/slides";
import { cn } from "@/utils/cn";

export const W = 1920;
export const H = 1080;

export const mmss = (sec: number) =>
  `${sec < 0 ? "−" : ""}${String(Math.floor(Math.abs(sec) / 60)).padStart(2, "0")}:${String(Math.abs(sec) % 60).padStart(2, "0")}`;

/** Scales a 1920×1080 canvas into whatever box it's given */
export function useFit(ref: React.RefObject<HTMLDivElement | null>) {
  const [scale, setScale] = useState(0.5);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        setScale(Math.max(0.05, Math.min(r.width / W, r.height / H)));
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", update);
    }
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", update);
      }
    };
  }, [ref]);
  return scale;
}

/** A non-interactive render of slide `i` frozen at build `step` (defaults to final). */
export function StaticSlide({ i, step }: { i: number; step?: number }) {
  const s = SLIDES[i];
  const st = step ?? s.builds;
  const ref = useRef<HTMLDivElement>(null);
  const scale = useFit(ref);
  const api: DeckApi = { step: st, builds: s.builds, dir: "fwd", goTo: () => {}, startAnim: () => {}, finishTick: 0, reduced: true, isStatic: true, slideNo: contentNo(i), act: s.act };
  const C = s.Component;
  return (
    <div ref={ref} className="relative aspect-video w-full overflow-hidden">
      <div className={cn("reduced pointer-events-none absolute left-0 top-0", themeBg[s.theme])} style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: "0 0" }} aria-hidden inert>
        <DeckContext.Provider value={api}>
          <C key={`${i}-${st}`} />
        </DeckContext.Provider>
      </div>
    </div>
  );
}

/** The state that follows (i, step) — next build, or first build of the next slide. */
export function nextState(i: number, step: number): [number, number] | null {
  if (step < SLIDES[i].builds) return [i, step + 1];
  if (i < SLIDES.length - 1) return [i + 1, 0];
  return null;
}

/* ---------- Audience ⇄ presenter messaging ---------- */
export type PresenterCmd = "next" | "prev" | "blank" | "first" | "last";
export type PresenterBody = { type: "hello" } | { type: "cmd"; cmd: PresenterCmd } | { type: "key"; key: string };
export type PresenterMsg = PresenterBody & { src: "bc-presenter" };
export type AudienceMsg = { src: "bc-audience"; type: "state"; index: number; step: number; blank: boolean };
