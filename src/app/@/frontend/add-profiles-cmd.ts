import { s } from '~/@/schema'
import { UserProfile } from '../data/user-profile'
import { isOk } from '~/@/result'

const parser = s.obj({
  t: s.l('add-profiles'),
  profiles: s.arr(UserProfile),
})

export type AddProfilesCmd = s.Infer<typeof parser>

const init = (profiles: UserProfile[]): AddProfilesCmd => {
  return {
    t: 'add-profiles',
    profiles,
  }
}

const is = (cmd: unknown): cmd is AddProfilesCmd => {
  return isOk(parser.parse(cmd))
}

const did = (output?: { msgOut?: unknown[] | null }, _profiles?: UserProfile[]): boolean => {
  return Boolean(
    output?.msgOut?.some((cmd) => {
      if (is(cmd)) return true
      return false
    }),
  )
}
export const AddProfilesCmd = {
  parser,
  init,
  is,
  did,
}
