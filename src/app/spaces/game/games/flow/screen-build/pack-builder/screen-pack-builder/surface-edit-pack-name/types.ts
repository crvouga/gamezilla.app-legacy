import { s } from '~/@/schema'
import { RemoteResult } from '~/@/result'
import { UserId } from '~/app/@/data/user-id'

export const EditPackNameValidationError = s.obj({
  t: s.l('name-cannot-be-empty'),
})
export type EditPackNameValidationError = s.Infer<typeof EditPackNameValidationError>

export const ModelSpace = s.obj({
  editPackName_draft: s.str(),
  editPackName_result: RemoteResult.schema(s.str(), s.unknown),
  editPackName_validationError: s.or(EditPackNameValidationError, s.l(null)),
})
export type ModelSpace = s.Infer<typeof ModelSpace>

export const MsgSpace = s.or(
  s.obj({
    t: s.l('edit-pack-name.user-inputted-draft-name'),
    userId: UserId,
    packNameDraft: s.str(),
  }),
  s.obj({
    t: s.l('edit-pack-name.user-submitted-form'),
    userId: UserId,
  }),
  s.obj({
    t: s.l('edit-pack-name.user-closed-drawer'),
    userId: UserId,
  }),
  s.obj({
    t: s.l('edit-pack-name.user-clicked-open-drawer-button'),
    userId: UserId,
  }),
)
export type MsgSpace = s.Infer<typeof MsgSpace>
