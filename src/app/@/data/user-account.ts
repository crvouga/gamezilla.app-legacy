import { s } from '~/@/schema'
import { PhoneNumber } from '~/@/phone-number'
import { Posix } from '~/@/time/posix'
import { UserId } from './user-id'

const schema = s.obj({
  userId: UserId,
  createdAt: Posix,
  phoneNumber: s.maybe(PhoneNumber),
  role: s.enumeration(['guest', 'normal', 'super'] as const),
})

export type UserAccount = s.Infer<typeof schema>

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
  ...schema,
  random,
  randomNormal,
}
