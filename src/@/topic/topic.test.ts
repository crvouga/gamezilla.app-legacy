import { describe, expect, it } from 'bun:test'
import { WirePubSub } from '.'
import { s } from '../schema'

const Msg = s.obj({
  name: s.str,
})
type Msg = s.Infer<typeof Msg>

const Fixture = () => {
  const childContract = WirePubSub.initContract({
    someTopic: {
      params: s.obj({
        id: s.str,
      }),
      msg: Msg,
    },
  })

  const contract = WirePubSub.initContract({
    someTopic: {
      params: s.obj({
        id: s.str,
      }),
      msg: Msg,
    },
    child: childContract,
  })

  const client = WirePubSub.initClient(contract)

  return {
    contract,
    client,
  }
}

describe.only('Topic', () => {
  it('should work', async () => {
    const f = Fixture()
    const got: Msg[] = []
    f.client.someTopic.subscribe({ id: '123' }).sub((msg) => {
      got.push(msg)
    })
    await f.client.someTopic.publish({ id: '123' }, { name: 'John' })
    expect(got).toEqual([{ name: 'John' }])
  })
})
