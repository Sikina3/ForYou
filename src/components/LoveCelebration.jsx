import { useEffect, useRef, useState } from 'react';
import { Heart, LoaderCircle } from 'lucide-react';
import './LoveCelebration.css';

const hearts = Array.from({ length: 54 }, (_, i) => ({
  left: `${(i * 37 + 3) % 100}%`,
  top: `${(i * 23 + 9) % 110}%`,
  size: 17 + (i * 13) % 42,
  delay: `${(i % 9) * .16}s`,
  duration: `${3.1 + (i % 7) * .24}s`,
  drift: `${((i * 47) % 260) - 130}px`,
  rotation: `${((i * 31) % 90) - 45}deg`,
  color: ['#ed80aa', '#d9568c', '#f3a4c3', '#c9467e', '#f5b9d1'][i % 5],
}));

export default function LoveCelebration({ status, error, onRetry }) {
  const [revealed, setRevealed] = useState(false);
  const title = useRef(null);
  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 3000);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => { if (revealed) title.current?.focus({ preventScroll: true }); }, [revealed]);

  return <main className={`love-finale ${revealed ? 'is-revealed' : ''}`}>
    {!revealed && <div className="heart-shower" aria-hidden="true">{hearts.map((heart, index) => <Heart key={index} className="flying-heart" size={heart.size} style={{ left: heart.left, top: heart.top, color: heart.color, '--delay': heart.delay, '--duration': heart.duration, '--drift': heart.drift, '--rotation': heart.rotation }} />)}</div>}
    <div className="finale-message">
      <Heart className="finale-main-heart" size={68} strokeWidth={1.2} aria-hidden="true" />
      {revealed ? <h1 className="finale-title" ref={title} tabIndex={-1}>Je t’aime<span className="finale-nickname">mon Sous-Chef</span></h1> : <p className="finale-wait" role="status">Je savais que tu choisirais oui.</p>}
    </div>
    {revealed && <div className="finale-delivery" aria-live="polite">
      {status === 'success' && <p>Tes réponses sont maintenant entre de bonnes mains.</p>}
      {status === 'sending' && <p><LoaderCircle size={16} className="spin" /> Enregistrement de tes réponses…</p>}
      {error && <><p>{error}</p><button className="primary" onClick={onRetry} disabled={status === 'sending'}>Réessayer l’enregistrement</button></>}
    </div>}
  </main>;
}
