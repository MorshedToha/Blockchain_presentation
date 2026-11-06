import { useDeck, useSequence } from "@/deck/DeckContext";
import { Arrow, DrawPath, GROUP, Headline, Mask, Micro, PRESENTERS, ACTS, Reveal, Slide, TOPIC } from "@/deck/ui";
import { cn } from "@/utils/cn";
import meme from "@/assets/meme.jpg";

/* =========================================================
   TITLE — bare black, one word, then builds
   ========================================================= */
export function STitle() {
  const { step } = useDeck();
  const lifted = step >= 1;
  return (
    <Slide theme="black" bare>
      <div className="t-base absolute inset-x-0 top-1/2 text-center" style={{ transform: `translateY(${lifted ? "-92%" : "-50%"})`, transitionDuration: "450ms" }}>
        <h1 className="font-display font-extrabold uppercase" style={{ fontSize: 250, lineHeight: 0.9, letterSpacing: "-0.04em" }}>
          <Mask show>BLOCKCHAIN</Mask>
        </h1>
      </div>

      <div className="absolute inset-x-0 top-[590px] text-center font-display text-[52px] font-semibold leading-[1.1] tracking-[-0.02em]">
        <Mask show={step >= 1} delay={150}>
          The machine that makes lying <span className="text-cobalt">almost impossible.</span>
        </Mask>
      </div>

      <div className="absolute bottom-[110px] left-[96px] right-[96px] grid grid-cols-4 gap-x-6">
        {PRESENTERS.map((p, i) => (
          <Reveal key={i} show={step >= 2} delay={i * 100} className="border-t border-paper/45 pt-4">
            <Micro className="text-paper/80">
              Act 0{i + 1} · {ACTS[i].title}
            </Micro>
            <div className="tabnum font-mono text-[22px] font-semibold tracking-[0.06em] text-brass mt-3">{p.id}</div>
            <div className="font-display text-[32px] font-bold leading-tight tracking-[-0.015em] text-paper mt-1">{p.name}</div>
          </Reveal>
        ))}
      </div>

      <Reveal show={step >= 3} className="absolute left-[96px] right-[96px] top-[52px] flex justify-between text-paper/80">
        <Micro>{TOPIC}</Micro>
        <Micro>{GROUP.date}</Micro>
      </Reveal>
    </Slide>
  );
}

/* =========================================================
   01 — THE COPY-PASTE HOOK (black)
   steps: 0 photo on your phone · 1 photo sent, still yours · 2 $100 + Ctrl+C/V
          3 thirty copies · 4 double spend
   ========================================================= */
function Keycap({ k, down }: { k: string; down: boolean }) {
  return (
    <span className={cn("inline-flex h-[64px] min-w-[64px] items-center justify-center border-2 px-4 font-display text-[24px] font-bold uppercase transition-colors duration-100", down ? "border-paper bg-paper text-ink" : "border-paper/70 text-paper")}>
      {k}
    </span>
  );
}

function Bill({ copy, small }: { copy?: number; small?: boolean }) {
  if (small)
    return (
      <div className="flex h-full w-full flex-col justify-between border-2 border-paper/75 bg-ink px-3 py-2">
        <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-paper/80">Copy</span>
        <span className="font-display text-[40px] font-extrabold leading-none tracking-[-0.04em]">$100</span>
      </div>
    );
  return (
    <div className="flex h-full w-full flex-col justify-between border-2 border-paper bg-ink p-7">
      <div className="flex justify-between">
        <Micro className="text-paper">{copy ? "Copy" : "Digital bill"}</Micro>
        <Micro className="text-paper/80">No. 0001</Micro>
      </div>
      <div className="font-display text-[150px] font-extrabold leading-[0.8] tracking-[-0.05em]">$100</div>
      <div className="h-[3px] w-full bg-cobalt" />
    </div>
  );
}

function Phone({ who, children, note }: { who: string; children?: React.ReactNode; note?: React.ReactNode }) {
  return (
    <div className="relative h-[560px] w-[300px] border-[3px] border-paper bg-ink">
      <div className="mx-auto mt-3 h-[6px] w-[70px] bg-paper/45" />
      <div className="flex items-center justify-between border-b border-paper/30 px-5 pb-3 pt-4">
        <Micro className="text-paper">{who}</Micro>
        <Micro className="text-paper/60">Chat</Micro>
      </div>
      <div className="relative h-[430px] px-5 pt-5">{children}</div>
      <div className="absolute bottom-4 left-5 right-5 text-[18px] font-semibold uppercase tracking-[0.1em]">{note}</div>
    </div>
  );
}

const GRID_COLS = 5;
const GRID_ROWS = 6;
const GRID_N = GRID_COLS * GRID_ROWS;

export function S01() {
  const { step } = useDeck();
  const keys = useSequence(`k${Math.min(step, 3)}`, step >= 2 && step <= 3, [0, 170, 340, 510]);
  const cDown = step >= 2 && step <= 3 && keys === 1;
  const vDown = step >= 2 && step <= 3 && keys === 3;
  const photos = step <= 1;
  const count = step === 0 ? 1 : step <= 2 ? 2 : GRID_N;
  const cellW = 150;
  const cellH = 96;
  const gap = 18;
  const layer = (v: boolean) => ({ opacity: v ? 1 : 0, visibility: v ? ("visible" as const) : ("hidden" as const), transitionProperty: "opacity, visibility, transform" });

  return (
    <Slide theme="black" label="The hook">
      <div className="absolute left-[96px] top-[130px]">
        <Headline lines={["COPY.", "PASTE.", "SPEND?"]} size={150} />
      </div>

      {/* Counter — photos, then bills */}
      <div className="absolute left-[96px] top-[600px]">
        <Micro className="text-paper/80">{photos ? "Copies of the photo" : "Bills on screen"}</Micro>
        <div className="tabnum mt-1 font-display text-[88px] font-extrabold leading-none tracking-[-0.03em]">
          {count}
          <span className="ml-5 text-[40px] font-semibold text-paper/80">{photos ? (step === 1 ? "— and that's fine." : "") : `= $${(count * 100).toLocaleString("en-US")}?`}</span>
        </div>
      </div>

      {/* Caption line: question → keys → problem */}
      <div className="absolute left-[96px] top-[780px] h-[140px] w-[880px]">
        <div className="t-base absolute inset-0" style={layer(photos)}>
          <div className="font-display text-[38px] font-semibold leading-[1.15] tracking-[-0.015em]">
            {step === 0 ? "Who has sent a photo to a friend today?" : (
              <>
                Did it disappear? <span className="underline decoration-[3px] underline-offset-[8px]">No — you made a copy.</span>
              </>
            )}
          </div>
        </div>
        <div className="t-base absolute inset-0 flex items-center gap-3" style={layer(step >= 2 && step <= 3)}>
          <Keycap k="Ctrl" down={cDown} />
          <span className="text-[28px] text-paper/80">+</span>
          <Keycap k="C" down={cDown} />
          <span className="mx-6 h-10 w-px bg-paper/45" />
          <Keycap k="Ctrl" down={vDown} />
          <span className="text-[28px] text-paper/80">+</span>
          <Keycap k="V" down={vDown} />
        </div>
        <Reveal show={step >= 4} className="absolute inset-0 flex items-start gap-6">
          <Arrow dir="se" size={44} className="mt-1 shrink-0" />
          <div>
            <div className="font-display text-[38px] font-bold uppercase leading-none tracking-[-0.01em]">The double-spend problem</div>
            <p className="mt-3 text-[28px] text-paper/85">Copying photos is great. Copying money breaks money.</p>
          </div>
        </Reveal>
      </div>

      {/* Phones */}
      <div className="t-base absolute left-[1100px] top-[200px] h-[560px] w-[700px]" style={layer(photos)}>
        <div className="absolute left-0 top-0">
          <Phone who="You" note={<span className={cn("t-base", step >= 1 ? "opacity-100" : "opacity-0")}>✓ Still yours</span>}>
            <img src={meme} alt="A photo of a dog — the picture being shared" className="photo h-[250px] w-[250px]" />
          </Phone>
        </div>
        <div className="absolute left-[400px] top-0">
          <Phone who="Friend" note={<span className={cn("t-base", step >= 1 ? "opacity-100" : "opacity-0")}>✓ Delivered</span>}>
            <div className="h-[250px] w-[250px] border border-dashed border-paper/30" />
          </Phone>
        </div>
        {/* the copy that travels */}
        <img
          src={meme}
          alt=""
          aria-hidden
          className="photo t-base absolute h-[250px] w-[250px]"
          style={{ left: 23, top: 95, transform: step >= 1 ? "translateX(400px)" : "none", opacity: step >= 1 ? 1 : 0, transitionDuration: "650ms" }}
        />
        <svg className="absolute left-[300px] top-[200px]" width={100} height={40} aria-hidden>
          <DrawPath d="M10 20 H86 M74 10 L88 20 L74 30" show={step >= 1} className="stroke-paper" strokeWidth={2.5} />
        </svg>
      </div>

      {/* One bill + one copy */}
      <div className="absolute left-[1120px] top-[210px] h-[320px] w-[560px]">
        <div className="t-base absolute inset-0" style={{ ...layer(step === 2), transform: step >= 2 ? "translate(48px, 48px)" : "none" }}>
          <Bill copy={1} />
        </div>
        <div className="t-base absolute inset-0" style={layer(step === 2)}>
          <Bill />
        </div>
      </div>

      {/* Copies everywhere */}
      <div className="absolute left-[1002px] top-[150px]" style={{ width: GRID_COLS * cellW + (GRID_COLS - 1) * gap, height: GRID_ROWS * cellH + (GRID_ROWS - 1) * gap }}>
        {Array.from({ length: GRID_N }).map((_, i) => {
          const r = Math.floor(i / GRID_COLS);
          const c = i % GRID_COLS;
          const on = step >= 3;
          return (
            <div
              key={i}
              className="t-base absolute"
              style={{ left: c * (cellW + gap), top: r * (cellH + gap), width: cellW, height: cellH, opacity: on ? (step >= 4 ? 0.45 : 1) : 0, transform: on ? "none" : "translateY(10px)", transitionDelay: on && step === 3 ? `${i * 28}ms` : "0ms" }}
              aria-hidden
            >
              <Bill small />
            </div>
          );
        })}
        <Reveal show={step >= 4} delay={100} className="absolute left-[-24px] right-[-24px] top-[290px] flex items-center gap-6 border-[3px] border-alert bg-ink px-8 py-7">
          <span className="h-6 w-6 shrink-0 bg-alert" aria-hidden />
          <div>
            <div className="font-display text-[44px] font-extrabold uppercase leading-none tracking-[-0.02em]">Error — double spend</div>
            <Micro className="mt-2 text-paper/80">The same $100 was sent to 30 people</Micro>
          </div>
        </Reveal>
      </div>
    </Slide>
  );
}

/* =========================================================
   02 — THE PREVIOUS VERSION: THE CENTRAL MIDDLEMAN (white)
   ========================================================= */
const C2 = { x: 1350, y: 575 };
const R2 = 290;
const PEOPLE = ["ANA", "BEN", "CARO", "DEV", "ELI", "FAY"];
const nodes2 = PEOPLE.map((n, i) => {
  const a = ((-90 + i * 60) * Math.PI) / 180;
  return { n, x: C2.x + R2 * Math.cos(a), y: C2.y + R2 * Math.sin(a) };
});
const FROM = 5;
const TO = 1;

export function S02() {
  const { step } = useDeck();
  const hacked = step >= 2;
  const pay = step === 1;
  const phase = useSequence("pay", step >= 1 && !hacked, [40, 520, 900, 1400]);
  const from = nodes2[FROM];
  const to = nodes2[TO];
  const dot = phase >= 3 ? to : phase >= 1 ? C2 : from;

  return (
    <Slide theme="white" label="The previous version">
      <Micro className="absolute left-[96px] top-[124px] text-cobalt">The previous version</Micro>
      <div className="absolute left-[96px] top-[160px]">
        <Headline lines={["THE CENTRAL", "MIDDLEMAN"]} />
      </div>

      <div className="absolute left-[96px] top-[420px] h-[40px] w-[880px] text-[26px]">
        {hacked ? (
          <span>
            <span className="font-semibold text-alert">Server hacked —</span> nobody can pay anybody.
          </span>
        ) : step >= 1 ? (
          <span className="t-base" style={{ opacity: phase >= 4 ? 1 : 0.4 }}>
            {phase >= 4 ? (
              <>
                Bank: <span className="tabnum">−$20 Fay, +$20 Ben.</span> <span className="text-cobalt">Only the bank's notebook changes.</span>
              </>
            ) : (
              "The bank checks Fay's balance…"
            )}
          </span>
        ) : (
          <span className="text-mute">Every payment goes through one private notebook.</span>
        )}
      </div>

      <div className="absolute left-[96px] top-[500px] w-[880px] font-display text-[44px] font-semibold leading-[1.1] tracking-[-0.02em]">
        <Mask show={step >= 4}>Can two strangers send value</Mask>
        <Mask show={step >= 4} delay={80}>
          with <span className="text-cobalt">zero middleman?</span>
        </Mask>
      </div>

      <svg className="absolute inset-0" width={1920} height={1080} viewBox="0 0 1920 1080" aria-label="Six people connected only through one bank">
        {nodes2.map((p, i) => {
          const active = pay && ((i === FROM && phase >= 1) || (i === TO && phase >= 3));
          const mx = p.x + (C2.x - p.x) * 0.5;
          const my = p.y + (C2.y - p.y) * 0.5;
          return hacked ? (
            <line key={p.n} x1={p.x} y1={p.y} x2={mx} y2={my} stroke="#B9B9B4" strokeWidth={2} strokeDasharray="6 9" />
          ) : (
            <line key={p.n} x1={p.x} y1={p.y} x2={C2.x} y2={C2.y} strokeWidth={active ? 4 : 2} className="t-base" stroke={active ? "#084BC5" : "#080808"} />
          );
        })}
        <rect x={C2.x - 160} y={C2.y - 66} width={320} height={132} fill={hacked ? "#080808" : "#FAFAF7"} strokeWidth={hacked ? 4 : 2} stroke={hacked ? "#B0392C" : pay && phase >= 2 ? "#084BC5" : "#080808"} className="t-base" />
        <text x={C2.x} y={C2.y - 4} textAnchor="middle" className="font-display" fontSize={40} fontWeight={800} fill={hacked ? "#FAFAF7" : "#080808"} letterSpacing="-0.5">
          BANK
        </text>
        <text x={C2.x} y={C2.y + 34} textAnchor="middle" fontSize={17} fontWeight={700} letterSpacing="2" fill={hacked ? "#FF8F80" : pay && phase >= 2 ? "#084BC5" : "#595955"}>
          {hacked ? "HACKED · OFFLINE" : "ONE PRIVATE NOTEBOOK"}
        </text>
        {nodes2.map((p) => {
          const lx = p.x + (p.x > C2.x + 5 ? 26 : p.x < C2.x - 5 ? -26 : 0);
          const ly = p.y + (Math.abs(p.x - C2.x) < 5 ? (p.y < C2.y ? -26 : 44) : 10);
          const anchor = p.x > C2.x + 5 ? "start" : p.x < C2.x - 5 ? "end" : "middle";
          return (
            <g key={p.n}>
              <rect x={p.x - 11} y={p.y - 11} width={22} height={22} fill={hacked ? "#B9B9B4" : "#080808"} className="t-base" />
              <text x={lx} y={ly} textAnchor={anchor} fontSize={26} fontWeight={600} letterSpacing="1.5" fill={hacked ? "#595955" : "#080808"}>
                {p.n}
              </text>
            </g>
          );
        })}
        {pay && <rect x={-12} y={-12} width={24} height={24} fill="#084BC5" className="t-base" style={{ transform: `translate(${dot.x}px, ${dot.y}px)`, transitionDuration: "460ms" }} />}
      </svg>

      <div className="absolute left-[96px] top-[740px] grid w-[880px] grid-cols-3 gap-x-8">
        {["Single point of failure", "Hidden fees & delays", "“Trust us, we promise”"].map((t, i) => (
          <Reveal key={t} show={step >= 3} delay={i * 110} className="border-t-2 border-ink pt-4">
            <div className="font-display text-[22px] font-bold text-cobalt">0{i + 1}</div>
            <div className="mt-1 font-display text-[28px] font-bold uppercase leading-[1.05] tracking-[-0.01em]">{t}</div>
          </Reveal>
        ))}
      </div>
    </Slide>
  );
}

/* =========================================================
   03 — WHAT IS BLOCKCHAIN? A CLASSROOM OF 40 NOTEBOOKS (blue)
   steps: 0 blank notebooks · 1 broadcast $50 · 2 your notebook edited
          3 compare: 39 vs 1 · 4 "no Backspace key"
   ========================================================= */
const COLS = 10;
const ROWS = 4;
const SEATS = COLS * ROWS;
const YOU = 0;

export function S03() {
  const { step } = useDeck();
  const written = step >= 1;
  const hacked = step >= 2;
  const compared = step >= 3;
  const cellW = 150;
  const cellH = 70;
  const gx = (1728 - COLS * cellW) / (COLS - 1);
  const gy = 20;
  const status = ["40 students. 40 blank notebooks. No bank.", "“I'm paying the Professor $50!” — everyone writes line 1.", "Tonight I secretly change my notebook to $5,000.", "Tomorrow morning we compare notebooks.", "Tomorrow morning we compare notebooks."][step];

  return (
    <Slide theme="blue" label="What is blockchain?">
      <Micro className="absolute left-[96px] top-[124px] text-paper/80">Explain like I'm 15</Micro>
      <div className="absolute left-[96px] top-[160px]">
        <Headline lines={["WHAT IS", "BLOCKCHAIN?"]} />
      </div>
      <div className="absolute left-[1060px] top-[170px] w-[764px]">
        <p className="font-display text-[40px] font-semibold leading-[1.12] tracking-[-0.015em]">We fire the bank. Every student gets a notebook.</p>
        <Micro className="mt-6 text-paper/85">{status}</Micro>
      </div>

      <Micro className="absolute left-[96px] top-[384px] text-paper/70">Front of the room · Professor</Micro>
      <div className="absolute left-[96px] top-[420px] h-[340px] w-[1728px]">
        {Array.from({ length: SEATS }).map((_, i) => {
          const r = Math.floor(i / COLS);
          const c = i % COLS;
          const you = i === YOU;
          const bad = you && hacked && !compared;
          const wave = (r * 2 + Math.abs(c - 0)) * 38;
          return (
            <div
              key={i}
              className={cn("t-base absolute flex flex-col justify-between border-2 px-3 py-2", bad ? "border-alert bg-alert" : you ? "border-paper" : "border-paper/55")}
              style={{ left: c * (cellW + gx), top: r * (cellH + gy), width: cellW, height: cellH }}
            >
              <div className="flex items-center justify-between text-[13px] font-semibold uppercase tracking-[0.1em] text-paper/80">
                <span>{you ? "You" : `Desk ${i + 1}`}</span>
                {compared && <span className="t-base">{you ? "✗" : "✓"}</span>}
              </div>
              <div className="flex items-baseline justify-between">
                <span className="t-base text-[15px] text-paper/80" style={{ opacity: written && !bad ? 1 : 0, transitionDelay: step === 1 ? `${wave}ms` : "0ms" }}>
                  → Prof
                </span>
                <span className="t-base tabnum font-display text-[24px] font-bold leading-none" style={{ opacity: written ? 1 : 0, transitionDelay: step === 1 ? `${wave}ms` : "0ms" }}>
                  {bad ? "$5,000" : "$50"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <Reveal show={compared} className="absolute left-[96px] top-[782px] flex items-baseline gap-8">
        <span className="tabnum font-display text-[44px] font-extrabold leading-none">39 ✓</span>
        <span className="tabnum font-display text-[44px] font-extrabold leading-none text-paper/70">1 ✗</span>
        <span className="text-[24px]">39 notebooks agree. The one lie is simply ignored.</span>
      </Reveal>

      <svg className="pointer-events-none absolute inset-0" width={1920} height={1080} aria-hidden>
        <DrawPath d="M96 855 H1824" show={step >= 4} className="stroke-paper" strokeWidth={1} />
      </svg>
      <div className="absolute left-[96px] top-[875px] grid w-[1728px] grid-cols-12 items-end gap-x-6">
        <Reveal show={step >= 4} className="col-span-4">
          <Micro className="text-paper/80">Old way</Micro>
          <div className="mt-2 font-display text-[34px] font-semibold leading-[1.1] text-paper/75">A private Word file.</div>
        </Reveal>
        <Reveal show={step >= 4} delay={150} className="col-span-5">
          <Micro className="text-paper/80">Blockchain</Micro>
          <div className="mt-2 font-display text-[34px] font-semibold leading-[1.1]">A shared Google Doc — with no Backspace key.</div>
        </Reveal>
        <Reveal show={step >= 4} delay={300} className="col-span-3 flex items-end justify-end gap-2" style={{ paddingBottom: 4 }}>
          {["O", "P", "["].map((k) => (
            <span key={k} className="flex h-[58px] w-[58px] items-center justify-center border-2 border-paper/70 font-display text-[22px] font-bold">
              {k}
            </span>
          ))}
          <span className="relative flex h-[58px] w-[130px] items-center justify-center border-2 border-dashed border-paper text-[15px] font-semibold uppercase tracking-[0.1em]">
            Backspace
            <svg className="absolute inset-0" width={130} height={58} aria-hidden>
              <path d="M4 54 L126 4" stroke="#FAFAF7" strokeWidth={2} />
            </svg>
          </span>
        </Reveal>
      </div>
    </Slide>
  );
}
