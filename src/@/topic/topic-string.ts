import { deterministicJsonStringify } from '~/@/json/deterministic-stringify'
import { s } from '~/@/schema'

export const parser = s.brand(s.str(), 'Topic')
export type TopicString = s.Infer<typeof parser>

export const TopicName = s.brand(s.str(), 'TopicName')
export type TopicName = s.Infer<typeof TopicName>

export const TopicParams = s.brand(s.dict(s.str(), s.unknown), 'TopicParams')
export type TopicParams = s.Infer<typeof TopicParams>

const init = (topicName: TopicName, topicParams: TopicParams): TopicString => {
  return [topicName, deterministicJsonStringify(topicParams)].join('/') as TopicString
}

const fromString = (topicString: string): TopicString => {
  return topicString as TopicString
}

export const TopicString = {
  ...parser,
  init,
  fromString,
}
