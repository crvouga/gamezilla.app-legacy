import { SpaceId } from '~/app/@/data/space-id'

export type MsgFrontend =
  | { t: 'leave-space.clicked-leave-space-button'; spaceId: SpaceId }
  | { t: 'leave-space.submitted-leave-space-button'; spaceId: SpaceId }
