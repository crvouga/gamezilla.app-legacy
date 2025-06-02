import { PubSub } from '~/@/sub'
import { TopicName } from './topic'

export type TopicNameSubscription = {
  pubSub: PubSub<any>
  topicName: TopicName
}
