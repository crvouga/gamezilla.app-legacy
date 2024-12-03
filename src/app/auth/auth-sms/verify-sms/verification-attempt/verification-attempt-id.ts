import { Uuid } from '~/@/core'
import { p } from '~/@/core/parser'

const parser = p.brand(p.str, 'VerificationAttemptId')

export type VerificationAttemptId = p.Infer<typeof parser>

const generate = (): VerificationAttemptId => {
  const id = `auth-sms-verification-attempt:${Uuid.generate()}`
  if (p.is(parser)(id)) {
    return id
  }
  throw new Error('Failed to generate VerificationAttemptId')
}

export const VerificationAttemptId = {
  ...parser,
  generate
}
