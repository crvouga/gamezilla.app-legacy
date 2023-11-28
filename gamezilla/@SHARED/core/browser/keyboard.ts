import { Sub } from "../sub";

export type ArrowKey = "ArrowUp" | "ArrowDown" | "ArrowRight" | "ArrowLeft";

const arrowKeys: { [key in ArrowKey]: ArrowKey } = {
  ArrowDown: "ArrowDown",
  ArrowUp: "ArrowUp",
  ArrowLeft: "ArrowLeft",
  ArrowRight: "ArrowRight",
};

export const isArrowKey = (key: unknown): key is ArrowKey => {
  return typeof key === "string" && key in arrowKeys;
};

export type EnterKey = "Enter";

export const isEnterKey = (key: unknown): key is EnterKey => {
  return typeof key === "string" && key === "Enter";
};

export type SpaceKey = "Space";

export type WASD = "w" | "a" | "s" | "d" | "W" | "A" | "S" | "D";

export type Key = WASD | SpaceKey | ArrowKey | EnterKey;

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
  //
  ArrowDown: "ArrowDown",
  ArrowUp: "ArrowUp",
  ArrowLeft: "ArrowLeft",
  ArrowRight: "ArrowRight",
  //
  Enter: "Enter",
};

const is = (key: unknown): key is Key => {
  return typeof key === "string" && key in keys;
};

export const keyDowns = <T>(callback: (key: Key) => T): Sub<T> => {
  return {
    subscribe: (subscriber: (msg: T) => void) => {
      const handler = (event: KeyboardEvent) => {
        if (event.repeat) {
          return;
        }
        const key = event.key;

        if (is(key)) {
          subscriber(callback(key));
        }
      };

      document.addEventListener("keydown", handler);
      return () => {
        document.removeEventListener("keydown", handler);
      };
    },
  };
};

export const keyUps = <T>(callback: (key: Key) => T): Sub<T> => {
  return {
    subscribe: (subscriber) => {
      const handler = (event: KeyboardEvent) => {
        if (event.repeat) {
          return;
        }

        const key = event.key;

        if (is(key)) {
          subscriber(callback(key));
        }
      };

      document.addEventListener("keyup", handler);
      return () => {
        document.removeEventListener("keyup", handler);
      };
    },
  };
};
