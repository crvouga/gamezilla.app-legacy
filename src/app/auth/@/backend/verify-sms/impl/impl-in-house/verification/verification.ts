import { type Hash, Hashing } from '~/@/hashing'
import { UnixMs } from '~/@/time/unix-ms'
import { VerificationId } from './verification-id'
import { TimeSpan } from '~/@/time/time-span'
import { PhoneNumber } from '~/@/phone-number'

export type Verification = {
  verificationId: VerificationId
  codeHash: Hash | null
  phoneNumber: PhoneNumber
  createdAtUnixMs: UnixMs
  expiresAtUnixMs: UnixMs
  verifiedAtUnixMs: UnixMs | null
}

const random = async (input?: { createdAt?: UnixMs; codeHash?: Hash | null }): Promise<Verification> => {
  const createdAt = input?.createdAt ?? UnixMs.now()
  const hashing = await Hashing({
    t: 'noop',
  })
  const codeHashArbitrary = await hashing.hash({
    algo: { t: 'sha256' },
    password: '123',
  })
  const codeHash = input?.codeHash === undefined ? codeHashArbitrary : input.codeHash
  return {
    verificationId: VerificationId.generate(),
    codeHash,
    phoneNumber: PhoneNumber.random(),
    createdAtUnixMs: createdAt,
    expiresAtUnixMs: UnixMs.future(createdAt, TimeSpan.minutes(1)),
    verifiedAtUnixMs: null,
  }
}

export const Verification = {
  random,
}
