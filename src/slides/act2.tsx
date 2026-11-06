import { useMemo } from "react";
import { useDeck, useSequence } from "@/deck/DeckContext";
import { DrawPath, Headline, Mask, Micro, Reveal, Slide } from "@/deck/ui";
import { sha256 } from "@/lib/sha256";
import { cn } from "@/utils/cn";
import sealPhoto from "@/assets/seal.jpg";

/* =========================================================
   05 — WHY A "BLOCK-CHAIN"? THE DIGITAL WAX SEAL (white)
   ========================================================= */
const NAMES = ["#101", "#102", "#103"];
const DATA = ["Carol pays Alice 5 BTC", "Alice pays Bob 10 BTC", "Bob pays Dan 3 BTC"];
const EDITED = "Alice pays Bob 100 BTC";
const GENESIS = "0".repeat(64);
const seal = (i: number, prev: string, d: string) => sha256(`${NAMES[i]}|${prev}|${d}`);
const PREV: string[] = [];
const ORIG: string[] = [];
{
  let p = GENESIS;
  DATA.forEach((d, i) => {
    PREV.push(p);
    p = seal(i, p, d);
    ORIG.push(p);
  });
}
const NEW_102 = seal(1, PREV[1], EDITED);
const fmt = (h: string) => `${h.slice(0, 6)} ${h.slice(6, 12)}…`;

export function S05() {
  const { step } = useDeck();
  const ph = useSequence("edit", step >= 3, [300, 750, 900, 1050, 1200, 1350, 1650]);
  const editing = step >= 3;
  const typed = editing && ph >= 2;
  const broken = editing && ph >= 7;
  const X = [96, 712, 1328];
  const BW = 496;
  const TOP = 440;
  const hash102 = !editing || ph < 3 ? ORIG[1] : ph < 6 ? sha256(`scramble${ph}`) : NEW_102;
  const status = [
    "Ingredient 01 — the data: one page of transactions",
    "Ingredient 02 — the block's own fingerprint: its wax seal",
    "Ingredient 03 — the previous block's fingerprint: the chain",
    "Now change 10 → 100 inside block #102",
    "Now change 10 → 100 inside block #102",
  ][step];

  return (
    <Slide theme="white" label="Inside a block">
      <Micro className="absolute left-[96px] top-[124px] text-cobalt">Inside a block</Micro>
      <div className="absolute left-[96px] top-[160px]">
        <Headline lines={["WHY A", "BLOCK-CHAIN?"]} />
      </div>
      <div className="absolute left-[1060px] top-[170px] w-[500px]">
        <p className="font-display text-[38px] font-semibold leading-[1.12] tracking-[-0.015em]">
          A hash is a <span className="text-cobalt">digital fingerprint</span> — a wax seal on every page.
        </p>
        <Micro className="mt-6 text-mute">{status}</Micro>
      </div>
      <Reveal show={step >= 1} from="right" className="absolute left-[1604px] top-[110px]">
        <img src={sealPhoto} alt="Black-and-white photograph of a wax seal on folded paper" className="photo h-[300px] w-[220px]" style={{ objectPosition: "50% 45%" }} />
      </Reveal>

      <svg className="absolute inset-0" width={1920} height={1080} aria-hidden>
        {[0, 1].map((i) => {
          const x1 = X[i] + BW;
          const y1 = TOP + 228;
          const x2 = X[i + 1];
          const y2 = TOP + 330;
          const isBroken = i === 1 && broken;
          if (isBroken)
            return (
              <g key={i} className="stroke-alert" strokeWidth={3} fill="none">
                <path d={`M${x1} ${y1} L${x1 + 42} ${y1 + 34}`} />
                <path d={`M${x2 - 42} ${y2 - 34 + 14} L${x2} ${y2}`} />
              </g>
            );
          return (
            <g key={i}>
              <DrawPath d={`M${x1} ${y1} L${x2 - 2} ${y2}`} show={step >= 2} delay={i * 160} className="stroke-ink" strokeWidth={2} />
            </g>
          );
        })}
      </svg>
      {broken && (
        <div className="absolute text-center text-[17px] font-bold uppercase leading-[1.25] tracking-[0.1em] text-alert" style={{ left: X[1] + BW + 6, top: TOP + 196, width: 108 }}>
          Link
          <br />
          broken
        </div>
      )}

      {DATA.map((d, i) => {
        const prevBad = i === 2 && broken;
        const is102 = i === 1;
        const h = is102 ? hash102 : ORIG[i];
        const changed = is102 && editing && ph >= 6;
        return (
          <div key={i} className={cn("absolute border-2 bg-paper px-7 py-6 t-base", prevBad ? "border-alert" : "border-ink")} style={{ left: X[i], top: TOP, width: BW, height: 410 }}>
            <div className="font-display text-[40px] font-extrabold leading-none tracking-[-0.02em]">BLOCK {NAMES[i]}</div>

            <div className="mt-6">
              <Micro className="text-mute">01 · Data</Micro>
              <div className="mt-1 font-display text-[30px] font-semibold">
                {is102 && editing ? (
                  <>
                    Alice pays Bob 10
                    {typed && <span className="text-alert">0</span>}
                    {ph >= 1 && ph < 6 && <span className="ml-[2px] inline-block h-[30px] w-[3px] translate-y-[4px] bg-cobalt" />} BTC
                  </>
                ) : (
                  d
                )}
              </div>
            </div>

            <Reveal show={step >= 1} className="mt-5">
              <Micro className="text-mute">02 · Fingerprint (hash)</Micro>
              <div className={cn("tabnum mt-1 inline-block text-[28px] font-semibold tracking-[0.02em]", changed ? "bg-cobalt px-2 text-paper" : "text-cobalt")}>{fmt(h)}</div>
            </Reveal>

            <Reveal show={step >= 2} className="mt-5">
              <div className="flex items-center justify-between">
                <Micro className="text-mute">03 · Previous fingerprint</Micro>
                {prevBad && <Micro className="text-alert">≠ #102</Micro>}
              </div>
              <div className={cn("tabnum mt-1 text-[24px] tracking-[0.02em]", prevBad ? "text-alert" : "text-mute")}>{i === 0 ? "000000 000000…" : fmt(PREV[i])}</div>
            </Reveal>
          </div>
        );
      })}

      <div className="absolute left-[96px] top-[885px] w-[1500px] font-display text-[36px] font-bold leading-[1.12] tracking-[-0.015em]">
        <Mask show={step >= 4}>To fake one old number, you must redo every block after it —</Mask>
        <Mask show={step >= 4} delay={80}>
          <span className="text-cobalt">on thousands of computers, all at once.</span>
        </Mask>
      </div>
      <Reveal show={step >= 1} className="absolute right-[96px] top-[910px] text-[20px] text-mute">
        Live SHA-256
      </Reveal>
    </Slide>
  );
}

/* =========================================================
   06 — WHO WRITES THE NEXT PAGE? (blue)
   ========================================================= */
function mine(seed: number) {
  const data = `page#${seed}|Alice→Bob:10`;
  let n = 0;
  while (!sha256(`${data}|${n}`).startsWith("000")) n++;
  return { data, nonce: n };
}
const VALIDATORS = [
  { n: "V1", s: 32 },
  { n: "V2", s: 8 },
  { n: "V3", s: 20 },
  { n: "V4", s: 14 },
  { n: "V5", s: 26 },
];
const CHOSEN = 4;
const SCAN_ORDER = [1, 3, 0, 2, 4, 1, 0, 3];
const TICKS = Array.from({ length: 12 }, (_, i) => 60 + i * 110);
const SCAN = Array.from({ length: SCAN_ORDER.length }, (_, i) => 60 + i * 150);

export function S06() {
  const { step } = useDeck();
  const m = useMemo(() => mine(3), []);
  const mp = useSequence("mine", step >= 1, TICKS);
  const sp = useSequence("stake", step >= 2, SCAN);
  const done = mp >= TICKS.length;
  const nonce = done ? m.nonce : Math.floor((m.nonce * mp) / TICKS.length);
  const h = sha256(`${m.data}|${nonce}`);
  const hi = sp >= SCAN.length ? CHOSEN : sp === 0 ? -1 : SCAN_ORDER[sp - 1];

  return (
    <Slide theme="blue" label="Consensus">
      <Micro className="absolute left-[96px] top-[124px] text-paper/80">No boss — so who decides?</Micro>
      <div className="absolute left-[96px] top-[160px]">
        <Headline lines={["WHO WRITES", "THE NEXT PAGE?"]} />
      </div>

      <div className="absolute left-[96px] top-[395px] grid w-[1728px] grid-cols-12 gap-x-6">
        <div className="col-span-6 border-t-2 border-paper pr-10 pt-5">
          <div className="flex items-baseline gap-5">
            <span className="font-display text-[30px] font-bold text-paper/80">01</span>
            <span className="font-display text-[40px] font-extrabold uppercase tracking-[-0.02em]">Proof of work</span>
          </div>
          <Micro className="mt-1 text-paper/80">The giant guessing game · Bitcoin</Micro>
          <Reveal show={step >= 1}>
            <p className="mt-4 text-[26px] text-paper/85">
              Computers race to guess a lucky number. <b className="text-paper">Winner seals the page.</b>
            </p>
            <div className="mt-5 flex items-end gap-10">
              <div>
                <Micro className="text-paper/80">Guesses</Micro>
                <div className="tabnum font-display text-[64px] font-bold leading-none">{nonce.toLocaleString("en-US")}</div>
              </div>
              <div className="pb-1">
                <Micro className="text-paper/80">{done ? "Found — starts with 000" : "Searching…"}</Micro>
                <div className="tabnum text-[26px] tracking-[0.03em]">
                  <span className={done ? "bg-paper px-1 font-bold text-cobalt" : ""}>{h.slice(0, 3)}</span>
                  {h.slice(3, 18)}…
                </div>
              </div>
            </div>
          </Reveal>
        </div>
        <div className="col-span-6 border-t-2 border-paper pl-4 pt-5">
          <div className="flex items-baseline gap-5">
            <span className="font-display text-[30px] font-bold text-paper/80">02</span>
            <span className="font-display text-[40px] font-extrabold uppercase tracking-[-0.02em]">Proof of stake</span>
          </div>
          <Micro className="mt-1 text-paper/80">The security deposit · Ethereum today</Micro>
          <Reveal show={step >= 2}>
            <p className="mt-4 text-[26px] text-paper/85">
              Lock up a deposit to take part. <b className="text-paper">Cheat, and lose it.</b>
            </p>
            <div className="mt-4 space-y-[7px]">
              {VALIDATORS.map((v, i) => (
                <div key={v.n} className="flex items-center gap-4">
                  <span className="w-10 text-[20px] font-semibold">{v.n}</span>
                  <div className={cn("h-[18px] border-2 border-paper t-base", hi === i ? "bg-paper" : "bg-transparent")} style={{ width: (v.s / 32) * 400, transitionDuration: "120ms" }} />
                  {sp >= SCAN.length && hi === i && <span className="text-[18px] font-bold uppercase tracking-[0.1em]">← seals the page</span>}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      <Reveal show={step >= 3} className="absolute left-[96px] top-[770px] grid w-[1728px] grid-cols-12 items-end gap-x-6 border-t border-paper/45 pt-6">
        <div className="col-span-7 space-y-4">
          <div className="flex items-center gap-5">
            <Micro className="w-[220px] text-paper/85">Proof of work</Micro>
            <div className="h-[20px] w-[720px] bg-paper" />
          </div>
          <div className="flex items-center gap-5">
            <Micro className="w-[220px] text-paper/85">Proof of stake</Micro>
            <div className="h-[20px] w-[3px] bg-paper" />
            <span className="text-[18px] text-paper/85">← barely visible</span>
          </div>
        </div>
        <div className="col-span-5 text-right">
          <div className="font-display text-[96px] font-extrabold leading-[0.85] tracking-[-0.045em]">−99.95%</div>
          <Micro className="mt-2 text-paper/80">Ethereum energy use, 2022 · ethereum.org</Micro>
        </div>
      </Reveal>
    </Slide>
  );
}
