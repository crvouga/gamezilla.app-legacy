import { Uuid } from '~/@/id/uuid'
import { s } from '~/@/schema'

const schema = s.brand(s.str(), 'VerificationId')

export type VerificationId = s.Infer<typeof schema>

const is = (id: unknown): id is VerificationId => {
  return typeof id === 'string' && Uuid.is(id)
}

const generate = (): VerificationId => {
  return Uuid.generate() as unknown as VerificationId
}

export const VerificationId = {
  ...schema,
  generate,
  is,
}
