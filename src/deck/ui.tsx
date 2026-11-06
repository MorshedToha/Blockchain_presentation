import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/utils/cn";
import { useDeck } from "./DeckContext";

export type Theme = "white" | "blue" | "black";

export const themeBg: Record<Theme, string> = {
  white: "bg-paper text-ink",
  blue: "bg-cobalt text-paper",
  black: "bg-ink text-paper",
};

export const DECK_LABEL = "Blockchain";
export const TOPIC = "Topic #33";
export const CONTENT_TOTAL = 12;

export const GROUP = {
  name: "",
  course: "",
  date: "20 Nov 2026",
};

/** One presenter per act. Replace names and IDs with your own. */
export const PRESENTERS = [
  { name: "T. JITO", id: "269201405" },
  { name: "T.M.F MORSHED", id: "269201413" },
  { name: "A.M. ASHIK", id: "269201407" },
  { name: "H.M. NAIM", id: "269201418" },
];

export const ACTS = [
  { n: 1, title: "What it is", time: "00:00 – 05:00" },
  { n: 2, title: "How it locks", time: "05:00 – 10:00" },
  { n: 3, title: "Real life", time: "10:00 – 15:00" },
  { n: 4, title: "The trade-off", time: "15:00 – 20:00" },
];

/* ---------- Headline ---------- */
export function Headline({ lines, className, show = true, size = 116 }: { lines: ReactNode[]; className?: string; show?: boolean; size?: number }) {
  return (
    <h1
      className={cn("font-display font-extrabold uppercase", className)}
      style={{ fontSize: size, lineHeight: 0.9, letterSpacing: "-0.035em" }}
    >
      {lines.map((l, i) => (
        <Mask key={i} show={show} delay={i * 70}>
          {l}
        </Mask>
      ))}
    </h1>
  );
}

/* ---------- Typographic mask reveal ---------- */
export function Mask({ show, children, delay = 0, className }: { show: boolean; children: ReactNode; delay?: number; className?: string }) {
  return (
    <span className={cn("block overflow-hidden pb-[0.06em] -mb-[0.06em]", className)}>
      <span
        className="t-base block"
        style={{ transform: show ? "translateY(0)" : "translateY(108%)", transitionDelay: `${delay}ms`, transitionDuration: "420ms" }}
      >
        {children}
      </span>
    </span>
  );
}

/* ---------- Simple reveal (short vertical/horizontal shift) ---------- */
export function Reveal({
  show,
  children,
  delay = 0,
  from = "up",
  className,
  style,
  as: Tag = "div",
}: {
  show: boolean;
  children?: ReactNode;
  delay?: number;
  from?: "up" | "left" | "right" | "none";
  className?: string;
  style?: CSSProperties;
  as?: "div" | "span" | "p" | "li";
}) {
  const off = from === "up" ? "translateY(14px)" : from === "left" ? "translateX(-18px)" : from === "right" ? "translateX(18px)" : "none";
  return (
    <Tag
      className={cn("t-base", className)}
      aria-hidden={!show || undefined}
      style={{
        opacity: show ? 1 : 0,
        transform: show ? "none" : off,
        transitionDelay: `${delay}ms`,
        visibility: show ? "visible" : "hidden",
        transitionProperty: "opacity, transform, visibility",
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}

/* ---------- Line that draws itself ---------- */
export function DrawPath({ d, show, delay = 0, className, strokeWidth = 2, dashed }: { d: string; show: boolean; delay?: number; className?: string; strokeWidth?: number; dashed?: boolean }) {
  if (dashed) {
    return <path d={d} fill="none" strokeWidth={strokeWidth} strokeDasharray="6 8" className={cn("t-base", className)} style={{ opacity: show ? 1 : 0, transitionDelay: `${delay}ms` }} />;
  }
  return (
    <path
      d={d}
      pathLength={1}
      fill="none"
      strokeWidth={strokeWidth}
      className={cn("draw", className)}
      style={{ strokeDashoffset: show ? 0 : 1, transitionDelay: `${delay}ms` }}
    />
  );
}

/* ---------- Thin directional arrow ---------- */
export function Arrow({ dir = "ne", size = 40, className, stroke = 2 }: { dir?: "ne" | "se" | "e" | "s" | "w" | "sw"; size?: number; className?: string; stroke?: number }) {
  const rot = { ne: 0, e: 45, se: 90, s: 135, sw: 180, w: 225 }[dir];
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className} style={{ transform: `rotate(${rot}deg)` }} aria-hidden>
      <path d="M8 32 L32 8 M13 8 H32 V27" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="square" />
    </svg>
  );
}

/* ---------- Rectangular control ---------- */
export function Btn({
  children,
  onClick,
  tone = "dark",
  active,
  disabled,
  className,
  ariaLabel,
}: {
  children: ReactNode;
  onClick: () => void;
  tone?: "dark" | "light";
  active?: boolean;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}) {
  const { isStatic } = useDeck();
  const base =
    tone === "dark"
      ? "border-ink text-ink hover:bg-ink hover:text-paper"
      : "border-paper text-paper hover:bg-paper hover:text-cobalt";
  const on = tone === "dark" ? "bg-ink text-paper" : "bg-paper text-cobalt";
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      tabIndex={isStatic ? -1 : 0}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "focus-ring group inline-flex items-center gap-4 border-2 px-6 py-[14px] font-sans text-[20px] font-semibold uppercase tracking-[0.08em] transition-colors duration-200",
        base,
        active && on,
        disabled && "pointer-events-none opacity-40",
        className,
      )}
    >
      <span>{children}</span>
      <Arrow size={22} stroke={2.5} className="transition-transform duration-200 group-hover:translate-x-[2px] group-hover:-translate-y-[2px]" />
    </button>
  );
}

/* ---------- Micro label ---------- */
export function Micro({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("font-sans text-[20px] font-semibold uppercase tracking-[0.11em]", className)}>{children}</div>;
}

/* ---------- Slide shell (1920×1080) ---------- */
export function Slide({ theme, children, label, className, bare }: { theme: Theme; children: ReactNode; label?: string; className?: string; bare?: boolean }) {
  const sub = theme === "white" ? "text-mute" : "text-paper/80";
  const { slideNo, act } = useDeck();
  if (bare) return <div className={cn("absolute inset-0 overflow-hidden", themeBg[theme], className)}>{children}</div>;
  const a = act ? ACTS[act - 1] : null;
  return (
    <div className={cn("absolute inset-0 overflow-hidden", themeBg[theme], className)}>
      <div className={cn("absolute left-[96px] right-[96px] top-[44px] flex justify-between", sub)}>
        <Micro>{a ? `Act 0${a.n} — ${a.title}` : DECK_LABEL}</Micro>
        {label && (
          <Micro>
            {slideNo ? (
              <>
                <span className="tabnum">{String(slideNo).padStart(2, "0")}</span>
                <span className="opacity-60"> / {CONTENT_TOTAL}</span> — {label}
              </>
            ) : (
              label
            )}
          </Micro>
        )}
      </div>
      {children}
      <div className={cn("absolute bottom-[40px] left-[96px] flex items-center gap-5", sub)}>
        <Arrow dir="ne" size={30} />
        <Micro>{a ? PRESENTERS[a.n - 1].name : DECK_LABEL}</Micro>
      </div>
    </div>
  );
}
