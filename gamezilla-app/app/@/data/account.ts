import { PhoneNumber, Posix } from 'gamezilla-app/@/core'
import { UserId } from './user-id'

export type UserAccount = {
  userId: UserId
  createdAt: Posix
  phoneNumber: PhoneNumber | null
  role: 'guest' | 'normal' | 'super'
}

export const randomUserAccount = (input?: {
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

export const randomNormalUserAccount = (input?: { userId?: UserId; createdAt?: Posix; phoneNumber?: PhoneNumber }) => {
  return {
    userId: input?.userId ?? UserId.generate(),
    createdAt: input?.createdAt ?? Posix.now(),
    phoneNumber: PhoneNumber.random(),
    role: 'normal'
  } satisfies UserAccount
}
