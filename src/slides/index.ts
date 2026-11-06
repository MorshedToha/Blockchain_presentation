import type { ComponentType } from "react";
import { GROUP, PRESENTERS, TOPIC, type Theme } from "@/deck/ui";
import { STitle, S01, S02, S03 } from "./act1";
import { S04 } from "./history";
import { S05, S06 } from "./act2";
import { S07, S08, S09 } from "./act3";
import { makeDivider, S10, S11, S12, SSources, SThanks } from "./act4";

export interface SlideDef {
  title: string;
  theme: Theme;
  builds: number;
  Component: ComponentType;
  /** one paragraph per state: notes[0] = on arrival, notes[n] = after click n */
  notes: string[];
  act: number;
  kind: "title" | "divider" | "content" | "end";
  /** target time (seconds from start) by which this slide should be finished */
  ends: number;
}

const [P1, P2, P3, P4] = PRESENTERS.map((p) => p.name);

export const SLIDES: SlideDef[] = [
  {
    title: "Title — Blockchain",
    theme: "black",
    builds: 3,
    Component: STitle,
    act: 1,
    kind: "title",
    ends: 20,
    notes: [
      "[Only the word BLOCKCHAIN is on screen. Wait for quiet.] Good morning, everyone.",
      "[CLICK] Don't worry — we aren't here today to tell you to buy Bitcoin, and we aren't going to bore you with complicated math.",
      `[CLICK] I'm ${P1}, with ${P2}, ${P3} and ${P4} — four acts, five minutes each.`,
      `[CLICK] This is ${TOPIC}. And I want to start with a five-second puzzle.`,
    ],
  },
  {
    title: "Copy. Paste. Spend?",
    theme: "black",
    builds: 4,
    Component: S01,
    act: 1,
    kind: "content",
    ends: 105,
    notes: [
      "Raise your hand if you have ever sent a photo or a meme to a friend on WeChat or WhatsApp. (Wait for hands.)",
      "[CLICK] Now — when you sent that photo to your friend, did the photo disappear from your phone? No! You made a copy. For photos, copying is great.",
      "[CLICK] But what about money? If I send the Professor $100 over the internet, why can't I just press Ctrl+C and Ctrl+V…",
      "[CLICK] …and send that exact same $100 file to thirty other people in this room?",
      "[CLICK] In computer science, this is called the Double-Spend Problem. And how we solve it is the story of blockchain.",
    ],
  },
  {
    title: "The Central Middleman",
    theme: "white",
    builds: 4,
    Component: S02,
    act: 1,
    kind: "content",
    ends: 195,
    notes: [
      "Before blockchain existed — in the 'previous version' of the internet — there was only one way to stop people copy-pasting digital money: we hired a middleman.",
      "[CLICK] Whenever you swipe a bank card or use a payment app, a giant company sits in the middle with one private notebook. They check if you have the money, subtract it from your name, and add it to your friend's. That works — until it doesn't.",
      "[CLICK] Because all the data lives in one central server: if hackers break in, if the server crashes, or if the bank decides to freeze your account — everyone is locked out at once.",
      "[CLICK] So three bad things. One: a single point of failure. Two: fees and delays on every transaction across borders. Three: we simply have to trust them.",
      "[CLICK] So scientists asked a crazy question: can two strangers send value over the internet with zero middleman?",
    ],
  },
  {
    title: "What Is Blockchain?",
    theme: "blue",
    builds: 4,
    Component: S03,
    act: 1,
    kind: "content",
    ends: 300,
    notes: [
      "Here is the simplest way to understand blockchain. Imagine we fire the bank right now. Instead of one private notebook at the front of the room, we hand a blank notebook to every single student.",
      "[CLICK] Watch what happens when I pay the Professor $50. I shout out loud: 'I am paying the Professor $50!' Every one of you writes that sentence on line 1 of your notebook.",
      "[CLICK] Now imagine tonight I get greedy. I sneak in and erase my notebook so it says $5,000.",
      "[CLICK] Does my trick work? Look at the screen — no! Tomorrow morning we compare notebooks. 39 of you have the real receipt, and only one notebook has the fake one. The network automatically ignores my lie.",
      `[CLICK] That's all a blockchain is: a shared digital notebook, copied across thousands of computers, where you can add new lines at the bottom — but the Backspace key is ripped off the keyboard forever. So who actually invented this crazy idea? ${P2} is going to take you into the mystery.`,
    ],
  },
  {
    title: "Act 2 — How It Locks",
    theme: "blue",
    builds: 0,
    Component: makeDivider(2),
    act: 2,
    kind: "divider",
    ends: 305,
    notes: [`[${P2} walks up. Click when ready.] Thank you, ${P1}.`],
  },
  {
    title: "A Brief History",
    theme: "white",
    builds: 4,
    Component: S04,
    act: 2,
    kind: "content",
    ends: 405,
    notes: [
      "Most people think blockchain started with Bitcoin — but the history actually starts in 1991.",
      "[CLICK] Two scientists, Stuart Haber and W. Scott Stornetta, wanted a way to put digital time-stamps on documents, so nobody could fake the date on a patent or a contract. Each record is sealed to the one before it.",
      "[CLICK] Then in 2008 the global financial crisis hit. Right in the middle of that panic, an anonymous programmer — or group — using the name Satoshi Nakamoto published a nine-page paper online, and in January 2009 launched Bitcoin. Look at the headline hidden inside the very first block: bank bailouts. And this question mark is deliberate. Satoshi vanished in 2011, leaving an estimated one million coins untouched — and nobody knows who he is.",
      "[CLICK] Fun fact for the room. In May 2010, a programmer in Florida, Laszlo Hanyecz, paid 10,000 bitcoins for two Papa John's pizzas — the first widely documented real-world purchase. Today those two pizzas would be worth hundreds of millions of dollars. (The photo is illustrative.)",
      "[CLICK] Finally: in 2013, a 19-year-old programmer named Vitalik Buterin realised we could put computer programs — not just money — inside the notebook. Ethereum launched in 2015, and modern blockchain was born.",
    ],
  },
  {
    title: "Why a Block-Chain?",
    theme: "white",
    builds: 4,
    Component: S05,
    act: 2,
    kind: "content",
    ends: 525,
    notes: [
      "Okay, let's look under the hood for 90 seconds — explained like we're 15. Why is it called a block-chain? Think of each block as one full page in our classroom notebook. Ingredient one: the data — the list of transactions on that page.",
      "[CLICK] Once a page fills up, we need to lock it, so the computer creates a hash. Don't let the word scare you — think of it as a digital fingerprint, or an old-fashioned wax seal.",
      "[CLICK] Ingredient three — and this is the trick: every block also carries the fingerprint of the block right before it. That's the chain.",
      "[CLICK] Now watch. In block 102, Alice's payment changes from 10 to 100 — one extra zero. Its fingerprint changes completely. And because block 103 was holding the old fingerprint, the link snaps.",
      "[CLICK] To change one number from five years ago, a hacker would have to redo every block after it, on thousands of computers, faster than everyone else — which is practically impossible.",
    ],
  },
  {
    title: "Who Writes the Next Page?",
    theme: "blue",
    builds: 3,
    Component: S06,
    act: 2,
    kind: "content",
    ends: 600,
    notes: [
      "One quick question before I pass the mic: if there is no boss, who decides which computer gets to seal the next page?",
      "[CLICK] In early blockchains like Bitcoin, computers play a giant guessing game called proof of work — or 'mining'. Millions of computers race to find a lucky number; the winner seals the page. The problem: it uses massive amounts of electricity.",
      "[CLICK] So newer blockchains use proof of stake. Instead of burning electricity, computers lock up their own money as a security deposit. Tell the truth: earn a small reward. Try to cheat: the network can take the deposit.",
      `[CLICK] When Ethereum switched in 2022, its energy use dropped by about 99.95%. Now you know how it works — and people aren't just using this for coins anymore. ${P3} is going to show you how blockchain is used in the real world.`,
    ],
  },
  {
    title: "Act 3 — Real Life",
    theme: "blue",
    builds: 0,
    Component: makeDivider(3),
    act: 3,
    kind: "divider",
    ends: 605,
    notes: [`[${P3} walks up. Click when ready.] Thanks, ${P2}.`],
  },
  {
    title: "Smart Contracts",
    theme: "white",
    builds: 3,
    Component: S07,
    act: 3,
    kind: "content",
    ends: 705,
    notes: [
      "If you ask ten people on the street how blockchain is used, nine will say 'Bitcoin'. That's like saying the entire internet is only used for email! The biggest real-world invention on blockchain is the smart contract: IF something happens, THEN the code runs — automatically.",
      "[CLICK] Explain it like we're 15: a smart contract is a digital vending machine. When you buy a soda, you don't need a lawyer or a cashier. You put in ¥5, press the button, and the machine's gears force the soda to drop.",
      "[CLICK] A smart contract works the exact same way — same machine, new input. Here's our flight-insurance simulator. Flight on time: the data feed reports zero minutes, the rule isn't met, and the airline keeps the fare.",
      "[CLICK] Now your flight is delayed three hours. Normally you'd argue with customer service for weeks. Here, the moment the flight-data feed reports two hours late, the code sends the refund straight to your phone. It can't make excuses. This really existed: AXA ran it on Ethereum from 2017 to 2019.",
    ],
  },
  {
    title: "Farm to Shelf",
    theme: "blue",
    builds: 4,
    Component: S08,
    act: 3,
    kind: "content",
    ends: 810,
    notes: [
      "The second huge use is right inside your supermarket. A few years ago, Walmart ran an experiment: a team walked in with a pack of sliced mangoes and asked, 'Which farm did these come from?' With paper receipts and normal databases, it took 6 days, 18 hours and 26 minutes. In a food-poisoning outbreak, a week is far too slow.",
      "[CLICK] So they put the supply chain onto a blockchain. When the farmer harvests the fruit, it's scanned onto block 1 — and every hand-off after that is written onto the chain.",
      "[CLICK] Now scan the QR code on the shelf. The whole journey appears — including the truck's temperature sensor. See that spike? The fridge got too warm, and it was recorded automatically. Nobody can erase it.",
      "[CLICK] Tracing that food now takes 2.2 seconds.",
      "[CLICK] The same idea is used for medicines — the MediLedger network, with companies like Pfizer, fights counterfeit drugs — and luxury brands like LVMH and Prada use it to prove a product is genuine.",
    ],
  },
  {
    title: "Un-fakeable Diplomas",
    theme: "white",
    builds: 3,
    Component: S09,
    act: 3,
    kind: "content",
    ends: 900,
    notes: [
      "Finally, think about your own life as a university student. When we graduate, how does an employer in another country know our diploma is real and not Photoshopped? Right now they email the university, pay verification fees, and wait weeks.",
      "[CLICK] With blockchain, the university records the diploma's fingerprint when it issues it. The employer checks the file against that record — verified, in one second, without contacting the registrar.",
      "[CLICK] And if someone Photoshops the GPA from 2.4 to 3.9? The fingerprint no longer matches: not valid.",
      `[CLICK] This is already real: in 2017, MIT gave 111 graduates blockchain-verifiable diplomas. The same idea works for medical records that follow you to any doctor, and for sending aid across borders. Wait — if blockchain is so secure, why isn't the whole world using it for everything? ${P4} will close with the advantages, the disadvantages, and a live test for the Professor.`,
    ],
  },
  {
    title: "Act 4 — The Trade-off",
    theme: "blue",
    builds: 0,
    Component: makeDivider(4),
    act: 4,
    kind: "divider",
    ends: 905,
    notes: [`[${P4} walks up. Click when ready.] Thank you, ${P3}.`],
  },
  {
    title: "Miracle or Hype?",
    theme: "white",
    builds: 6,
    Component: S10,
    act: 4,
    kind: "content",
    ends: 1035,
    notes: [
      "As engineers and students, we should never look at a technology like fans — we have to look at both sides of the coin. Let's start with the advantages.",
      "[CLICK] One: trust without a middleman. Two strangers — or two competing companies — can do business safely without paying anyone in the middle.",
      "[CLICK] Two: always on. Banks close on weekends and holidays; a blockchain runs 24 hours a day, 365 days a year.",
      "[CLICK] Three: transparency. Every transaction can be audited in public, which makes hidden accounting fraud much harder.",
      "[CLICK] Now the other side. The speed bottleneck: because thousands of computers must agree on every page, older blockchains are slow. Visa says its network can handle up to 65,000 transaction messages per second; Bitcoin manages about 7.",
      "[CLICK] Irreversible mistakes and scams: there's no boss in the middle, so if a scammer tricks you, there's no hotline to reverse the payment.",
      "[CLICK] And the lost-password nightmare — which brings us to our biggest question of the day.",
    ],
  },
  {
    title: "Total Freedom. No Safety Net.",
    theme: "black",
    builds: 4,
    Component: S11,
    act: 4,
    kind: "content",
    ends: 1140,
    notes: [
      "The ultimate trade-off: total freedom — with no safety net.",
      "[CLICK] This is a real person: Stefan Thomas. In 2011 he was paid 7,002 bitcoins for making an animated video explaining Bitcoin — worth hundreds of millions of dollars today. He put the key on an encrypted drive that locks forever after ten wrong guesses. He lost the paper with the password. He has guessed wrong eight times. Two guesses left. And no government, no court, no programmer can click 'Forgot password' for him.",
      "[CLICK] He's not alone. James Howells says a hard drive holding 8,000 bitcoins was thrown out in 2013. It's still in a landfill in Wales — and a court rejected his claim in 2025.",
      "[CLICK] So, Professor, we'd like you to decide for the class. If you had to put your life savings into one system tomorrow, which flaw would you rather live with? Option A: a traditional bank — a friendly clerk can reset your password, but the bank can also freeze your account, charge fees, or get hacked. Or option B: blockchain — nobody on Earth can freeze or alter your vault, but if you lose your key, nobody can save you. [Pause 10–15 seconds. Press A or B on the keyboard to mark the answer.]",
      "[CLICK] (Thank the Professor — lead a round of applause.) And notice: it's a spectrum, not two boxes — banks at one end, self-custody at the other, and shared recovery in between.",
    ],
  },
  {
    title: "Don't Be Evil → Can't Be Evil",
    theme: "blue",
    builds: 6,
    Component: S12,
    act: 4,
    kind: "content",
    ends: 1195,
    notes: [
      "That exact tension the Professor just pointed out is why the future isn't 100% banks or 100% wild-west crypto — it's combining the best of both worlds. Let's recap our twenty minutes.",
      `[CLICK] ${P1} showed you what it is: a shared notebook with no Backspace key.`,
      `[CLICK] ${P2} showed how it locks: fingerprints that chain every page together.`,
      `[CLICK] ${P3} showed where it's used: contracts, food, medicine, diplomas.`,
      "[CLICK] And the trade-off: total freedom, or a safety net.",
      "[CLICK] To wrap up in one sentence. For the first thirty years of the internet, our motto had to be 'Don't be evil' — we crossed our fingers and hoped giant companies wouldn't lose our data or cheat us.",
      "[CLICK] Blockchain changes that motto from 'Don't be evil' to 'Can't be evil' — replacing blind human trust with open, checkable math.",
    ],
  },
  {
    title: "Sources",
    theme: "white",
    builds: 0,
    Component: SSources,
    act: 0,
    kind: "end",
    ends: 1197,
    notes: ["[Click straight through. Leave for anyone who asks where a number came from.]"],
  },
  {
    title: "Thank You",
    theme: "black",
    builds: 1,
    Component: SThanks,
    act: 0,
    kind: "end",
    ends: 1200,
    notes: [
      "Thank you so much for being our human blockchain today!",
      `[CLICK] We'd love to take your questions. [Leave up for Q&A. G jumps to any slide; End returns here.]`,
    ],
  },
];

/** Number shown on screen: content slides count 01–12, everything else 0. */
export function contentNo(i: number) {
  if (SLIDES[i].kind !== "content") return 0;
  return SLIDES.slice(0, i + 1).filter((s) => s.kind === "content").length;
}
