import { RemoteResult, Result } from '~/@/core'
import { p } from '~/@/parser'
import { UserId } from '~/app/@/data'
import { Pack } from '../../../@/pack/pack'
import { PackName } from '../../../@/pack/pack-name'

export type MsgClient = MsgCore

type EditPackNameValidationError = { t: 'name-cannot-be-empty' }

export const EditPackNameValidationError = p.obj({
  t: p.l('name-cannot-be-empty')
})

export const ModelCore = p.obj({
  pack: Pack,
  draft: p.str,
  result: RemoteResult.parser(p.str, p.unknown),
  rollback: PackName,
  validationError: p.or(EditPackNameValidationError, p.l(null))
})
export type ModelCore = p.Infer<typeof ModelCore>

export const MsgCore = p.or(
  p.obj({
    t: p.l('edit-pack-name.user-inputted-draft-name'),
    userId: UserId,
    packNameDraft: p.str
  }),
  p.obj({
    t: p.l('edit-pack-name.user-clicked-save-button'),
    userId: UserId
  }),
  p.obj({
    t: p.l('edit-pack-name.server-persisted-pack'),
    userId: UserId,
    result: Result.parser(p.str, p.unknown)
  }),
  p.obj({
    t: p.l('edit-pack-name.user-closed-drawer'),
    userId: UserId
  })
)
export type MsgCore = p.Infer<typeof MsgCore>
