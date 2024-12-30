import type { Route } from '~/@/routing/generated/routes'
import type { UserAccount } from '../data/account'
import { Profile } from '../data/profile'

export type ClientEvt =
  | {
      t: 'auth/authenticated'
      account: UserAccount
      loggedIn?: boolean
    }
  | {
      t: 'auth/unauthenticated'
    }
  | {
      t: 'wire/server-connected'
    }
  | {
      t: 'routing/route-changed'
      route: Route
    }
  | {
      t: 'platform/document-visibility-changed'
      state: DocumentVisibilityState
    }
  | {
      t: 'time/elapsed'
    }
  | {
      t: 'profile/current-user-profile'
      profile: Profile
    }

export const routeChanged = (route: Route): ClientEvt => {
  return { t: 'routing/route-changed', route }
}

export const serverConnected = (): ClientEvt => {
  return { t: 'wire/server-connected' }
}
