import { PhoneNumber } from '~/@/phone-number'
import type { Screen } from '~/@/screen/generated/screens'
import { Posix } from '~/@/time/posix'
import { TestRender } from '~/@/vdom/test-render'
import { VDOM_IMPL_TEST } from '~/config/frontend'
import { UserId } from '../data/user-id'
import type { AppFrontendCtx } from './ctx'
import { Translator } from './translator'
import { DbConnSql } from '~/@/db-conn-sql'
import { Logger } from '~/@/logger'

export const FixtureAppFrontend = async (input?: { currentScreen?: Screen }) => {
  const currentUserId = UserId.generate()
  const ctx: AppFrontendCtx = {
    dbConnSql: await DbConnSql({ t: 'pglite', dataDir: '', logger: Logger({ t: 'noop' }) }),
    currentScreen: input?.currentScreen ?? {
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
