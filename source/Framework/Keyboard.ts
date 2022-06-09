import * as Rx from "rxjs";
import { Sub } from "./Sub";

export type Key = "w" | "a" | "s" | "d" | "W" | "A" | "S" | "D" | "Space";

const keys: { [key in Key]: Key } = {
  //
  w: "w",
  a: "a",
  s: "s",
  d: "d",
  //
  W: "W",
  A: "A",
  S: "S",
  D: "D",
  //
  Space: "Space",
};

const is = (key: unknown): key is Key => {
  return typeof key === "string" && key in keys;
};

export const keyDowns = <T>(callback: (key: Key) => T): Sub<T> => {
  return new Rx.Observable((subscriber) => {
    const handler = (event: KeyboardEvent) => {
      const key = event.key;

      if (key === " ") {
        subscriber.next(callback("Space"));
      }

      if (is(key)) {
        subscriber.next(callback(key));
      }
    };

    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
    };
  });
};
