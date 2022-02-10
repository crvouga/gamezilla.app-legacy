import React, { useState, useRef, useEffect } from "react";

export const usePersistedState = <T>(
  key: string,
  encode: (value: T) => string,
  decode: (value: string) => T,
  defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const keyRef = useRef(key);
  const [value, setValue] = useState(() => {
    try {
      const storedValue = localStorage.getItem(key);

      if (storedValue === null) {
        localStorage.setItem(key, encode(defaultValue));

        return defaultValue;
      }

      return decode(storedValue);
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(keyRef.current, encode(value));
    } catch {}
  }, [value]);

  useEffect(() => {
    const lastKey = keyRef.current;

    if (key === lastKey) {
      return;
    }

    try {
      localStorage.setItem(key, encode(value));
      keyRef.current = key;
      localStorage.removeItem(lastKey);
    } catch {}
  }, [key]);

  return [value, setValue];
};
