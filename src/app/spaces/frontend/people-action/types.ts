import { UserId } from '~/app/@/data/user-id'

export type MsgFrontend =
  | { t: 'peopleAction_closedSurface' }
  | { t: 'peopleAction_clickedPeopleAction' }
  | { t: 'peopleAction_clickedPersonMenuItem'; userId: UserId }
  | { t: 'peopleAction_clickedPreviewUserLink' }
