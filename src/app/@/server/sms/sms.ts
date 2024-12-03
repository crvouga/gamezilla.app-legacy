import type { PhoneNumber, Result } from '~/@/core'

export type ISMS = {
  sendMessage: (input: { phoneNumber: PhoneNumber; message: string }) => Promise<Result<string, null>>
}
