import { dbConnSqlNoop } from '~/@/db-conn-sql/impl'
import { PhoneNumber } from '~/@/phone-number'
import type { Screen } from '~/@/screen/generated/screens'
import { Posix } from '~/@/time/posix'
import { TestRender } from '~/@/vdom/test-render'
import { CONFIG_FRONTEND } from '~/config/frontend'
import { UserId } from '../data/user-id'
import type { AppFrontendCtx } from './ctx'
import { Translator } from './translator'
import { loggerNoop } from '~/@/logger/impl-noop'

export const FixtureAppFrontend = async (input?: { currentScreen?: Screen }) => {
  const currentUserId = UserId.generate()
  const ctx: AppFrontendCtx = {
    dbConnSql: dbConnSqlNoop,
    logger: loggerNoop,
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
    screenSize: 'mobile',
    t: Translator('en'),
    currentUser: {
      userId: currentUserId,
      createdAt: Posix.now(),
      phoneNumber: PhoneNumber.random(),
      role: 'normal',
    },
  }

  const render = await TestRender(CONFIG_FRONTEND.VDOM_IMPL_TEST)

  return {
    ctx,
    render,
  }
}
