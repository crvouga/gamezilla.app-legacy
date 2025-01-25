import { p } from '~/@/parser'
import { RemoteResult } from '~/@/result'
import { UserId } from '~/app/@/data/user-id'

export const EditPackNameValidationError = p.obj({
  t: p.l('name-cannot-be-empty'),
})
export type EditPackNameValidationError = p.Infer<typeof EditPackNameValidationError>

export const ModelSpace = p.obj({
  editPackName_draft: p.str,
  editPackName_result: RemoteResult.parser(p.str, p.unknown),
  editPackName_validationError: p.or(EditPackNameValidationError, p.l(null)),
})
export type ModelSpace = p.Infer<typeof ModelSpace>

export const MsgSpace = p.or(
  p.obj({
    t: p.l('edit-pack-name.user-inputted-draft-name'),
    userId: UserId,
    packNameDraft: p.str,
  }),
  p.obj({
    t: p.l('edit-pack-name.user-submitted-form'),
    userId: UserId,
  }),
  p.obj({
    t: p.l('edit-pack-name.user-closed-drawer'),
    userId: UserId,
  }),
  p.obj({
    t: p.l('edit-pack-name.user-clicked-open-drawer-button'),
    userId: UserId,
  }),
)
export type MsgSpace = p.Infer<typeof MsgSpace>
