import { p } from '~/@/parser'
import { isOk } from '~/@/result'

export const parser = p.or(
  p.obj({
    t: p.l('space-cmd.exit-game'),
  }),
)

export type ExitGameCmd = p.Infer<typeof parser>

export const init = (): ExitGameCmd => {
  return {
    t: 'space-cmd.exit-game',
  }
}

const is = (cmd: unknown): cmd is ExitGameCmd => {
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

export const ExitGameCmd = {
  is,
  init,
  did,
}
