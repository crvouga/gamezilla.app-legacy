import { Step, Store } from "./store";

type Entry<T> = { time: number; value: T; stepId: number };

export const init = (): Step => {
  return {
    stepId: 0,
  };
};

export const createStore = <T>(): Store<T> => {
  // TODO use a mutable tree structure to store the values
  const entries: Map<number, Map<string, Entry<T>[]>> = new Map();

  return {
    add(step, currentTime, key, value) {
      const currentEntriesForKey = entries.get(step.stepId)?.get(key) || [];
      const newEntry: Entry<T> = {
        time: currentTime,
        value,
        stepId: step.stepId,
      };

      const newEntriesForKey = [...currentEntriesForKey, newEntry];
      const newStepId = step.stepId + 1;

      const newStepEntries = new Map(entries.get(step.stepId) || []);
      newStepEntries.set(key, newEntriesForKey);
      entries.set(newStepId, newStepEntries);

      return {
        stepId: newStepId,
      };
    },
    find(step, maxTime, key) {
      const currentEntries = entries.get(step.stepId)?.get(key) || [];
      const result = [];
      for (const entry of currentEntries) {
        if (entry.time <= maxTime) {
          result.push(entry.value);
        }
      }
      return result;
    },
  };
};
