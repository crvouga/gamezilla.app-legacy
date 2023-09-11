import { Err, Ok, Result } from "../result";

type Problem = "Invalid";

export type EmailAddress = string & { _opaque: "EmailAddress" };

// source: https://stackoverflow.com/questions/201323/how-can-i-validate-an-email-address-using-a-regular-expression
const regex =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const is = (emailAddress: unknown): emailAddress is EmailAddress => {
  return typeof emailAddress === "string" && regex.test(emailAddress);
};

const parse = (emailAddress: string): Result<Problem, EmailAddress> => {
  if (is(emailAddress)) {
    return Ok(emailAddress);
  }
  return Err("Invalid");
};

export const EmailAddress = {
  is,
  parse,
};
