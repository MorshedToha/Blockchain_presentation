import { useEffect, useState, type CSSProperties } from 'react';

type BookendProps = {
  kind: 'opening' | 'closing';
  presenting: boolean;
  motion: boolean;
  revision: number;
  onBegin: () => void;
  onBack: () => void;
};

const specks = [
  [13, 19], [31, 12], [72, 17], [88, 32],
  [9, 68], [28, 84], [71, 86], [89, 73],
];

function MinimalBackdrop() {
  return <div className="bookend-atmosphere" aria-hidden="true">
    <span className="ambient-scan" />
    {specks.map(([x, y], i) => <span key={i} className="ambient-speck" style={{
      left: `${x}%`,
      top: `${y}%`,
      '--drift-delay': `${-i * 2.3}s`,
      '--drift-time': `${22 + i % 3 * 4}s`,
    } as CSSProperties} />)}
  </div>;
}

export default function BookendScreen({ kind, presenting, motion, revision, onBegin, onBack }: BookendProps) {
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(preference.matches);
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);

  const opening = kind === 'opening';
  const title = opening ? 'BLOCKCHAIN' : 'THANK YOU';
  const animated = motion && !reducedMotion;

  return <div className={`bookend-screen bookend-${kind} ${animated ? '' : 'effects-paused'}`}>
    <div className="bookend-visual" key={revision}><MinimalBackdrop /></div>
    <div className="bookend-copy">
      <h2 className="bookend-title" key={`${kind}-${revision}`}>
        <span className="bookend-word">{title}</span>
        {!opening && <>
          <span className="glitch-slice glitch-slice-top" aria-hidden="true">{title}</span>
          <span className="glitch-slice glitch-slice-bottom" aria-hidden="true">{title}</span>
        </>}
      </h2>
      <p id={`bookend-subtitle-${kind}`} className={`bookend-description ${opening ? '' : 'bookend-closing-question'}`}>{opening ? 'The architecture of digital trust' : 'Do we need it?'}</p>
    </div>
    <button className="bookend-hit-area" aria-label={opening ? presenting ? 'Begin the talk' : 'Explore the slides' : 'Back to the takeaway'} aria-describedby={`bookend-subtitle-${kind}`} onClick={opening ? onBegin : onBack} />
  </div>;
}