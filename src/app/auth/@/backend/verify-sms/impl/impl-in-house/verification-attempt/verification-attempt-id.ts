import { Uuid } from '~/@/id/uuid'
import { s } from '~/@/schema'

const schema = s.brand(s.str, 'VerificationAttemptId')

export type VerificationAttemptId = s.Infer<typeof schema>

const generate = (): VerificationAttemptId => {
  const id = `auth-sms-verification-attempt:${Uuid.generate()}`
  if (s.is(schema)(id)) {
    return id
  }
  throw new Error('Failed to generate VerificationAttemptId')
}

export const VerificationAttemptId = {
  ...schema,
  generate,
}
