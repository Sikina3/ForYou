import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Heart, LoaderCircle } from 'lucide-react';
import { reactions } from '../data/questions.js';
import { clampPosition, escapePosition } from '../hooks/escapePosition.js';

const viewport = () => ({ left: window.visualViewport?.offsetLeft ?? 0, top: window.visualViewport?.offsetTop ?? 0, width: window.visualViewport?.width ?? innerWidth, height: window.visualViewport?.height ?? innerHeight });

export default function FinalChoice({ attempts, onAttempt, onYes, sending }) {
  const no = useRef(null); const yes = useRef(null);
  const count = useRef(attempts); const cooldown = useRef(0); const armed = useRef(true);
  const [position, setPosition] = useState(null);
  const [gone, setGone] = useState(attempts >= 3);
  const [notice, setNotice] = useState(false);
  const [reaction, setReaction] = useState(attempts >= 3 ? '' : attempts ? reactions[attempts - 1] : 'Prends ton temps. Enfin… presque.');
  const escapeRef = useRef(null);
  escapeRef.current = (pointer) => {
    if (count.current >= 3 || sending || performance.now() < cooldown.current) return;
    cooldown.current = performance.now() + 650;
    armed.current = false;
    const next = ++count.current;
    onAttempt(next); setReaction(reactions[next - 1]);
    if (next < 3 && no.current) {
      const rect = no.current.getBoundingClientRect();
      const nextPosition = escapePosition(viewport(), rect.width, rect.height, pointer, yes.current?.getBoundingClientRect());
      // Start from the current on-screen position before transitioning to the new one.
      if (!position) { setPosition({ x: rect.left, y: rect.top }); requestAnimationFrame(() => requestAnimationFrame(() => setPosition(nextPosition))); }
      else setPosition(nextPosition);
    }
  };
  useEffect(() => {
    if (attempts !== 3 || gone) return;
    const hide = setTimeout(() => { setGone(true); setNotice(true); }, 700);
    return () => clearTimeout(hide);
  }, [attempts, gone]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => { setNotice(false); setReaction(''); }, 2600);
    return () => clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    function move(event) {
      if (event.pointerType !== 'mouse' || !no.current || count.current >= 3) return;
      const r = no.current.getBoundingClientRect();
      const distance = Math.hypot(Math.max(r.left - event.clientX, 0, event.clientX - r.right), Math.max(r.top - event.clientY, 0, event.clientY - r.bottom));
      if (distance > 85) armed.current = true;
      if (distance < 52 && armed.current) escapeRef.current({ x: event.clientX, y: event.clientY });
    }
    function resize() {
      if (!no.current) return;
      const button = no.current;
      const r = button.getBoundingClientRect();
      // Resize corrections must be immediate: a transition could leave the button outside a smaller viewport.
      button.style.transition = 'none';
      const clamped = clampPosition({ x: r.left, y: r.top }, viewport(), r.width, r.height);
      if (button.classList.contains('escaping')) { button.style.left = `${clamped.x}px`; button.style.top = `${clamped.y}px`; }
      setPosition(previous => previous ? clamped : previous);
      requestAnimationFrame(() => requestAnimationFrame(() => { button.style.transition = ''; }));
    }
    window.addEventListener('pointermove', move);
    window.addEventListener('resize', resize);
    window.visualViewport?.addEventListener('resize', resize);
    window.visualViewport?.addEventListener('scroll', resize);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('resize', resize); window.visualViewport?.removeEventListener('resize', resize); window.visualViewport?.removeEventListener('scroll', resize); };
  }, []);
  const noButton = !gone && <button ref={no} type="button" className={`no-button ${position ? 'escaping' : ''} ${attempts >= 3 ? 'vanishing' : ''}`} style={position ? { left: position.x, top: position.y } : undefined} disabled={sending || attempts >= 3} onPointerDown={event => { event.preventDefault(); escapeRef.current({ x: event.clientX, y: event.clientY }); }} onClick={event => { event.preventDefault(); const r = no.current?.getBoundingClientRect(); if (r) escapeRef.current({ x: r.left, y: r.top }); }}>NON</button>;
  return <><div className={`final-buttons ${gone ? 'only-yes' : ''}`}><button ref={yes} className="primary yes-button" style={{ '--growth': 1 + attempts * .07 }} disabled={sending} onClick={onYes}>{sending ? <LoaderCircle className="spin" size={19} /> : <Heart size={19} />} {sending ? 'Un petit instant…' : 'OUI'}</button><span className="no-slot">{!position && noButton}</span></div>{position && createPortal(noButton, document.body)}<div className="reaction final-reaction" role="status" aria-live="polite">{notice ? "Le choix NON n'est plus disponible." : reaction}</div></>;
}
