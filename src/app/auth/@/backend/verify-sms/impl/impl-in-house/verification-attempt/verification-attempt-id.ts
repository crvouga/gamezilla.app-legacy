import { Uuid } from '~/@/id/uuid'
import { s } from '~/@/schema'

const schema = s.brand(s.str(), 'VerificationAttemptId')

export type VerificationAttemptId = s.Infer<typeof schema>

const is = (id: unknown): id is VerificationAttemptId => {
  return typeof id === 'string' && Uuid.is(id)
}

const generate = (): VerificationAttemptId => {
  return Uuid.generate() as unknown as VerificationAttemptId
}

export const VerificationAttemptId = {
  ...schema,
  generate,
  is,
}
