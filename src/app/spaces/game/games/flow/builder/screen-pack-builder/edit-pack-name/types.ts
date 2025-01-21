import { p } from '~/@/parser'
import { RemoteResult } from '~/@/result'
import { UserId } from '~/app/@/data/user-id'
import { Pack } from '../../../@/pack/pack'
import { PackName } from '../../../@/pack/pack-name'

export type MsgFrontend = MsgSpace

type EditPackNameValidationError = { t: 'name-cannot-be-empty' }

export const EditPackNameValidationError = p.obj({
  t: p.l('name-cannot-be-empty'),
})

export const ModelSpace = p.obj({
  pack: Pack,
  draft: p.str,
  result: RemoteResult.parser(p.str, p.unknown),
  rollback: PackName,
  validationError: p.or(EditPackNameValidationError, p.l(null)),
})
export type ModelSpace = p.Infer<typeof ModelSpace>

export const MsgSpace = p.or(
  p.obj({
    t: p.l('edit-pack-name.user-inputted-draft-name'),
    userId: UserId,
    packNameDraft: p.str,
  }),
  p.obj({
    t: p.l('edit-pack-name.user-clicked-save-button'),
    userId: UserId,
  }),
  p.obj({
    t: p.l('edit-pack-name.user-closed-drawer'),
    userId: UserId,
  }),
)
export type MsgSpace = p.Infer<typeof MsgSpace>
