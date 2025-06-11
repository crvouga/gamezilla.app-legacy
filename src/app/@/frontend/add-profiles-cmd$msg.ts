import { s } from '~/@/schema'
import { UserProfile } from '../data/user-profile'
import { isOk } from '~/@/result'

const schema = s.obj({
  t: s.l('add-profiles'),
  profiles: s.arr(UserProfile),
})

export type AddProfilesCmd = s.Infer<typeof schema>

export type MsgShared = AddProfilesCmd

const init = (profiles: UserProfile[]): AddProfilesCmd => {
  return {
    t: 'add-profiles',
    profiles,
  }
}

const is = (cmd: unknown): cmd is AddProfilesCmd => {
  return isOk(schema.parse(cmd))
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
  schema,
  init,
  is,
  did,
}
