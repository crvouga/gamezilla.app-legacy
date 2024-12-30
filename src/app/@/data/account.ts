import { PhoneNumber } from '~/@/core'
import { Posix } from '~/@/time/posix'
import { UserId } from './user-id'

export type UserAccount = {
  userId: UserId
  createdAt: Posix
  phoneNumber: PhoneNumber | null
  role: 'guest' | 'normal' | 'super'
}

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
    role: input?.role ?? 'guest'
  }
}

const randomNormal = (input?: { userId?: UserId; createdAt?: Posix; phoneNumber?: PhoneNumber }) => {
  return {
    userId: input?.userId ?? UserId.generate(),
    createdAt: input?.createdAt ?? Posix.now(),
    phoneNumber: PhoneNumber.random(),
    role: 'normal'
  } satisfies UserAccount
}

export const UserAccount = {
  random,
  randomNormal
}
