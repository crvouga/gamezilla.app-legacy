import { Result } from "../Core"

type Problem = { message: string }

export type EmailAddress = string & { _opaque: typeof EmailAddress }

declare const EmailAddress: unique symbol

// source: https://stackoverflow.com/questions/201323/how-can-i-validate-an-email-address-using-a-regular-expression
const regex =
  /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/

export const is = (emailAddress: unknown): emailAddress is EmailAddress => {
  return typeof emailAddress === "string" && regex.test(emailAddress)
}

export const decode = (
  emailAddress: string,
): Result.Result<Problem, EmailAddress> => {
  if (is(emailAddress)) {
    return Result.Ok(emailAddress)
  }
  return Result.Err({ message: "Invalid email address" })
}
