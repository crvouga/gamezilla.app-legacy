import { PubSub } from '~/@/sub'
import { TopicName, TopicParams } from './topic'

export type TopicSubscription = {
  pubSub: PubSub<any>
  topicName: TopicName
  topicParams: TopicParams
}
