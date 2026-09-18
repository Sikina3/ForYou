import { Check, ArrowRight } from 'lucide-react';
import { loveReaction } from '../data/questions.js';
import FinalChoice from './FinalChoice.jsx';

export default function Question({ flow }) {
  const { question: q, answers, update, valid } = flow;
  return <><h1 id="question-title">{q.title}</h1><div className="answer-area">
    {q.options && <div className="options" role="group" aria-labelledby="question-title">{q.options.map((option, index) => <button key={option} aria-pressed={answers[q.id] === option} className={`option ${answers[q.id] === option ? 'selected' : ''}`} onClick={() => update(q.id, option)}><span className="option-letter">{String.fromCharCode(65 + index)}</span><span>{option}</span><span className="check">{answers[q.id] === option && <Check size={18} />}</span></button>)}</div>}
    {q.id === 'meeting' && answers.meeting === 'Autre...' && <label className="text-label">Alors raconte-moi…<textarea autoFocus maxLength={2000} value={answers.other || ''} onChange={e => update('other', e.target.value)} rows={3} /></label>}
    {q.type === 'range' && <div className="range-field"><div className="love-value">{answers.love}<span>/ 10</span></div><label className="sr-only" htmlFor="love">À quel point tu m’aimes, de 1 à 10</label><input id="love" type="range" min="1" max="10" value={answers.love} style={{ '--fill': `${(answers.love - 1) / 9 * 100}%` }} onChange={e => update('love', Number(e.target.value))} /><div className="range-labels"><span>Un petit peu</span><span>À la folie</span></div><p className="reaction" aria-live="polite">{loveReaction(answers.love)}</p></div>}
    {q.type === 'text' && <><label className="sr-only" htmlFor="favorite">Ce que tu préfères chez moi</label><textarea id="favorite" rows={4} maxLength={2000} placeholder="Je veux une vraie réponse..." value={answers.favorite || ''} onChange={e => update('favorite', e.target.value)} /><span className="character-count">{(answers.favorite || '').length} / 2000</span></>}
    {q.id === 'most' && <p className="reaction recorded" aria-live="polite">{answers.most ? 'Réponse enregistrée. Elle pourra être utilisée contre toi.' : '\u00a0'}</p>}
    {q.type === 'final' && <FinalChoice attempts={flow.attempts} onAttempt={flow.recordAttempt} onYes={flow.submit} sending={flow.status === 'sending'} />}
  </div>{q.type !== 'final' && <button className="primary continue" disabled={!valid} onClick={() => flow.setStep(flow.step + 1)}>Continuer <ArrowRight size={18} /></button>}{flow.error && <p className="error" role="alert">{flow.error}</p>}</>;
}
