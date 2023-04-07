import { Posix } from '../unix-time';

type Easing =
  | { type: 'ease-out-bounce'; n1?: number; d1?: number }
  | { type: 'ease-out-quint' }
  | { type: 'linear' }
  | { type: 'ease-in-back' }
  | { type: 'ease-in-expo' }
  | { type: 'ease-out-back' };

export type Model = {
  startMs: Posix;
  durationMs: number;
  value: number;
  from: number;
  to: number;
  easing: Easing;
  delayMs: number;
};

export const initConstant = (value: number): Model => {
  return {
    startMs: Posix.fromNumber(0),
    durationMs: 0,
    value,
    from: value,
    to: value,
    easing: { type: 'linear' },
    delayMs: 0,
  };
};

export const isAnimating = (now: Posix, model: Model): boolean => {
  return now < model.startMs + model.durationMs + model.delayMs;
};

export const easeOutBounce = (
  { n1 = 7.5625, d1 = 2.75 }: { n1?: number; d1?: number },
  x: number
): number => {
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

export function easeInBack(x: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;

  return c3 * x * x * x - c1 * x * x;
}

function easeInExpo(x: number): number {
  return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
}

function easeOutBack(x: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;

  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

const ease = (easing: Easing, x: number): number => {
  switch (easing.type) {
    case 'ease-out-back':
      return easeOutBack(x);

    case 'ease-out-bounce':
      return easeOutBounce(easing, x);

    case 'ease-out-quint':
      return easeOutQuint(x);

    case 'ease-in-back':
      return easeInBack(x);

    case 'ease-in-expo':
      return easeInExpo(x);

    case 'linear':
      return x;
  }
};

export const step = (now: Posix, model: Model): Model => {
  const elapsedMs = now - model.startMs;
  if (elapsedMs < model.delayMs) {
    return model;
  }
  const progress = (elapsedMs - model.delayMs) / model.durationMs;
  if (progress >= 1) {
    return { ...model, value: model.to };
  }
  const range = Math.abs(model.to - model.from);
  const sign = Math.sign(model.to - model.from);
  const easedProgress = sign * ease(model.easing, progress);
  const valueNew = model.from + range * easedProgress;
  return { ...model, value: valueNew };
};

export const init = ({
  from,
  to,
  durationMs,
  startMs,
  delayMs = 0,
  easing = { type: 'linear' },
}: {
  easing?: Easing;
  delayMs?: number;
  from: number;
  to: number;
  durationMs: number;
  startMs: Posix;
}): Model => {
  return {
    startMs,
    durationMs,
    value: from,
    from,
    to,
    easing,
    delayMs,
  };
};
