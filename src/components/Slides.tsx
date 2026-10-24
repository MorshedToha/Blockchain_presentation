import { useState, type ReactNode, type RefObject } from 'react';
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, Check, CircleCheck,
  Copy, Database, FileCheck2, Fingerprint, KeyRound, Link2,
  Plus, ShieldCheck, X, Zap,
} from 'lucide-react';
import { mangoTiming, sources, tpsBenchmarks } from '../data/deck';
import { firstRecord, hash, originalHash, secondHash, shortHash, signaturePreview, thirdHash, verifyCredential } from '../utils/crypto';
import { SlideNavigationProvider, useSlideNavigation, type SlideNavigation, type StepAvailability } from './SlideNavigation';

type ActivityProps = { revealed: boolean };

function Topline({ chapter, label = 'A classroom field guide' }: { chapter: string; label?: string }) {
  return <div className="slide-topline"><span>BLOCKCHAIN<span className="topline-slash">/</span>{chapter}</span><span>{label}</span></div>;
}

function Footline({ number, children }: { number: number; children: ReactNode }) {
  return <div className="slide-footline"><span className="slide-footnote"><ArrowUpRight size={30} strokeWidth={1.4} />{children}</span><span className="slide-folio">{String(number).padStart(2, '0')}</span></div>;
}

function Action({ children, onClick, disabled = false, secondary = false, className = '' }: { children: ReactNode; onClick: () => void; disabled?: boolean; secondary?: boolean; className?: string }) {
  return <button type="button" className={`slide-action ${secondary ? 'secondary' : ''} ${className}`} onClick={onClick} disabled={disabled}>{children}</button>;
}

function Citation({ id, children }: { id: string; children?: ReactNode }) {
  const source = sources.find((item) => item.id === id)!;
  return <a className="citation" href={source.url} target="_blank" rel="noreferrer">{children || source.title}<ArrowUpRight size={17} /></a>;
}

function MoneyNote({ small = false }: { small?: boolean }) {
  return <svg className={small ? 'money-note small' : 'money-note'} viewBox="0 0 380 192" role="img" aria-label="Illustrative ten-dollar digital token">
    <rect x="2" y="2" width="376" height="188" fill="currentColor" />
    <rect x="13" y="13" width="354" height="166" fill="none" stroke="var(--blue)" strokeWidth="1.5" />
    <path d="M13 39Q39 39 39 13M341 13Q341 39 367 39M367 153Q341 153 341 179M39 179Q39 153 13 153" fill="none" stroke="var(--blue)" strokeWidth="1.5" />
    <text x="45" y="69" fill="var(--blue)" fontSize="33" fontWeight="500">$</text>
    <text x="190" y="139" textAnchor="middle" fill="var(--blue)" fontSize="145" fontWeight="650" letterSpacing="-11">10</text>
    <text x="315" y="160" fill="var(--blue)" fontSize="20" fontWeight="600">10</text>
    <path d="M47 123v26m7-34v34m7-43v43m7-54v54m7-41v41" stroke="var(--blue)" strokeWidth="1.4" />
  </svg>;
}

function Intro({ revealed }: ActivityProps) {
  const [copied, setCopied] = useState(false);
  const [payment, setPayment] = useState<'Alex' | 'Sam' | null>(null);
  const isCopied = copied || revealed;
  const selected = revealed ? 'Alex' : payment;
  useSlideNavigation(
    revealed || payment ? null : !copied
      ? { label: 'Copy the $10', run: () => setCopied(true) }
      : { label: 'Count Alex\'s payment in the example', run: () => setPayment('Alex') },
    revealed ? null : payment ? () => setPayment(null) : copied ? () => setCopied(false) : null,
  );
  return <div className="slide-inner intro-slide theme-dark">
    <div className="intro-blue" />
    <Topline chapter="THE PROBLEM" label="01 / Start with a question" />
    <div className="intro-copy">
      <div className="eyebrow"><span className="little-line" /> BEYOND THE HYPE</div>
      <h1>CAN DIGITAL<br />MONEY BE<br />COPIED<span className="blue-question">?</span></h1>
      <p className="intro-description">Copying a photo is easy.<br />Spending the same money twice is a problem.</p>
      <div className="intro-action-area">
        {!isCopied ? <Action onClick={() => setCopied(true)}><Copy size={23} />Copy the $10<ArrowRight size={25} /></Action> : <div className="intro-result" aria-live="polite"><span className="result-rule" />{selected ? <><strong>One payment counts.</strong><span>A copy does not create more money.</span></> : <><strong>Two copies. Still just $10.</strong><span>Which payment should count?</span></>}</div>}
      </div>
    </div>
    <div className={`token-stage ${isCopied ? 'is-copied' : ''}`}>
      <div className="diagram-caption">YOUR DIGITAL WALLET</div>
      <div className="note-outline" aria-hidden="true" />
      <div className="original-note"><MoneyNote /></div>
      <div className="balance-caption">Available balance <strong>$10</strong></div>
      <svg className="fork-lines" viewBox="0 0 540 146" aria-hidden="true"><path d="M270 0V62M120 133V62H420V133" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="m111 123 9 10 9-10m282 0 9 10 9-10" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
      <div className="payment-options">
        {(['Alex', 'Sam'] as const).map((name) => <button type="button" key={name} disabled={!isCopied || !!selected} onClick={() => setPayment(name)} className={`payment-option ${selected === name ? 'counts' : ''} ${selected && selected !== name ? 'rejected' : ''}`}>
          <span className="payment-label">PAYMENT {name === 'Alex' ? 'A' : 'B'}</span>
          <span className="payment-amount">$10{selected && (selected === name ? <Check size={29} /> : <X size={29} />)}</span>
          <span className="payment-name">To {name}</span>
          <span className="payment-state">{selected ? selected === name ? 'Counted in this example' : 'Already spent' : isCopied ? 'Choose this payment' : 'Waiting for a copy'}</span>
        </button>)}
      </div>
      <div className="token-prompt">{selected ? 'A RECORD + RULES DECIDE.' : 'SAME MONEY. TWO PAYMENT ATTEMPTS.'}</div>
    </div>
    <Footline number={1}><span>The double-spending problem</span><span className="intro-simulation">Classroom simulation. Not real money.</span></Footline>
  </div>;
}

function Computer({ x, y, label, ledger = true }: { x: number; y: number; label: string; ledger?: boolean }) {
  return <g transform={`translate(${x},${y})`}>
    <rect x="-61" y="-42" width="122" height="84" rx="2" fill="var(--diagram-bg)" stroke="currentColor" strokeWidth="2" />
    <path d="M-76 49H76L61 42H-61Z" fill="var(--diagram-bg)" stroke="currentColor" strokeWidth="2" />
    {ledger ? <><path d="M-29-21H29M-29-7H29M-29 7H12M-29 21H29" stroke="currentColor" strokeWidth="3" /><path d="m20 7 7 7 12-14" stroke="currentColor" strokeWidth="2" fill="none" /></> : <><circle cx="0" cy="-11" r="12" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M-22 25q0-23 22-23t22 23" fill="none" stroke="currentColor" strokeWidth="2" /></>}
    <text y="82" textAnchor="middle" fill="currentColor" fontSize="20" fontWeight="500">{label}</text>
  </g>;
}

function NetworkDiagram({ distributed, permissioned = false }: { distributed: boolean; permissioned?: boolean }) {
  return <svg className="network-diagram" viewBox="0 0 710 450" role="img" aria-label={distributed ? 'Simplified network: five participants with ledger copies connected to each other' : 'Simplified network: users depend on a central payment provider'}>
    {distributed ? <>
      <g className="network-edges" fill="none" stroke="currentColor" strokeWidth="1.5" opacity=".55"><path d="M130 105H560L610 310H110ZM130 105 355 315 560 105M110 310H610M130 105 610 310M560 105 110 310" /></g>
      <Computer x={130} y={105} label={permissioned ? 'Approved A' : 'Participant A'} />
      <Computer x={560} y={105} label={permissioned ? 'Approved B' : 'Participant B'} />
      <Computer x={110} y={310} label={permissioned ? 'Approved C' : 'Participant C'} />
      <Computer x={355} y={315} label={permissioned ? 'Approved D' : 'Participant D'} />
      <Computer x={610} y={310} label={permissioned ? 'Approved E' : 'Participant E'} />
      <text x="355" y="190" textAnchor="middle" fill="currentColor" fontSize="19" fontWeight="600" letterSpacing="2">SHARED RULES</text>
    </> : <>
      <g fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M118 100 355 220 592 100M118 345 355 220 592 345" /></g>
      <Computer x={118} y={100} label="You" ledger={false} />
      <Computer x={592} y={100} label="Alex" ledger={false} />
      <Computer x={118} y={345} label="Sam" ledger={false} />
      <Computer x={592} y={345} label="Other customers" ledger={false} />
      <circle cx="355" cy="220" r="94" fill="var(--blue)" />
      <path d="m323 197 32-20 32 20ZM328 204v30m18-30v30m18-30v30m18-30v30m-63 8h72" fill="none" stroke="white" strokeWidth="2.5" />
      <text x="355" y="268" textAnchor="middle" fontSize="18" fontWeight="600" fill="white">RECORD KEEPER</text>
    </>}
  </svg>;
}

function CentralKeeper({ revealed }: ActivityProps) {
  const [distributed, setDistributed] = useState(false);
  const shared = revealed || distributed;
  useSlideNavigation(
    shared ? null : { label: 'Compare the shared ledger', run: () => setDistributed(true) },
    !revealed && distributed ? () => setDistributed(false) : null,
  );
  return <div className="slide-inner theme-light">
    <Topline chapter="THE PROBLEM" label="Illustrative example" />
    <div className="two-column-slide central-layout">
      <div className="editorial-copy"><h2>ONE RECORD.<br /><span className="text-blue">ONE KEEPER.</span></h2><p className="lead">A bank or payment provider<br />checks and updates the record.</p>
        <div className="plain-insight"><span>THE USEFUL PART</span><p>One organization coordinates.</p></div><div className="plain-insight"><span>THE DEPENDENCY</span><p>You rely on its systems and policies.</p></div>
      </div>
      <div className="network-area"><div className="segmented-control"><button aria-pressed={!shared} onClick={() => setDistributed(false)} disabled={revealed}>Central keeper</button><button aria-pressed={shared} onClick={() => setDistributed(true)}>Shared ledger</button></div><NetworkDiagram distributed={shared} /><p className="diagram-note" aria-live="polite">{shared ? 'Several participants keep and check ledger copies.' : 'One organization can still operate many computers and backups.'}</p></div>
    </div>
    <Footline number={2}>Centralized does not mean a single computer.</Footline>
  </div>;
}

function SharedLedger({ revealed }: ActivityProps) {
  const [permissioned, setPermissioned] = useState(false);
  const restricted = revealed || permissioned;
  useSlideNavigation(
    restricted ? null : { label: 'Show permissioned participation', run: () => setPermissioned(true) },
    !revealed && permissioned ? () => setPermissioned(false) : null,
  );
  return <div className="slide-inner theme-blue">
    <Topline chapter="THE SHARED LEDGER" label="Simplified network diagram" />
    <div className="two-column-slide shared-layout"><div className="editorial-copy"><h2>ONE LEDGER.<br />MANY COPIES.</h2><p className="lead">A shared record, grouped into linked blocks.<br />Participants follow rules to check updates.</p><div className="definition"><span>LEDGER</span><p>A record of transactions or events.</p></div><div className="definition"><span>NODE</span><p>A participating computer.</p></div></div>
      <div className="network-area"><NetworkDiagram distributed permissioned={restricted} /><div className="segmented-control inverted"><button aria-pressed={!restricted} onClick={() => setPermissioned(false)} disabled={revealed}>Open network</button><button aria-pressed={restricted} onClick={() => setPermissioned(true)}>Permissioned network</button></div><p className="diagram-note" aria-live="polite">{restricted ? 'Participation is limited to approved members.' : 'Anyone can participate under the network\'s rules.'}</p></div>
    </div><Footline number={3}>Shared does not mean anyone can change anything.</Footline>
  </div>;
}

function Agreement({ revealed }: ActivityProps) {
  const [amount, setAmount] = useState(7);
  const [checked, setChecked] = useState(false);
  const complete = checked || revealed;
  const valid = amount <= 10;
  useSlideNavigation(
    revealed ? null : !checked
      ? { label: 'Check the proposed transaction', run: () => setChecked(true) }
      : valid
        ? { label: 'Try a payment of 14 tokens', run: () => { setAmount(14); setChecked(false); } }
        : null,
    revealed ? null : checked
      ? () => setChecked(false)
      : amount !== 7 ? () => { setAmount(7); setChecked(true); } : null,
  );
  return <div className="slide-inner theme-light">
    <Topline chapter="THE SHARED LEDGER" label="Classroom simulation" />
    <h2 className="wide-heading">SAME RULES.<br /><span className="text-blue">SAME CHECKS.</span></h2>
    <div className="agreement-content"><div className="transaction-proposal"><div className="eyebrow">ALEX HAS 10 TOKENS</div><div className="transaction-number">{amount}<ArrowRight size={85} strokeWidth={1.2} /><span>SAM</span></div><p>Alex proposes a payment.</p><div className="segmented-control"><button aria-pressed={amount === 7} onClick={() => { setAmount(7); setChecked(false); }}>Send 7 tokens</button><button aria-pressed={amount === 14} onClick={() => { setAmount(14); setChecked(false); }}>Send 14 tokens</button></div></div>
      <div className="rule-list">{['Authorized by Alex?', 'Enough tokens?', 'Not already spent?'].map((rule, i) => <div key={rule} className={`rule-row ${complete ? 'is-checked' : ''}`}><span className="rule-index">0{i + 1}</span><span>{rule}</span><span className="check-space">{complete ? (i === 1 && !valid ? <X size={32} /> : <Check size={32} />) : <span className="empty-check" />}</span></div>)}<div className="rule-result" aria-live="polite">{complete ? <><strong>{valid ? 'Passes these checks.' : 'Rejected: not enough tokens.'}</strong><span>Consensus also determines the accepted order.</span></> : <Action onClick={() => setChecked(true)}>Check transaction<ArrowRight size={24} /></Action>}</div></div>
    </div><Footline number={4}>A rule-checking analogy, not a vote by every computer.</Footline>
  </div>;
}

const milestones = [
  { year: '1991', title: 'Linked timestamps', text: 'Stuart Haber & W. Scott Stornetta', id: 'haber' },
  { year: '2008', title: 'The Bitcoin paper', text: 'Satoshi Nakamoto. Identity unknown.', id: 'bitcoin' },
  { year: '2010', title: '10,000 bitcoin. 2 pizzas.', text: 'Laszlo Hanyecz makes the exchange.', id: 'pizza' },
  { year: '2015', title: 'Ethereum launches', text: 'A programmable blockchain platform.', id: 'launch' },
];

function History({ revealed }: ActivityProps) {
  const [count, setCount] = useState(1);
  const visible = revealed ? 4 : count;
  useSlideNavigation(
    visible < 4 ? { label: `Reveal the ${milestones[count].year} milestone`, run: () => setCount((value) => Math.min(4, value + 1)) } : null,
    !revealed && count > 1 ? () => setCount((value) => value - 1) : null,
  );
  return <div className="slide-inner theme-dark history-slide">
    <Topline chapter="INSIDE THE CHAIN" label="Four moments, not the whole history" />
    <h2 className="wide-heading">NOT AN<br /><span className="text-blue">OVERNIGHT IDEA.</span></h2>
    <div className="history-timeline">{milestones.map((milestone, i) => <div key={milestone.year} className={`milestone ${i < visible ? 'is-visible' : ''}`}><div className="year">{milestone.year}</div><div className="timeline-line"><span /></div><div className="milestone-content" aria-hidden={i >= visible}><h3>{milestone.title}</h3><p>{milestone.text}</p></div></div>)}</div>
    <div className="history-controls"><Action onClick={() => setCount(Math.min(4, count + 1))} disabled={visible === 4}>{visible === 4 ? 'Timeline complete' : 'Next milestone'}{visible === 4 ? <Check size={24} /> : <ArrowRight size={24} />}</Action><span>{visible} / 4 MILESTONES</span></div>
    <Footline number={5}><span>Sources: original papers, pizza forum & Ethereum launch announcement.</span></Footline>
  </div>;
}

function BlockContents({ revealed }: ActivityProps) {
  const [added, setAdded] = useState(false);
  const [part, setPart] = useState('records');
  const hasRecord = revealed || added;
  const detail = part === 'link' ? 'A fingerprint of the earlier block connects the history.' : part === 'details' ? 'Timestamps and other metadata depend on the network.' : 'A batch groups several records into one proposed block.';
  useSlideNavigation(
    revealed ? null : !added
      ? { label: 'Add a record to the block', run: () => { setAdded(true); setPart('records'); } }
      : part === 'records'
        ? { label: 'Inspect the link to the earlier block', run: () => setPart('link') }
        : part === 'link' ? { label: 'Inspect network-specific details', run: () => setPart('details') } : null,
    revealed ? null : part === 'details'
      ? () => setPart('link')
      : part === 'link' ? () => setPart('records') : added ? () => setAdded(false) : null,
  );
  return <div className="slide-inner theme-light">
    <Topline chapter="INSIDE THE CHAIN" label="Classroom simulation" />
    <div className="two-column-slide block-layout"><div className="editorial-copy"><h2>A BLOCK<br />IS A <span className="text-blue">BATCH.</span></h2><p className="lead">Records, plus information<br />that links them to the past.</p><Action onClick={() => setAdded(true)} disabled={hasRecord}><Plus size={24} />{hasRecord ? 'Record added' : 'Add a record'}</Action><p className="small-explainer" aria-live="polite">{detail}</p></div>
      <div className="block-anatomy"><div className="anatomy-heading"><span>PROPOSED BLOCK</span><strong>002</strong></div><button onClick={() => setPart('link')} aria-pressed={part === 'link'} className="anatomy-row"><span className="anatomy-label"><Link2 size={24} />LINK TO EARLIER BLOCK</span><code>PREVIOUS HASH: 18C4...7F20</code></button><button onClick={() => setPart('records')} aria-pressed={part === 'records'} className="anatomy-row records-row"><span className="anatomy-label"><Database size={24} />RECORDS</span><span className="sample-record"><span>Alex <ArrowRight size={21} /> Sam</span><b>7 tokens</b></span><span className="sample-record"><span>Sam <ArrowRight size={21} /> Jo</span><b>2 tokens</b></span>{hasRecord && <span className="sample-record new-record"><span>Jo <ArrowRight size={21} /> Lee</span><b>1 token</b></span>}</button><button onClick={() => setPart('details')} aria-pressed={part === 'details'} className="anatomy-row"><span className="anatomy-label">NETWORK-SPECIFIC DETAILS</span><span>Example timestamp: 09:41</span></button></div>
    </div><Footline number={6}>A simplified proposed block. Exact contents vary by network.</Footline>
  </div>;
}

function HashChain({ revealed }: ActivityProps) {
  const [amount, setAmount] = useState('7');
  const [calculated, setCalculated] = useState('7');
  const shownAmount = revealed ? '9' : amount;
  const hashAmount = revealed ? '9' : calculated;
  const currentHash = hash(firstRecord(hashAmount));
  const broken = currentHash !== originalHash;
  const pending = shownAmount !== hashAmount;
  const validAmount = amount !== '' && Number(amount) >= 1 && Number(amount) <= 99;
  useSlideNavigation(
    revealed ? null : pending && validAmount
      ? { label: 'Recalculate the edited block\'s hash', run: () => setCalculated(amount) }
      : !validAmount || !broken
        ? { label: 'Change the first payment to 9 tokens', run: () => setAmount('9') }
        : null,
    revealed ? null : pending
      ? () => setAmount(calculated)
      : broken ? () => setCalculated('7') : null,
  );
  return <div className="slide-inner theme-blue hash-slide">
    <Topline chapter="INSIDE THE CHAIN" label="Classroom simulation / hashes calculated locally" />
    <h2 className="wide-heading">CHANGE A RECORD.<br />BREAK A LINK.</h2>
    <p className="hash-definition">A hash is a digital fingerprint calculated from data.</p>
    <div className="hash-chain">
      <div className={`hash-block ${pending ? 'pending' : ''}`}><div className="hash-block-header"><span>BLOCK</span><strong>01</strong></div><div className="hash-record"><label htmlFor="hash-amount">Alex pays Sam</label><div className="amount-input"><input id="hash-amount" aria-label="Tokens in block one" type="number" min="1" max="99" value={shownAmount} disabled={revealed} onChange={(event) => setAmount(event.target.value)} /><span>tokens</span></div></div><div className="hash-field"><span>THIS BLOCK'S HASH {pending && '(STALE)'}</span><code>{shortHash(currentHash)}</code></div></div>
      <div className={`hash-connector ${broken ? 'broken' : ''}`}><ArrowRight size={42} strokeWidth={1.5} /><span>{broken ? <X size={22} /> : <Check size={22} />}</span></div>
      <div className={`hash-block ${broken ? 'broken-block' : ''}`}><div className="hash-block-header"><span>BLOCK</span><strong>02</strong></div><div className="previous-field"><span>PREVIOUS HASH</span><code>{shortHash(originalHash)}</code><small>{broken ? 'Still points to the OLD value' : 'Matches block 01'}</small></div><div className="hash-field"><span>THIS BLOCK'S HASH</span><code>{shortHash(secondHash)}</code></div></div>
      <div className="hash-connector"><ArrowRight size={42} strokeWidth={1.5} /><span><Check size={22} /></span></div>
      <div className="hash-block"><div className="hash-block-header"><span>BLOCK</span><strong>03</strong></div><div className="previous-field"><span>PREVIOUS HASH</span><code>{shortHash(secondHash)}</code><small>Local link still matches block 02</small></div><div className="hash-field"><span>THIS BLOCK'S HASH</span><code>{shortHash(thirdHash)}</code></div></div>
    </div>
    <div className="hash-bottom"><Action onClick={() => setCalculated(amount)} disabled={!pending || !amount || Number(amount) < 1 || Number(amount) > 99}><Fingerprint size={25} />Recalculate hash</Action><p aria-live="polite">{pending ? 'The record changed. Recalculate its fingerprint.' : broken ? 'Link mismatch. Block 02 remembers a different history.' : 'Try changing 7 to 9 in block 01.'}</p></div>
    <Footline number={7}>Hashes reveal changes, not truth. SHA-256; first 8 characters shown.</Footline>
  </div>;
}

function Consensus({ revealed }: ActivityProps) {
  const [mode, setMode] = useState<'work' | 'stake' | null>(null);
  const selected = revealed ? 'stake' : mode;
  useSlideNavigation(
    revealed || mode === 'stake' ? null : mode === null
      ? { label: 'Reveal the proof-of-work process', run: () => setMode('work') }
      : { label: 'Reveal the proof-of-stake process', run: () => setMode('stake') },
    revealed || mode === null ? null : () => setMode(mode === 'stake' ? 'work' : null),
  );
  return <div className="slide-inner theme-light consensus-slide">
    <Topline chapter="INSIDE THE CHAIN" label="Simplified processes, not performance measurements" />
    <h2 className="wide-heading">WHO ADDS<br /><span className="text-blue">THE NEXT BLOCK?</span></h2>
    <div className="consensus-options"><button className={`consensus-option ${selected === 'work' ? 'selected' : ''}`} aria-pressed={selected === 'work'} onClick={() => setMode('work')}><div className="consensus-label"><span>01</span><Zap size={37} strokeWidth={1.4} /></div><h3>PROOF OF WORK</h3><p>Computing effort + electricity</p><span className="select-process">Explore the process <ArrowUpRight size={24} /></span></button><button className={`consensus-option ${selected === 'stake' ? 'selected' : ''}`} aria-pressed={selected === 'stake'} onClick={() => setMode('stake')}><div className="consensus-label"><span>02</span><ShieldCheck size={37} strokeWidth={1.4} /></div><h3>PROOF OF STAKE</h3><p>Validators + stake at risk</p><span className="select-process">Explore the process <ArrowUpRight size={24} /></span></button></div>
    <div className="consensus-process" aria-live="polite">{selected ? <><div className="process-line">{selected === 'work' ? <><span>Try many hashes</span><ArrowRight /><span>Propose a valid block</span><ArrowRight /><span>Others check</span></> : <><span>Commit stake</span><ArrowRight /><span>Selected validator proposes</span><ArrowRight /><span>Others check</span></>}</div><p>{selected === 'work' ? 'The work uses electricity. A proposal still has to meet the rules.' : 'Penalties depend on network rules; not every error deletes a stake.'}</p></> : <p>Choose a mechanism to see how a block is proposed.</p>}</div>
    {selected && <div className="consensus-benchmark" aria-live="polite">
      <div className="benchmark-badge">{selected === 'work' ? 'ENERGY INTENSIVE' : 'EST. ~99.95% POWER DROP'}</div>
      <p>{selected === 'work' ? 'Bitcoin PoW consumes estimated multi-terawatt-hours of electricity globally for computational hashing.' : 'Ethereum The Merge (Sept 2022) replaced PoW with PoS, documented to reduce power consumption by ~99.95%.'}</p>
      <Citation id={selected === 'work' ? 'pow' : 'ccri'}>{selected === 'work' ? 'NIST / PoW' : 'CCRI (2022)'}</Citation>
    </div>}
    <Footline number={8}>Both rely on rules, incentives, and checks. Neither is a guarantee.</Footline>
  </div>;
}

function SmartContract({ revealed }: ActivityProps) {
  const [amount, setAmount] = useState(1);
  const [run, setRun] = useState(false);
  const inserted = revealed ? 2 : amount;
  const complete = run || revealed;
  useSlideNavigation(
    revealed ? null : !run
      ? { label: 'Run the vending-machine rule', run: () => setRun(true) }
      : amount < 2 ? { label: 'Try inserting $2', run: () => { setAmount(2); setRun(false); } } : null,
    revealed ? null : run
      ? () => setRun(false)
      : amount === 2 ? () => { setAmount(1); setRun(true); } : null,
  );
  return <div className="slide-inner theme-blue smart-slide">
    <Topline chapter="BEYOND THE CURRENCY" label="Classroom simulation / vending-machine analogy" />
    <div className="two-column-slide smart-layout"><div className="editorial-copy"><h2>IF THIS.<br />THEN THAT.</h2><p className="lead">Smart contracts are code on a blockchain.<br />When triggered, they follow conditions.</p><div className="condition-code"><span>IF</span> payment is at least $2<br /><span>THEN</span> release a snack</div><div className="smart-actions"><div className="segmented-control inverted"><button aria-pressed={inserted === 1} onClick={() => { setAmount(1); setRun(false); }} disabled={revealed}>Insert $1</button><button aria-pressed={inserted === 2} onClick={() => { setAmount(2); setRun(false); }}>Insert $2</button></div><Action onClick={() => setRun(true)}>Run the rule<ArrowRight size={24} /></Action></div></div>
      <div className="vending-area"><div className="vending-machine"><div className="vending-title">SNACK / 02</div><div className="vending-window"><div className="snack-packet"><span>CRUNCH</span><div /></div><div className="snack-packet"><span>CRUNCH</span><div /></div><div className="snack-packet"><span>CRUNCH</span><div /></div></div><div className="vending-display"><span>INSERTED</span><strong>${inserted}.00</strong></div><div className={`vending-slot ${complete && inserted >= 2 ? 'dispensed' : ''}`}><span>{complete && inserted >= 2 ? 'YOUR SNACK' : 'PICK UP HERE'}</span></div></div><p className="vending-result" aria-live="polite">{complete ? inserted >= 2 ? <><Check size={27} />Condition met. Dispense.</> : <><X size={27} />Not enough. No snack.</> : 'What will the rule do?'}</p></div>
    </div><Footline number={9}>Code follows its rules. It cannot judge whether they are fair.</Footline>
  </div>;
}

function OutsideData({ revealed }: ActivityProps) {
  const [delay, setDelay] = useState<number | null>(150);
  const [run, setRun] = useState(false);
  const complete = run || revealed;
  const report = revealed ? 150 : delay;
  useSlideNavigation(
    complete ? null : { label: 'Reveal the selected flight outcome', run: () => setRun(true) },
    !revealed && run ? () => setRun(false) : null,
  );
  return <div className="slide-inner theme-light oracle-slide">
    <Topline chapter="BEYOND THE CURRENCY" label="Fictional policy / simulated inputs and payouts" />
    <h2 className="wide-heading">CODE CAN'T<br /><span className="text-blue">SEE YOUR FLIGHT.</span></h2>
    <div className="oracle-rule">Fictional rule: delay of 120+ minutes <ArrowRight size={23} /> $50 payout</div>
    <div className="oracle-flow"><div className="oracle-source"><span className="eyebrow">OUTSIDE THE BLOCKCHAIN</span><h3>Airline status feed</h3><div className="report-options">{[{ label: 'On time', value: 0 }, { label: 'Delayed', value: 150 }, { label: 'No data', value: null }].map((option) => <button key={option.label} aria-pressed={report === option.value} onClick={() => { setDelay(option.value); setRun(false); }} disabled={revealed}><span>{option.label}</span><strong>{option.value === null ? '?' : `${option.value} min`}</strong></button>)}</div></div><div className="oracle-arrow"><ArrowRight size={48} strokeWidth={1.2} /><span>ORACLE</span><small>Outside-data bridge</small></div><div className="oracle-contract"><span className="eyebrow">ON THE BLOCKCHAIN</span><h3>Contract checks<br />the report.</h3><div className="payout-number">{complete ? report === null ? '?' : report >= 120 ? '$50' : '$0' : '--'}</div><span className="payout-label">{complete && report === null ? 'NO DATA. NO DECISION.' : 'SIMULATED PAYOUT'}</span></div></div>
    <div className="oracle-bottom"><Action onClick={() => setRun(true)}>Reveal outcome<ArrowRight size={24} /></Action><p aria-live="polite">{complete ? 'Source: a simulated airline feed, delivered through an oracle.' : 'The contract cannot independently know whether the plane was late.'}</p></div>
    <Footline number={10}>Wrong outside data can produce a wrong result, even with correct code.</Footline>
  </div>;
}

const mangoRecords = [
  { role: 'Farm', title: 'Harvest record', detail: 'Farm entered harvest lot M104.' },
  { role: 'Packer', title: 'Package record', detail: 'Packer linked package P22 to lot M104.' },
  { role: 'Shipper', title: 'Handoff record', detail: 'Shipper logged package P22 at dispatch.' },
  { role: 'Store', title: 'Arrival record', detail: 'Store recorded receipt of package P22.' },
];

function MangoTimingChart() {
  const plotWidth = 840;
  const position = (seconds: number) => seconds / 86400 / mangoTiming.axisMaxDays * plotWidth;
  return <figure className="mango-statistics trace-figure" aria-labelledby="trace-chart-title">
    <figcaption className="stat-title" id="trace-chart-title">REPORTED TIME TO TRACE ONE PACKAGE TO ITS ORIGIN</figcaption>
    <svg className="trace-chart" viewBox="0 0 860 166" role="img" aria-labelledby="trace-chart-title trace-chart-description">
      <desc id="trace-chart-description">Elapsed time on a shared, linear zero-to-seven-day scale. Existing methods: six days, 18 hours, and 26 minutes. Blockchain pilot: 2.2 seconds. The pilot is marked with a dot near zero because a proportional bar would be too small to see. These are Walmart's reported pilot results, not a universal speed benchmark.</desc>
      <text x="10" y="27" className="trace-method">Existing methods</text>
      <text x="850" y="27" textAnchor="end" className="trace-value">6 days 18h 26m</text>
      <rect x="10" y="42" width={plotWidth} height="12" className="trace-track" />
      <rect x="10" y="42" width={position(mangoTiming.existingSeconds)} height="12" className="trace-bar" data-seconds={mangoTiming.existingSeconds} />
      <text x="10" y="88" className="trace-method trace-blue">Blockchain pilot</text>
      <text x="850" y="88" textAnchor="end" className="trace-value trace-blue">2.2 seconds</text>
      <rect x="10" y="103" width={plotWidth} height="12" className="trace-track" />
      <circle cx={10 + position(mangoTiming.pilotSeconds)} cy="109" r="5" className="trace-pilot" data-seconds={mangoTiming.pilotSeconds} />
      <line x1="10" x2="850" y1="135" y2="135" className="trace-axis" />
      {Array.from({ length: mangoTiming.axisMaxDays + 1 }, (_, day) => <g key={day}>
        <line x1={10 + day * plotWidth / mangoTiming.axisMaxDays} x2={10 + day * plotWidth / mangoTiming.axisMaxDays} y1="131" y2="140" className="trace-axis" />
        <text x={10 + day * plotWidth / mangoTiming.axisMaxDays} y="163" textAnchor={day === 0 ? 'start' : day === mangoTiming.axisMaxDays ? 'end' : 'middle'} className="trace-tick">{day}</text>
      </g>)}
    </svg>
    <div className="trace-chart-meta"><span>Days, linear scale. Pilot shown as a dot.</span><Citation id="walmart">Walmart, 2018 report</Citation></div>
  </figure>;
}

function Mango({ revealed }: ActivityProps) {
  const [selected, setSelected] = useState(0);
  const [incorrect, setIncorrect] = useState(false);
  const bad = incorrect || revealed;
  useSlideNavigation(
    bad ? null : selected < mangoRecords.length - 1
      ? { label: `Inspect the ${mangoRecords[selected + 1].role.toLowerCase()} record`, run: () => setSelected((value) => value + 1) }
      : { label: 'Show an incorrect input', run: () => setIncorrect(true) },
    revealed ? null : incorrect
      ? () => setIncorrect(false)
      : selected > 0 ? () => setSelected((value) => value - 1) : null,
  );
  return <div className="slide-inner theme-light mango-slide">
    <Topline chapter="BEYOND THE CURRENCY" label="A reported pilot, not a universal benchmark" />
    <div className="mango-heading"><h2>FOLLOW<br /><span className="text-blue">THE MANGO.</span></h2><MangoTimingChart /></div>
    <div className="mango-demo"><div className="mango-demo-heading"><span>WHO SUPPLIES THE RECORDS?</span><span>ILLUSTRATIVE EXAMPLE. NOT WALMART PILOT DATA.</span></div><div className="supply-chain">{mangoRecords.map((record, i) => <div key={record.role} className="supply-step"><button aria-pressed={!bad && selected === i} onClick={() => { setSelected(i); setIncorrect(false); }} disabled={revealed}><span className="supply-number">0{i + 1}</span><strong>{record.role}</strong><span>{record.title}</span></button>{i < 3 && <ArrowRight size={36} strokeWidth={1.2} />}</div>)}</div><div className="mango-record" aria-live="polite"><p>{bad ? <><strong>Farm typed M140 instead of M104.</strong> A stored mistake is still a mistake.</> : <><strong>{mangoRecords[selected].role} supplied this record.</strong> {mangoRecords[selected].detail}</>}</p><button className={`text-action ${bad ? 'is-active' : ''}`} onClick={() => setIncorrect(!incorrect)}> {bad ? <X size={22} /> : <ArrowUpRight size={22} />} {bad ? 'Incorrect input shown' : 'Try an incorrect input'}</button></div></div>
    <Footline number={11}>Faster record retrieval is not proof that the original input was true.</Footline>
  </div>;
}

function Credentials({ revealed }: ActivityProps) {
  const [name, setName] = useState('Alex Morgan');
  const [verified, setVerified] = useState<boolean | null>(null);
  const shownName = revealed ? 'Alex MorgAn' : name;
  const result = revealed ? false : verified;
  useSlideNavigation(
    revealed || verified === false ? null : verified === null
      ? { label: 'Verify the sample credential\'s signature', run: () => setVerified(verifyCredential(name)) }
      : { label: 'Alter one character in the credential', run: () => { setName('Alex MorgAn'); setVerified(null); } },
    revealed ? null : verified !== null
      ? () => setVerified(null)
      : name !== 'Alex Morgan' ? () => { setName('Alex Morgan'); setVerified(true); } : null,
  );
  return <div className="slide-inner theme-dark credential-slide">
    <Topline chapter="BEYOND THE CURRENCY" label="Fictional credential / real local signature check" />
    <div className="two-column-slide credential-layout"><div className="editorial-copy"><h2>CHECK THE<br />RECORD.<br /><span className="text-blue">TRUST THE<br />ISSUER.</span></h2><p className="credential-mit">MIT offers digital diplomas<br />using Blockcerts.</p><Citation id="mit">MIT Registrar: digital diplomas</Citation></div><div className="credential-demo"><div className="sample-diploma"><div className="diploma-top"><span>CLASSROOM<br />ACADEMY</span><FileCheck2 size={44} strokeWidth={1.2} /></div><span className="diploma-label">CERTIFICATE OF COMPLETION</span><label className="sr-only" htmlFor="credential-name">Name on the sample credential</label><input id="credential-name" className="diploma-name" value={shownName} disabled={revealed} onChange={(event) => { setName(event.target.value); setVerified(null); }} /><div className="diploma-course">Blockchain basics</div><div className="diploma-bottom"><span>01 MAY 2025<br />FICTIONAL SAMPLE</span><span>ISSUER SIGNATURE<br /><code>{signaturePreview}...</code></span></div></div><div className="credential-buttons"><Action onClick={() => setVerified(verifyCredential(name))} disabled={revealed}><ShieldCheck size={24} />Verify signature</Action><button className="text-action" onClick={() => { setName(name === 'Alex Morgan' ? 'Alex MorgAn' : 'Alex Morgan'); setVerified(null); }} disabled={revealed}>Alter one character<ArrowUpRight size={23} /></button></div><div className={`signature-result ${result === false ? 'failed' : ''}`} aria-live="polite">{result === null ? <><Fingerprint size={28} /><span>Does this match what the issuer signed?</span></> : result ? <><CircleCheck size={28} /><span>Signature valid. The sample is unchanged.</span></> : <><X size={28} /><span>Check failed. The signed content changed.</span></>}</div></div></div>
    <Footline number={12}>Keep the credential. Verify the issuer. This demo is not full Blockcerts verification.</Footline>
  </div>;
}

const tradeoffs = [
  { title: 'Shared records', detail: 'Participants may work from the same history instead of reconciling separate versions.' },
  { title: 'Tamper evidence', detail: 'Links and verification can reveal changes, under the system\'s security assumptions.' },
  { title: 'Coordination', detail: 'Someone must agree on formats, rules, roles, and day-to-day operations.' },
  { title: 'Privacy', detail: 'Sharing a record means carefully deciding who can see which information.' },
  { title: 'Governance', detail: 'People still decide who changes the rules and how disputes are resolved.' },
  { title: 'Correcting mistakes', detail: 'An error may need a new record or a coordinated correction, rather than a quiet edit.' },
];

function Tradeoffs({ revealed }: ActivityProps) {
  const [selected, setSelected] = useState(0);
  const active = revealed ? 5 : selected;
  useSlideNavigation(
    !revealed && selected < tradeoffs.length - 1
      ? { label: `Explain ${tradeoffs[selected + 1].title.toLowerCase()}`, run: () => setSelected((value) => value + 1) } : null,
    !revealed && selected > 0 ? () => setSelected((value) => value - 1) : null,
  );
  return <div className="slide-inner theme-blue tradeoff-slide">
    <Topline chapter="THE TRADE-OFFS" label="Potential benefits. Real responsibilities." />
    <h2 className="wide-heading">NOT FREE<br />OF TRADE-OFFS.</h2>
    <div className="tradeoff-columns"><div><div className="eyebrow">WHAT YOU MAY GAIN</div>{tradeoffs.slice(0, 2).map((item, i) => <button key={item.title} className={`tradeoff-item ${active === i ? 'selected' : ''}`} aria-pressed={active === i} onClick={() => setSelected(i)}><Plus size={32} strokeWidth={1.3} /><span>{item.title}</span><ArrowUpRight size={26} /></button>)}</div><div><div className="eyebrow">WHAT YOU TAKE ON</div>{tradeoffs.slice(2).map((item, i) => <button key={item.title} className={`tradeoff-item ${active === i + 2 ? 'selected' : ''}`} aria-pressed={active === i + 2} onClick={() => setSelected(i + 2)}><span className="tradeoff-dash" /><span>{item.title}</span><ArrowUpRight size={26} /></button>)}</div></div>
    <div className="tradeoff-detail" aria-live="polite"><ArrowDownRight size={42} strokeWidth={1.3} /><p><strong>{tradeoffs[active].title}.</strong> {tradeoffs[active].detail}</p></div>
    <Footline number={13}>No benefit is automatic. The design and the people matter.</Footline>
  </div>;
}

function Decision({ revealed }: ActivityProps) {
  const [view, setView] = useState<'decision' | 'tps'>('decision');
  const [answers, setAnswers] = useState<(boolean | null)[]>([null, null, null]);
  const values = revealed ? [true, true, true] : answers;
  const questions = ['Do multiple parties need to share and verify records?', 'Do they need one shared system?', 'Would a regular database work?'];
  const answer = (i: number, value: boolean) => setAnswers((previous) => previous.map((item, position) => position === i ? value : position > i ? null : item));
  const verdict = values[0] === false ? 'A simpler record keeper may be enough.' : values[1] === false ? 'Consider exchanging signed records instead.' : values[2] === true ? 'Start with a regular database.' : values[2] === false ? 'Consider blockchain. Compare its trade-offs.' : null;
  const unanswered = answers.findIndex((value) => value === null);
  const lastAnswered = answers.reduce((last, value, i) => value === null ? last : i, -1);
  useSlideNavigation(
    revealed ? null : view === 'tps'
      ? { label: 'Return to decision path', run: () => setView('decision') }
      : verdict || unanswered === -1
        ? { label: 'View throughput (TPS) comparison', run: () => setView('tps') }
        : { label: `Follow the example's Yes path for question ${unanswered + 1}`, run: () => answer(unanswered, true) },
    !revealed && view === 'tps'
      ? () => setView('decision')
      : !revealed && lastAnswered >= 0
        ? () => setAnswers((previous) => previous.map((value, i) => i >= lastAnswered ? null : value)) : null,
  );
  return <div className="slide-inner theme-light decision-slide">
    <Topline chapter="THE TRADE-OFFS" label="Illustrative decision aid & throughput benchmarks" />
    <h2 className="wide-heading">ASK BEFORE<br /><span className="text-blue">YOU BUILD.</span></h2>
    <div className="decision-view-toggle">
      <button type="button" className={view === 'decision' ? 'active' : ''} onClick={() => setView('decision')}>01 Decision path</button>
      <button type="button" className={view === 'tps' ? 'active' : ''} onClick={() => setView('tps')}>02 Throughput (TPS)</button>
    </div>
    {view === 'decision' ? (
      <>
        <div className="decision-tree">{questions.map((question, i) => { const enabled = i === 0 || values.slice(0, i).every((value) => value === true); return <div key={question} className={`decision-row ${enabled ? '' : 'inactive'} ${values[i] !== null ? 'answered' : ''}`}><span className="decision-number">0{i + 1}</span><p>{question}</p><div className="decision-buttons"><button disabled={!enabled || revealed} aria-pressed={values[i] === true} onClick={() => answer(i, true)}>Yes</button><button disabled={!enabled || revealed} aria-pressed={values[i] === false} onClick={() => answer(i, false)}>No</button></div></div>; })}</div>
        <div className="decision-verdict" aria-live="polite">{verdict ? <><ArrowRight size={37} /><p>{verdict}</p></> : <><span className="small-line" /><p>Start with the first question. Follow one path.</p></>}</div>
      </>
    ) : (
      <div className="tps-comparison-area" aria-live="polite">
        <div className="tps-table">
          {tpsBenchmarks.map((item) => (
            <div key={item.system} className={`tps-row category-${item.category}`}>
              <div className="tps-system">
                <strong>{item.system}</strong>
                <small>{item.detail}</small>
              </div>
              <div className="tps-metric">
                <span className="tps-number">{item.label}</span>
                <span className="tps-latency">Latency: {item.latency}</span>
              </div>
              <div className="tps-bar-wrapper">
                <div
                  className="tps-bar"
                  style={{ width: `${Math.max(8, Math.min(100, (Math.log10(item.tps) / Math.log10(100000)) * 100))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="tps-footer-note">
          <span>Logarithmic scale. Decentralization trades raw throughput for multi-party verification.</span>
          <Citation id="tps">Visa & L1 Benchmarks</Citation>
        </div>
      </div>
    )}
    <Footline number={14}>Compare ways to solve the same problem, not technology buzzwords.</Footline>
  </div>;
}

function LostKey({ revealed }: ActivityProps) {
  const [choice, setChoice] = useState<'provider' | 'self' | null>(null);
  const selected = revealed ? 'self' : choice;
  useSlideNavigation(
    revealed || choice === 'self' ? null : choice === null
      ? { label: 'Reveal provider-assisted recovery', run: () => setChoice('provider') }
      : { label: 'Compare self-managed keys', run: () => setChoice('self') },
    revealed || choice === null ? null : () => setChoice(choice === 'self' ? 'provider' : null),
  );
  return <div className="slide-inner theme-dark lostkey-slide">
    <Topline chapter="THE TRADE-OFFS" label="A reported story. A fictional design choice." />
    <div className="lostkey-heading"><div><h2>WHAT IF YOU<br /><span className="text-blue">LOSE THE KEY?</span></h2><p>Stefan Thomas's reported IronKey dilemma.</p><Citation id="wired">WIRED, October 24, 2023</Citation></div><div className="lostkey-number"><KeyRound size={49} strokeWidth={1.2} /><strong>7,002</strong><span>BITCOIN ASSOCIATED WITH THE WALLET</span><div className="attempts"><div role="img" aria-label="Eight of ten device password attempts reportedly used">{Array.from({ length: 10 }, (_, i) => <span key={i} className={i < 8 ? 'used' : ''} />)}</div><span>8 of 10 device attempts reportedly used</span></div></div></div>
    <div className="teacher-choice"><div className="teacher-choice-label"><span>TEACHER, WHICH WOULD YOU CHOOSE?</span><span>TWO FICTIONAL WALLET DESIGNS</span></div><div className="recovery-options"><button aria-pressed={selected === 'provider'} onClick={() => setChoice('provider')}><ShieldCheck size={31} strokeWidth={1.3} /><span>Provider-assisted recovery</span><ArrowUpRight size={27} /></button><button aria-pressed={selected === 'self'} onClick={() => setChoice('self')}><KeyRound size={31} strokeWidth={1.3} /><span>Self-managed keys</span><ArrowUpRight size={27} /></button></div><div className="recovery-result" aria-live="polite">{selected ? selected === 'provider' ? <><strong>Help recovering access.</strong><span>You depend on the provider's security and policies.</span></> : <><strong>Direct control.</strong><span>You are responsible for backups and recovery.</span></> : <><strong>The device holds wallet keys.</strong><span>This is not a standard account password reset.</span></>}</div></div>
    <Footline number={15}>The report does not establish his current access status. Recovery research exists.</Footline>
  </div>;
}

const finalTakeaways = [
  { title: 'A shared record.', detail: 'Maintained by multiple participants.' },
  { title: 'Agreed rules.', detail: 'For checking and accepting updates.' },
  { title: 'Changes leave clues.', detail: 'Some edits become easier to detect.' },
  { title: 'Trust still matters.', detail: 'False inputs do not become true.' },
];

function Conclusion({ revealed }: ActivityProps) {
  const [count, setCount] = useState(0);
  const visible = revealed ? 4 : count;
  useSlideNavigation(
    visible < 4 ? { label: `Reveal takeaway ${count + 1}: ${finalTakeaways[count].title}`, run: () => setCount((value) => Math.min(4, value + 1)) } : null,
    !revealed && count > 0 ? () => setCount((value) => value - 1) : null,
  );
  return <div className="slide-inner theme-blue conclusion-slide">
    <Topline chapter="THE BIG PICTURE" label="Choose the tool for the problem" />
    <h2 className="wide-heading">SHARED RECORDS.<br />REAL TRADE-OFFS.</h2><ArrowUpRight className="conclusion-arrow" size={160} strokeWidth={1} />
    <div className="takeaways">{finalTakeaways.map((item, i) => <div key={item.title} className={`takeaway ${i < visible ? 'is-visible' : ''}`}><span>0{i + 1}</span><div aria-hidden={i >= visible}><h3>{item.title}</h3><p>{item.detail}</p></div></div>)}</div>
    <Action className="takeaway-button" onClick={() => setCount(Math.min(4, count + 1))} disabled={visible === 4}>{visible === 4 ? 'Four ideas to take with you' : 'Reveal a takeaway'}{visible === 4 ? <Check size={25} /> : <Plus size={25} />}</Action>
    <div className="closing-question"><span>THE QUESTION WORTH ASKING</span><p>Does this problem need a shared ledger,<br />and are its trade-offs worth it?</p><span className="closing-folio">16</span></div>
  </div>;
}

const slideComponents = [Intro, CentralKeeper, SharedLedger, Agreement, History, BlockContents, HashChain, Consensus, SmartContract, OutsideData, Mango, Credentials, Tradeoffs, Decision, LostKey, Conclusion];

export default function SlideContent({ index, revealed, controllerRef, onAvailabilityChange }: ActivityProps & {
  index: number;
  controllerRef: RefObject<SlideNavigation | null>;
  onAvailabilityChange: (index: number, availability: StepAvailability) => void;
}) {
  const Component = slideComponents[index];
  return <SlideNavigationProvider index={index} controllerRef={controllerRef} onAvailabilityChange={onAvailabilityChange}>
    <Component revealed={revealed} />
  </SlideNavigationProvider>;
}
