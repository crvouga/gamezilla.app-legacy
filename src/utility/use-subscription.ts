import { useEffect, useState } from "react";
import { usePersistedState } from "./use-persisted-state";

export const useSubscription = <T>(
  initialData: T,
  subscribe: (set: (data: T) => void) => () => void
) => {
  const [data, setData] = useState(initialData);

  useEffect(() => {
    const unsubscribe = subscribe(setData);

    return () => {
      unsubscribe();
    };
  }, []);

  return data;
};
