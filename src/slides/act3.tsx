import { useDeck, useSequence } from "@/deck/DeckContext";
import { DrawPath, Headline, Micro, Reveal, Slide } from "@/deck/ui";
import { sha256 } from "@/lib/sha256";
import { cn } from "@/utils/cn";
import logistics from "@/assets/logistics.jpg";
import university from "@/assets/university.jpg";

/* =========================================================
   07 — SMART CONTRACTS: THE VENDING MACHINE (white)
   steps: 0 IF/THEN · 1 vending machine runs · 2 flight on time · 3 delayed 3 h
   ========================================================= */
const SCEN = [
  { k: "Vending machine" },
  { k: "Flight on time", delay: 0, show: "0 min" },
  { k: "Delayed 3 hours", delay: 180, show: "180 min" },
];

function Coin() {
  return (
    <svg width={64} height={64} aria-hidden>
      <circle cx={32} cy={32} r={28} fill="none" stroke="#084BC5" strokeWidth={3} />
      <circle cx={32} cy={32} r={21} fill="none" stroke="#084BC5" strokeWidth={1} />
      <text x={32} y={40} textAnchor="middle" fontSize={22} fontWeight={800} fill="#084BC5">¥5</text>
    </svg>
  );
}
function Keypad({ lit }: { lit: boolean }) {
  return (
    <svg width={88} height={64} aria-hidden>
      {Array.from({ length: 6 }).map((_, i) => {
        const x = (i % 3) * 30;
        const y = Math.floor(i / 3) * 33;
        const on = lit && i === 4;
        return (
          <g key={i}>
            <rect x={x + 1} y={y + 1} width={26} height={29} fill={on ? "#084BC5" : "none"} stroke={on ? "#084BC5" : "#080808"} strokeWidth={2} className="t-base" />
            {on && <text x={x + 14} y={y + 21} textAnchor="middle" fontSize={12} fontWeight={800} fill="#FAFAF7">B4</text>}
          </g>
        );
      })}
    </svg>
  );
}
function Can({ dropped }: { dropped: boolean }) {
  return (
    <div className="relative h-[64px] w-[70px] overflow-hidden" aria-hidden>
      <div className="t-base absolute left-[18px] h-[48px] w-[32px] border-2 border-paper" style={{ top: dropped ? 8 : -60, transitionDuration: "420ms" }}>
        <div className="mt-[14px] h-[4px] w-full bg-paper" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-paper" />
    </div>
  );
}

export function S07() {
  const { step } = useDeck();
  const vend = step === 1;
  const sc = step >= 2 ? (SCEN[step - 1] as { k: string; delay: number; show: string }) : null;
  const ph = useSequence(`${step}`, step >= 1, [60, 620, 1180]);
  const pays = sc ? sc.delay >= 120 : vend;
  const Y = 490;
  const NX = [96, 726, 1356];
  const NW = 468;
  const on = (n: number) => (vend || !!sc) && ph >= n;
  const node = (lit: boolean) => cn("absolute border-2 p-7 t-base", lit ? "border-cobalt" : "border-ink");
  const fill3 = on(3) && pays;

  return (
    <Slide theme="white" label="Smart contracts">
      <Micro className="absolute left-[96px] top-[124px] text-cobalt">How it is used #1</Micro>
      <div className="absolute left-[96px] top-[160px]">
        <Headline lines={["SMART", "CONTRACTS"]} />
      </div>
      <div className="absolute left-[1060px] top-[170px] w-[764px] font-display text-[46px] font-semibold leading-[1.18] tracking-[-0.02em]">
        <div>
          <span className="font-extrabold text-cobalt">IF</span> something happens,
        </div>
        <div>
          <span className="font-extrabold text-cobalt">THEN</span> it runs — automatically.
        </div>
      </div>

      <div className="absolute left-[96px] top-[410px] h-[40px] text-[28px]">
        <span className="t-base" style={{ opacity: step >= 1 ? 1 : 0 }}>
          {vend ? (
            <>
              <span className="font-semibold">A digital vending machine.</span> <span className="text-mute">No cashier. No lawyer.</span>
            </>
          ) : sc ? (
            <>
              <span className="font-semibold">Same machine — new input:</span> <span className="text-mute">flight insurance.</span>
            </>
          ) : null}
        </span>
      </div>

      <svg className="absolute inset-0" width={1920} height={1080} aria-hidden>
        {[0, 1].map((i) => {
          const lit = on(i + 2);
          const x1 = NX[i] + NW;
          const x2 = NX[i + 1];
          const y = Y + 115;
          return (
            <g key={i} className="t-base" stroke={lit ? "#084BC5" : "#D8D8D3"} strokeWidth={lit ? 4 : 2}>
              <path d={`M${x1 + 10} ${y} H${x2 - 14}`} />
              <path d={`M${x2 - 26} ${y - 11} L${x2 - 13} ${y} L${x2 - 26} ${y + 11}`} fill="none" />
            </g>
          );
        })}
      </svg>

      {/* 01 */}
      <div className={node(on(1))} style={{ left: NX[0], top: Y, width: NW, height: 230 }}>
        <Micro className="text-mute">01 — {vend ? "Input" : "Data"}</Micro>
        <div className="mt-1 font-display text-[36px] font-extrabold uppercase tracking-[-0.02em]">{vend ? "Coin in" : sc ? "Flight-data feed" : "Input"}</div>
        <div className="mt-4 flex h-[70px] items-center justify-between border-t border-rule pt-3">
          <span className="text-[22px] text-mute">{vend ? "You pay" : "Delay"}</span>
          {vend ? (
            <span className="t-base" style={{ opacity: on(1) ? 1 : 0.2 }}>
              <Coin />
            </span>
          ) : (
            <span className={cn("tabnum whitespace-nowrap font-display text-[34px] font-bold t-base", on(1) ? "text-cobalt" : "text-rule")}>{on(1) && sc ? sc.show : "—"}</span>
          )}
        </div>
      </div>
      {/* 02 */}
      <div className={node(on(2))} style={{ left: NX[1], top: Y, width: NW, height: 230 }}>
        <Micro className="text-mute">02 — Rule</Micro>
        <div className="mt-1 font-display text-[36px] font-extrabold uppercase tracking-[-0.02em]">{vend ? "Press B4" : sc ? "Delay ≥ 2 hours?" : "Rule"}</div>
        <div className="mt-4 flex h-[70px] items-center justify-between border-t border-rule pt-3">
          <span className="text-[22px] text-mute">{vend ? "Button" : "Condition"}</span>
          {vend ? (
            <Keypad lit={on(2)} />
          ) : (
            <span className={cn("font-display text-[34px] font-bold t-base", on(2) ? (pays ? "text-cobalt" : "text-ink") : "text-rule")}>{on(2) && sc ? (pays ? "MET" : "NOT MET") : "—"}</span>
          )}
        </div>
      </div>
      {/* 03 */}
      <div className={cn(node(fill3), fill3 && "bg-cobalt text-paper")} style={{ left: NX[2], top: Y, width: NW, height: 230 }}>
        <Micro className={fill3 ? "text-paper/80" : "text-mute"}>03 — Action</Micro>
        <div className="mt-1 font-display text-[36px] font-extrabold uppercase tracking-[-0.02em]">
          {vend ? (on(3) ? "Soda drops" : "Waiting") : sc ? (on(3) ? (pays ? "$200 refund sent" : "Airline keeps fare") : "Waiting") : "Action"}
        </div>
        <div className={cn("mt-4 flex h-[70px] items-center justify-between border-t pt-3 text-[22px]", fill3 ? "border-paper/45" : "border-rule text-mute")}>
          {vend ? (
            <>
              <span>{on(3) ? "Automatically." : "—"}</span>
              <Can dropped={on(3)} />
            </>
          ) : (
            <span>{on(3) && sc ? (pays ? "Zero paperwork. Zero lawyers." : "Rule not met — nothing happens.") : "—"}</span>
          )}
        </div>
      </div>

      <div className="absolute left-[96px] top-[770px] flex items-center gap-10">
        <Micro className="text-mute">Scenario</Micro>
        {SCEN.map((s, i) => (
          <span key={s.k} className={cn("t-base border-b-[3px] pb-1 font-display text-[28px] font-bold uppercase tracking-[-0.01em]", step === i + 1 ? "border-cobalt text-cobalt" : step > i + 1 ? "border-transparent text-ink" : "border-transparent text-rule")}>
            0{i + 1} {s.k}
          </span>
        ))}
      </div>
      <Reveal show={step >= 3} delay={1200} className="absolute left-[96px] top-[880px] text-[22px] text-mute">
        <span className="font-semibold text-ink">Real example —</span> AXA's <i>fizzy</i> flight insurance ran this way on Ethereum, 2017–2019. The code only knows what its data feed tells it.
      </Reveal>
    </Slide>
  );
}

/* =========================================================
   08 — FARM TO SHELF IN 2.2 SECONDS (blue)
   ========================================================= */
const STAGES = [
  { t: "Orchard", d: "Harvest scanned" },
  { t: "Container", d: "Temperature sensor" },
  { t: "Customs", d: "Checks recorded" },
  { t: "Shelf", d: "Ready to scan" },
];
const TEMPS = [4.6, 4.8, 4.5, 4.4, 4.9, 5.2, 6.4, 8.6, 8.4, 6.1, 5.0, 4.7, 4.6, 4.9, 5.1, 4.8, 4.6, 4.5];

function QR() {
  const N = 25;
  const bits = sha256("mango-lot-17").repeat(4);
  const finder = (r: number, c: number) => {
    const inF = (r0: number, c0: number) => r >= r0 && r < r0 + 7 && c >= c0 && c < c0 + 7;
    for (const [r0, c0] of [[0, 0], [0, N - 7], [N - 7, 0]]) {
      if (inF(r0, c0)) {
        const rr = r - r0;
        const cc = c - c0;
        return rr === 0 || rr === 6 || cc === 0 || cc === 6 || (rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4) ? 1 : 0;
      }
    }
    return -1;
  };
  const cells: [number, number][] = [];
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++) {
      const f = finder(r, c);
      const on = f === -1 ? parseInt(bits[(r * N + c) % bits.length], 16) % 2 === 0 : f === 1;
      if (on) cells.push([r, c]);
    }
  return (
    <svg width={150} height={150} viewBox={`0 0 ${N} ${N}`} shapeRendering="crispEdges" aria-label="Illustrative QR code">
      {cells.map(([r, c]) => (
        <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="#080808" />
      ))}
    </svg>
  );
}

export function S08() {
  const { step } = useDeck();
  const ph = useSequence("trace", step >= 2, [60, 420, 780, 1140, 1400]);
  const A = step === 0;
  const B = step === 1 || step === 2;
  const C = step >= 3;
  const SX = 96;
  const SW = 432;
  const SY = 520;
  const traced = (i: number) => step >= 2 && ph >= 4 - i;
  const sx = (i: number) => SX + (i * 1240) / (TEMPS.length - 1);
  const sy = (t: number) => 880 - (t - 4) * 22;
  const spark = TEMPS.map((t, i) => `${i ? "L" : "M"}${sx(i)} ${sy(t)}`).join(" ");
  const layer = (v: boolean) => ({ opacity: v ? 1 : 0, visibility: v ? ("visible" as const) : ("hidden" as const), transitionProperty: "opacity, visibility" });

  return (
    <Slide theme="blue" label="Supply chain">
      <Micro className="absolute left-[96px] top-[124px] text-paper/80">How it is used #2</Micro>
      <div className="absolute left-[96px] top-[160px]">
        <Headline lines={["FARM TO SHELF", "IN 2.2 SECONDS"]} />
      </div>
      <img src={logistics} alt="Black-and-white photograph of stacked shipping containers beside a port crane" className="photo absolute right-[96px] top-[110px] h-[300px] w-[400px]" style={{ objectPosition: "50% 40%" }} />

      {/* A — the old way */}
      <div className="t-base absolute left-[96px] top-[480px] w-[1728px]" style={layer(A)}>
        <Micro className="text-paper/85">Walmart's test — trace one pack of sliced mangoes to its farm, the old way</Micro>
        <div className="tabnum mt-4 font-display text-[150px] font-extrabold uppercase leading-[0.9] tracking-[-0.045em]">6 d 18 h 26 min</div>
        <p className="mt-6 text-[28px] text-paper/85">Paper receipts, phone calls, emails.</p>
      </div>

      {/* B — the journey */}
      <div className="t-base absolute inset-0" style={layer(B)}>
        <div className="t-base absolute right-[96px] top-[110px] flex h-[300px] w-[400px] gap-5 bg-paper p-5 text-ink" style={{ opacity: step >= 2 ? 1 : 0, transform: step >= 2 ? "none" : "translateY(12px)", transitionDelay: step >= 2 ? "200ms" : "0ms" }}>
          <div>
            <QR />
            <Micro className="mt-3 text-mute">Scanned</Micro>
          </div>
          <div className="min-w-0 flex-1">
            <Micro className="text-cobalt">Blockchain passport</Micro>
            <div className="mt-1 font-display text-[24px] font-extrabold uppercase leading-none">Mango · Lot 17</div>
            <ul className="mt-3 text-[17px]">
              {[["Orchard", "✓"], ["Container", "8.6 °C"], ["Customs", "✓"], ["Shelf", "✓"]].map(([k, v]) => (
                <li key={k} className="flex justify-between border-t border-rule py-[6px]">
                  <span>{k}</span>
                  <span className={cn("font-semibold", v.includes("°") ? "text-alert" : "text-cobalt")}>{v}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <Micro className="absolute left-[96px] top-[440px] text-paper/85">
          {step >= 2 ? (ph >= 5 ? "Scanned — origin found in one step" : "Scanning the QR code on the shelf…") : "Every hand-off is written onto the chain"}
        </Micro>
        <svg className="absolute inset-0" width={1920} height={1080} aria-hidden>
          <DrawPath d={`M${SX} ${SY} H${SX + 1688}`} show={step >= 1} className="stroke-paper" strokeWidth={2} />
          {STAGES.map((_, i) => (
            <rect key={i} x={SX + i * SW - 1} y={SY - 9} width={18} height={18} className="t-base" fill={traced(i) ? "#FAFAF7" : "#084BC5"} stroke="#FAFAF7" strokeWidth={2} />
          ))}
          <g className="t-base" style={{ opacity: step >= 2 ? 1 : 0 }}>
            <line x1={SX} x2={SX + 1240} y1={sy(8)} y2={sy(8)} stroke="#FAFAF7" strokeOpacity={0.5} strokeDasharray="4 6" />
            <DrawPath d={spark} show={step >= 2} className="stroke-paper" strokeWidth={2} />
            <rect x={sx(7) - 7} y={sy(8.6) - 7} width={14} height={14} fill="#FAFAF7" />
          </g>
        </svg>
        {STAGES.map((s, i) => (
          <Reveal key={s.t} show={step >= 1} delay={i * 110} className="absolute" style={{ left: SX + i * SW, top: SY + 24, width: SW - 40 }}>
            <Micro className="text-paper/80">Block {i + 1}</Micro>
            <div className="font-display text-[34px] font-extrabold uppercase leading-none tracking-[-0.02em]">{s.t}</div>
            <div className="mt-2 text-[21px] text-paper/85">{s.d}</div>
            <div className={cn("mt-1 text-[19px] font-semibold uppercase tracking-[0.08em] t-base", traced(i) ? "opacity-100" : "opacity-0")}>✓ Verified</div>
          </Reveal>
        ))}
        <Reveal show={step >= 2} delay={900} className="absolute left-[1380px] top-[748px] w-[444px]">
          <div className="text-[22px] font-semibold">8.6 °C on the truck — too warm.</div>
          <div className="text-[20px] text-paper/85">Recorded automatically. Can't be erased.</div>
          <Micro className="mt-3 text-paper/80">Illustrative data · limit 8 °C</Micro>
        </Reveal>
      </div>

      {/* C — the result */}
      <div className="t-base absolute left-[96px] top-[440px] w-[1728px]" style={layer(C)}>
        <div className="tabnum font-display text-[60px] font-bold uppercase leading-none tracking-[-0.03em] text-paper/70 line-through decoration-[4px]">6 d 18 h 26 min</div>
        <div className="mt-4 font-display text-[230px] font-extrabold uppercase leading-[0.82] tracking-[-0.055em]">2.2 seconds</div>
        <Micro className="mt-6 text-paper/85">Walmart & IBM pilot · reported by Quartz, 2018</Micro>
      </div>
      <div className="absolute left-[96px] top-[880px] grid w-[1728px] grid-cols-2 gap-x-6 border-t border-paper/45 pt-5" style={layer(step >= 4)}>
        <div className="text-[24px]">
          <span className="font-semibold">Medicines —</span> MediLedger: Pfizer, McKesson and others fight fake drugs.
        </div>
        <div className="text-[24px]">
          <span className="font-semibold">Luxury —</span> Aura: LVMH, Prada and Cartier prove a bag is real.
        </div>
      </div>
    </Slide>
  );
}

/* =========================================================
   09 — UN-FAKEABLE DIPLOMAS (white)
   ========================================================= */
const DIPLOMA = {
  uni: "University of Northfield",
  degree: "Bachelor of Science in Information Systems",
  name: "Maya L. Ortega",
  grade: "2.4",
  altered: "3.9",
  id: "NF-2025-004817",
  issued: "30 June 2025",
};
const canonical = (g: string) => `${DIPLOMA.uni}|${DIPLOMA.degree}|${DIPLOMA.name}|GPA ${g}|${DIPLOMA.id}|${DIPLOMA.issued}`;
const RECORDED = sha256(canonical(DIPLOMA.grade));

export function S09() {
  const { step } = useDeck();
  const altered = step === 2;
  const grade = altered ? DIPLOMA.altered : DIPLOMA.grade;
  const docHash = sha256(canonical(grade));
  const ph = useSequence(`${Math.min(step, 2)}`, step >= 1 && step <= 2, [60, 450, 850, 1250]);
  const match = docHash === RECORDED;
  const h = (x: string) => `${x.slice(0, 8)} ${x.slice(8, 16)}…`;
  const rows = [
    { k: "Fingerprint of this file", v: h(docHash), bad: altered },
    { k: "University's record on the chain", v: h(RECORDED) },
    { k: "Compare", v: match ? "Identical" : "Different", bad: !match },
  ];
  const showV = step <= 2;

  return (
    <Slide theme="white" label="Digital identity">
      <Micro className="absolute left-[96px] top-[124px] text-cobalt">How it is used #3</Micro>
      <div className="absolute left-[96px] top-[160px]">
        <Headline lines={["UN-FAKEABLE", "DIPLOMAS"]} />
      </div>
      <img src={university} alt="Black-and-white photograph of a modernist university facade" className="photo absolute right-[96px] top-[110px] h-[250px] w-[520px]" style={{ objectPosition: "50% 45%" }} />

      <div className="absolute left-[96px] top-[410px] h-[540px] w-[900px] border-2 border-ink bg-paper p-[10px]">
        <div className="relative h-full w-full border border-rule px-12 py-9">
          <div className="flex items-start justify-between">
            <div className="font-display text-[30px] font-extrabold uppercase tracking-[-0.01em]">{DIPLOMA.uni}</div>
            <div className="border border-ink px-2 py-1 text-[17px] font-bold tracking-[0.14em]">SAMPLE</div>
          </div>
          <div className="mt-8 text-[22px] text-mute">This certifies that</div>
          <div className="font-display text-[60px] font-bold leading-[1.05] tracking-[-0.025em]">{DIPLOMA.name}</div>
          <div className="mt-3 text-[22px] text-mute">has been awarded the degree of</div>
          <div className="font-display text-[30px] font-semibold leading-[1.15]">{DIPLOMA.degree}</div>
          <div className="absolute bottom-9 left-12 right-12 grid grid-cols-4 gap-6 border-t border-ink pt-4">
            <div>
              <Micro className="text-mute">Final GPA</Micro>
              <div className={cn("tabnum mt-1 inline-block font-display text-[28px] font-bold t-base", altered && "bg-alert px-2 text-paper")}>{grade}</div>
              {altered && <div className="mt-1 text-[17px] font-bold uppercase tracking-[0.1em] text-alert">Photoshopped</div>}
            </div>
            <div className="col-span-2">
              <Micro className="text-mute">Issued</Micro>
              <div className="mt-1 text-[22px] font-semibold">{DIPLOMA.issued}</div>
            </div>
            <div>
              <Micro className="text-mute">Fingerprint</Micro>
              <div className="tabnum mt-1 text-[22px] font-semibold text-cobalt">{docHash.slice(0, 8)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Verification panel */}
      <div className="t-base absolute left-[1080px] top-[410px] w-[744px]" style={{ opacity: showV ? 1 : 0, visibility: showV ? "visible" : "hidden" }}>
        <Micro className={cn("t-base", altered ? "text-alert" : "text-mute")}>
          {altered ? "Someone edits the GPA: 2.4 → 3.9" : step >= 1 ? "An employer checks — no email to the registrar" : "How does an employer know it's real?"}
        </Micro>
        <ol className="mt-10">
          {rows.map((r, i) => {
            const lit = step >= 1 && ph >= i + 1;
            return (
              <li key={r.k} className="grid grid-cols-[56px_1fr_auto] items-baseline border-t border-rule py-[16px]">
                <span className={cn("font-display text-[22px] font-bold t-base", lit ? "text-cobalt" : "text-rule")}>0{i + 1}</span>
                <div className={cn("text-[24px] t-base", lit ? "text-ink" : "text-mute")}>{r.k}</div>
                <div className={cn("tabnum text-[24px] font-semibold t-base", !lit && "opacity-0", r.bad ? "text-alert" : "text-cobalt")}>{r.v}</div>
              </li>
            );
          })}
        </ol>
        <div className="border-t-2 border-ink pt-6">
          <Reveal show={step >= 1 && ph >= 4} className="flex items-start gap-4">
            {match ? (
              <>
                <svg width="40" height="40" viewBox="0 0 40 40" className="mt-1 shrink-0" aria-hidden>
                  <path d="M6 21 L16 31 L34 9" fill="none" stroke="#084BC5" strokeWidth="4" />
                </svg>
                <div>
                  <div className="font-display text-[34px] font-extrabold uppercase leading-none text-cobalt">Verified</div>
                  <div className="mt-1 text-[22px] text-mute">Signed by the university. Checked in one second.</div>
                </div>
              </>
            ) : (
              <>
                <div className="mt-2 h-[26px] w-[26px] shrink-0 bg-alert" aria-hidden />
                <div>
                  <div className="font-display text-[34px] font-extrabold uppercase leading-none text-alert">Not valid</div>
                  <div className="mt-1 text-[22px] text-mute">The file no longer matches the record.</div>
                </div>
              </>
            )}
          </Reveal>
        </div>
      </div>

      {/* Already real */}
      <div className="t-base absolute left-[1080px] top-[410px] w-[744px]" style={{ opacity: step >= 3 ? 1 : 0, visibility: step >= 3 ? "visible" : "hidden" }}>
        <Micro className="text-mute">Already real</Micro>
        <div className="mt-2 font-display text-[80px] font-extrabold leading-none tracking-[-0.04em] text-cobalt">MIT, 2017</div>
        <p className="mt-3 text-[24px] leading-[1.35]">111 graduates received blockchain-verifiable diplomas.</p>
        <Micro className="mt-2 text-mute">Blockcerts pilot · CoinDesk, Oct 2017</Micro>
        <ul className="mt-8">
          {["Medical records", "University diplomas", "Cross-border aid"].map((t, i) => (
            <Reveal as="li" key={t} show={step >= 3} delay={200 + i * 100} className="flex items-baseline gap-5 border-t border-rule py-[12px]">
              <span className="font-display text-[22px] font-bold text-cobalt">0{i + 1}</span>
              <span className="font-display text-[30px] font-bold uppercase tracking-[-0.01em]">{t}</span>
            </Reveal>
          ))}
        </ul>
      </div>
    </Slide>
  );
}
