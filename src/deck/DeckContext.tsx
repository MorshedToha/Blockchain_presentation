import { createContext, useContext, useEffect, useRef, useState } from "react";

export type Dir = "fwd" | "back";

export interface DeckApi {
  step: number;
  builds: number;
  dir: Dir;
  /** jump to a build step on the current slide (used by in-slide demo buttons) */
  goTo: (n: number) => void;
  /** register a running animation lasting `ms` so Next finishes it first */
  startAnim: (ms: number) => void;
  /** increments whenever the presenter asks to finish current animations */
  finishTick: number;
  reduced: boolean;
  /** static render (overview thumbnails) — everything at final state, no interaction */
  isStatic: boolean;
  /** number shown on the slide (title = 0) */
  slideNo: number;
  /** act number 1–4 (0 = bookend slide) */
  act: number;
}

export const DeckContext = createContext<DeckApi>({
  step: 0,
  builds: 0,
  dir: "fwd",
  goTo: () => {},
  startAnim: () => {},
  finishTick: 0,
  reduced: false,
  isStatic: false,
  slideNo: 0,
  act: 0,
});

export const useDeck = () => useContext(DeckContext);

/**
 * Timed multi-phase sequence. Returns the current phase (0..delays.length).
 * - Starts whenever `key` changes while `run` is true.
 * - Jumps to the final phase on finish-signal, reduced motion, backwards nav or static render.
 * - Deterministic: the final phase is always delays.length.
 */
export function useSequence(key: string | number, run: boolean, delays: number[]) {
  const { finishTick, startAnim, reduced, isStatic, dir } = useDeck();
  const total = delays.length;
  const [phase, setPhase] = useState(run ? total : 0);
  const timers = useRef<number[]>([]);
  const sig = `${key}|${run}`;
  const prevSig = useRef(sig);
  const prevFinish = useRef(finishTick);

  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  useEffect(() => {
    if (prevSig.current === sig) return;
    prevSig.current = sig;
    clear();
    if (!run) {
      setPhase(0);
      return;
    }
    if (reduced || isStatic || dir === "back") {
      setPhase(total);
      return;
    }
    setPhase(0);
    delays.forEach((d, i) => {
      timers.current.push(window.setTimeout(() => setPhase(i + 1), d));
    });
    startAnim((delays[total - 1] ?? 0) + 420);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig]);

  useEffect(() => {
    if (prevFinish.current === finishTick) return;
    prevFinish.current = finishTick;
    if (timers.current.length) {
      clear();
      if (run) setPhase(total);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finishTick]);

  useEffect(() => clear, []);

  return phase;
}
