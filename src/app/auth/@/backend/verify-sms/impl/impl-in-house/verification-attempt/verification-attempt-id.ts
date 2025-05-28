import { Uuid } from '~/@/id/uuid'
import { s } from '~/@/schema'

const parser = s.brand(s.str, 'VerificationAttemptId')

export type VerificationAttemptId = s.Infer<typeof parser>

const generate = (): VerificationAttemptId => {
  const id = `auth-sms-verification-attempt:${Uuid.generate()}`
  if (s.is(parser)(id)) {
    return id
  }
  throw new Error('Failed to generate VerificationAttemptId')
}

export const VerificationAttemptId = {
  ...parser,
  generate,
}
