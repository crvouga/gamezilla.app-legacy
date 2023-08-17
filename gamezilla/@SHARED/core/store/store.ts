export type Step = {
  stepId: number;
};

export type Store<T> = {
  add: (step: Step, currentTime: number, key: string, value: T) => Step;
  find: (step: Step, minTime: number, key: string) => T[];
};
