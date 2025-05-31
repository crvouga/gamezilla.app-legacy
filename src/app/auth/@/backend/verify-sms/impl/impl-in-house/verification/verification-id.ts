import { Uuid } from '~/@/id/uuid'
import { s } from '~/@/schema'

const schema = s.brand(s.str(), 'VerificationId')

export type VerificationId = s.Infer<typeof schema>

const generate = (): VerificationId => {
  const id = `auth-sms-verification:${Uuid.generate()}`
  if (s.is(schema)(id)) {
    return id
  }
  throw new Error('Failed to generate VerificationId')
}

export const VerificationId = {
  ...schema,
  generate,
}
