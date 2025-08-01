import { UserId } from '~/app/@/data/user-id'

export type MsgFrontend =
  | { t: 'people-action.closed-surface' }
  | { t: 'people-action.clicked-people-action' }
  | { t: 'people-action.clicked-person-menu-item'; userId: UserId }
  | { t: 'people-action.clicked-preview-user-link' }
