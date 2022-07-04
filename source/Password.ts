import { Result } from "Core";

export type Password = string & { _opaque: typeof Password };

declare const Password: unique symbol;

const passwordMinLength = 6;

export const is = (password: unknown): password is Password => {
  return typeof password === "string" && password.length >= passwordMinLength;
};

export type Problem = { message: string };

export const validate = (
  password: string,
): Result.Result<Problem, Password> => {
  if (password.length < passwordMinLength) {
    return Result.Err({
      message: `Password must be longer than ${passwordMinLength} characters.`,
    });
  }

  if (is(password)) {
    return Result.Ok(password);
  }

  return Result.Err({ message: "Password is invalid for an unknown reason." });
};
