import { useEffect, useState } from "react";

export const useSubscription = <T>(
  initialData: T,
  subscribe: (set: (data: T) => void) => () => void
) => {
  const [data, setData] = useState(initialData);

  useEffect(() => {
    return subscribe(setData);
  }, []);

  return data;
};
