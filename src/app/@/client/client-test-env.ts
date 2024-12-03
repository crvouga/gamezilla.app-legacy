import { PhoneNumber, Posix } from '~/@/core'
import type { Route } from '~/@/routing/generated/routes'
import { TestRender } from '~/@/vdom/test-render'
import { UserId } from '../data'
import type { AppClientCtx } from './client-ctx'
import { Translator } from './translator'
import { VDOM_IMPL_TEST } from 'config-public'

export const FixtureAppClient = async (input?: { currentRoute?: Route }) => {
  const currentUserId = UserId.generate()
  const ctx: AppClientCtx = {
    currentRoute: input?.currentRoute ?? {
      n: 'auth-login',
      t: 'login'
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
      role: 'normal'
    }
  }

  const render = await TestRender(VDOM_IMPL_TEST)

  return {
    ctx,
    render
  }
}
