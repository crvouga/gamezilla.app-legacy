import { HttpClient } from '~/@/http-client'
import { loggerNoop } from '~/@/logger/impl-noop'
import { PhoneNumber } from '~/@/phone-number'
import type { Screen } from '~/@/screen/generated/screens'
import { SQL_DB_NOOP } from '~/@/sql-db/impl-noop'
import { UnixMs } from '~/@/time/posix'
import { TestRender } from '~/@/vdom/test-render'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { CONFIG_FRONTEND } from '~/config/frontend'
import { UserId } from '../data/user-id'
import type { AppFrontendCtx } from './ctx'
import { Translator } from './translator'
export const FixtureAppFrontend = async (input?: { currentScreen?: Screen }) => {
  const currentUserId = UserId.generate()

  const ctx: AppFrontendCtx = {
    location: {
      pathname: '/',
      query: {},
    },
    clientSessionId: ClientSessionId.generate(),
    parentScreen: null,
    sqlDb: SQL_DB_NOOP,
    logger: loggerNoop,
    currentScreen: input?.currentScreen ?? {
      n: 'auth-login',
      t: 'login',
    },
    currentUserId,
    currentUserRole: 'normal',
    documentVisibilityState: 'visible',
    navigatorLanguage: 'en',
    now: UnixMs.now(),
    profilesByUserId: {},
    screenSize: 'mobile',
    t: Translator('en'),
    currentUser: {
      userId: currentUserId,
      createdAt: UnixMs.now(),
      phoneNumber: PhoneNumber.random(),
      role: 'normal',
    },
    httpClient: HttpClient({
      t: 'fetch',
    }),
  }

  const render = await TestRender(CONFIG_FRONTEND.VDOM_IMPL_TEST)

  return {
    ctx,
    render,
  }
}
