import { Result, Uuid } from "@gamezilla/core";
import { z } from "zod";

export type UserId = string & { _opaque: "UserId" };

const is = (userId: unknown): userId is UserId => {
  return typeof userId === "string";
};

type Problem = "invalid_user_id";

const decode = (id: unknown): Result<Problem, UserId> => {
  if (is(id)) {
    return Result.Ok(id);
  }
  return Result.Err("invalid_user_id");
};

const generate = () => {
  const id = Uuid.generate();

  if (is(id)) {
    return id;
  }

  throw new Error("impossible condition. generated invalid user id.");
};

export const UserId = {
  generate,
  decode,
  is,
};

export const UserIdZod: z.ZodType<UserId> = z.custom((value) => {
  if (typeof value === "string" && value.length > 0) {
    return value as UserId;
  }
  throw new z.ZodError([]);
});
