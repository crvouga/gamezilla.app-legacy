import type { Result } from '~/@/core'
import { PhoneNumber } from '../phone-number'

export type ISMS = {
  sendMessage: (input: { phoneNumber: PhoneNumber; message: string }) => Promise<Result<string, null>>
}
