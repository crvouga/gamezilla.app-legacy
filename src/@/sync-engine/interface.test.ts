import { Ok } from '~/@/result'
import { describe, expect, test } from '~/@/test-runner'
import { Logger } from '../logger'
import { ClientSessionId } from '../wire/client-session-id'
import { SessionId } from '../wire/session-id'
import { SyncEngine } from './impl'

const Fixture = () => {
  const sessionId = SessionId.generate()
  const clientSessionId = ClientSessionId.generate()
  const logger = Logger({ t: 'noop' })

  const syncEngine = SyncEngine({
    t: 'backend',
    logger,
  })

  return { sessionId, clientSessionId, logger, syncEngine }
}

describe('SyncEngine', () => {
  test('should work', async () => {
    const f = Fixture()
    const pushed = await f.syncEngine.push({
      sessionId: f.sessionId,
      clientSessionId: f.clientSessionId,
      crudTransaction: {
        entries: [
          {
            id: '1',
            newData: {
              name: 'John Doe',
            },
            op: 'create',
            collection: 'users',
            prevData: null,
          },
        ],
      },
    })

    expect(pushed).toEqual(Ok(null))
  })
})
