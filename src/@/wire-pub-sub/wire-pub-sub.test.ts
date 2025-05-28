import { WirePubSub } from '.'
import { s } from '../schema'

export const childContract = WirePubSub.initContract({
  someTopic: {
    params: s.obj({
      id: s.str,
    }),
    msg: s.obj({
      name: s.str,
    }),
  },
})

export const contract = WirePubSub.initContract({
  someTopic: {
    params: s.obj({
      id: s.str,
    }),
    msg: s.obj({
      name: s.str,
    }),
  },
  child: childContract,
})

export const client = WirePubSub.initClient(contract)

client.someTopic.publish({ id: '123' }, { name: 'John' })

client.someTopic.subscribe({ id: '123' }).sub(console.log)

client.child.someTopic.publish({ id: '123' }, { name: 'John' })

client.child.someTopic.subscribe({ id: '123' }).sub(console.log)
