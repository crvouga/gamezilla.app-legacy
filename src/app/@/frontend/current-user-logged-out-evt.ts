import { p } from '~/@/schema'
import { isOk } from '~/@/result'

export const parser = p.or(
  p.obj({
    t: p.l('current-user-logged-out'),
    text: p.str,
  }),
)

export type CurrentUserLoggedOutEvt = p.Infer<typeof parser>

export const init = (text: string): CurrentUserLoggedOutEvt => {
  return {
    t: 'current-user-logged-out',
    text,
  }
}

const is = (cmd: unknown): cmd is CurrentUserLoggedOutEvt => {
  return isOk(parser.parse(cmd))
}

const did = (output?: { msgOut?: unknown[] | null }, text?: string): boolean => {
  return Boolean(
    output?.msgOut?.some((cmd) => {
      if (is(cmd)) {
        return text ? cmd.text === text : true
      }
      return false
    }),
  )
}

export const CurrentUserLoggedOutEvt = {
  is,
  init,
  did,
}
