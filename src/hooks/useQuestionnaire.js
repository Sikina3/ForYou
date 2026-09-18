import { useRef, useState } from "react";
import { questions } from "../data/questions.js";
import { sendAnswers } from "../services/sendAnswers.js";

export function useQuestionnaire() {
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState({ love: 10 });
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [accepted, setAccepted] = useState(false);
  const busy = useRef(false);
  const submission = useRef(null);
  function update(id, value) {
    setAnswers((previous) => ({ ...previous, [id]: value }));
    submission.current = null;
    setError("");
  }
  async function submit() {
    if (busy.current) return;
    setAccepted(true);
    busy.current = true;
    setStatus("sending");
    setError("");
    submission.current ??= {
      id: crypto.randomUUID(),
      answers: { ...answers, final: "OUI" },
      attempts,
      date: new Date().toISOString(),
    };
    try {
      await sendAnswers(submission.current);
      setStatus("success");
    } catch (err) {
      setError(
        err.name === "TimeoutError"
          ? "L’enregistrement prend trop de temps. Tes réponses sont conservées ici. Réessaie dans un instant."
          : err.message,
      );
      setStatus("idle");
    } finally {
      busy.current = false;
    }
  }
  function recordAttempt(value) {
    setAttempts(value);
    submission.current = null;
  }
  const question = questions[step];
  const valid =
    question &&
    (question.type === "range" ||
      (question.id === "meeting" && answers.meeting === "Autre..."
        ? Boolean(answers.other?.trim())
        : Boolean(answers[question.id]?.trim?.())));
  return {
    step,
    setStep,
    answers,
    update,
    attempts,
    recordAttempt,
    status,
    error,
    submit,
    valid,
    question,
    accepted,
  };
}
