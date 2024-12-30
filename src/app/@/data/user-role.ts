import { p } from '~/@/parser'

const ALL_USER_ROLES = ['super', 'normal', 'guest'] as const

const parser = p.enumeration(ALL_USER_ROLES)

export type UserRole = p.Infer<typeof parser>

export const NON_SUPER_USER_ROLES = ['normal', 'guest'] as const

export const UserRole = {
  ...parser,
  ALL_USER_ROLES,
  NON_SUPER_USER_ROLES
}
