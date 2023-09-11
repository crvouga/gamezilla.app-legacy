import { Err, Ok, Result, Uuid } from "gamezilla/@SHARED/core";

export type UserId = string & { _opaque: "UserId" };

const is = (userId: unknown): userId is UserId => {
  return typeof userId === "string";
};

type Problem = "invalid_user_id";

const parse = (id: unknown): Result<Problem, UserId> => {
  if (is(id)) {
    return Ok(id);
  }
  return Err("invalid_user_id");
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
  parse,
  is,
};
