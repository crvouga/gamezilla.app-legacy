import * as Result from "./Result";

export type Json = boolean | number | string | null | JsonArray | JsonRecord;

export interface JsonArray extends ReadonlyArray<Json> {}

export interface JsonRecord {
  readonly [key: string]: Json;
}

export type Problem = { message: string };

export const parse = (s: string): Result.Result<Problem, Json> => {
  try {
    const parsed: Json = JSON.parse(s);

    return Result.Ok(parsed);
  } catch (error) {
    // todo make better
    const message = String(error);
    return Result.Err({ message });
  }
};

export const stringify = (json: Json): Result.Result<Problem, string> => {
  try {
    const stringified: string = JSON.stringify(json);

    return Result.Ok(stringified);
  } catch (error) {
    // todo make better
    const message = String(error);
    return Result.Err({ message });
  }
};
