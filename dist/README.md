# Blockchain, Explained

An offline-capable, interactive 16:9 classroom presentation. Exactly 16 teaching slides, four per speaker, with a 20:00 run of show. An unnumbered BLOCKCHAIN opening and a matching THANK YOU closing frame the lesson without changing its timing. Educational, not investment advice.

## Open and Present

1. Open `dist/index.html` directly in a current Chrome, Edge, Firefox, or Safari browser. The animated BLOCKCHAIN title appears first. No server or internet connection is needed.
2. Use **Next step** to run the next part of the current activity. After the activity is complete, it becomes **Next slide**. Back reverses activity steps before returning to the previous slide. Progress marks, chapter links, and **All slides** jump directly between slides.
3. Select **Present** to open the title fullscreen with the clock waiting at 0:00. Click anywhere on the black title, or press Right / Page Down, when ready: only then does the 20-minute schedule start on teaching slide 1. Bottom navigation, the chapter footer, and the timer bar stay hidden. Press **?** for the clock and settings. The corner menu is visible on teaching slides; on the clean title screens it appears only when keyboard-focused. Browser fullscreen is optional.
4. Follow the speaker notes and keep activities within their allotted time. Speaker changes occur at 5:00, 10:00, and 15:00. Handoffs are included in slides 4, 8, and 12, not added afterward.
5. At 20:00, auto pace stops the clock and opens the matching THANK YOU screen with the audience prompt **Do we need it?** The fuller closing question remains on teaching slide 16. In manual navigation, finish that slide's four takeaways, then advance once more to the thank-you screen. Discussion on this holding screen is outside the timed talk.

The opening and closing are untimed holding screens, not additional teaching slots. The lesson clock starts when you advance from the opening, not while displaying it. Stepping through an activity does not change the clock or turn off auto pace. Manually moving to another slide disables **Auto pace**; turn it back on in the corner menu to return to the scheduled slide. Pausing adds wall-clock time, so use pause for rehearsal, not during an exactly 20-minute delivery. Exiting presentation mode or native fullscreen pauses the clock. **Present** prepares a fresh run.

## Titles and Chart

- Both title screens are pure black with a white title centered horizontally and vertically, and a small gray subtitle directly beneath it. There are no visible page labels, network graphics, buttons, or footer bars on the title itself.
- The opening subtitle is **The architecture of digital trust**. The thank-you subtitle is **Do we need it?**, inviting the audience to think about whether the problem actually needs blockchain.
- BLOCKCHAIN is static, with no glitch or text animation. Its centered layout and subtitle are unchanged. Eight faint specks and a very low-opacity, slow scan line keep the background minimal and black. Press **M** to pause/resume background effects, or **R** / **0** to replay them. Reduced-motion preferences automatically give a static background.
- Click the opening to begin, or click the thank-you screen to return to the takeaway. The whole slide is keyboard-operable with a visible focus outline. **Home** and **End** open the first and last title, and both remain available in **All slides**.
- Slide 11 adds a chart of Walmart's already-cited retrieval times. It uses one linear 0-7 day axis for both methods: 584,760 seconds for the existing method and 2.2 seconds for the pilot. A dot marks the pilot's actual near-zero position; its visible radius is a location marker, not an inflated duration bar. No new statistics or universal performance claims are introduced.

## Interaction Controls

- Large buttons on each slide control its activity. No activity requires sound, hover, internet, or precise timing.
- Right arrow, Page Down, Space, and **Next step** perform the current activity one step at a time before advancing the slide. For example: copy the token, count a sample payment, then move on; verify a credential, alter a character, verify again, then move on.
- Navigation follows an illustrative sample path, not an audience vote. Use the on-slide controls to choose another payment, flight report, or decision branch. Navigation respects those choices and any completed steps.
- In presentation mode, click or tap a non-interactive area of the slide to continue. Shift-click goes back. Clicking an activity button or editing a field never also advances the slide.
- **Reveal answer** shows a completed example. **Reset** restores that slide and replays its short entrance motion.
- The keyboard/help button opens **Read-through mode**, which shows completed examples throughout the deck, and a motion toggle.
- Activities preserve their local state when moving between slides. Starting a new timed presentation resets all activities.
- Tab and Enter operate controls; focus indicators are visible. Arrow keys do not interrupt input editing. Page Up and Page Down can operate presenter steps even from a field. Space activates a focused control instead of advancing the deck.
- Every activity has a no-click fallback in the notes and in the printable guide.

| Key | Action |
| --- | --- |
| Left / Right, Page Up / Page Down | Previous / next activity step, then previous / next slide |
| Up / Down | Same as Left / Right |
| Space / Shift+Space | Next / previous activity step |
| Shift + arrow or Page key | Skip directly to the previous / next slide |
| Home / End | Opening title / thank-you screen |
| N | Speaker notes |
| G | All slides |
| S | Sources |
| R | Reveal answer; replay effects on a title |
| 0 | Reset current activity; replay effects on a title |
| M | Pause / resume visual effects |
| P | Pause / resume presentation clock |
| Escape | Close a dialog or leave presentation mode |
| ? | Help and settings |

## Notes and Non-Interactive Fallback

Open `dist/presenter-guide.html` in a browser, even with JavaScript disabled. It contains all 16 spoken scripts, exact timing budgets, handoffs, key takeaways, activity instructions, complete fallback outcomes, and source links. It can be printed or saved as a PDF using the browser's print command. Sources are also in `dist/sources.md` and the deck's Sources panel. Source pages require a connection only if deliberately opened.

| Speaker | Slides | Schedule |
| --- | --- | --- |
| 1 | 1-4 | 0:00-5:00 |
| 2 | 5-8 | 5:00-10:00 |
| 3 | 9-12 | 10:00-15:00 |
| 4 | 13-16 | 15:00-20:00 |

The exact slide durations are 70, 75, 80, 75, 70, 70, 90, 70, 75, 75, 80, 70, 70, 65, 105, and 60 seconds. They total 1,200 seconds. Human speaking pace should be rehearsed against the included clock; the schedule is not a claim that all speakers naturally talk at the same rate.

## Technical Notes

- The production HTML embeds its JavaScript, CSS, local font, and illustrations in one file. Keep the companion guide, sources, README, and notices alongside it for documentation links.
- SHA-256 hashes are computed locally, with only eight characters shown. The simplified chain does not implement mining, a network, finality, or an attack-resistant consensus protocol.
- Credential checks use real Ed25519 signatures with a deliberately public teaching key. The credential, issuer, and student are fictional. This is not a full Blockcerts implementation and must not be used for real credentials or funds.
- Vending, flight, payment, decision, recovery, and supply-chain records are fictional simulations. Walmart's reported pilot times and the cited historical stories are clearly separated from invented examples.
- There is no analytics, API call, external media embed, wallet connection, or collection of personal information. No interaction state is persisted beyond the current browser session.
- Original HTML/CSS/SVG diagrams replace external photography. Inter is bundled locally under the SIL Open Font License; Lucide icons use the ISC license. The supplied visual reference is not embedded or copied as content.

## Development

```sh
npm install
node scripts/export-guide.mjs
npm run dev
```

Create the offline distribution:

```sh
node scripts/export-guide.mjs
npx tsc --noEmit
npm run build
```

Run browser verification after building:

```sh
npx playwright install chromium
node scripts/verify-deck.mjs
```

`src/App.tsx` contains the presentation shell and tools. `src/components/BookendScreen.tsx` contains the animated opening and closing. `src/components/Slides.tsx` contains all teaching activities and the sourced tracing-time chart; `src/components/SlideNavigation.tsx` connects their actual state to next/back controls. `src/data/deck.ts` is the source of truth for the 16 teaching slides, timing, notes, and citations. `src/utils/crypto.ts` contains the local teaching demonstrations. `src/index.css` defines the editorial visual system. `scripts/export-guide.mjs` generates the static guide, sources, and license notices in `public/`; Vite copies them to `dist/`.