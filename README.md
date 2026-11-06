# Blockchain — An Interactive Swiss Editorial Presentation

> **Topic #33** • Presentation Date: **20 Nov 2026**

An offline-capable, interactive 16:9 classroom presentation designed with the Swiss International Typographic Style (high-contrast editorial grid, cobalt blue accents, authentic typography, and documentary photojournalism).

Choreographed for a **4-speaker team** over a tight **20-minute run of show** (approx. 5 minutes per act).

---

## 👥 Presenters & Roles

| Act & Role | Student ID | Presenter | Act Topic |
| :---: | :---: | :---: | :--- |
| **Act 01** | `269201405` | **T. JITO** | **What It Is** — Double-spend dilemma & the shared notebook |
| **Act 02** | `269201413` | **T.M.F MORSHED** | **How It Locks** — Cryptographic hashes & consensus (PoW / PoS) |
| **Act 03** | `269201407` | **A.M. ASHIK** | **Real Life** — Smart contracts, supply chains & un-fakeable diplomas |
| **Act 04** | `269201418` | **H.M. NAIM** | **The Trade-off** — Honest balance sheet, professor vote & conclusion |

---

## 🚀 How to Run & Present

### 1. Zero-Install / Offline (Recommended for Classroom)
Open **`dist/index.html`** directly in any modern browser (Chrome, Edge, Safari, Firefox).
- It is completely self-contained (all fonts, styles, scripts, and high-res media are inlined).
- Works 100% offline without any internet connection or web server.

### 2. Dual-Screen Presenter Console
Connect your laptop to the classroom projector in **Extended Display** mode:
1. Open `dist/index.html` on the projector screen and press **`F`** for fullscreen.
2. Open `dist/index.html?presenter` on your laptop screen.
3. The two windows synchronize in real time via `BroadcastChannel` with an elapsed timer, speaker cues, and next-click previews.

### 3. Local Development Server
To run and edit the source code:
```bash
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173).

To rebuild the single-file bundle:
```bash
npm run build
```

---

## ⌨️ Presentation Keyboard Shortcuts

| Key | Action |
| :---: | :--- |
| **`Click` / `→` / `Space` / `PageDown`** | Next step / animation (finishes running animations first) |
| **`←` / `PageUp`** | Back one step |
| **`F`** | Toggle Fullscreen on active window |
| **`P`** | Open Presenter View (second window with speaker notes & clock) |
| **`N`** | Toggle speaker script + timer overlay (if presenting from a single monitor) |
| **`A` / `B`** | **Slide 11 only:** Record the professor's live vote interactively on screen |
| **`.`** *(period)* | Black screen on/off (draw room attention to speaker) |
| **`G` / `Esc`** | Grid overview of all slides |
| **`R`** | Restart current slide animations from step 0 |

---

## ⏱️ The 20-Minute Run of Show

| Slide | Speaker | Clicks | Ends By | Key Action / What Happens |
| :---: | :---: | :---: | :---: | :--- |
| **Title** | 1 | 3 | 0:20 | Subtitle → 4 speakers with IDs → Topic header |
| **01** | 1 | 4 | 1:45 | Photo sent vs $100 file → 30 copies → **Double-Spend Problem** |
| **02** | 1 | 4 | 3:15 | Bank middleman → Single point of failure → *"Zero middleman?"* |
| **03** | 1 | 4 | 5:00 | 40 desks simulation → 39 checkmarks vs 1 lie → Backspace ripped off |
| **Act 2** | 2 | 0 | 5:05 | *Speaker Handoff to T.M.F MORSHED* |
| **04** | 2 | 4 | 6:45 | 1991 Haber & Stornetta → 2008 Satoshi Nakamoto → 2010 Pizza → 2015 Ethereum |
| **05** | 2 | 4 | 8:45 | Live hash calculation → 10 to 100 alteration breaks chain link |
| **06** | 2 | 3 | 10:00 | Proof of Work (mining) → Proof of Stake (-99.95% energy drop) |
| **Act 3** | 3 | 0 | 10:05 | *Speaker Handoff to A.M. ASHIK* |
| **07** | 3 | 3 | 11:45 | Vending machine analogy → AXA automated flight delay insurance |
| **08** | 3 | 4 | 13:30 | Walmart mango supply chain tracking: **7 days down to 2.2 seconds** |
| **09** | 3 | 3 | 15:00 | Tamper-proof diplomas: MIT Blockcerts & GPA verification demo |
| **Act 4** | 4 | 0 | 15:05 | *Speaker Handoff to H.M. NAIM* |
| **10** | 4 | 6 | 17:15 | Honest balance sheet: Visa (65,000 TPS) vs Bitcoin (7 TPS) |
| **11** | 4 | 4 | 19:00 | Lost keys (Stefan Thomas & James Howells) → **Live Professor Vote (A/B)** |
| **12** | 4 | 6 | 19:45 | 4 speaker recaps → *"Don't be evil"* ➔ *"Can't be evil"* |
| **Sources** | 4 | 0 | — | Academic citations & verified facts |
| **Thank You** | 4 | 1 | 20:00 | Open floor for Q&A |
