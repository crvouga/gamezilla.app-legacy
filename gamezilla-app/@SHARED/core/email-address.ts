import { p } from "./parser"

// source: https://stackoverflow.com/questions/201323/how-can-i-validate-an-email-address-using-a-regular-expression
const regex =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const parser = p.brand(p.regex(regex), "EmailAddress")

export type EmailAddress = p.Infer<typeof parser>

const is = (emailAddress: unknown): emailAddress is EmailAddress => {
  return typeof emailAddress === "string" && regex.test(emailAddress)
}

export const EmailAddress = {
  ...parser,
  is,
}
