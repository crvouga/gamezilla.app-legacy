import { Step, Store } from "./store";

type Entry<T> = { time: number; value: T; stepId: number };

export const init = (time: number): Step => {
  return {
    stepId: 0,
    time: time,
  };
};

export const createStore = <T>(): Store<T> => {
  // TODO use a mutable tree structure to store the values
  const entries: Map<number, Map<string, Entry<T>[]>> = new Map();

  return {
    add(step, key, value) {
      const currentEntriesForKey = entries.get(step.stepId)?.get(key) || [];
      const newEntry: Entry<T> = {
        time: step.time,
        value,
        stepId: step.stepId,
      };

      const newEntriesForKey = [...currentEntriesForKey, newEntry];
      const newStepId = step.stepId + 1;

      const newStepEntries = new Map(entries.get(step.stepId) || []);
      newStepEntries.set(key, newEntriesForKey);
      entries.set(newStepId, newStepEntries);

      return {
        time: step.time,
        stepId: newStepId,
      };
    },
    find(step, maxTime, key) {
      const currentEntries = entries.get(step.stepId)?.get(key) || [];

      let runningMax: Entry<T> | null = null;
      for (const entry of currentEntries) {
        if (!runningMax) {
          runningMax = entry;
          continue;
        }

        if (
          runningMax.time < entry.time &&
          runningMax.stepId < entry.stepId &&
          entry.time <= maxTime
        ) {
          runningMax = entry;
          continue;
        }
      }
      return runningMax?.value ?? null;
    },
  };
};
