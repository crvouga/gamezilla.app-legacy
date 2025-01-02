import type { Route } from '~/@/routing/generated/routes'
import type { UserAccount } from '../data/account'
import { Profile } from '../data/profile'

export type ClientEvt =
  | {
      t: 'auth-evt.authenticated'
      account: UserAccount
      loggedIn?: boolean
    }
  | {
      t: 'auth-evt.unauthenticated'
    }
  | {
      t: 'wire-evt.server-connected'
    }
  | {
      t: 'routing-evt.route-changed'
      route: Route
    }
  | {
      t: 'platform-evt.document-visibility-changed'
      state: DocumentVisibilityState
    }
  | {
      t: 'profile-evt.current-user-profile'
      profile: Profile
    }

export const routeChanged = (route: Route): ClientEvt => {
  return { t: 'routing-evt.route-changed', route }
}

export const serverConnected = (): ClientEvt => {
  return { t: 'wire-evt.server-connected' }
}
