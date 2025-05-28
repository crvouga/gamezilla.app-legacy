import { p } from '~/@/schema'
import { isOk } from '~/@/result'
import { Solutions } from '../solutions/solutions'

export const parser = p.or(
  p.obj({
    t: p.l('add-solutions'),
    solutions: Solutions,
    causedBy: p.any,
  }),
)

export type AddSolutionsCmd = p.Infer<typeof parser>

export const init = (solutions: Solutions, causedBy: unknown): AddSolutionsCmd => {
  return {
    t: 'add-solutions',
    solutions,
    causedBy,
  }
}

const is = (cmd: unknown): cmd is AddSolutionsCmd => {
  return isOk(parser.parse(cmd))
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
