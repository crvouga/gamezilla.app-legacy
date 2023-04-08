import * as Board from './chess';

export type Clock = {
  preset: Preset;
  times: {
    [color in Board.Color]: Seconds;
  };
};

export type Seconds = number & { _type: 'Seconds' };

export const tick = ({
  turn,
  clock,
}: {
  turn: Board.Color;
  clock: Clock;
}):
  | { type: 'TimeIsUp'; clock: Clock; timeIsUp: Board.Color }
  | { type: 'Ticked'; clock: Clock } => {
  if (clock.times.w === 0) {
    return {
      type: 'TimeIsUp',
      clock,
      timeIsUp: 'w',
    };
  }

  if (clock.times.b === 0) {
    return {
      type: 'TimeIsUp',
      clock,
      timeIsUp: 'b',
    };
  }

  const clockNew: Clock = {
    preset: clock.preset,
    times: {
      ...clock.times,
      [turn]: toSeconds(clock.times[turn] - 1),
    },
  };

  if (clockNew.times[turn] === 0) {
    return {
      type: 'TimeIsUp',
      clock: clockNew,
      timeIsUp: turn,
    };
  }

  return {
    type: 'Ticked',
    clock: clockNew,
  };
};

export const toSeconds = (seconds: number): Seconds => {
  return Math.floor(Math.max(0, seconds)) as Seconds;
};

export const toTime = (color: Board.Color, clock: Clock): Seconds => {
  return clock.times[color];
};

export type Preset = 'Bullet' | 'Blitz' | 'Fast';

export const presets: { [preset in Preset]: Preset } = {
  Bullet: 'Bullet',
  Blitz: 'Blitz',
  Fast: 'Fast',
};

export const presetToSeconds: { [preset in Preset]: Seconds } = {
  Bullet: toSeconds(60 * 1),
  Blitz: toSeconds(60 * 3),
  Fast: toSeconds(60 * 10),
};

export const presetToClock = (preset: Preset): Clock => {
  const seconds = presetToSeconds[preset];
  return {
    preset,
    times: {
      w: seconds,
      b: seconds,
    },
  };
};

export const presetToString = (preset: Preset): string => {
  const minutes = presetToSeconds[preset] / 60;

  return `${minutes} min`;
};

export const formatSeconds = (seconds: Seconds): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${formatTwoDigits(remainingSeconds)}`;
};

const formatTwoDigits = (number: number): string => {
  if (number < 10) {
    return `0${number}`;
  }
  return `${number}`;
};
