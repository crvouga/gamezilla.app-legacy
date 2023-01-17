import { Cmd, p, RemoteData, Result, Task } from "@gamezilla/core"
import { UserId } from "@gamezilla/shared"
import { client, definitions } from "@gamezilla/supabase"
import produce from "immer"
import type { Problem, Store } from "./Types"
import * as Types from "./Types"

//
//
//
// Model
//
//
//

export type Message = Types.Message

//
//
//
// Msg
//
//
//

export type Msg = Send_Done | Unsend_Done

export type Action = Send | Unsend

export type Send = [
  "Send",
  { userId: UserId; conversationId: string; messageText: string },
]

export type Send_Done = [
  "Send_Done",
  { conversationId: string; result: Result<Problem, Message> },
]

export type Unsend = ["Unsend", { messageId: string }]

export type Unsend_Done = [
  "Unsend_Done",
  { messageId: string; result: Result<Problem, string> },
]

//
//
//
// Update
//
//
//

export const update = (msg: Msg, model: Store): [Store, Cmd<Msg>] => {
  switch (msg[0]) {
    case "Unsend_Done": {
      const { messageId, result } = msg[1]
      const modelNew = produce(model, (model) => {
        model.mutations.Message.Unsend[messageId] = result

        switch (result.type) {
          case "Err":
            break

          case "Ok":
            delete model.Message[messageId]
            break
        }
      })
      return [modelNew, Cmd.None]
    }

    case "Send_Done": {
      const { conversationId, result } = msg[1]


      const modelNew: Store = {
        ...model,
        mutations: {
          ...model.mutations,
          Message: {
            ...model.mutations.Message,
            Send: {
              ...model.mutations.Message.Send,
              [conversationId]: p(result, RemoteData.map((message) => message.messageId)),
            },
          },
        },

        Message: {
          ...model.Message,
          ...(result.type === "Ok"
            ? { [result.value.messageId]: result.value, }
            : {}),
        },
      }


      return [modelNew, Cmd.None]
    }
  }
}

export const runAction = (action: Action, model: Store): [Store, Cmd<Msg>] => {
  switch (action[0]) {
    case "Unsend": {
      const { messageId } = action[1]
      const modelNew = produce(model, (modelNew) => {
        modelNew.mutations.Message.Unsend[messageId] = RemoteData.Loading
      })

      return [
        modelNew,
        p(
          deleteForever({ messageId }),
          Cmd.perform((result): Msg => ["Unsend_Done", { messageId, result }]),
        ),
      ]
    }

    case "Send": {
      const { conversationId, userId, messageText } = action[1]
      const modelNew = produce(model, (model) => {
        model.mutations.Message.Send[conversationId] = RemoteData.Loading
      })

      return [
        modelNew,
        p(
          insert({
            userId,
            conversationId,
            message: messageText,
          }),
          Cmd.perform(
            (result): Msg => ["Send_Done", { conversationId, result }],
          ),
        ),
      ]
    }
  }
}

//
//
//
// Data Access
//
//
//

const insert =
  ({
    message,
    userId,
    conversationId,
  }: {
    conversationId: string
    message: string
    userId: UserId
  }): Task<Result<Problem, Message>> =>
    async () => {
      const messageResponse = await client
        .from<definitions["message"]>("message")
        .insert({
          message,
          user_id: userId,
          conversation_id: conversationId,
        })
        .single()

      if (messageResponse.error) {
        return Result.Err(messageResponse.error.message)
      }

      const data = messageResponse.data

      return Result.Ok({
        messageId: data.id,
        conversationId: data.conversation_id,
        userId,
        message: data.message,
      })
    }

const deleteForever =
  ({ messageId }: { messageId: string }): Task<Result<Problem, string>> =>
    async () => {
      const response = await client
        .from<definitions["message"]>("message")
        .delete()
        .eq("id", messageId)

      if (response.error) {
        return Result.Err(response.error.message)
      }

      return Result.Ok(messageId)
    }
