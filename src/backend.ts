import { runSaga } from 'redux-saga'
import { fork } from 'typed-redux-saga'
import { AppBackend } from '~/app/backend'
import { CONFIG_BACKEND } from '~/config/backend'
import { CONFIG_SHARED } from './config/shared'

const main = async () => {
  const ctx = await AppBackend.initCtx()

  runSaga({}, function* () {
    yield fork(AppBackend.saga, { ctx })
  })

  ctx.httpServer.start(CONFIG_BACKEND.SERVER_PORT!)

  ctx.logger.info({ ...CONFIG_SHARED, ...CONFIG_BACKEND })
}

main()
