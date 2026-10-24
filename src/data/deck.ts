export type Source = {
  id: string;
  title: string;
  url: string;
  detail: string;
};

export const sources: Source[] = [
  {
    id: 'nist',
    title: 'NIST: Blockchain Technology Overview (2018)',
    url: 'https://csrc.nist.gov/pubs/ir/8202/final',
    detail: 'NISTIR 8202. Distributed ledgers, blocks, hashes, consensus, permission models, security, and limitations. The final report, not the earlier draft, is used.',
  },
  {
    id: 'bitcoin',
    title: 'Satoshi Nakamoto: Bitcoin paper (2008)',
    url: 'https://bitcoin.org/bitcoin.pdf',
    detail: 'Bitcoin: A Peer-to-Peer Electronic Cash System. Primary source for double spending, hash-linked records, and proof of work; not a specification for every blockchain.',
  },
  {
    id: 'haber',
    title: 'Haber and Stornetta: How to Time-Stamp a Digital Document (1991)',
    url: 'https://doi.org/10.1007/BF00196791',
    detail: 'Stuart Haber and W. Scott Stornetta, Journal of Cryptology 3, 99-111. Early linked timestamping research, not a claim that Bitcoin existed in 1991.',
  },
  {
    id: 'satoshi',
    title: 'Encyclopaedia Britannica: Satoshi Nakamoto',
    url: 'https://www.britannica.com/biography/Satoshi-Nakamoto',
    detail: 'The name used by the author or authors of the Bitcoin paper; their identity is unknown. No speculative identity is presented.',
  },
  {
    id: 'pizza',
    title: 'Laszlo Hanyecz: Pizza for bitcoins? (2010)',
    url: 'https://bitcointalk.org/index.php?topic=137.0',
    detail: 'Original May 2010 forum thread. Hanyecz confirmed exchanging 10,000 bitcoin for pizza on May 22; his offer was for two pizzas. Another participant arranged the pizzas. No current valuation is used.',
  },
  {
    id: 'launch',
    title: 'Ethereum Foundation: Ethereum Launches (July 30, 2015)',
    url: 'https://blog.ethereum.org/2015/07/30/ethereum-launches',
    detail: 'Primary announcement of Frontier, the first live Ethereum release.',
  },
  {
    id: 'pow',
    title: 'Ethereum documentation: Proof of work',
    url: 'https://ethereum.org/en/developers/docs/consensus-mechanisms/pow/',
    detail: 'Computational work, block proposals, verification, and energy use. Ethereum no longer uses proof of work; the slide compares mechanisms, not current Ethereum and Bitcoin energy statistics.',
  },
  {
    id: 'pos',
    title: 'Ethereum documentation: Proof of stake',
    url: 'https://ethereum.org/en/developers/docs/consensus-mechanisms/pos/',
    detail: 'Validators, staked assets, proposals, attestations, and network-specific penalties. Not all mistakes cause slashing, and not all proof-of-stake networks use identical rules.',
  },
  {
    id: 'contracts',
    title: 'Ethereum documentation: Introduction to smart contracts',
    url: 'https://ethereum.org/en/developers/docs/smart-contracts/',
    detail: 'Programs on a blockchain that execute when called. Programmed conditions do not imply legal fairness, correctness, or an independent understanding of the real world.',
  },
  {
    id: 'oracles',
    title: 'Ethereum documentation: Oracles',
    url: 'https://ethereum.org/en/developers/docs/oracles/',
    detail: 'External data bridges and the oracle problem. The flight example is entirely fictional; no airline, insurance product, API, or live feed is used.',
  },
  {
    id: 'walmart',
    title: 'Walmart: 2018 Global Responsibility Report Summary',
    url: 'https://stock.walmart.com/_assets/_8521831b8d70c598f8c9e787a008f80a/walmart/db/951/9698/file/WMT-2018-GRR-Summary-for-digital.pdf',
    detail: 'Walmart reported six days, 18 hours, and 26 minutes to trace a package of sliced mangoes with existing methods, versus 2.2 seconds in its blockchain pilot. These are reported record-retrieval times, not an independent trial, a universal speed claim, or proof of input accuracy. The clickable supply-chain records in this deck are invented teaching examples, not pilot data.',
  },
  {
    id: 'mit',
    title: 'MIT Registrar: Digital diplomas',
    url: 'https://registrar.mit.edu/transcripts-records/diplomas/digital-diplomas',
    detail: 'MIT offers opt-in Blockcerts digital diplomas and a verification portal. Recipients should retain their credential file and access information. MIT describes reissuance if access is lost; this is different from losing self-managed wallet keys.',
  },
  {
    id: 'blockcerts',
    title: 'Blockcerts: Verification process',
    url: 'https://www.blockcerts.org/guide/verification-process.html',
    detail: 'Credential integrity, blockchain anchoring, issuer identity, and revocation checks. The local Ed25519 classroom demo illustrates signatures; it does not reproduce the complete Blockcerts verification protocol.',
  },
  {
    id: 'wired',
    title: 'Andy Greenberg, WIRED: The IronKey story (October 24, 2023)',
    url: 'https://www.wired.com/story/unciphered-ironkey-password-cracking-bitcoin/',
    detail: 'Reports Stefan Thomas\'s account of an encrypted IronKey holding keys to 7,002 bitcoin and eight unsuccessful attempts out of ten. The story also discusses recovery research. This deck does not claim that recovery is impossible or establish his present-day access status. No dollar valuation is shown.',
  },
];

export const mangoTiming = {
  existingSeconds: 6 * 86400 + 18 * 3600 + 26 * 60,
  pilotSeconds: 2.2,
  axisMaxDays: 7,
};

export const chapters = [
  { title: 'The shared ledger', subtitle: 'The problem & the shared ledger', range: '0:00 - 5:00', first: 0 },
  { title: 'Inside the chain', subtitle: 'History & how the chain works', range: '5:00 - 10:00', first: 4 },
  { title: 'Beyond the currency', subtitle: 'Applications', range: '10:00 - 15:00', first: 8 },
  { title: 'The trade-offs', subtitle: 'Trade-offs & conclusion', range: '15:00 - 20:00', first: 12 },
];

export type SlideData = {
  id: number;
  title: string;
  shortTitle: string;
  speaker: number;
  start: number;
  duration: number;
  theme: 'dark' | 'light' | 'blue';
  script: string[];
  takeaway: string;
  interaction: string;
  fallback: string;
  beats: { label: string; seconds: number }[];
  sources: string[];
  handoff?: string;
};

export const slides: SlideData[] = [
  {
    id: 1, title: 'Can digital money be copied?', shortTitle: 'The copy problem', speaker: 1, start: 0, duration: 70, theme: 'dark',
    script: [
      'Quick show of hands: who has sent a photo or meme in a chat like WeChat or WhatsApp? When you sent it, did it disappear from your phone? No—you both had a copy. Great for photos.',
      'Now imagine this $100 is digital. If I copy it and try to pay 50 people with the same $100, did I make $5,000? No, I made 50 claims on the same money. That is double spending. Let’s test a small version: click Copy, then choose Alex or Sam. Which payment should count? Take two quick answers. A record and its rules decide which payment is accepted. Blockchain is one way to keep that shared record. This is a classroom example, not real money or a full network.',
    ],
    takeaway: 'Copying digital information must not create a second spendable balance.',
    interaction: 'Ask for a show of hands about sharing photos, then click Copy the $100. Invite at most two quick answers about which payment should count, then select Alex or Sam. The two-payment screen is a simplified double-spending example, not a real consensus algorithm.',
    fallback: 'Say: "A copy does not make more money. These two payment attempts compete for the same $100; a record and its rules decide which one counts." Reveal answer shows Alex paid and Sam rejected.',
    beats: [{ label: 'Photo-copy hook and show of hands', seconds: 20 }, { label: 'Set up and click the digital $100 puzzle', seconds: 25 }, { label: 'Choose a payment and name double spending', seconds: 25 }],
    sources: ['bitcoin', 'nist'],
  },
  {
    id: 2, title: 'The central record keeper', shortTitle: 'One record keeper', speaker: 1, start: 70, duration: 75, theme: 'light',
    script: [
      'A familiar answer is a central record keeper, such as a bank or payment provider. Its ledger is a record of balances and payments. When you pay, it checks your balance and updates its records so the same money cannot be spent again.',
      'That is useful: one organization coordinates the record, operates the service, and can provide support. The dependency is that you rely on that organization\'s systems, policies, and decisions. Centralized does not mean one lonely computer. Providers can have backups, multiple data centers, and strong safeguards. Fees and account rules also differ.',
      'Switch the diagram. What changes when several participants keep records rather than depending on one organization to control the ledger? That is our next question.',
    ],
    takeaway: 'A central keeper coordinates the ledger; users depend on that organization.',
    interaction: 'Toggle Central keeper and Shared ledger once. Ask students to identify who is responsible for checking updates in each diagram. Do not spend time discussing particular banks.',
    fallback: 'Describe the two diagrams: one coordinating organization versus multiple participants with ledger copies. In both, rules and operational safeguards still matter.',
    beats: [{ label: 'Explain the central ledger and its usefulness', seconds: 35 }, { label: 'Compare the two diagrams', seconds: 15 }, { label: 'Explain dependency without overgeneralizing', seconds: 25 }],
    sources: ['nist', 'bitcoin'],
  },
  {
    id: 3, title: 'A shared ledger', shortTitle: 'One ledger, many copies', speaker: 1, start: 145, duration: 80, theme: 'blue',
    script: [
      'A ledger is simply a record of transactions or events. A blockchain is a shared ledger whose records are grouped into linked blocks. Computers in the network keep and check copies according to agreed rules. A computer participating in the network is often called a node.',
      'Sharing the ledger is not the same as letting anyone change anything. Updates still have to satisfy the network\'s rules. Some networks are open: people can join by following the protocol. Others are permissioned: approved organizations take part.',
      'Switch between the two examples. Neither model makes the original information automatically true. And copies do not mean every computer has exactly the same view at every instant. Networks need a process for checking and agreeing on updates.',
    ],
    takeaway: 'A blockchain combines shared records, linked blocks, and rules for updates.',
    interaction: 'Toggle Open network and Permissioned network. Point to the ledger on each computer. Ask "Can anyone edit any record?" and answer no: access and update rules are separate questions.',
    fallback: 'Read the definition and describe several computers checking their ledger copies. Open networks allow participation under protocol rules; permissioned networks restrict participation.',
    beats: [{ label: 'Define ledger, blockchain, and node', seconds: 35 }, { label: 'Compare participation models', seconds: 20 }, { label: 'Explain why shared rules are still needed', seconds: 25 }],
    sources: ['nist'],
  },
  {
    id: 4, title: 'How agreement works', shortTitle: 'Same rules, same checks', speaker: 1, start: 225, duration: 75, theme: 'light',
    script: [
      'Imagine our classroom shares a record showing that Alex has ten tokens. Alex proposes sending seven to Sam. We check three rules: was it authorized by Alex, are enough tokens available, and have those tokens already been spent? This example passes. Fourteen tokens would fail the balance check.',
      'These checks illustrate transaction validity. Real consensus also decides which valid records are added and in what order. It is not a show of hands by every computer. Different networks have different roles and agreement mechanisms. A participant can keep a bad local copy; other computers do not magically overwrite it. They can reject invalid proposals under their rules.',
    ],
    takeaway: 'Participants check rules; consensus also determines the accepted order of records.',
    interaction: 'Show the 7-token proposal. Ask students to check the three rules, then click Check transaction. If time allows, select 14 tokens and check again. Reserve the last 10 seconds for the handoff.',
    fallback: 'With 10 available tokens, an authorized, unspent payment of 7 passes these classroom checks; a payment of 14 fails. This is a simplified rule-checking analogy, not live consensus.',
    beats: [{ label: 'Explain the example and network caveats', seconds: 45 }, { label: 'Check a transaction together', seconds: 20 }, { label: 'Speaker handoff', seconds: 10 }],
    handoff: 'We\'ve seen the problem and the shared-record idea. Next, let\'s look at where blockchains came from and how records get linked.',
    sources: ['nist', 'bitcoin'],
  },
  {
    id: 5, title: 'Before and after Bitcoin', shortTitle: 'Four moments in history', speaker: 2, start: 300, duration: 70, theme: 'dark',
    script: [
      'This story did not start with a coin. In 1991, Stuart Haber and W. Scott Stornetta published research on timestamping digital documents, using cryptographic links to help reveal later changes.',
      'In 2008, the Bitcoin paper appeared under the name Satoshi Nakamoto. Satoshi\'s identity is unknown; the name could represent a person or people. Bitcoin applied a combination of ideas to digital cash without a central payment keeper.',
      'In 2010, Laszlo Hanyecz exchanged ten thousand bitcoin for two pizzas, arranged by another person. We are not converting that historical amount into today\'s money. Finally, Ethereum launched in 2015, making a programmable blockchain platform available. These are milestones, not an investment story.',
    ],
    takeaway: 'Blockchain draws on earlier research; Bitcoin and Ethereum are important later milestones.',
    interaction: 'Reveal one milestone at a time as it is mentioned. Keep each reveal to one click. The years remain visible to give the timeline structure.',
    fallback: 'Read the four milestones in order: 1991 timestamping, 2008 Bitcoin paper, 2010 two pizzas for 10,000 bitcoin, and 2015 Ethereum launch. Reveal answer displays the entire timeline.',
    beats: [{ label: '1991 timestamping work', seconds: 15 }, { label: '2008 paper and unknown identity', seconds: 20 }, { label: '2010 pizza exchange', seconds: 20 }, { label: '2015 Ethereum launch', seconds: 15 }],
    sources: ['haber', 'bitcoin', 'satoshi', 'pizza', 'launch'],
  },
  {
    id: 6, title: 'What goes into a block?', shortTitle: 'A batch of records', speaker: 2, start: 370, duration: 70, theme: 'light',
    script: [
      'Think of a block as a batch of records, not a physical box. This classroom block contains a few example payments. A real network groups records in its own format.',
      'The block also contains information that links it to the previous block. Here we show a previous hash, a compact digital fingerprint. We will see how that works next. Networks may also include timestamps and other information for checking and agreement.',
      'Add the sample record. Notice that it joins the batch, while the reference points to the earlier block. This is only a diagram of a proposed block, not a payment broadcast to a network. The precise contents and structure of blocks vary by blockchain.',
    ],
    takeaway: 'A block holds a batch of records plus information connecting it to an earlier block.',
    interaction: 'Click Add a record once. Select the Link, Records, or Details labels to inspect the parts. Do not suggest that pressing the button finalizes a real block.',
    fallback: 'Read the labeled parts: the earlier block\'s hash, a batch of example transactions, and network-specific metadata. A third sample record can be added to the proposed batch.',
    beats: [{ label: 'Introduce the block diagram', seconds: 30 }, { label: 'Add and inspect a record', seconds: 15 }, { label: 'Explain the earlier-block link and network variation', seconds: 25 }],
    sources: ['nist'],
  },
  {
    id: 7, title: 'How hashes link the chain', shortTitle: 'Change a record, break a link', speaker: 2, start: 440, duration: 90, theme: 'blue',
    script: [
      'A hash is a fixed-length digital fingerprint calculated from data. With a secure hash function, even a small edit usually produces a very different result. Our demo calculates real SHA-256 hashes locally, but shows only their first eight characters.',
      'Each later block remembers the earlier block\'s fingerprint. Change the first payment from seven tokens to nine, then recalculate. Block one has a new fingerprint, but block two still points to the old one. The mismatch reveals the edit. The third block\'s immediate link still matches block two, but the earlier history is broken.',
      'Someone could recalculate links too. What makes an alternative history accepted depends on the network\'s consensus and security assumptions, not magical mathematics. Most importantly, hashing a false statement does not make it true.',
    ],
    takeaway: 'Hash links reveal changes; they do not certify truth or make rewriting mathematically impossible.',
    interaction: 'Edit the first transaction from 7 to 9, then click Recalculate hash. Point to the changed fingerprint and block two\'s unchanged reference. Reset activity restores the original three-block example.',
    fallback: 'Before: block two points to the hash of the 7-token record. After changing it to 9 and hashing again, block one changes but block two\'s reference does not. The link no longer matches.',
    beats: [{ label: 'Define a hash and read the chain', seconds: 30 }, { label: 'Edit, recalculate, and inspect the mismatch', seconds: 30 }, { label: 'Explain tamper evidence and its limits', seconds: 30 }],
    sources: ['nist', 'bitcoin'],
  },
  {
    id: 8, title: 'Who adds the next block?', shortTitle: 'Work or stake?', speaker: 2, start: 530, duration: 70, theme: 'light',
    script: [
      'Proof of work uses repeated computation to find a result meeting a difficulty target. That takes equipment and electricity. Other participants still check whether the proposed block follows the rules.',
      'Proof of stake uses validators who put assets at risk. Selected validators propose blocks; others check them. Certain actions can lead to penalties, depending on the network. Not every mistake deletes an entire stake.',
      'Both need incentives and verification. Both can face concentrated influence. These are simplified processes, not performance measurements or guarantees of fairness.',
    ],
    takeaway: 'Proof of work commits computing effort; proof of stake puts stake at risk under network rules.',
    interaction: 'Choose each mechanism once to reveal its simplified process. Avoid turning this into a debate about coin prices. Leave 10 seconds for the handoff.',
    fallback: 'Read both comparisons: work uses computing effort and electricity; stake uses validators and assets at risk. Validity checks still matter in both.',
    beats: [{ label: 'Explain both approaches', seconds: 40 }, { label: 'Reveal the two processes and compare', seconds: 20 }, { label: 'Speaker handoff', seconds: 10 }],
    handoff: 'Now that we know how records are added, let\'s look at a few things people build with them.',
    sources: ['nist', 'pow', 'pos'],
  },
  {
    id: 9, title: 'Smart contracts: code with conditions', shortTitle: 'If this, then that', speaker: 3, start: 600, duration: 75, theme: 'blue',
    script: [
      'A smart contract is code stored and run on a blockchain. When it is triggered, it follows programmed conditions. It is not a robot lawyer and does not have common sense.',
      'Think about a vending machine. Our fictional machine says: if at least two dollars have been inserted, release a snack. One dollar is not enough; two dollars meet the condition. A real vending machine is not a blockchain. The analogy just helps us understand conditional code.',
      'The code follows the rule even if someone thinks the price is unfair. A bug can also produce a bad result. Smart contracts do not independently decide whether their rules are wise, fair, or legally enforceable. And they need an action or transaction to run; they do not simply watch the world.',
    ],
    takeaway: 'A smart contract executes programmed conditions, not human judgment.',
    interaction: 'Choose $1 or $2, then click Run the rule. Ask what the code will do before showing the result. Limit the activity to two tries.',
    fallback: 'For the fictional $2 snack, $1 produces "not enough" and $2 produces "dispense." The condition does not assess fairness. Reveal answer shows the $2 outcome.',
    beats: [{ label: 'Define smart contracts and the analogy', seconds: 30 }, { label: 'Choose an input and run the rule', seconds: 20 }, { label: 'Explain triggers, bugs, and fairness', seconds: 25 }],
    sources: ['contracts', 'oracles'],
  },
  {
    id: 10, title: 'The outside-data problem', shortTitle: 'Code cannot see your flight', speaker: 3, start: 675, duration: 75, theme: 'light',
    script: [
      'Imagine a fictional flight-delay policy: if a reported delay is at least 120 minutes, the contract pays 50 simulated dollars. How could the blockchain know that a plane was late? It cannot independently look at an airport.',
      'It needs an external data source. An oracle is a bridge that brings outside information into a blockchain. Here the invented source is an airline status feed delivered by that bridge. All inputs and payouts on this slide are simulated, with no live connection.',
      'Choose an input and reveal the outcome. A 150-minute report meets the condition; an on-time report does not. Missing data leaves the contract waiting. A wrong report can cause a wrong result even when the code works exactly as written. We still have to trust and check the source.',
    ],
    takeaway: 'Blockchain code depends on outside sources for facts about the outside world.',
    interaction: 'Select On time, Delayed, or No data, then Reveal outcome. Point to the airline feed and define oracle. Use only one or two scenarios to stay on time.',
    fallback: 'Read the simulated cases: 0 minutes gives $0; 150 minutes gives $50; missing data gives no decision. An oracle supplies the report, not independent proof of the flight.',
    beats: [{ label: 'Introduce the fictional policy and oracle', seconds: 30 }, { label: 'Select a report and reveal the payout', seconds: 20 }, { label: 'Explain wrong inputs and missing data', seconds: 25 }],
    sources: ['contracts', 'oracles'],
  },
  {
    id: 11, title: 'Supply-chain traceability', shortTitle: 'Follow the mango', speaker: 3, start: 750, duration: 80, theme: 'light',
    script: [
      'Walmart reported a mango traceability pilot in its 2018 responsibility report. Tracing a package with existing methods took six days, 18 hours, and 26 minutes. In the blockchain pilot, retrieving the path back to its origin took 2.2 seconds.',
      'That is a report about retrieving records in this pilot, not a universal blockchain speed test. It does not show that a blockchain was the only possible way to improve the process, or that every original entry was accurate.',
      'The diagram below is our invented example, not Walmart\'s actual records. The farm enters a lot, the packer links a package, the shipper records a handoff, and the store logs arrival. Select the incorrect input. A wrong lot number can be preserved very reliably. Checking real-world inputs still matters.',
    ],
    takeaway: 'Shared traceability can help find records faster; record accuracy still depends on people and processes.',
    interaction: 'Read the reported times on the shared, linear 0-7 day axis. The 2.2-second pilot result is a dot near zero, not an enlarged bar. Select one or two supply-chain participants, then choose Incorrect input. Keep these fictional records separate from the reported pilot results.',
    fallback: 'Read the reported times. Describe farm, packer, shipper, and store supplying their own records. A typo such as M140 instead of M104 remains a mistake even if its later alteration would be detectable.',
    beats: [{ label: 'Explain the sourced pilot comparison', seconds: 30 }, { label: 'Explore contributors and a wrong input', seconds: 25 }, { label: 'Separate retrieval speed from truth and causation', seconds: 25 }],
    sources: ['walmart', 'nist'],
  },
  {
    id: 12, title: 'Digital credentials', shortTitle: 'Check the credential', speaker: 3, start: 830, duration: 70, theme: 'dark',
    script: [
      'An issuer can digitally sign a credential. Using its public key, a verifier checks for changes. MIT offers Blockcerts digital diplomas. Our certificate is fictional: it uses a real local signature, not the full Blockcerts process.',
      'Verify, alter one letter, and verify again. The edited credential fails. A valid signature still requires trusting the issuer and knowing whose key it is. Keep your credential and access information. MIT offers reissuance if access is lost.',
    ],
    takeaway: 'Signatures help check integrity and issuer identity; trust and access are still needed.',
    interaction: 'Click Verify signature, then Alter one character, then Verify signature again. The certificate is from fictional Classroom Academy, never MIT. Reserve the last 10 seconds for the handoff.',
    fallback: 'The original Alex Morgan credential passes the sample signature check. Changing one character without obtaining a new signature fails. The issuer still needs to be trusted.',
    beats: [{ label: 'Explain the real example and verification limits', seconds: 35 }, { label: 'Verify, alter, and verify again', seconds: 25 }, { label: 'Speaker handoff', seconds: 10 }],
    handoff: 'These examples show what shared records can help with. They also leave us with a question: what do we give up?',
    sources: ['mit', 'blockcerts', 'nist'],
  },
  {
    id: 13, title: 'What you gain; what you give up', shortTitle: 'No free guarantees', speaker: 4, start: 900, duration: 70, theme: 'blue',
    script: [
      'A blockchain may help several organizations work from shared records. Hash links and verification can also provide tamper evidence: signs that data has changed. Those are potential benefits, not automatic guarantees.',
      'There are costs. Participants must coordinate rules and operations. Sharing records can create privacy concerns. Governance means deciding who can change the rules and how disagreements are resolved. Correcting a mistake may require a new transaction or a coordinated process rather than quietly editing an old entry.',
      'Select one trade-off. Ask: who would be responsible for this in a school or business? A system is not good simply because it is decentralized or difficult to edit. We need to compare benefits and responsibilities for a specific problem.',
    ],
    takeaway: 'Potential benefits must be weighed against coordination, privacy, governance, and correction costs.',
    interaction: 'Choose one potential benefit and one trade-off to reveal explanations. Take one brief student response about who would own the responsibility.',
    fallback: 'Read the two benefit labels and the four trade-offs. Shared records may reduce reconciliation, but rules, privacy choices, governance, and correction procedures still require work.',
    beats: [{ label: 'Explain potential benefits', seconds: 25 }, { label: 'Select and discuss a trade-off', seconds: 20 }, { label: 'Compare benefits with responsibilities', seconds: 25 }],
    sources: ['nist'],
  },
  {
    id: 14, title: 'Is blockchain the right tool?', shortTitle: 'Ask before you build', speaker: 4, start: 970, duration: 65, theme: 'light',
    script: [
      'Start with the problem. Do multiple parties need to share and verify records? If not, a simpler record keeper may be enough. Do they need one shared system? Sometimes exchanging signed records is enough.',
      'Would a regular database work? A trusted operator may be the straightforward choice. If not, blockchain is a candidate to compare, not an automatic answer.',
      'Try a fictional school equipment register. Who writes records, checks them, corrects mistakes, and changes rules? Compare privacy, cost, and coordination with other designs. Neither technology has a universal speed advantage.',
    ],
    takeaway: 'Compare blockchain with a regular database and other ways to solve the same problem.',
    interaction: 'Answer the three questions with the audience using one fictional scenario. A No answer can end the path early. Reset lets the presenter try another path.',
    fallback: 'A single-party record often needs no blockchain. Several parties may exchange signed records. If a regular database meets the needs, use it. Otherwise evaluate blockchain and its trade-offs, rather than assuming it wins.',
    beats: [{ label: 'Introduce the decision questions', seconds: 25 }, { label: 'Follow one path through the diagram', seconds: 20 }, { label: 'Explain why a candidate is not a verdict', seconds: 20 }],
    sources: ['nist'],
  },
  {
    id: 15, title: 'The lost-key dilemma', shortTitle: 'What if you lose the key?', speaker: 4, start: 1035, duration: 105, theme: 'dark',
    script: [
      'Stefan Thomas has said he cannot access a wallet containing 7,002 bitcoin because he lost the password to an encrypted IronKey device. WIRED reported in 2023 that he had used eight of ten password attempts. We are reporting that account, not claiming to know his current access status.',
      'The device stores wallet keys, the secret information used to authorize spending. The bitcoin is not a file of coins inside the USB device. This is not a standard blockchain account with a central forgot-password button. The article also discusses recovery research, so we should not claim recovery is mathematically impossible.',
      'Teacher, choose between two fictional wallet designs. Provider-assisted recovery can offer help, but makes you depend on the provider\'s security and policies. Self-managed keys give you direct control, but make safe backups and recovery planning your responsibility. Neither choice removes risk; it moves responsibility.',
    ],
    takeaway: 'Recovery design shifts responsibility and trust; self-management is not effortless safety.',
    interaction: 'Give the teacher up to 10 seconds to choose Provider-assisted recovery or Self-managed keys. Click that option, reveal its trade-off, and briefly show the other. If the teacher is unavailable, choose the provider model yourself.',
    fallback: 'Read both fictional designs: provider assistance adds a recovery path and provider dependence; self-managed keys give control but make backup and recovery the owner\'s responsibility. Explain the device-password and wallet-key distinction.',
    beats: [{ label: 'Tell the carefully attributed IronKey story', seconds: 35 }, { label: 'Explain device passwords versus wallet keys', seconds: 20 }, { label: 'Teacher chooses a fictional design', seconds: 20 }, { label: 'Reveal and compare both trade-offs', seconds: 30 }],
    sources: ['wired', 'nist'],
  },
  {
    id: 16, title: 'Choose the tool for the problem', shortTitle: 'Shared records, real trade-offs', speaker: 4, start: 1140, duration: 60, theme: 'blue',
    script: [
      'Here are the four ideas to take away. One: a blockchain is a shared record maintained by multiple participants. Two: they follow agreed rules to check updates. Three: linked records can make some changes easier to detect. Four: the system still needs trustworthy inputs, sensible governance, and people who manage their responsibilities.',
      'It does not make false inputs true. It does not remove every need for trust. Sometimes a shared blockchain is useful; sometimes a regular database or another design is a better fit. The goal is to solve a real problem, not to add blockchain to everything.',
      'Does this problem need a shared ledger, and are its trade-offs worth it?',
    ],
    takeaway: 'Choose blockchain only when the shared-record benefits justify its trade-offs.',
    interaction: 'Reveal the four takeaways in order, one click at a time. Keep the closing question visible. Finish on the question at 20:00; extended discussion happens after the timed talk.',
    fallback: 'Read all four takeaways from this guide, then leave the closing question visible. Reveal answer shows all four at once.',
    beats: [{ label: 'Reveal and summarize four takeaways', seconds: 35 }, { label: 'State the limitations and tool choice', seconds: 15 }, { label: 'Read the closing question and finish', seconds: 10 }],
    sources: ['nist'],
  },
];

export const TOTAL_SECONDS = 1200;
export const formatTime = (seconds: number) => `${Math.floor(Math.max(0, seconds) / 60)}:${String(Math.floor(Math.max(0, seconds) % 60)).padStart(2, '0')}`;
export const timeRange = (slide: SlideData) => `${formatTime(slide.start)} - ${formatTime(slide.start + slide.duration)}`;

if (slides.length !== 16 || slides.reduce((sum, slide) => sum + slide.duration, 0) !== TOTAL_SECONDS) {
  throw new Error('The deck must have exactly 16 slides and a 20-minute schedule.');
}
for (const slide of slides) {
  if (slide.beats.reduce((sum, beat) => sum + beat.seconds, 0) !== slide.duration) {
    throw new Error(`Slide ${slide.id} has an inconsistent timing budget.`);
  }
}
