import { type Hash, Hashing } from '~/@/hashing'
import { Posix } from '~/@/time/posix'
import { VerificationId } from './verification-id'
import { TimeSpan } from '~/@/time/time-span'
import { PhoneNumber } from '~/@/phone-number'

export type Verification = {
  verificationId: VerificationId
  codeHash: Hash | null
  phoneNumber: PhoneNumber
  createdAtPosix: Posix
  expiresAtPosix: Posix
  verifiedAtPosix: Posix | null
}

const random = async (input?: { createdAt?: Posix; codeHash?: Hash | null }): Promise<Verification> => {
  const createdAt = input?.createdAt ?? Posix.now()
  const codeHashArbitrary = await Hashing({
    t: 'noop'
  }).hash({
    algo: { t: 'sha256' },
    password: '123'
  })
  const codeHash = input?.codeHash === undefined ? codeHashArbitrary : input.codeHash
  return {
    verificationId: VerificationId.generate(),
    codeHash,
    phoneNumber: PhoneNumber.random(),
    createdAtPosix: createdAt,
    expiresAtPosix: Posix.future(createdAt, TimeSpan.minutes(1)),
    verifiedAtPosix: null
  }
}

export const Verification = {
  random
}
