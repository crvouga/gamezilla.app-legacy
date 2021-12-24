import { useEffect, useState } from "react";

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
