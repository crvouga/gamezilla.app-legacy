import { SpaceId } from '~/app/@/data/space-id'

export type MsgFrontend =
  | { t: 'end-space.clicked-end-space-button'; spaceId: SpaceId }
  | { t: 'end-space.submitted-end-space-form'; spaceId: SpaceId }
