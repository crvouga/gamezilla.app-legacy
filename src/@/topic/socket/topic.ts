import { Brand } from '~/@/brand/brand'
import { deterministicJsonStringify } from '~/@/json/deterministic-stringify'
import { s } from '~/@/schema'

export const Topic = s.brand(s.str(), 'Topic')
export type Topic = Brand<string, 'Topic'>

export const TopicName = s.brand(s.str(), 'TopicName')
export type TopicName = s.Infer<typeof TopicName>

export const TopicParams = s.brand(s.dict(s.str(), s.unknown), 'TopicParams')
export type TopicParams = s.Infer<typeof TopicParams>

export const toTopic = (topicName: TopicName, topicParams: TopicParams): Topic => {
  return [topicName, deterministicJsonStringify(topicParams)].join('/') as Topic
}
