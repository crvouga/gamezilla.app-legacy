import { PhoneNumber, Posix, TimeSpan } from '@/core'
import { type Hash, Hashing } from '@/hashing'
import { VerificationId } from './verification-id'

export type Verification = {
  verificationId: VerificationId
  codeHash: Hash | null
  phoneNumber: PhoneNumber
  createdAt: Posix
  expiresAt: Posix
  verifiedAt: Posix | null
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
    createdAt,
    expiresAt: Posix.future(createdAt, TimeSpan.minutes(1)),
    verifiedAt: null
  }
}

export const Verification = {
  random
}
