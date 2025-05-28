import { s } from '~/@/schema'

// source: https://stackoverflow.com/questions/201323/how-can-i-validate-an-email-address-using-a-regular-expression
const regex =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const schema = s.brand(s.regex(regex), 'EmailAddress')

export type EmailAddress = s.Infer<typeof schema>

const is = (emailAddress: unknown): emailAddress is EmailAddress => {
  return typeof emailAddress === 'string' && regex.test(emailAddress)
}

const toString = (emailAddress: EmailAddress): string => emailAddress

export const EmailAddress = {
  ...schema,

  toString,
  is,
}
