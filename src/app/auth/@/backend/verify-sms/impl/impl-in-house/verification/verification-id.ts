import { Uuid } from '~/@/id/uuid'
import { s } from '~/@/schema'

const parser = s.brand(s.str, 'VerificationId')

export type VerificationId = s.Infer<typeof parser>

const generate = (): VerificationId => {
  const id = `auth-sms-verification:${Uuid.generate()}`
  if (s.is(parser)(id)) {
    return id
  }
  throw new Error('Failed to generate VerificationId')
}

export const VerificationId = {
  ...parser,
  generate,
}
