export type Model = {
  startMs: number;
  durationMs: number;
  value: number;
  target: number;
};

export const isDone = (nowMs: number, model: Model): boolean => {
  return model.startMs + model.durationMs < nowMs;
};

type EasingFunction = (
  time: number,
  start: number,
  change: number,
  duration: number
) => number;

export const linear: EasingFunction = (t, b, c, d) => {
  return (c * t) / d + b;
};

export const easeInQuad: EasingFunction = (t, b, c, d) => {
  t /= d;
  return c * t * t + b;
};

export const easeOutQuad: EasingFunction = (t, b, c, d) => {
  t /= d;
  return -c * t * (t - 2) + b;
};

export const easeInOutQuad: EasingFunction = (t, b, c, d) => {
  t /= d / 2;
  if (t < 1) return (c / 2) * t * t + b;
  t--;
  return (-c / 2) * (t * (t - 2) - 1) + b;
};

export const step = (
  easing: EasingFunction,
  nowMs: number,
  model: Model
): Model => {
  const next = easing(
    nowMs,
    model.value,
    model.startMs - nowMs,
    model.durationMs
  );
  return { ...model, value: next };
};

export const init = ({
  from,
  to,
  durationMs,
}: {
  from: number;
  to: number;
  durationMs: number;
}) => {
  return {
    startMs: Date.now(),
    durationMs,
    value: from,
    target: to,
  };
};
