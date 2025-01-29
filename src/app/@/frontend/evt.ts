import type { Screen } from '~/@/screen/generated/screens'
import type { UserAccount } from '../data/account'
import { Profile } from '../data/profile'

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
      profile: Profile
    }

export const screenChanged = (screen: Screen): AppFrontendEvt => {
  return { t: 'screen-evt.screen-changed', screen }
}

export const backendConnected = (): AppFrontendEvt => {
  return { t: 'wire-evt.backend-connected' }
}
