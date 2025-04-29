import type { Screen } from '~/@/screen/generated/screens'
import type { UserAccount } from '../data/user-account'
import { UserProfile } from '../data/user-profile'

export type AppFrontendEvt =
  | {
      t: 'auth-evt.authenticated'
      account: UserAccount
      loggedIn?: boolean
    }
  | {
      t: 'auth-evt.unauthenticated'
    }
  | {
      t: 'wire-evt.backend-connected'
    }
  | {
      t: 'screen-evt.screen-changed'
      screen: Screen
    }
  | {
      t: 'platform-evt.document-visibility-changed'
      state: DocumentVisibilityState
    }
  | {
      t: 'profile-evt.current-user-profile'
      profile: UserProfile
    }

export const screenChanged = (screen: Screen): AppFrontendEvt => {
  return { t: 'screen-evt.screen-changed', screen }
}

export const backendConnected = (): AppFrontendEvt => {
  return { t: 'wire-evt.backend-connected' }
}
