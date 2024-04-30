import { p } from "gamezilla-app/@SHARED/core/parser"

const ALL_USER_ROLES = ["super", "normal", "guest"] as const

const parser = p.enumeration(ALL_USER_ROLES)

export type UserRole = p.Infer<typeof parser>

export const UserRole = {
  ...parser,
  ALL_USER_ROLES,
}
