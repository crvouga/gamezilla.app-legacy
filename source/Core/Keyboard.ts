import * as Rx from "rxjs";
import { Sub } from "./Sub";

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

export type Key =
  | "w"
  | "a"
  | "s"
  | "d"
  | "W"
  | "A"
  | "S"
  | "D"
  | "Space"
  | ArrowKey
  | EnterKey;

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

type SkipFlag = "Keyboard/SkipFlag";

export const SkipFlag: SkipFlag = "Keyboard/SkipFlag";

const isSkipFlag = (unknown: unknown): unknown is SkipFlag => {
  return unknown === SkipFlag;
};

export const keyDowns = <T>(callback: (key: Key) => T | SkipFlag): Sub<T> => {
  return new Rx.Observable((subscriber) => {
    const handler = (event: KeyboardEvent) => {
      const key = event.key;

      if (key === " ") {
        const result = callback("Space");
        if (isSkipFlag(result)) {
          return;
        }
        subscriber.next(result);
      }

      if (is(key)) {
        const result = callback(key);
        if (isSkipFlag(result)) {
          return;
        }

        subscriber.next(result);
      }
    };

    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
    };
  });
};
