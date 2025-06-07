import { s } from '~/@/schema'

const ORDER = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q'] as const

const schema = s.enumeration(ORDER)

export type GroupId = s.Infer<typeof schema>

const is = (groupId: unknown): groupId is GroupId => {
  return schema.parse(groupId).t === 'ok'
}

const toOrder = (groupId: GroupId): number => {
  return ORDER.indexOf(groupId)
}

const toNumber = (groupId: GroupId): number => {
  return toOrder(groupId) + 1
}

export const GroupId = {
  ...schema,
  ORDER,
  toOrder,
  toNumber,
  is,
}
