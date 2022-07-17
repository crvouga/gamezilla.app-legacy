import { Result } from "Core";

export type UserId = string & { _opaque: typeof UserId };

declare const UserId: unique symbol;

export const is = (userId: unknown): userId is UserId => {
  return typeof userId === "string";
};

type Problem = "InvalidUserId";

export const decode = (userId: string): Result.Result<Problem, UserId> => {
  if (is(userId)) {
    return Result.Ok(userId);
  }
  return Result.Err("InvalidUserId");
};
