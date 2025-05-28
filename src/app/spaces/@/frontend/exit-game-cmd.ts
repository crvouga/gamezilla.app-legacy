import { s } from '~/@/schema'
import { isOk } from '~/@/result'

export const schema = s.or(
  s.obj({
    t: s.l('space-cmd.exit-game'),
  }),
)

export type ExitGameCmd = s.Infer<typeof schema>

export const init = (): ExitGameCmd => {
  return {
    t: 'space-cmd.exit-game',
  }
}

const is = (cmd: unknown): cmd is ExitGameCmd => {
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

export const ExitGameCmd = {
  is,
  init,
  did,
}
