import { useState } from "react";

export const usePersistedState = <T>(
  key: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const value = window.localStorage.getItem(key);

      return value ? JSON.parse(value) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue: typeof setStoredValue = (setStateAction) => {
    try {
      const valueToStore =
        setStateAction instanceof Function
          ? setStateAction(storedValue)
          : setStateAction;

      setStoredValue(setStateAction);

      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };
  return [storedValue, setValue];
};
