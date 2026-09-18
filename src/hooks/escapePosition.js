export function clampPosition(position, bounds, width, height) {
  const margin = 12;
  return {
    x: Math.max(
      bounds.left + margin,
      Math.min(position.x, bounds.left + bounds.width - width - margin),
    ),
    y: Math.max(
      bounds.top + margin,
      Math.min(position.y, bounds.top + bounds.height - height - margin),
    ),
  };
}
export function escapePosition(
  bounds,
  width,
  height,
  pointer,
  avoid,
  random = Math.random,
) {
  let best;
  let bestScore = -Infinity;
  for (let i = 0; i < 50; i++) {
    const p = clampPosition(
      {
        x: bounds.left + random() * (bounds.width - width),
        y: bounds.top + random() * (bounds.height - height),
      },
      bounds,
      width,
      height,
    );
    const overlaps =
      avoid &&
      p.x < avoid.right + 24 &&
      p.x + width > avoid.left - 24 &&
      p.y < avoid.bottom + 24 &&
      p.y + height > avoid.top - 24;
    const score =
      Math.hypot(p.x + width / 2 - pointer.x, p.y + height / 2 - pointer.y) -
      (overlaps ? 10000 : 0);
    if (score > bestScore) {
      best = p;
      bestScore = score;
    }
  }
  return best;
}
