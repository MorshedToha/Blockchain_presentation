import { createRef, useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Check, ChevronLeft, ChevronRight,
  Clock3, Download, Eye, Grid2X2, Info, Keyboard, Maximize, Minimize, MoreHorizontal,
  Pause, Play, RotateCcw, StickyNote, X,
} from 'lucide-react';
import SlideContent from './components/Slides';
import BookendScreen from './components/BookendScreen';
import type { SlideNavigation, StepAvailability } from './components/SlideNavigation';
import { chapters, formatTime, slides, sources, timeRange, TOTAL_SECONDS } from './data/deck';

type Panel = 'notes' | 'overview' | 'sources' | 'help' | null;
type Screen = 'opening' | 'lesson' | 'closing';
const getInitialScreen = (): Screen => /^#slide-\d+$/.test(window.location.hash) ? 'lesson' : window.location.hash === '#thank-you' ? 'closing' : 'opening';
const getInitialIndex = () => {
  const match = window.location.hash.match(/^#slide-(\d+)$/);
  return match ? Math.max(0, Math.min(15, Number(match[1]) - 1)) : window.location.hash === '#thank-you' ? 15 : 0;
};

function Dialog({ title, subtitle, onClose, children, className = '' }: { title: string; subtitle?: string; onClose: () => void; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.showModal();
    return () => previous?.focus();
  }, []);
  return <dialog ref={ref} aria-labelledby={titleId} className={`dialog ${className}`} onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="dialog-shell"><header className="dialog-heading"><div>{subtitle && <span className="dialog-eyebrow">{subtitle}</span>}<h2 id={titleId}>{title}</h2></div><button autoFocus type="button" className="icon-button" aria-label={`Close ${title}`} onClick={onClose}><X size={23} /></button></header>{children}</div>
  </dialog>;
}

export default function App() {
  const [index, setIndex] = useState(getInitialIndex);
  const [screen, setScreen] = useState<Screen>(getInitialScreen);
  const [bookendRevision, setBookendRevision] = useState(0);
  const [panel, setPanel] = useState<Panel>(null);
  const [revealed, setRevealed] = useState<boolean[]>(Array(16).fill(false));
  const [resetVersions, setResetVersions] = useState<number[]>(Array(16).fill(0));
  const [readThrough, setReadThrough] = useState(false);
  const [motion, setMotion] = useState(true);
  const [scale, setScale] = useState(0.8);
  const [presenting, setPresenting] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [clockEpoch, setClockEpoch] = useState(0);
  const controllers = useMemo(() => slides.map(() => createRef<SlideNavigation>()), []);
  const [stepAvailability, setStepAvailability] = useState<StepAvailability[]>(() => slides.map(() => ({ canNext: false, canPrevious: false, nextLabel: '' })));
  const autoAdvanceRef = useRef(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const wasFullscreen = useRef(false);
  const fullscreenExit = useRef<Promise<void> | null>(null);
  const presentationSession = useRef(0);
  const current = slides[index];
  const chapterIndex = Math.floor(index / 4);
  const canStepForward = screen === 'lesson' && !revealed[index] && !readThrough && stepAvailability[index].canNext;
  const canStepBackward = screen === 'lesson' && !readThrough && (revealed[index] || stepAvailability[index].canPrevious);
  const scheduledIndex = elapsed >= TOTAL_SECONDS ? 15 : slides.findIndex((slide) => elapsed >= slide.start && elapsed < slide.start + slide.duration);
  const talkFinished = elapsed >= TOTAL_SECONDS;

  useLayoutEffect(() => {
    const element = viewportRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / 1440));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const showOpening = useCallback(() => {
    autoAdvanceRef.current = false;
    setAutoAdvance(false);
    setRunning(false);
    setElapsed(0);
    setIndex(0);
    setScreen('opening');
    setPanel(null);
    setBookendRevision((value) => value + 1);
  }, []);

  const showClosing = useCallback(() => {
    autoAdvanceRef.current = false;
    setAutoAdvance(false);
    setRunning(false);
    setIndex(15);
    setScreen('closing');
  }, []);

  const beginTalk = useCallback(() => {
    setPanel(null);
    setScreen('lesson');
    setIndex(0);
    setElapsed(0);
    setClockEpoch((value) => value + 1);
    autoAdvanceRef.current = presenting;
    setAutoAdvance(presenting);
    setRunning(presenting);
    setReadThrough(false);
    setRevealed(Array(16).fill(false));
    setResetVersions((previous) => previous.map((value) => value + 1));
  }, [presenting]);

  const goTo = useCallback((next: number, manual = true) => {
    if (next < 0) { showOpening(); return; }
    if (next > 15) { showClosing(); return; }
    if (manual) {
      autoAdvanceRef.current = false;
      setAutoAdvance(false);
    }
    setScreen('lesson');
    setIndex(Math.max(0, Math.min(15, next)));
  }, [showOpening, showClosing]);

  const onAvailabilityChange = useCallback((slideIndex: number, availability: StepAvailability) => {
    setStepAvailability((previous) => {
      const old = previous[slideIndex];
      if (old.canNext === availability.canNext && old.canPrevious === availability.canPrevious && old.nextLabel === availability.nextLabel) return previous;
      return previous.map((item, i) => i === slideIndex ? availability : item);
    });
  }, []);

  const advanceStep = useCallback(() => {
    if (screen === 'opening') { beginTalk(); return; }
    if (screen === 'closing') return;
    if (!readThrough && !revealed[index] && controllers[index].current?.next()) return;
    goTo(index + 1);
  }, [screen, beginTalk, controllers, goTo, index, readThrough, revealed]);

  const previousStep = useCallback(() => {
    if (screen === 'opening') return;
    if (screen === 'closing') { goTo(15); return; }
    if (!readThrough && revealed[index]) {
      setRevealed((previous) => previous.map((value, i) => i === index ? false : value));
      return;
    }
    if (!readThrough && controllers[index].current?.previous()) return;
    goTo(index - 1);
  }, [screen, controllers, goTo, index, readThrough, revealed]);

  const resetActivity = useCallback(() => {
    if (screen !== 'lesson') { setBookendRevision((value) => value + 1); return; }
    setRevealed((previous) => previous.map((value, i) => i === index ? false : value));
    setResetVersions((previous) => previous.map((value, i) => i === index ? value + 1 : value));
    setReadThrough(false);
  }, [index, screen]);

  const revealAnswer = useCallback(() => {
    if (screen !== 'lesson') { setBookendRevision((value) => value + 1); return; }
    setRevealed((previous) => previous.map((value, i) => i === index ? true : value));
  }, [index, screen]);

  const leavePresentation = useCallback(() => {
    presentationSession.current += 1;
    wasFullscreen.current = false;
    setPresenting(false);
    setRunning(false);
    if (document.fullscreenElement) {
      const pending = document.exitFullscreen().catch(() => {});
      fullscreenExit.current = pending;
      void pending.then(() => {
        if (fullscreenExit.current === pending) fullscreenExit.current = null;
      });
    }
  }, []);

  const startPresentation = useCallback(() => {
    const session = ++presentationSession.current;
    setPanel(null);
    setScreen('opening');
    setIndex(0);
    setElapsed(0);
    setClockEpoch((value) => value + 1);
    autoAdvanceRef.current = false;
    setAutoAdvance(false);
    setRunning(false);
    setPresenting(true);
    setReadThrough(false);
    setRevealed(Array(16).fill(false));
    setResetVersions((previous) => previous.map((value) => value + 1));
    setBookendRevision((value) => value + 1);
    const enterFullscreen = () => {
      if (session !== presentationSession.current || document.fullscreenElement || !document.documentElement.requestFullscreen) return;
      void document.documentElement.requestFullscreen().catch(() => {});
    };
    // A quick restart must wait for the previous native fullscreen exit to finish.
    if (fullscreenExit.current) void fullscreenExit.current.then(enterFullscreen);
    else enterFullscreen();
  }, []);

  useEffect(() => {
    window.history.replaceState(null, '', screen === 'lesson' ? `#slide-${index + 1}` : screen === 'opening' ? '#opening' : '#thank-you');
    document.title = screen === 'lesson' ? `${String(index + 1).padStart(2, '0')} / ${current.title} | Blockchain, Explained` : screen === 'opening' ? 'Blockchain, Explained | The Classroom Edition' : 'Thank You | Blockchain, Explained';
  }, [index, current.title, screen]);

  useEffect(() => {
    const onHash = () => {
      const destination = getInitialScreen();
      if (destination === 'opening') showOpening();
      else if (destination === 'closing') showClosing();
      else goTo(getInitialIndex());
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [goTo, showOpening, showClosing]);

  useEffect(() => {
    const onFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement);
      if (wasFullscreen.current && !active) {
        presentationSession.current += 1;
        setPresenting(false);
        setRunning(false);
      }
      wasFullscreen.current = active;
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // Anchor the clock to elapsed real time so background tabs do not accumulate timer drift.
  useEffect(() => {
    if (!running) return;
    const startedAt = performance.now() - elapsed * 1000;
    const interval = window.setInterval(() => {
      const seconds = Math.min(TOTAL_SECONDS, Math.floor((performance.now() - startedAt) / 1000));
      setElapsed(seconds);
      if (seconds >= TOTAL_SECONDS) setRunning(false);
    }, 150);
    return () => window.clearInterval(interval);
    // A new anchor is intentionally created only when the clock starts or resumes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, clockEpoch]);

  useEffect(() => {
    if (screen !== 'lesson' || !autoAdvance || !autoAdvanceRef.current) return;
    if (talkFinished) { showClosing(); return; }
    // A manual navigation must win over a previously queued clock transition.
    setIndex((previous) => autoAdvanceRef.current ? scheduledIndex : previous);
  }, [scheduledIndex, autoAdvance, screen, talkFinished, showClosing]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (panel) return;
      if (event.key === 'Escape' && presenting) {
        event.preventDefault();
        leavePresentation();
        return;
      }
      const target = event.target as HTMLElement;
      const isPaging = event.key === 'PageDown' || event.key === 'PageUp';
      if (!isPaging && target.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (event.key === ' ' && target.closest('button, a')) return;
      switch (event.key) {
        case 'ArrowRight': case 'ArrowDown': case 'PageDown':
          event.preventDefault();
          if (!event.repeat) event.shiftKey && screen === 'lesson' ? goTo(index + 1) : advanceStep();
          break;
        case 'ArrowLeft': case 'ArrowUp': case 'PageUp':
          event.preventDefault();
          if (!event.repeat) event.shiftKey && screen === 'lesson' ? goTo(index - 1) : previousStep();
          break;
        case ' ':
          event.preventDefault();
          if (!event.repeat) event.shiftKey ? previousStep() : advanceStep();
          break;
        case 'Home': event.preventDefault(); showOpening(); break;
        case 'End': event.preventDefault(); showClosing(); break;
        case 'n': case 'N': setPanel('notes'); break;
        case 'g': case 'G': setPanel('overview'); break;
        case 's': case 'S': setPanel('sources'); break;
        case 'r': case 'R': revealAnswer(); break;
        case '0': resetActivity(); break;
        case 'm': case 'M': if (!event.repeat) setMotion((value) => !value); break;
        case 'p': case 'P': if (presenting && screen === 'lesson' && elapsed < TOTAL_SECONDS) setRunning((value) => !value); break;
        case '?': setPanel('help'); break;
        default: break;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [index, screen, panel, goTo, showOpening, showClosing, advanceStep, previousStep, revealAnswer, resetActivity, presenting, leavePresentation, elapsed]);

  return <div className={`app-shell ${presenting ? 'is-presenting' : ''} ${motion ? '' : 'no-motion'}`} data-screen={screen}>
    <h1 className="sr-only">Blockchain, Explained: the classroom presentation</h1>
    <header className="app-header">
      <a className="brand" href="#opening" onClick={(event) => { event.preventDefault(); showOpening(); }} aria-label="Blockchain, Explained. Go to opening title"><span className="brand-mark" aria-hidden="true"><i /><i /></span><span>BLOCKCHAIN<span className="brand-period">.</span></span></a>
      <span className="brand-subtitle">THE CLASSROOM EDITION</span>
      <div className="header-actions"><button className="header-button overview-button" onClick={() => setPanel('overview')}><Grid2X2 size={17} /><span>All slides</span></button><button className="header-button" onClick={() => setPanel('notes')}><StickyNote size={18} /><span>Speaker notes</span></button><button className="present-button" onClick={startPresentation}><Play size={16} fill="currentColor" /><span>Present</span><span className="present-shortcut"><Maximize size={14} /></span></button></div>
    </header>

    <main className="presentation-workspace">
      <div className="slide-context">
        {screen === 'lesson' ? <><div><span className="part-label">PART {String(chapterIndex + 1).padStart(2, '0')}</span><span className="context-slash">/</span><span>{chapters[chapterIndex].subtitle}</span></div><div className="speaker-meta"><span className="speaker-dot" /><span>Speaker {current.speaker}</span><span className="meta-divider" /><Clock3 size={14} /><span>{timeRange(current)}</span></div></> : <><div><span className="part-label">{screen === 'opening' ? 'OPENING' : 'CLOSING'}</span><span className="context-slash">/</span><span>{screen === 'opening' ? 'Blockchain, explained' : 'Thanks for thinking it through'}</span></div><div className="speaker-meta"><span className="speaker-dot" /><span>{screen === 'opening' ? 'Ready when you are' : 'Room for questions'}</span><span className="meta-divider" /><span>Untimed title screen</span></div></>}
      </div>
      <div ref={viewportRef} className="slide-viewport" aria-label="Interactive blockchain presentation" onClick={(event) => {
        if (!presenting || panel || (event.target as Element).closest('button, a, input, select, textarea, label, [role="button"]') || window.getSelection()?.toString()) return;
        event.shiftKey ? previousStep() : advanceStep();
      }}>
        {screen !== 'lesson' && <section className="slide-canvas bookend-canvas" data-bookend={screen} style={{ transform: `scale(${scale})` }} aria-label={screen === 'opening' ? 'Opening title: Blockchain' : 'Closing title: Thank you'}>
          <BookendScreen kind={screen} presenting={presenting} motion={motion} revision={bookendRevision} onBegin={beginTalk} onBack={() => goTo(15)} />
        </section>}
        {slides.map((slide, i) => <section key={slide.id} hidden={screen !== 'lesson' || i !== index} className="slide-canvas" style={{ transform: `scale(${scale})` }} aria-roledescription="slide" aria-label={`${slide.id} of 16: ${slide.title}`} data-slide={slide.id}>
          <SlideContent key={`${i}-${resetVersions[i]}`} index={i} revealed={revealed[i] || readThrough} controllerRef={controllers[i]} onAvailabilityChange={onAvailabilityChange} />
        </section>)}
      </div>

      <nav className={`deck-controls ${screen === 'lesson' ? '' : 'is-bookend'}`} aria-label="Presentation controls">
        <div className="slide-position"><button className="slide-count" onClick={() => setPanel('overview')} aria-label={screen === 'lesson' ? `Slide ${index + 1} of 16. Open slide overview` : `${screen === 'opening' ? 'Opening' : 'Closing'} title. Open slide overview`}><strong className={screen === 'lesson' ? '' : 'bookend-count'}>{screen === 'lesson' ? String(index + 1).padStart(2, '0') : screen === 'opening' ? 'OPENING' : 'CLOSING'}</strong><span>/</span><span>{screen === 'lesson' ? '16' : '16 lessons'}</span><Grid2X2 size={14} /></button><div className="slide-progress" aria-label="Jump to slide">{slides.map((slide, i) => <button key={slide.id} className={`${screen === 'lesson' && i === index ? 'active' : ''} ${screen === 'closing' || screen === 'lesson' && i < index ? 'visited' : ''}`} onClick={() => goTo(i)} aria-label={`Go to slide ${slide.id}: ${slide.title}`} aria-current={screen === 'lesson' && i === index ? 'step' : undefined} />)}</div></div>
        <div className="activity-controls" hidden={screen !== 'lesson'}><button className="control-button" onClick={resetActivity} title="Reset activity (0)"><RotateCcw size={16} /><span>Reset</span></button><button className={`control-button ${revealed[index] || readThrough ? 'is-active' : ''}`} onClick={revealAnswer} title="Reveal the activity's answer (R)">{revealed[index] || readThrough ? <Check size={17} /> : <Eye size={17} />}<span>{revealed[index] || readThrough ? 'Answer shown' : 'Reveal answer'}</span></button></div>
        <div className="navigation-controls">
          <button className="previous-button" aria-label={canStepBackward ? 'Previous step' : 'Previous slide'} onClick={previousStep} disabled={screen === 'opening'}><ArrowLeft size={19} /><span>{canStepBackward ? 'Back a step' : screen === 'closing' ? 'Takeaway' : index === 0 ? 'Opening' : 'Previous'}</span></button>
          <button className="next-button" aria-label={screen === 'opening' ? 'Begin the slides' : canStepForward ? 'Next step' : screen === 'lesson' && index === 15 ? 'Show thank-you screen' : 'Next slide'} title={canStepForward ? stepAvailability[index].nextLabel : screen === 'opening' ? 'Open the first teaching slide' : 'Continue'} onClick={advanceStep} disabled={screen === 'closing'}><span>{screen === 'opening' ? 'Begin' : screen === 'closing' ? 'End of deck' : canStepForward ? 'Next step' : index === 15 ? 'Thank you' : 'Next slide'}</span><ArrowRight size={20} /></button>
        </div>
      </nav>
    </main>

    <footer className="app-footer"><nav className="chapter-nav" aria-label="Chapters">{chapters.map((chapter, i) => <button key={chapter.title} className={screen === 'lesson' && i === chapterIndex ? 'active' : ''} onClick={() => goTo(chapter.first)} aria-current={screen === 'lesson' && i === chapterIndex ? 'step' : undefined}><span className="chapter-number">0{i + 1}</span><span>{chapter.title}</span></button>)}</nav><div className="footer-utilities"><button onClick={() => setPanel('sources')}><BookOpen size={15} /><span>Sources</span></button><button onClick={() => setPanel('help')} aria-label="Presentation help and keyboard shortcuts"><Keyboard size={18} /></button></div></footer>

    {presenting && <button className={`presentation-tools-trigger ${screen === 'lesson' ? '' : 'title-tools-trigger'}`} aria-label="Presentation controls and settings" title="Presentation controls (?)" onClick={() => setPanel('help')}><MoreHorizontal size={23} /></button>}

    <div className="sr-only" aria-live="polite" aria-atomic="true">{screen === 'lesson' ? `Slide ${index + 1} of 16. ${current.title}. Speaker ${current.speaker}.` : screen === 'opening' ? 'Opening title: Blockchain. Begin when you are ready.' : 'Thank you. The closing question and review controls remain available.'}</div>

    {panel === 'notes' && screen !== 'lesson' && <Dialog title={screen === 'opening' ? 'Opening notes' : 'Closing notes'} subtitle="Untimed bookend / outside the 16 teaching slides" onClose={() => setPanel(null)} className="notes-dialog"><div className="bookend-guide"><h3>{screen === 'opening' ? 'Ready when you are.' : 'Leave room for questions.'}</h3><p>{screen === 'opening' ? 'Use the BLOCKCHAIN title while the room settles. Select Present for fullscreen, then click anywhere on the title or press Right / Page Down. Only then does Speaker 1\'s 0:00-1:10 window and the 20-minute clock start.' : 'The THANK YOU screen follows the conclusion. It appears at 20:00 in auto-paced mode, or after the final takeaway when you advance manually. Further discussion is outside the timed talk.'}</p><section className="note-section"><h4>Animation and fallback</h4><p>Both titles stay centered on pure black. The opening subtitle is The architecture of digital trust; the closing asks Do we need it? BLOCKCHAIN is static, with no glitch or text animation. Faint drifting specks and a barely visible scan line keep the background minimal. The base title and subtitle stay readable. Press M to pause or resume visual effects, and R or 0 to replay. Press ? for settings. Reduced-motion preferences produce a static version automatically.</p></section><section className="note-section"><h4>Timing</h4><p>These are unnumbered holding screens. The 16 teaching slides, four slides per speaker, and all original 20-minute timing boundaries are unchanged.</p></section><a className="outline-button" href="./presenter-guide.html" target="_blank" rel="noreferrer"><BookOpen size={17} />Complete presenter guide<ArrowUpRight size={17} /></a></div></Dialog>}

    {panel === 'overview' && <Dialog title="The whole story." subtitle="16 slides / 4 speakers / 20 minutes" onClose={() => setPanel(null)} className="overview-dialog"><div className="overview-bookends"><span>Two untimed titles frame the 16-slide lesson.</span><div><button className="text-link" onClick={showOpening}>Opening title<ArrowUpRight size={16} /></button><button className="text-link" onClick={() => { showClosing(); setPanel(null); }}>Thank-you screen<ArrowUpRight size={16} /></button></div></div><div className="overview-grid">{slides.map((slide, i) => <button key={slide.id} className={`overview-slide ${index === i ? 'selected' : ''}`} onClick={() => { goTo(i); setPanel(null); }} aria-label={`Open slide ${slide.id}: ${slide.title}`}><div className={`mini-slide theme-${slide.theme} mini-${i}`}><span className="mini-top">BLOCKCHAIN / {String(slide.id).padStart(2, '0')}</span><strong>{slide.shortTitle}</strong><ArrowUpRight size={28} strokeWidth={1.1} /><span className="mini-number">{String(slide.id).padStart(2, '0')}</span></div><div className="overview-caption"><span>{String(slide.id).padStart(2, '0')} / {slide.title}</span><span>{formatTime(slide.duration)}</span></div></button>)}</div><div className="dialog-bottom"><span>Each speaker has four slides and exactly five minutes.</span><button className="text-link" onClick={() => setPanel('help')}>Keyboard shortcuts<ArrowUpRight size={16} /></button></div></Dialog>}

    {panel === 'notes' && screen === 'lesson' && <Dialog title="Speaker notes" subtitle={`Speaker ${current.speaker} / Part ${String(chapterIndex + 1).padStart(2, '0')}`} onClose={() => setPanel(null)} className="notes-dialog"><div className="notes-navigation"><button className="icon-button" onClick={() => goTo(index - 1)} disabled={index === 0} aria-label="Previous slide notes"><ChevronLeft size={22} /></button><span>SLIDE {String(index + 1).padStart(2, '0')} / 16</span><button className="icon-button" onClick={() => goTo(index + 1)} disabled={index === 15} aria-label="Next slide notes"><ChevronRight size={22} /></button></div><div className="notes-content"><h3>{current.title}</h3><div className="notes-timing"><Clock3 size={17} /><strong>{timeRange(current)}</strong><span>{formatTime(current.duration)} target</span></div><section className="note-section"><h4>Run of show</h4><div className="timing-beats">{current.beats.map((beat) => <div key={beat.label}><span>{beat.label}</span><strong>{beat.seconds}s</strong></div>)}</div></section><section className="note-section"><h4>Spoken script</h4>{current.script.map((paragraph, i) => <p key={i}>{paragraph}</p>)}</section>{current.handoff && <section className="note-section handoff"><h4>Speaker handoff / included in the time</h4><p>"{current.handoff}"</p></section>}<section className="note-section key-takeaway"><h4>One thing to remember</h4><p>{current.takeaway}</p></section><section className="note-section"><h4>Interaction</h4><p>{current.interaction}</p></section><section className="note-section"><h4>No-click fallback</h4><p>{current.fallback}</p><button className="outline-button" onClick={() => { revealAnswer(); setPanel(null); }}><Eye size={17} />Show the completed example</button></section><section className="note-section"><h4>Sources for this slide</h4>{current.sources.map((id) => { const source = sources.find((item) => item.id === id)!; return <a className="note-source" href={source.url} target="_blank" rel="noreferrer" key={id}>{source.title}<ArrowUpRight size={16} /></a>; })}</section></div><div className="dialog-bottom"><a className="text-link" href="./presenter-guide.html" target="_blank" rel="noreferrer"><BookOpen size={16} />Complete presenter guide</a><a className="icon-button" href="./presenter-guide.html" download aria-label="Download offline presenter guide"><Download size={18} /></a></div></Dialog>}

    {panel === 'sources' && <Dialog title="Sources, not speculation." subtitle="References & visual credits" onClose={() => setPanel(null)} className="sources-dialog"><div className="sources-intro"><p>Direct sources for the history, mechanisms, and reported case studies. All classroom activities are local simulations, not live blockchain data.</p><a className="text-link" href="./sources.md" download><Download size={17} />Download sources list</a></div><ol className="source-list">{sources.map((source, i) => <li key={source.id}><span>{String(i + 1).padStart(2, '0')}</span><div><h3>{source.title}</h3><p>{source.detail}</p><a href={source.url} target="_blank" rel="noreferrer">{source.url}<ArrowUpRight size={16} /></a></div></li>)}</ol><section className="visual-credits"><h3>Visuals & licenses</h3><p>All title-screen backgrounds, charts, money, network, block, timeline, vending-machine, supply-chain, and credential illustrations were created for this presentation in HTML, CSS, and SVG. No external photographs, audio, video, or remote fonts are used. The supplied reference informs the layout only; it is not reproduced in the deck.</p><p>Local typeface: <a href="https://github.com/rsms/inter" target="_blank" rel="noreferrer">Inter by Rasmus Andersson, SIL Open Font License 1.1</a>. The font is embedded for offline use.</p><p>Interface icons: <a href="https://lucide.dev/license" target="_blank" rel="noreferrer">Lucide, ISC license</a>. Offline cryptography: <a href="https://github.com/paulmillr/noble-curves" target="_blank" rel="noreferrer">noble-curves</a> and <a href="https://github.com/paulmillr/noble-hashes" target="_blank" rel="noreferrer">noble-hashes</a>, MIT license. The diploma is fictional, with a public demonstration key, and is not a real credential.</p></section></Dialog>}

    {panel === 'help' && <Dialog title="Ready for the classroom." subtitle="Presentation settings & help" onClose={() => setPanel(null)} className="help-dialog"><div className="help-content"><p className="help-intro">A 20-minute talk, with every interaction and speaker handoff already in the schedule.</p>
      {presenting && <section className="help-section presentation-settings">
        <h3>Presentation controls</h3>
        <div className="presentation-clock">
          <div><span className="timer" role="timer">{formatTime(elapsed)} <span>/ 20:00</span></span><span className="clock-status">{screen === 'opening' ? 'Waiting to begin' : elapsed === TOTAL_SECONDS ? 'Talk complete' : screen === 'closing' ? 'Closing screen' : running ? `Speaker ${current.speaker}` : 'Clock paused'}</span></div>
          <button className="outline-button" aria-label={running ? 'Pause presentation clock' : 'Resume presentation clock'} disabled={screen !== 'lesson' || elapsed === TOTAL_SECONDS} onClick={() => setRunning((value) => !value)}>{running ? <Pause size={17} /> : <Play size={17} />}{running ? 'Pause clock' : 'Resume clock'}</button>
        </div>
        <label className="setting-row"><div><strong>Auto pace</strong><span>Follow the original 20-minute slide schedule.</span></div><input type="checkbox" aria-label="Auto pace" disabled={screen !== 'lesson'} checked={autoAdvance} onChange={(event) => { autoAdvanceRef.current = event.target.checked; setAutoAdvance(event.target.checked); }} /></label>
        <div className="presentation-settings-actions"><button className="outline-button" onClick={() => setPanel('notes')}><StickyNote size={17} />Speaker notes</button><button className="outline-button" onClick={() => { setPanel(null); leavePresentation(); }}><Minimize size={17} />Exit presentation</button></div>
      </section>}
      <section className="help-section"><h3>Present your way</h3><p><strong>Present</strong> opens the BLOCKCHAIN title with subtle background motion in a slide-only view with no bottom bars. Click anywhere on the black title or press Right / Page Down when ready; the 20-minute clock starts on the first teaching slide, not on the opening title. Right arrow, Page Down, Space, and the Next button work through the current activity before moving on. Left arrow reverses a step. Hold Shift with an arrow to skip directly between slides.</p><p>Click the opening title to begin, or the thank-you title to return to the takeaway. On teaching slides, click a non-interactive area to continue, or Shift-click to go back. Use the corner menu or ? for the clock and settings; Esc exits. Navigation follows an illustrative example. On-slide buttons still let you choose other outcomes.</p><p>The 16 teaching slides and their 20-minute schedule are unchanged. The matching THANK YOU screen appears afterward, outside the timed lesson, with the short audience prompt Do we need it? The fuller closing question remains on teaching slide 16. Activity steps keep the clock running; manually changing slides turns auto pace off. Use P to pause, or disable auto pace in the presentation controls to navigate entirely at your own speed.</p><div className="setting-row"><div><strong>Read-through mode</strong><span>Show completed examples on all 16 slides.</span></div><input type="checkbox" aria-label="Read-through mode" checked={readThrough} onChange={(event) => setReadThrough(event.target.checked)} /></div><div className="setting-row"><div><strong>Short animations</strong><span>Turn off motion. Reduced-motion preferences are respected.</span></div><input type="checkbox" aria-label="Short animations" checked={motion} onChange={(event) => setMotion(event.target.checked)} /></div></section><section className="help-section"><h3>Keyboard shortcuts</h3><div className="keyboard-shortcuts">{[['Left / Right', 'Previous / next step, then slide'], ['Page Up / Page Down', 'Presenter remote: previous / next step'], ['Space / Shift+Space', 'Next / previous step'], ['Shift + arrows', 'Skip directly between slides'], ['Home / End', 'Opening / thank-you screen'], ['N / G / S', 'Notes / all slides / sources'], ['R / 0', 'Reveal / reset; replay effects on titles'], ['M', 'Pause or resume visual effects'], ['P', 'Pause or resume the clock'], ['Esc', 'Close panel / leave presentation'], ['?', 'This help panel']].map(([key, description]) => <div key={key}><span>{description}</span><kbd>{key}</kbd></div>)}</div><p className="help-small">Arrow keys respect text editing. Page Up and Page Down also work from an input. Space activates a focused control. Use Tab and Enter to operate every activity.</p></section><section className="help-section"><h3>Works without the internet</h3><p>Open the built <code>dist/index.html</code> directly in a modern browser. All diagrams, code, and interactions are bundled. Source links only use the internet if you choose to open them.</p><a className="outline-button" href="./presenter-guide.html" target="_blank" rel="noreferrer"><BookOpen size={18} />Open printable presenter guide<ArrowUpRight size={17} /></a><p className="help-small">The guide is a fully non-interactive fallback, with scripts, outcomes, sources, and timing for every slide.</p></section><div className="help-notice"><Info size={20} /><span>No real wallets, payments, private data, or live feeds. This is education, not financial advice.</span></div></div></Dialog>}
  </div>;
}
