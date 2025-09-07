import { ascend } from '~/@/array/sorting'
import { s } from '~/@/schema'
import { TimeSpan } from '~/@/time/time-span'
import { ITopicClient } from '~/@/topic/topic-client/types'
import { TopicContract } from '~/@/topic/topic-contract'
import { ClientSessionId } from '~/@/wire/client-session-id'

export const TestMsg = s.obj({
  id: s.num(),
})
export type TestMsg = s.Infer<typeof TestMsg>

export const sortMsgs = (msgs: TestMsg[]) => msgs.toSorted(ascend((x) => x.id))

export const testTopicContract = TopicContract.init({
  someTopic: {
    params: s.obj({
      id: s.str(),
    }),
    msg: TestMsg,
  },
  nestedSomeTopic: {
    params: s.obj({
      id: s.str(),
    }),
    msg: TestMsg,
  },
})

export const RECONNECTION_RATE = TimeSpan.milliseconds(0)
export const SYNC_SUBSCRIPTION_RATE = TimeSpan.milliseconds(0)

export type TestTopicContract = typeof testTopicContract
export type TestTopicContractKey = keyof TestTopicContract

export type IFixture = {
  topicContract: typeof testTopicContract
  clientA: {
    clientSessionId: ClientSessionId
    topic: ITopicClient<TestTopicContract>
  }
  clientB: {
    clientSessionId: ClientSessionId
    topic: ITopicClient<TestTopicContract>
  }
  clientC: {
    clientSessionId: ClientSessionId
    topic: ITopicClient<TestTopicContract>
  }
  isSubscribedClientA: (
    topicName: TestTopicContractKey,
    params: s.Infer<(typeof testTopicContract)[TestTopicContractKey]['params']>,
  ) => boolean
  isSubscribedClientB: (
    topicName: TestTopicContractKey,
    params: s.Infer<(typeof testTopicContract)[TestTopicContractKey]['params']>,
  ) => boolean
  isSubscribedClientC: (
    topicName: TestTopicContractKey,
    params: s.Infer<(typeof testTopicContract)[TestTopicContractKey]['params']>,
  ) => boolean
  restartServer: () => Promise<void>
  [Symbol.asyncDispose]: () => Promise<void>
}
