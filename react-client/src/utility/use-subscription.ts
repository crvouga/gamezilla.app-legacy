import { useEffect, useState } from "react";
import { usePersistedState } from "./use-persisted-state";

export const useSubscription = <T>(
  subscribe: (emit: (data: T) => void) => () => void,
  initial: T
) => {
  const [data, setData] = useState<T>(initial);

  useEffect(() => {
    const unsubcribe = subscribe(setData);

    return () => {
      unsubcribe();
    };
  }, [subscribe, setData]);

  return data;
};

export const usePersistedSubscription = <T>(
  key: string,
  subscribe: (emit: (data: T) => void) => () => void,
  initial: T
) => {
  const [data, setData] = usePersistedState<T>(key, initial);

  useEffect(() => {
    const unsubcribe = subscribe(setData);

    return () => {
      unsubcribe();
    };
  }, [subscribe, setData]);

  return data;
};
