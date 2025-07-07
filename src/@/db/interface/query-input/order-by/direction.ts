import { s } from '~/@/schema'

const schema = s.enumeration(['asc', 'desc'])

export type OrderDirection = s.Infer<typeof schema>

export const OrderDirection = {
  schema,
}
