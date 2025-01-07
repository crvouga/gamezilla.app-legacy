import { p } from '~/@/parser'

const ORDER = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q'] as const

const parser = p.enumeration(ORDER)

export type GroupId = p.Infer<typeof parser>

const is = (groupId: unknown): groupId is GroupId => {
  return parser.parse(groupId).t === 'ok'
}

const toOrder = (groupId: GroupId): number => {
  return ORDER.indexOf(groupId)
}

export const GroupId = {
  ...parser,
  ORDER,
  toOrder,
  is,
}
