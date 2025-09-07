import { describe, expect, test } from '~/@/test-runner'
import { eventually } from '../../test/eventually'
import { Fixture as Fixture_, IFixture, TestMsg, sortMsgs } from './fixture'

const Fixture = async () => {
  let fixture: IFixture

  fixture ??= await Fixture_.init({ t: 'web-socket-server' })
  // fixture ??= await Fixture_.init({ t: 'web-socket-server-nats' })

  return fixture
}

describe('Topic', () => {
  test('should work', async () => {
    await using f = await Fixture()
    const gotA: TestMsg[] = []
    const gotB: TestMsg[] = []
    const gotC: TestMsg[] = []
    f.clientA.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    f.clientB.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotB.push(msg))
    f.clientC.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotC.push(msg))
    await eventually(() => {
      expect(f.isSubscribedClientA('someTopic', { id: '123' })).toEqual(true)
      expect(f.isSubscribedClientB('someTopic', { id: '123' })).toEqual(true)
      expect(f.isSubscribedClientC('someTopic', { id: '123' })).toEqual(true)
    })
    f.clientC.topic.someTopic.pub({ id: '123' }, { id: 1 })
    await eventually(() => {
      expect(gotA).toEqual([{ id: 1 }])
      expect(gotB).toEqual([{ id: 1 }])
      expect(gotC).toEqual([{ id: 1 }, { id: 1 }])
    })
  })

  test('should not receive messages after unsubscribing', async () => {
    await using f = await Fixture()
    const gotA: TestMsg[] = []
    const unsub = f.clientA.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    await eventually(() => expect(f.isSubscribedClientA('someTopic', { id: '123' })).toEqual(true))
    unsub()
    await eventually(() => expect(f.isSubscribedClientA('someTopic', { id: '123' })).toEqual(false))
    f.clientA.topic.someTopic.pub({ id: '123' }, { id: 1 })
    await eventually(() => {
      expect(gotA).toEqual([])
    })
  })

  test('should not receive messages for different topic params', async () => {
    await using f = await Fixture()
    const gotA: TestMsg[] = []
    const gotB: TestMsg[] = []
    f.clientA.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    f.clientB.topic.someTopic.sub({ id: '456' }, (x) => x).sub((msg) => gotB.push(msg))
    await eventually(() => expect(f.isSubscribedClientA('someTopic', { id: '123' })).toEqual(true))
    await eventually(() => expect(f.isSubscribedClientB('someTopic', { id: '456' })).toEqual(true))
    f.clientA.topic.someTopic.pub({ id: '123' }, { id: 1 })
    await eventually(() => {
      expect(gotA).toEqual([{ id: 1 }, { id: 1 }])
      expect(gotB).toEqual([])
    })
  })

  test('should handle multiple messages in sequence', async () => {
    await using f = await Fixture()
    const gotA: TestMsg[] = []
    f.clientA.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    await eventually(() => expect(f.isSubscribedClientA('someTopic', { id: '123' })).toEqual(true))
    f.clientA.topic.someTopic.pub({ id: '123' }, { id: 1 })
    f.clientA.topic.someTopic.pub({ id: '123' }, { id: 2 })
    f.clientA.topic.someTopic.pub({ id: '123' }, { id: 3 })
    await eventually(() => {
      expect(sortMsgs(gotA)).toEqual(sortMsgs([{ id: 1 }, { id: 1 }, { id: 2 }, { id: 2 }, { id: 3 }, { id: 3 }]))
    })
  })

  test('should handle multiple subscribers with different topic params', async () => {
    await using f = await Fixture()
    const gotA: TestMsg[] = []
    const gotB: TestMsg[] = []
    const gotC: TestMsg[] = []

    f.clientA.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    f.clientB.topic.someTopic.sub({ id: '456' }, (x) => x).sub((msg) => gotB.push(msg))
    f.clientC.topic.someTopic.sub({ id: '789' }, (x) => x).sub((msg) => gotC.push(msg))

    await eventually(() => {
      expect(f.isSubscribedClientA('someTopic', { id: '123' })).toEqual(true)
      expect(f.isSubscribedClientB('someTopic', { id: '456' })).toEqual(true)
      expect(f.isSubscribedClientC('someTopic', { id: '789' })).toEqual(true)
    })

    f.clientA.topic.someTopic.pub({ id: '123' }, { id: 1 })
    f.clientB.topic.someTopic.pub({ id: '456' }, { id: 2 })
    f.clientC.topic.someTopic.pub({ id: '789' }, { id: 3 })
    await eventually(() => {
      expect(gotA).toEqual([{ id: 1 }, { id: 1 }])
      expect(gotB).toEqual([{ id: 2 }, { id: 2 }])
      expect(gotC).toEqual([{ id: 3 }, { id: 3 }])
    })
  })

  test('should handle unsubscribe correctly', async () => {
    await using f = await Fixture()
    const gotA: TestMsg[] = []
    const gotB: TestMsg[] = []

    const unsubA = f.clientA.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))

    f.clientB.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotB.push(msg))
    await eventually(() => {
      expect(f.isSubscribedClientA('someTopic', { id: '123' })).toEqual(true)
      expect(f.isSubscribedClientB('someTopic', { id: '123' })).toEqual(true)
    })
    f.clientA.topic.someTopic.pub({ id: '123' }, { id: 1 })
    await eventually(() => {
      expect(gotA).toEqual([{ id: 1 }, { id: 1 }])
      expect(gotB).toEqual([{ id: 1 }])
    })
    unsubA()
    await eventually(() => {
      expect(f.isSubscribedClientA('someTopic', { id: '123' })).toEqual(false)
    })
    f.clientA.topic.someTopic.pub({ id: '123' }, { id: 2 })
    await eventually(() => {
      expect(gotA).toEqual([{ id: 1 }, { id: 1 }])
      expect(gotB).toEqual([{ id: 1 }, { id: 2 }])
    })
  })

  test('should handle multiple messages on the same topic', async () => {
    await using f = await Fixture()
    const gotA: TestMsg[] = []
    const gotB: TestMsg[] = []

    f.clientA.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    f.clientB.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotB.push(msg))
    await eventually(() => {
      expect(f.isSubscribedClientA('someTopic', { id: '123' })).toEqual(true)
      expect(f.isSubscribedClientB('someTopic', { id: '123' })).toEqual(true)
    })

    f.clientA.topic.someTopic.pub({ id: '123' }, { id: 1 })
    f.clientA.topic.someTopic.pub({ id: '123' }, { id: 2 })
    f.clientA.topic.someTopic.pub({ id: '123' }, { id: 3 })
    await eventually(() => {
      expect(sortMsgs(gotA)).toEqual(sortMsgs([{ id: 1 }, { id: 1 }, { id: 2 }, { id: 2 }, { id: 3 }, { id: 3 }]))
      expect(sortMsgs(gotB)).toEqual(sortMsgs([{ id: 1 }, { id: 2 }, { id: 3 }]))
    })
  })

  test('should handle nested topics correctly', async () => {
    await using f = await Fixture()
    const gotA: TestMsg[] = []
    const gotB: TestMsg[] = []

    f.clientA.topic.nestedSomeTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    f.clientB.topic.nestedSomeTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotB.push(msg))
    await eventually(() => {
      expect(f.isSubscribedClientA('nestedSomeTopic', { id: '123' })).toEqual(true)
      expect(f.isSubscribedClientB('nestedSomeTopic', { id: '123' })).toEqual(true)
    })
    f.clientA.topic.nestedSomeTopic.pub({ id: '123' }, { id: 1 })

    await eventually(() => {
      expect(sortMsgs(gotA)).toEqual(sortMsgs([{ id: 1 }, { id: 1 }]))
      expect(sortMsgs(gotB)).toEqual(sortMsgs([{ id: 1 }]))
    })
  })

  test('should handle multiple unsubscribes correctly', async () => {
    await using f = await Fixture()
    const gotA: TestMsg[] = []
    const gotB: TestMsg[] = []
    const gotC: TestMsg[] = []

    const unsubA = f.clientA.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    const unsubB = f.clientB.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotB.push(msg))
    f.clientC.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotC.push(msg))
    await eventually(() => {
      expect(f.isSubscribedClientA('someTopic', { id: '123' })).toEqual(true)
      expect(f.isSubscribedClientB('someTopic', { id: '123' })).toEqual(true)
      expect(f.isSubscribedClientC('someTopic', { id: '123' })).toEqual(true)
    })
    f.clientA.topic.someTopic.pub({ id: '123' }, { id: 1 })
    await eventually(() => {
      expect(gotA).toEqual([{ id: 1 }, { id: 1 }])
      expect(gotB).toEqual([{ id: 1 }])
      expect(gotC).toEqual([{ id: 1 }])
    })
    unsubA()
    unsubB()
    await eventually(() => {
      expect(f.isSubscribedClientA('someTopic', { id: '123' })).toEqual(false)
      expect(f.isSubscribedClientB('someTopic', { id: '123' })).toEqual(false)
    })
    f.clientA.topic.someTopic.pub({ id: '123' }, { id: 2 })
    await eventually(() => {
      expect(gotA).toEqual([{ id: 1 }, { id: 1 }])
      expect(gotB).toEqual([{ id: 1 }])
      expect(gotC).toEqual([{ id: 1 }, { id: 2 }])
    })
  })

  test('should handle multiple subscriptions to the same topic correctly', async () => {
    await using f = await Fixture()
    const gotA1: TestMsg[] = []
    const gotA2: TestMsg[] = []
    const gotB: TestMsg[] = []

    f.clientA.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA1.push(msg))
    f.clientA.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA2.push(msg))
    f.clientB.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotB.push(msg))
    await eventually(() => {
      expect(f.isSubscribedClientA('someTopic', { id: '123' })).toEqual(true)
      expect(f.isSubscribedClientB('someTopic', { id: '123' })).toEqual(true)
    })
    f.clientA.topic.someTopic.pub({ id: '123' }, { id: 1 })
    await eventually(() => {
      expect(gotA1).toEqual([{ id: 1 }, { id: 1 }])
      expect(gotA2).toEqual([{ id: 1 }, { id: 1 }])
      expect(gotB).toEqual([{ id: 1 }])
    })
  })

  test('should handle different topic parameters correctly', async () => {
    await using f = await Fixture()
    const gotA: TestMsg[] = []
    const gotB: TestMsg[] = []

    f.clientA.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    f.clientB.topic.someTopic.sub({ id: '456' }, (x) => x).sub((msg) => gotB.push(msg))
    await eventually(() => {
      expect(f.isSubscribedClientA('someTopic', { id: '123' })).toEqual(true)
      expect(f.isSubscribedClientB('someTopic', { id: '456' })).toEqual(true)
    })

    f.clientA.topic.someTopic.pub({ id: '123' }, { id: 1 })
    f.clientA.topic.someTopic.pub({ id: '456' }, { id: 2 })

    await eventually(() => {
      expect(gotA).toEqual([{ id: 1 }, { id: 1 }])
      expect(gotB).toEqual([{ id: 2 }])
    })
  })

  test('should handle reconnection correctly', async () => {
    await using f = await Fixture()
    const gotA: TestMsg[] = []
    const gotB: TestMsg[] = []

    f.clientA.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    f.clientB.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotB.push(msg))
    await eventually(() => {
      expect(f.isSubscribedClientA('someTopic', { id: '123' })).toEqual(true)
      expect(f.isSubscribedClientB('someTopic', { id: '123' })).toEqual(true)
    })

    f.clientA.topic.someTopic.pub({ id: '123' }, { id: 1 })
    await eventually(() => {
      expect(gotA).toEqual([{ id: 1 }, { id: 1 }])
      expect(gotB).toEqual([{ id: 1 }])
    })

    await f.restartServer()

    f.clientA.topic.someTopic.pub({ id: '123' }, { id: 2 })
    await eventually(() => {
      expect(sortMsgs(gotA)).toEqual(sortMsgs([{ id: 1 }, { id: 1 }, { id: 2 }, { id: 2 }]))
      expect(sortMsgs(gotB)).toEqual(sortMsgs([{ id: 1 }, { id: 2 }]))
    })
  })
})
