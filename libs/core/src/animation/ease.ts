export type Model = {
  startMs: number;
  durationMs: number;
  from: number;
  to: number;
};

export const isDone = (nowMs: number, model: Model): boolean => {
  const elapsed = nowMs - model.startMs;
  const progress = elapsed / model.durationMs;
  return progress < 1;
};

export const step = (
  easing: (t: number) => number,
  nowMs: number,
  model: Model
): Model => {
  const elapsed = nowMs - model.startMs;
  // const progress = elapsed / model.durationMs;
  // const value = easing(progress);
  return {
    ...model,
    durationMs: model.durationMs - elapsed,
    startMs: nowMs,
    from: model.from + (model.to - model.from),
  };
};

export const easeInOutCubic = (t: number) => {
  return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
};
