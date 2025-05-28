import { s } from '~/@/schema'

const ALL_USER_ROLES = ['super', 'normal', 'guest'] as const

const parser = s.enumeration(ALL_USER_ROLES)

export type UserRole = s.Infer<typeof parser>

export const NON_SUPER_USER_ROLES = ['normal', 'guest'] as const

export const UserRole = {
  ...parser,
  ALL_USER_ROLES,
  NON_SUPER_USER_ROLES,
}
