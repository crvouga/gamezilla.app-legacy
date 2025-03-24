import { p } from '~/@/parser'
import { PhoneNumber } from '~/@/phone-number'
import { Posix } from '~/@/time/posix'
import { UserId } from './user-id'

const parser = p.obj({
  userId: UserId,
  createdAt: Posix,
  phoneNumber: p.maybe(PhoneNumber),
  role: p.enumeration(['guest', 'normal', 'super'] as const),
})

export type UserAccount = p.Infer<typeof parser>

const random = (input?: {
  userId?: UserId
  createdAt?: Posix
  phoneNumber?: PhoneNumber
  role?: 'guest' | 'normal' | 'super'
}): UserAccount => {
  return {
    userId: input?.userId ?? UserId.generate(),
    createdAt: input?.createdAt ?? Posix.now(),
    phoneNumber: input?.phoneNumber ?? null,
    role: input?.role ?? 'guest',
  }
}

const randomNormal = (input?: { userId?: UserId; createdAt?: Posix; phoneNumber?: PhoneNumber }) => {
  return {
    userId: input?.userId ?? UserId.generate(),
    createdAt: input?.createdAt ?? Posix.now(),
    phoneNumber: PhoneNumber.random(),
    role: 'normal',
  } satisfies UserAccount
}

export const UserAccount = {
  ...parser,
  random,
  randomNormal,
}
