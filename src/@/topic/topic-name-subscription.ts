import { PubSub } from '~/@/sub'
import { TopicName } from './topic-string'

export type TopicNameSubscription = {
  pubSub: PubSub<any>
  topicName: TopicName
}
