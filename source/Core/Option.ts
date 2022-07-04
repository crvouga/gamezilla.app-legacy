import { Option } from "Core";
import * as Result from "./Result";

export type Option<T> = Some<T> | None;

export type Some<T> = { type: "Some"; value: T };

export const Some = <T>(value: T): Some<T> => ({ type: "Some", value });

export type None = { type: "None" };

export const None: None = { type: "None" };

export const map =
  <A, B>(mapper: (value: A) => B) =>
  (option: Option<A>): Option<B> => {
    switch (option.type) {
      case "None":
        return None;

      case "Some":
        return Some(mapper(option.value));
    }
  };

export const fold =
  <A, B>(onNone: () => B, onSome: (value: A) => B) =>
  (option: Option<A>): B => {
    switch (option.type) {
      case "None":
        return onNone();

      case "Some":
        return onSome(option.value);
    }
  };

export const withDefault = <T>(value: T, option: Option<T>): T => {
  switch (option.type) {
    case "None":
      return value;

    case "Some":
      return option.value;
  }
};

export const fromNullable = <T>(value: T | null | undefined): Option<T> => {
  if (value === null) {
    return None;
  }

  if (value === undefined) {
    return None;
  }

  return Some(value);
};

export const fromResult = <TErr, TOk>(
  result: Result.Result<TErr, TOk>,
): Option<TOk> => {
  switch (result.type) {
    case "Err":
      return Option.None;

    case "Ok":
      return Option.Some(result.value);
  }
};
