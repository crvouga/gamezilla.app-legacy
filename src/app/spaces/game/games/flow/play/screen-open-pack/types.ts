import { PackListTypes } from '../../@/pack/pack-list'

export type MsgFrontend = {
  t: 'screen-open-pack.got-pack-list-msg'
  c: PackListTypes.MsgFrontend
}
