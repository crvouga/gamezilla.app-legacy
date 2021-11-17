import { useEffect, useState } from "react";

export const useSubscription = <TData>(
  subscribe: (set: (newData: TData) => void) => () => void,
  initialData: TData
) => {
  const [data, setData] = useState<TData>(initialData);

  useEffect(() => {
    return subscribe(setData);
  }, []);

  return data;
};
