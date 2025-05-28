import { s } from '~/@/schema'
import { isOk } from '~/@/result'

export const schema = s.or(
  s.obj({
    t: s.l('current-user-logged-out'),
    text: s.str,
  }),
)

export type CurrentUserLoggedOutEvt = s.Infer<typeof schema>

export const init = (text: string): CurrentUserLoggedOutEvt => {
  return {
    t: 'current-user-logged-out',
    text,
  }
}

const is = (cmd: unknown): cmd is CurrentUserLoggedOutEvt => {
  return isOk(schema.parse(cmd))
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
