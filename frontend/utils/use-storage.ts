import { useEffect, useState } from "react";
import { createStorageLocalJSON, IStorage } from "./storage";

export const useStorage = <TValue>(
  storage: IStorage<TValue>,
  key: string,
  defaultValue: TValue
) => {
  const [value, setValue] = useState<TValue>(() => {
    return storage.read(key) ?? defaultValue;
  });

  useEffect(() => {
    storage.write(key, value);
  }, [key, value]);

  return [value, setValue] as const;
};

export const useStorageLocalJSON = <TValue>(
  key: string,
  defaultValue: TValue
) => {
  return useStorage(createStorageLocalJSON<TValue>(), key, defaultValue);
};
