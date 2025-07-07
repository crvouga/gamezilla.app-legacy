import { Eff } from '~/@/eff'
import type { RemoteResult, Result } from '~/@/result'
import type { UserId } from '~/app/@/data/user-id'
import type { ChatId } from './@/chat-id'
import type { ChatMessageId } from './@/chat-message-id'
import type { ChatUserJoinId } from './@/chat-user-join-id'

//
//
//
// Model
//
//
//

export type ModelFrontend = {
  chats: {
    [chatId: ChatId]: {
      chatId: ChatId
    }
  }
  chatsUsers: {
    [chatsUsersId: ChatUserJoinId]: {
      chatsUsersId: ChatUserJoinId
      chatId: ChatId
      userId: UserId
    }
  }
  users: {
    [userId: UserId]: {
      userId: UserId
      chatId: ChatId
    }
  }
  messages: {
    [messageId: ChatMessageId]: {
      messageId: ChatMessageId
      chatId: ChatId
    }
  }
  messageDrafts: {
    [chatId: ChatId]: {
      chatId: ChatId
      text: string
    }
  }
  requests: {
    [key in Req[0]]?: RemoteResult<Problem, null>
  }
  userSearch: string
  userSelected: {
    [userId: UserId]: UserId
  }
}

export type ModelBackend = null

//
//
//
// Msg
//
//
//

export type MsgFrontend =
  | ['inputted-user-search', { userSearch: string }]
  | ['clicked-user-search-result', { userId: UserId }]
  | [
      'clicked-user-selected-delete-button',
      {
        userId: UserId
      },
    ]
  | ['clicked-user-search-clear-button']
  | Req

export type Req =
  | ['chat-join', { chatId: string }]
  | ['chat-leave', { chatId: string }]
  | ['chat-list', { userId: UserId }]
  | ['chat-start', { userId: UserId[] }]
  | ['message-send', { chatId: string; text: string }]
  | ['message-unsend', { chatId: string; text: string }]
  | ['message-list', { chatId: string }]

type Problem = ['database-error', string]

export type Res = [...Req, Result<Problem, Partial<ModelFrontend>>]

export const update = (input: { msg: MsgFrontend; model: ModelFrontend }) => {
  switch (input.msg[0]) {
    default: {
      return null
    }
  }
}

export type MsgToBackend = Req

export type MsgBackend = Res

export type MsgToFrontend = Res

export const updateFromFrontend = ({
  msg,
}: {
  msg: MsgToBackend
  model: ModelBackend
}): {
  eff: Eff<MsgBackend>
} => {
  switch (msg[0]) {
    default: {
      return {
        eff: () => {
          //
        },
      }
    }
  }
}
