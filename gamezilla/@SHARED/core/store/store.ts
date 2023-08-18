export type Step = {
  stepId: number;
  time: number;
};

export type Store<T> = {
  add: (step: Step, key: string, value: T) => Step;
  find: (step: Step, maxTime: number, key: string) => T | null;
};
