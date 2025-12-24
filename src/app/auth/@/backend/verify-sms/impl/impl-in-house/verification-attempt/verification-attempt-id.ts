import type { Brand } from '~/@/brand/brand'
import { s } from '~/@/schema'
import { Uuid } from '~/@/id/uuid'

export type VerificationAttemptId = Brand<string, 'VerificationAttemptId'>

const is = (id: unknown): id is VerificationAttemptId => {
  return typeof id === 'string' && id.length > 0
}

const schema = s.custom(is, 'Invalid verification attempt id')

const generate = (): VerificationAttemptId => {
  return Uuid.generate() as unknown as VerificationAttemptId
}

export const VerificationAttemptId = {
  ...schema,
  generate,
  is,
}
