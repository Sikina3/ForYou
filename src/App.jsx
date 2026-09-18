import { useEffect, useRef } from "react";
import {
  Heart,
  ArrowRight,
  ArrowLeft,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import { useQuestionnaire } from "./hooks/useQuestionnaire.js";
import Question from "./components/Question.jsx";
import LoveCelebration from "./components/LoveCelebration.jsx";

export default function App() {
  const flow = useQuestionnaire();
  const heading = useRef(null);
  const success = flow.status === "success";
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, [flow.step, success]);
  if (flow.accepted)
    return (
      <LoveCelebration
        status={flow.status}
        error={flow.error}
        onRetry={flow.submit}
      />
    );
  return (
    <div className="site-shell">
      <header className="brand">
        <Heart size={19} strokeWidth={1.5} />
        <span>pour toi.</span>
      </header>
      <div className="ambient-hearts" aria-hidden="true">
        <Heart />
        <Heart />
        <Heart />
        <Heart />
      </div>
      <main>
        <section
          className={`letter ${success ? "success" : ""}`}
          aria-label="Quelques questions entre nous"
        >
          {flow.step >= 0 && !success && (
            <div className="progress-area">
              <div className="progress-caption">
                <span>Question {flow.step + 1} sur 7</span>
                <span>
                  {String(flow.step + 1).padStart(2, "0")}{" "}
                  <span className="muted">/ 07</span>
                </span>
              </div>
              <div
                className="progress-track"
                role="progressbar"
                aria-label="Progression du questionnaire"
                aria-valuenow={flow.step + 1}
                aria-valuemin={0}
                aria-valuemax={7}
              >
                <div style={{ width: `${((flow.step + 1) / 7) * 100}%` }} />
              </div>
            </div>
          )}
          <div
            className="scene"
            key={success ? "success" : flow.step}
            ref={heading}
            tabIndex={-1}
          >
            {success ? (
              <>
                <div className="heart-seal celebration" aria-hidden="true">
                  <Heart size={39} />
                  {Array.from({ length: 7 }, (_, i) => (
                    <Heart
                      key={i}
                      className="burst-heart"
                      style={{ "--i": i }}
                      size={18}
                    />
                  ))}
                </div>
                <p className="eyebrow">C’ÉTAIT ÉCRIT.</p>
                <h1>
                  Je savais que tu
                  <br />
                  choisirais <em>oui.</em>
                </h1>
                <p className="description">
                  Tes réponses sont maintenant
                  <br />
                  entre de bonnes mains.
                </p>
                <p className="love-note">Je t’aime.</p>
              </>
            ) : flow.step < 0 ? (
              <>
                <div className="heart-seal" aria-hidden="true">
                  <Heart size={35} strokeWidth={1.3} />
                </div>
                <p className="eyebrow">JUSTE ENTRE NOUS</p>
                <h1>
                  J’ai quelques
                  <br />
                  questions <em>pour toi…</em>
                </h1>
                <p className="description">
                  Et oui, tes réponses seront
                  <br className="desktop-break" /> soigneusement conservées.
                </p>
                <button
                  className="primary start"
                  onClick={() => flow.setStep(0)}
                >
                  Commencer <ArrowRight size={18} />
                </button>
              </>
            ) : (
              <Question flow={flow} />
            )}
          </div>
          <div className="letter-bottom">
            {flow.step >= 0 && !success ? (
              <button
                className="back"
                disabled={flow.status === "sending"}
                onClick={() => flow.setStep(flow.step - 1)}
              >
                <ArrowLeft size={15} /> Retour
              </button>
            ) : (
              <span className="handwritten">avec tout mon amour</span>
            )}
            <Heart size={17} strokeWidth={1.2} />
          </div>
        </section>
        <footer>
          <LockKeyhole size={13} />
          <span>
            {success
              ? "Un petit secret de plus entre nous."
              : "Tes réponses seront conservées à la fin."}
          </span>
        </footer>
      </main>
    </div>
  );
}
