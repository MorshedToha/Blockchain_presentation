import { useEffect, useState } from "react";
import { useDeck } from "@/deck/DeckContext";
import { ACTS, Arrow, DrawPath, GROUP, Headline, Mask, Micro, PRESENTERS, Reveal, Slide } from "@/deck/ui";
import { cn } from "@/utils/cn";
import drive from "@/assets/drive.jpg";

/* =========================================================
   ACT DIVIDER — full cobalt, one number, one name
   ========================================================= */
export function makeDivider(n: number) {
  function Divider() {
    const a = ACTS[n - 1];
    const p = PRESENTERS[n - 1];
    return (
      <Slide theme="blue" bare>
        <div className="absolute left-[60px] top-[60px] w-[960px] font-display font-extrabold leading-[0.8] tracking-[-0.06em]" style={{ fontSize: 640 }}>
          <Mask show>0{n}</Mask>
        </div>
        <div className="absolute left-[1060px] top-[380px] w-[764px]">
          <Micro className="text-paper/80">
            Act 0{n} · <span className="tabnum">{a.time}</span>
          </Micro>
          <div className="mt-4 font-display text-[120px] font-extrabold uppercase leading-[0.9] tracking-[-0.04em]">
            <Mask show>{a.title}</Mask>
          </div>
          <svg width={764} height={40} className="mt-10 block" aria-hidden>
            <DrawPath d="M0 20 H700" show className="stroke-paper" strokeWidth={2} />
          </svg>
          <div className="mt-6 flex items-center gap-5">
            <Arrow dir="ne" size={36} />
            <span className="font-display text-[44px] font-bold tracking-[-0.015em]">{p.name}</span>
          </div>
        </div>
      </Slide>
    );
  }
  return Divider;
}

/* =========================================================
   10 — MIRACLE OR HYPE? (white)
   ========================================================= */
const PROS = [
  ["Trust without a middleman", "Strangers can deal safely — no fee to a bank in the middle."],
  ["Always on, 24/7", "No weekends, no holidays, no closing time."],
  ["Transparent", "Every transaction can be checked in public."],
];
const CONS = [
  ["Speed limits", "Thousands of computers must agree on every page."],
  ["No undo for mistakes & scams", "No hotline to reverse a payment."],
  ["No “Forgot password”", "Lose the key, lose everything."],
];

function Scale({ pros, cons }: { pros: number; cons: number }) {
  const deg = (pros - cons) * 3;
  const L = 270;
  const PY = 92;
  const dy = L * Math.sin((deg * Math.PI) / 180);
  const pan = (side: -1 | 1, n: number, label: string, color: string, dyy: number) => {
    const x = 382 + side * L;
    return (
      <g className="t-base" style={{ transform: `translateY(${dyy}px)`, transitionDuration: "520ms" }}>
        <line x1={x} y1={PY} x2={x - 70} y2={PY + 86} stroke="#080808" strokeWidth={1.5} />
        <line x1={x} y1={PY} x2={x + 70} y2={PY + 86} stroke="#080808" strokeWidth={1.5} />
        <line x1={x - 80} y1={PY + 86} x2={x + 80} y2={PY + 86} stroke="#080808" strokeWidth={3} />
        {Array.from({ length: n }).map((_, i) => (
          <rect key={i} x={x - 54 + i * 38} y={PY + 54} width={30} height={30} fill={color} />
        ))}
        <text x={x} y={PY + 116} textAnchor="middle" fontSize={17} fontWeight={700} letterSpacing="2" fill={color}>
          {label}
        </text>
      </g>
    );
  };
  return (
    <svg width={764} height={290} viewBox="0 0 764 290" aria-label={`Balance scale: ${pros} advantages, ${cons} disadvantages`}>
      <line x1={382} y1={PY} x2={382} y2={268} stroke="#080808" strokeWidth={3} />
      <line x1={322} y1={268} x2={442} y2={268} stroke="#080808" strokeWidth={3} />
      <g className="t-base" style={{ transform: `rotate(${-deg}deg)`, transformOrigin: `382px ${PY}px`, transitionDuration: "520ms" }}>
        <line x1={382 - L} y1={PY} x2={382 + L} y2={PY} stroke="#080808" strokeWidth={3} />
      </g>
      <rect x={374} y={PY - 8} width={16} height={16} fill="#080808" />
      {pan(-1, pros, "ADVANTAGES", "#084BC5", dy)}
      {pan(1, cons, "DISADVANTAGES", "#080808", -dy)}
      <text x={382} y={22} textAnchor="middle" fontSize={17} fontWeight={700} letterSpacing="2" fill="#595955">
        BOTH SIDES OF THE COIN
      </text>
    </svg>
  );
}

export function S10() {
  const { step } = useDeck();
  const Item = ({ t, d, i, show, active, sign }: { t: string; d: string; i: number; show: boolean; active: boolean; sign: string }) => (
    <Reveal show={show} className={cn("grid grid-cols-[56px_1fr] border-b py-[12px] t-base", active ? "border-cobalt" : "border-rule")}>
      <span className={cn("font-display text-[30px] font-bold leading-none t-base", active ? "text-cobalt" : "text-mute")}>
        {sign}
        <span className="ml-1 text-[18px]">0{i + 1}</span>
      </span>
      <span>
        <span className={cn("block font-display text-[32px] font-bold uppercase leading-[1.05] tracking-[-0.015em] t-base", active && "text-cobalt")}>{t}</span>
        <span className="mt-1 block text-[22px] text-mute">{d}</span>
      </span>
    </Reveal>
  );

  return (
    <Slide theme="white" label="Advantages vs. disadvantages">
      <Micro className="absolute left-[96px] top-[124px] text-cobalt">The honest truth</Micro>
      <div className="absolute left-[96px] top-[160px]">
        <Headline lines={["MIRACLE", "OR HYPE?"]} />
      </div>
      <div className="absolute left-[1060px] top-[100px]">
        <Scale pros={Math.min(step, 3)} cons={Math.max(0, step - 3)} />
      </div>

      <div className="absolute left-[96px] top-[400px] grid w-[1728px] grid-cols-2 gap-x-16">
        <div>
          <Micro className="border-b-2 border-ink pb-3">Advantages</Micro>
          {PROS.map(([t, d], i) => (
            <Item key={t} t={t} d={d} i={i} sign="+" show={step >= i + 1} active={step === i + 1} />
          ))}
        </div>
        <div>
          <Micro className="border-b-2 border-ink pb-3">Disadvantages</Micro>
          {CONS.map(([t, d], i) => (
            <Item key={t} t={t} d={d} i={i} sign="−" show={step >= i + 4} active={step === i + 4} />
          ))}
        </div>
      </div>

      <Reveal show={step >= 4} className="absolute left-[96px] top-[790px] w-[1728px] border-t-2 border-ink pt-5">
        <div className="grid grid-cols-[200px_1fr_420px] items-center gap-x-6 gap-y-4">
          <span className="font-display text-[28px] font-bold uppercase">Visa</span>
          <div className="h-[22px] w-full bg-ink" />
          <span className="tabnum text-[24px]">
            <b>65,000</b> per second <span className="text-mute">· capacity</span>
          </span>
          <span className="font-display text-[28px] font-bold uppercase text-cobalt">Bitcoin</span>
          <div className="h-[22px] w-[3px] bg-cobalt" />
          <span className="tabnum text-[24px] text-cobalt">
            <b>~7</b> per second <span className="text-mute">· typical max</span>
          </span>
        </div>
        <Micro className="mt-3 text-mute">Visa fact sheet (stated capacity, transaction messages) · not a like-for-like test</Micro>
      </Reveal>
    </Slide>
  );
}

/* =========================================================
   11 — TOTAL FREEDOM. NO SAFETY NET. (black)
   ========================================================= */
export function S11() {
  const { step, isStatic } = useDeck();
  const [choice, setChoice] = useState<"A" | "B" | null>(null);

  useEffect(() => {
    if (step < 3) setChoice(null);
  }, [step]);
  useEffect(() => {
    if (isStatic || step < 3) return;
    const on = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "a" || e.key === "A") setChoice("A");
      if (e.key === "b" || e.key === "B") setChoice("B");
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [step, isStatic]);

  const spectrum = [
    { t: "A — Bank / custodian", d: "Someone can help you" },
    { t: "Shared recovery", d: "Multi-signature" },
    { t: "B — Self-custody", d: "Nobody can touch it" },
  ];
  const lit = (i: number) => step >= 4 && ((choice === "A" && i === 0) || (choice === "B" && i === 2));

  return (
    <Slide theme="black" label="The ultimate trade-off">
      <Micro className="absolute left-[96px] top-[124px] text-paper/80">The ultimate trade-off</Micro>
      <div className="absolute left-[96px] top-[160px]">
        <Headline lines={["TOTAL FREEDOM.", "NO SAFETY NET."]} size={104} />
      </div>
      <img src={drive} alt="Black-and-white photograph of a hand holding a small metal encrypted USB drive" className="photo absolute right-[96px] top-[110px] h-[560px] w-[400px]" style={{ objectPosition: "50% 35%" }} />

      <Reveal show={step >= 1} className="absolute left-[96px] top-[385px] flex w-[1200px] items-end gap-10">
        <div className="tabnum shrink-0 whitespace-nowrap font-display text-[96px] font-extrabold leading-[0.85] tracking-[-0.045em]">7,002 BTC</div>
        <div className="pb-1">
          <div className="flex gap-[6px]" aria-label="8 of 10 password attempts used">
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={i} className={cn("flex h-[34px] w-[34px] items-center justify-center border-2 text-[20px] font-bold", i < 8 ? "border-paper/45 text-paper/60" : "border-paper text-paper")}>
                {i < 8 ? "×" : ""}
              </span>
            ))}
          </div>
          <Micro className="mt-2 whitespace-nowrap text-paper">2 guesses left — Stefan Thomas · NYT, 2021</Micro>
        </div>
      </Reveal>

      <Reveal show={step >= 2} className="absolute left-[96px] top-[525px] flex w-[1240px] items-baseline gap-8">
        <div className="tabnum shrink-0 whitespace-nowrap font-display text-[48px] font-extrabold leading-none tracking-[-0.03em]">8,000 BTC</div>
        <p className="text-[22px] text-paper/85">James Howells — drive in a landfill since 2013. A court said no in 2025.</p>
      </Reveal>

      <Reveal show={step >= 3} className="absolute left-[96px] top-[615px] w-[1200px]">
        <Micro className="mb-3 text-paper/80">Professor — which flaw would you rather live with?</Micro>
        <div className="grid grid-cols-2 gap-6">
          {(
            [
              ["A", "A “reset password” boss", "Can save you — can also freeze you."],
              ["B", "Nobody can touch your vault", "Nobody can freeze it — nobody can save you."],
            ] as const
          ).map(([k, t, d]) => {
            const on = choice === k;
            return (
              <div key={k} className={cn("grid grid-cols-[60px_1fr] items-center border-2 px-6 py-4 transition-colors duration-200", on ? "border-paper bg-paper text-ink" : "border-paper/80")}>
                <span className="font-display text-[52px] font-extrabold leading-none">{k}</span>
                <span>
                  <span className="block font-display text-[26px] font-bold uppercase leading-[1.05]">{t}</span>
                  <span className={cn("mt-1 block text-[19px]", on ? "text-ink/70" : "text-paper/80")}>{d}</span>
                </span>
              </div>
            );
          })}
        </div>
      </Reveal>

      <svg className="absolute inset-0" width={1920} height={1080} aria-hidden>
        <DrawPath d="M96 870 H1824" show={step >= 4} className="stroke-paper" strokeWidth={2} />
        {spectrum.map((_, i) => {
          const x = 96 + (i * 1728) / 2;
          return <rect key={i} x={x - (i === 2 ? 18 : i === 1 ? 9 : 0)} y={861} width={18} height={18} className="t-base" fill={lit(i) ? "#084BC5" : "#080808"} stroke="#FAFAF7" strokeWidth={2} style={{ opacity: step >= 4 ? 1 : 0, transitionDelay: `${200 + i * 120}ms` }} />;
        })}
      </svg>
      {spectrum.map((s, i) => {
        const left = i === 0 ? 96 : i === 1 ? 96 + 864 - 260 : 96 + 1728 - 520;
        return (
          <Reveal key={s.t} show={step >= 4} delay={200 + i * 120} className="absolute w-[520px]" style={{ left, top: 894, textAlign: i === 0 ? "left" : i === 1 ? "center" : "right" }}>
            <div className={cn("inline-block font-display text-[24px] font-bold uppercase", lit(i) && "bg-cobalt px-2")}>
              {s.t}
              {lit(i) && " · Professor's pick"}
            </div>
            <div className="mt-1 text-[20px] text-paper/80">{s.d}</div>
          </Reveal>
        );
      })}
    </Slide>
  );
}

/* =========================================================
   12 — FROM "DON'T BE EVIL" TO "CAN'T BE EVIL" (blue)
   ========================================================= */
const PILLARS = [
  ["What it is", "A shared notebook with no Backspace key."],
  ["How it locks", "Fingerprints chain every page together."],
  ["Real life", "Contracts, food, medicine, diplomas."],
  ["The trade-off", "Total freedom — or a safety net."],
];

export function S12() {
  const { step } = useDeck();
  const pillarOn = (i: number) => (step >= 1 && step <= 4 ? step === i + 1 : step > 4);
  return (
    <Slide theme="blue" label="Conclusion">
      <Micro className="absolute left-[96px] top-[124px] text-paper/80">The architecture of trust</Micro>
      <div className="absolute left-[96px] top-[170px] grid w-[1728px] grid-cols-4 gap-x-8">
        {PILLARS.map(([t, d], i) => (
          <Reveal key={t} show={step >= i + 1} className={cn("border-t-2 pt-4 t-base", pillarOn(i) ? "border-paper" : "border-paper/45 opacity-60")}>
            <Micro className="text-paper/80">
              Act 0{i + 1} · {PRESENTERS[i].name}
            </Micro>
            <div className="mt-2 font-display text-[34px] font-extrabold uppercase leading-[1.05] tracking-[-0.015em]">{t}</div>
            <p className="mt-2 text-[23px] leading-[1.35] text-paper/85">{d}</p>
          </Reveal>
        ))}
      </div>

      <div className="absolute left-[96px] top-[500px] font-display font-extrabold uppercase leading-[0.95] tracking-[-0.045em]" style={{ fontSize: 150 }}>
        <div className="relative">
          <span className={cn("t-base inline-block", step >= 6 && "text-paper/45")}>
            <Mask show={step >= 5}>Don't be evil.</Mask>
          </span>
          <svg className="pointer-events-none absolute left-0 top-0" width={1300} height={150} aria-hidden>
            <DrawPath d="M0 78 H975" show={step >= 6} className="stroke-paper" strokeWidth={6} />
          </svg>
        </div>
        <Mask show={step >= 6} delay={450}>
          <span className="underline decoration-[8px] underline-offset-[14px]">Can't</span> be evil.
        </Mask>
      </div>
      <Reveal show={step >= 6} delay={800} className="absolute left-[96px] top-[910px] text-[28px] text-paper">
        Blind human trust → open, checkable math.
      </Reveal>
    </Slide>
  );
}

/* =========================================================
   SOURCES (white)
   ========================================================= */
const SOURCES: [string, string, string][] = [
  ["04", "Haber & Stornetta (1991). How to time-stamp a digital document.", "Journal of Cryptology 3"],
  ["04", "Nakamoto (2008). Bitcoin: a peer-to-peer electronic cash system · block 0, 3 Jan 2009.", "bitcoin.org"],
  ["04", "Hanyecz pizza offer, 18 May 2010; purchase 22 May 2010.", "Bitcointalk · Bitcoin Wiki"],
  ["04", "Buterin (Nov 2013, age 19). Ethereum white paper; launch 30 Jul 2015.", "ethereum.org"],
  ["06", "The Merge (15 Sep 2022) cut Ethereum's energy use by ~99.95%.", "ethereum.org/roadmap/merge"],
  ["07", "AXA fizzy flight-delay insurance on Ethereum, 2017–2019.", "Artificial Lawyer, 2020"],
  ["08", "Walmart mango trace: 6 d 18 h 26 min vs 2.2 s.", "Quartz, Feb 2018"],
  ["08", "MediLedger network (Pfizer, McKesson…) · Aura consortium (LVMH, Prada, Cartier).", "Reuters, 2020 · Aura"],
  ["09", "MIT issues blockchain diplomas to 111 graduates (Blockcerts).", "CoinDesk, Oct 2017"],
  ["10", "Visa: 65,000 transaction messages per second (stated capacity).", "Visa Inc. fact sheet"],
  ["11", "Stefan Thomas, 7,002 BTC, two guesses left.", "New York Times, 12 Jan 2021"],
  ["11", "James Howells, 8,000 BTC in a landfill; claim struck out 2025.", "BBC News, Aug 2025"],
];

export function SSources() {
  return (
    <Slide theme="white" label="Sources">
      <div className="absolute left-[96px] top-[130px]">
        <h1 className="font-display text-[96px] font-extrabold uppercase leading-[0.9] tracking-[-0.035em]">Sources</h1>
      </div>
      <ol className="absolute left-[96px] top-[270px] w-[1728px]">
        {SOURCES.map(([sl, t, w], i) => (
          <li key={i} className={cn("grid grid-cols-[110px_1fr_440px] items-baseline gap-x-6 border-t border-rule py-[11px]", i === SOURCES.length - 1 && "border-b")}>
            <span className="tabnum font-display text-[21px] font-bold text-cobalt">Slide {sl}</span>
            <span className="text-[22px] leading-[1.3]">{t}</span>
            <span className="text-right text-[20px] text-mute">{w}</span>
          </li>
        ))}
      </ol>
      <div className="absolute left-[96px] top-[960px] text-[20px] text-mute">Photographs are AI-generated for this presentation. The diploma, names and sensor data in the demos are synthetic.</div>
    </Slide>
  );
}

/* =========================================================
   THANK YOU — final screen (bare black)
   ========================================================= */
export function SThanks() {
  const { step } = useDeck();
  const q = step >= 1;
  return (
    <Slide theme="black" bare>
      <div className="t-base absolute inset-x-0 top-1/2 text-center" style={{ transform: `translateY(${q ? "-92%" : "-50%"})`, transitionDuration: "450ms" }}>
        <h1 className="font-display font-extrabold uppercase" style={{ fontSize: 250, lineHeight: 0.9, letterSpacing: "-0.04em" }}>
          <Mask show>THANK YOU.</Mask>
        </h1>
      </div>
      <svg className="absolute inset-0" width={1920} height={1080} aria-hidden>
        <DrawPath d="M880 600 H1040" show={q} delay={200} className="stroke-cobalt" strokeWidth={4} />
      </svg>
      <div className="absolute inset-x-0 top-[640px] text-center font-display text-[84px] font-bold uppercase leading-none tracking-[-0.03em]">
        <Mask show={q} delay={380}>
          Any questions?
        </Mask>
      </div>
      <Reveal show={q} delay={650} className="absolute bottom-[64px] left-[96px] right-[96px] flex justify-between text-paper/80">
        <Micro>{GROUP.date}</Micro>
        <Micro>{PRESENTERS.map((p) => p.name).join(" · ")}</Micro>
      </Reveal>
    </Slide>
  );
}
