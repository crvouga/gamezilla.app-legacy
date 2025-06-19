import { describe, expect, it } from 'bun:test'
import { Ok } from '~/@/result'
import { Logger } from '../logger'
import { ClientSessionId } from '../wire/client-session-id'
import { SessionId } from '../wire/session-id'
import { ISync } from './sync'
import { SyncEngine } from './sync-engine'

const Fixture = () => {
  const sessionId = SessionId.generate()
  const clientSessionId = ClientSessionId.generate()
  const logger = Logger({ t: 'noop' })
  const syncRegistry = new Set<ISync>()

  const syncEngine = SyncEngine({
    logger,
    syncRegistry,
  })

  return { sessionId, clientSessionId, logger, syncEngine, syncRegistry }
}

describe('uploadData', () => {
  it('should upload data', async () => {
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

    expect(pushed).toBe(Ok(null))
  })
})
