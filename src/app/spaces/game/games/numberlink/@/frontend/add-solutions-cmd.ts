import { s } from '~/@/schema'
import { isOk } from '~/@/result'
import { Solutions } from '../solutions/solutions'

export const schema = s.or(
  s.obj({
    t: s.l('add-solutions'),
    solutions: Solutions,
    causedBy: s.any,
  }),
)

export type AddSolutionsCmd = s.Infer<typeof schema>

export const init = (solutions: Solutions, causedBy: unknown): AddSolutionsCmd => {
  return {
    t: 'add-solutions',
    solutions,
    causedBy,
  }
}

const is = (cmd: unknown): cmd is AddSolutionsCmd => {
  return isOk(schema.parse(cmd))
}

const did = (output?: { msgOut?: unknown[] | null }): boolean => {
  return Boolean(
    output?.msgOut?.some((cmd) => {
      if (is(cmd)) {
        return true
      }
      return false
    }),
  )
}

export const AddSolutionsCmd = {
  is,
  init,
  did,
}
