export async function sendAnswers(payload) {
  const response = await fetch("/api/answers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok)
    throw new Error(
      "L’enregistrement n’a pas abouti. Tes réponses sont conservées ici. Tu peux réessayer.",
    );
  const result = await response.json();
  if (!result.ok)
    throw new Error(
      "L’enregistrement n’a pas pu être confirmé. Tu peux réessayer.",
    );
}
