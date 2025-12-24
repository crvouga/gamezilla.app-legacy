import type { Brand } from '~/@/brand/brand'
import { s } from '~/@/schema'
import { Uuid } from '~/@/id/uuid'

export type VerificationId = Brand<string, 'VerificationId'>

const is = (id: unknown): id is VerificationId => {
  return typeof id === 'string' && id.length > 0
}

const schema = s.custom(is, 'Invalid verification id')

const generate = (): VerificationId => {
  return Uuid.generate() as unknown as VerificationId
}

export const VerificationId = {
  ...schema,
  generate,
  is,
}
