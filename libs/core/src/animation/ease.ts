type Easing = 'easeOutBounce' | 'easeOutQuint' | 'linear';

export type Model = {
  startMs: number;
  durationMs: number;
  value: number;
  from: number;
  to: number;
  easing: Easing;
};

export const isDone = (nowMs: number, model: Model): boolean => {
  const endMs = model.startMs + model.durationMs;
  return endMs < nowMs;
};

/**
 *
 * @param x
 *
 * [0, 1] ∋ x
 *
 * @returns {number}
 */
export const easeOutBounce = (x: number): number => {
  const n1 = 7.5625;
  const d1 = 2.75;

  if (x < 1 / d1) {
    return n1 * x * x;
  }

  if (x < 2 / d1) {
    return n1 * (x -= 1.5 / d1) * x + 0.75;
  }

  if (x < 2.5 / d1) {
    return n1 * (x -= 2.25 / d1) * x + 0.9375;
  }

  return n1 * (x -= 2.625 / d1) * x + 0.984375;
};

export function easeOutQuint(x: number): number {
  return 1 - Math.pow(1 - x, 5);
}

const ease = (easing: Easing, x: number): number => {
  switch (easing) {
    case 'easeOutBounce':
      return easeOutBounce(x);

    case 'easeOutQuint':
      return easeOutQuint(x);

    case 'linear':
      return x;
  }
};

export const step = (nowMs: number, model: Model): Model => {
  const elapsedTime = nowMs - model.startMs;
  const progress = elapsedTime / model.durationMs;
  if (progress >= 1) {
    return { ...model, value: model.to };
  }
  const easedProgress = ease(model.easing, progress);
  const valueNew = model.from + (model.to - model.from) * easedProgress;
  return { ...model, value: valueNew };
};

export const init = ({
  from,
  to,
  durationMs,
  delayMs = 0,
  easing = 'linear',
}: {
  easing?: Easing;
  delayMs?: number;
  from: number;
  to: number;
  durationMs: number;
}): Model => {
  return {
    startMs: Date.now() + delayMs,
    durationMs,
    value: from,
    from,
    to,
    easing,
  };
};
