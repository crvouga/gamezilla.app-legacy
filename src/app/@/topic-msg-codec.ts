import { TopicMsgCodec, TopicMsgCodecJson, TopicMsgCodecMsgPack } from '~/@/topic/socket/topic-msg-codec'

const USE_MSG_PACK = false

export const topicMsgCodec: TopicMsgCodec = USE_MSG_PACK ? TopicMsgCodecMsgPack : TopicMsgCodecJson
