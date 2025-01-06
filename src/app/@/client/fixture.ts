import { PhoneNumber } from '~/@/phone-number'
import type { Route } from '~/@/routing/generated/routes'
import { Posix } from '~/@/time/posix'
import { TestRender } from '~/@/vdom/test-render'
import { VDOM_IMPL_TEST } from '~/config/client'
import { UserId } from '../data/user-id'
import type { AppClientCtx } from './ctx'
import { Translator } from './translator'

export const FixtureAppClient = async (input?: { currentRoute?: Route }) => {
  const currentUserId = UserId.generate()
  const ctx: AppClientCtx = {
    currentRoute: input?.currentRoute ?? {
      n: 'auth-login',
      t: 'login',
    },
    currentUserId,
    currentUserRole: 'normal',
    documentVisibilityState: 'visible',
    navigatorLanguage: 'en',
    now: Posix.now(),
    profiles: {},
    t: Translator('en'),
    currentUser: {
      userId: currentUserId,
      createdAt: Posix.now(),
      phoneNumber: PhoneNumber.random(),
      role: 'normal',
    },
  }

  const render = await TestRender(VDOM_IMPL_TEST)

  return {
    ctx,
    render,
  }
}
