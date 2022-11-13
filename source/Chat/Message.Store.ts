import produce from "immer"
import { Cmd, p, RemoteData, Result, Task } from "../Core"
import { UserId } from "../Data"
import * as Supabase from "../Supabase"
import { definitions } from "../Supabase.Types"
import * as Types from "./Types"
import { Problem, Store } from "./Types"

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
      const modelNew = produce(model, (model) => {
        model.mutations.Message.Send[conversationId] = p(
          result,
          RemoteData.map((item) => item.messageId),
        )
        switch (result.type) {
          case "Err":
            break

          case "Ok":
            const message = result.value
            model.Message[message.messageId] = message
            break
        }
      })

      return [modelNew, Cmd.None]
    }
  }
}

export const runAction = (
  action: Action,
  model: Store,
): [Store, Cmd<Msg>] => {
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
      const messageResponse = await Supabase.client
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
  ({
    messageId,
  }: {
    messageId: string
  }): Task<Result<Problem, string>> =>
    async () => {
      const response = await Supabase.client
        .from<definitions["message"]>("message")
        .delete()
        .eq("id", messageId)

      if (response.error) {
        return Result.Err(response.error.message)
      }

      return Result.Ok(messageId)
    }
