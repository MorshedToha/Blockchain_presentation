import { useDeck } from "@/deck/DeckContext";
import { DrawPath, Headline, Mask, Micro, Reveal, Slide } from "@/deck/ui";
import { cn } from "@/utils/cn";
import { sha256 } from "@/lib/sha256";
import pizza from "@/assets/pizza.jpg";
import statue from "@/assets/statue.jpg";
import vitalik from "@/assets/vitalik.jpg";
import haber from "@/assets/haber.jpg";

/* =========================================================
   04 — A BRIEF HISTORY (white)
   ========================================================= */
const HISTORY = [
  {
    y: "1991",
    t: "Chained timestamps",
    d: "Haber & Stornetta",
    quote: "“How to time-stamp a digital document”",
    by: "Paper title · Journal of Cryptology, 1991",
    cap: "Foundational paper, 1991 · The birth of cryptographic chaining",
  },
  {
    y: "2008–09",
    t: "Bitcoin",
    d: "Satoshi Nakamoto",
    quote: "“Chancellor on brink of second bailout for banks”",
    by: "Hidden in Bitcoin's first block · 3 Jan 2009, mid financial crisis",
    cap: "9-page white paper, Oct 2008 · author still unknown",
  },
  {
    y: "2010",
    t: "Two pizzas",
    d: "10,000 BTC",
    quote: "“I'll pay 10,000 bitcoins for a couple of pizzas”",
    by: "Laszlo Hanyecz · Bitcointalk forum, 18 May 2010",
    cap: "Illustrative photo — not the original pizzas",
  },
  {
    y: "2015",
    t: "Ethereum",
    d: "Vitalik Buterin",
    quote: "“A next-generation smart contract … platform”",
    by: "Ethereum white paper, 2013 (age 19) · launched July 2015",
    cap: "36-page white paper, 2013 · The 'World Computer' & smart contracts",
  },
];

/* ---- 1991: Journal of Cryptology paper + Haber & Stornetta portrait ---- */
function ArtHaber() {
  return (
    <div className="grid h-[470px] w-[764px] grid-cols-2">
      <div className="flex flex-col border-2 border-ink bg-paper px-8 py-8 text-center">
        <div className="font-display text-[21px] font-bold leading-[1.15]">How to Time-Stamp a Digital Document</div>
        <div className="mt-4 text-[17px]">Stuart Haber & W. Scott Stornetta</div>
        <div className="text-[15px] text-mute">Journal of Cryptology (1991) · Bellcore</div>
        <div className="mt-6 text-left text-[14px] leading-[1.45]">
          <b>Abstract.</b> A digital document can be altered in ways that are undetectable. We propose cryptographic methods for sealing records sequentially so that back-dating or tampering is mathematically impossible.
        </div>
        <div className="mt-4 space-y-[9px]">
          {[100, 100, 92, 100, 64].map((w, i) => (
            <div key={i} className="h-[6px] bg-rule" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
      <div className="relative flex flex-col items-center justify-center overflow-hidden border-2 border-l-0 border-ink bg-ink text-paper">
        <img
          src={haber}
          alt="Stuart Haber and W. Scott Stornetta at Bellcore in 1991"
          className="photo h-full w-full object-cover"
          style={{ objectPosition: "50% 20%" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent pointer-events-none" />
        <div className="absolute bottom-6 left-0 right-0 text-center">
          <Micro className="text-paper">Haber & Stornetta · 1991</Micro>
          <div className="text-[14px] text-paper/75 tracking-wider mt-1 uppercase font-sans font-medium">Bellcore Scientists · Cited 3× by Satoshi</div>
        </div>
      </div>
    </div>
  );
}

/* ---- 2008–09: white paper + the missing portrait ---- */
function ArtSatoshi() {
  return (
    <div className="grid h-[470px] w-[764px] grid-cols-2">
      <div className="flex flex-col border-2 border-ink bg-paper px-8 py-8 text-center">
        <div className="font-display text-[23px] font-bold leading-[1.15]">Bitcoin: A Peer-to-Peer Electronic Cash System</div>
        <div className="mt-4 text-[17px]">Satoshi Nakamoto</div>
        <div className="text-[15px] text-mute">satoshin@gmx.com · www.bitcoin.org</div>
        <div className="mt-6 text-left text-[15px] leading-[1.45]">
          <b>Abstract.</b> A purely peer-to-peer version of electronic cash would allow online payments to be sent directly from one party to another without going through a financial institution.
        </div>
        <div className="mt-4 space-y-[9px]">
          {[100, 100, 92, 100, 64].map((w, i) => (
            <div key={i} className="h-[6px] bg-rule" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
      <div className="relative flex flex-col items-center justify-center overflow-hidden border-2 border-l-0 border-ink bg-ink text-paper">
        <img
          src={statue}
          alt="Statue of Satoshi Nakamoto in Budapest"
          className="photo h-full w-full object-cover"
          style={{ objectPosition: "50% 20%" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent pointer-events-none" />
        <div className="absolute bottom-6 left-0 right-0 text-center">
          <Micro className="text-paper">No verified photo exists</Micro>
          <div className="text-[14px] text-paper/75 tracking-wider mt-1 uppercase font-sans font-medium">Satoshi Statue · Budapest</div>
        </div>
      </div>
    </div>
  );
}

/* ---- 2010: pizza photo ---- */
function ArtPizza() {
  return <img src={pizza} alt="Black-and-white photograph of two pizzas in open delivery boxes (illustrative)" className="photo h-[470px] w-[764px]" style={{ objectPosition: "50% 30%" }} />;
}

/* ---- 2015: Ethereum white paper + Vitalik Buterin portrait ---- */
function ArtEthereum() {
  return (
    <div className="grid h-[470px] w-[764px] grid-cols-2">
      <div className="flex flex-col border-2 border-ink bg-paper px-8 py-8 text-center">
        <div className="font-display text-[21px] font-bold leading-[1.15]">Ethereum: A Next-Generation Smart Contract Platform</div>
        <div className="mt-4 text-[17px]">Vitalik Buterin</div>
        <div className="text-[15px] text-mute">vitalik.buterin@ethereum.org · www.ethereum.org</div>
        <div className="mt-6 text-left text-[14px] leading-[1.45]">
          <b>Abstract.</b> Rather than supporting a single set of operations, Ethereum allows users to create arbitrary smart contracts, self-executing rules and decentralized applications.
        </div>
        <div className="mt-4 space-y-[9px]">
          {[100, 100, 92, 100, 64].map((w, i) => (
            <div key={i} className="h-[6px] bg-rule" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
      <div className="relative flex flex-col items-center justify-center overflow-hidden border-2 border-l-0 border-ink bg-ink text-paper">
        <img
          src={vitalik}
          alt="Vitalik Buterin in 2015"
          className="photo h-full w-full object-cover"
          style={{ objectPosition: "50% 15%" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent pointer-events-none" />
        <div className="absolute bottom-6 left-0 right-0 text-center">
          <Micro className="text-paper">Vitalik Buterin · Age 19</Micro>
          <div className="text-[14px] text-paper/75 tracking-wider mt-1 uppercase font-sans font-medium">Ethereum Creator · 2015</div>
        </div>
      </div>
    </div>
  );
}

const ART = [ArtHaber, ArtSatoshi, ArtPizza, ArtEthereum];

export function S04() {
  const { step } = useDeck();
  const active = step - 1; // -1 = nothing shown yet
  const COLW = 432;

  return (
    <Slide theme="white" label="Context">
      <div className="absolute left-[96px] top-[130px]">
        <Micro className="mb-4 text-cobalt">From ghost creator to global tech</Micro>
        <Headline lines={["A BRIEF", "HISTORY"]} />
      </div>

      {/* Quote for the current moment */}
      <div className="absolute left-[96px] top-[400px] w-[880px]">
        {HISTORY.map((h, i) => (
          <div key={h.y} className="t-base absolute left-0 top-0 w-full" style={{ opacity: active === i ? 1 : 0, transform: active === i ? "none" : "translateY(10px)" }} aria-hidden={active !== i}>
            <div className="font-display text-[42px] font-semibold leading-[1.12] tracking-[-0.02em]" style={{ textWrap: "balance" }}>{h.quote}</div>
            <Micro className="mt-4 text-mute">{h.by}</Micro>
          </div>
        ))}
      </div>

      {/* Feature frame: one image per step */}
      <div className="absolute left-[1060px] top-[120px] h-[470px] w-[764px]">
        {ART.map((A, i) => (
          <div key={i} className="t-base absolute inset-0" style={{ opacity: active === i ? 1 : 0, transform: active === i ? "none" : "translateX(16px)" }} aria-hidden={active !== i}>
            <A />
          </div>
        ))}
      </div>
      <div className="absolute left-[1060px] top-[606px] w-[764px]">
        {HISTORY.map((h, i) => (
          <Micro key={h.y} className={cn("t-base absolute left-0 top-0 text-mute", active === i ? "opacity-100" : "opacity-0")}>
            {h.cap}
          </Micro>
        ))}
      </div>

      {/* Timeline row */}
      <svg className="absolute inset-0" width={1920} height={1080} aria-hidden>
        {HISTORY.map((_, i) => (
          <DrawPath key={i} d={`M${96 + i * COLW} 700 H${96 + i * COLW + COLW - 40}`} show={step >= i + 1} strokeWidth={active === i ? 4 : 2} className={active === i ? "stroke-cobalt" : "stroke-ink"} />
        ))}
      </svg>
      {HISTORY.map((h, i) => (
        <div key={h.y} className="absolute" style={{ left: 96 + i * COLW, top: 720, width: COLW - 64 }}>
          <Micro className="text-mute">
            <Reveal show={step >= i + 1} as="span">0{i + 1}</Reveal>
          </Micro>
          <div className={cn("t-base font-display text-[80px] font-extrabold leading-[0.95] tracking-[-0.04em]", active === i ? "text-cobalt" : "text-ink")}>
            <Mask show={step >= i + 1} delay={60}>{h.y}</Mask>
          </div>
          <Reveal show={step >= i + 1} delay={160}>
            <div className="mt-3 font-display text-[28px] font-bold uppercase leading-[1.05] tracking-[-0.01em]">{h.t}</div>
            <p className="mt-1 text-[23px] text-mute">{h.d}</p>
          </Reveal>
        </div>
      ))}
    </Slide>
  );
}
