import produce from "immer"
import { Cmd, pipe, RemoteData, Result, Task } from "../Core"
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

export type Msg = SendResulted | UnsendResulted

export type Action = Send | Unsend

export type Send = [
  "Send",
  { userId: UserId.UserId; conversationId: string; messageText: string },
]

export type SendResulted = [
  "SendResulted",
  { conversationId: string; result: Result.Result<Problem, Message> },
]

export type Unsend = ["Unsend", { messageId: string }]

export type UnsendResulted = [
  "UnsendResulted",
  { messageId: string; result: Result.Result<Problem, string> },
]

//
//
//
// Update
//
//
//

export const update = (msg: Msg, model: Store): [Store, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "UnsendResulted": {
      const { messageId, result } = msg[1]
      const modelNew = produce(model, (model) => {
        model.mutations.Message.Unsend[messageId] = pipe(
          result,
          RemoteData.fromResult,
        )

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

    case "SendResulted": {
      const { conversationId, result } = msg[1]
      const modelNew = produce(model, (model) => {
        model.mutations.Message.Send[conversationId] = pipe(
          result,
          RemoteData.fromResult,
          RemoteData.mapSuccess((item) => item.messageId),
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

export const updateFromAction = (
  action: Action,
  model: Store,
): [Store, Cmd.Cmd<Msg>] => {
  switch (action[0]) {
    case "Unsend": {
      const { messageId } = action[1]
      const modelNew = produce(model, (modelNew) => {
        modelNew.mutations.Message.Unsend[messageId] = RemoteData.Loading
      })

      return [
        modelNew,
        pipe(
          deleteForever({ messageId }),
          Cmd.perform(
            (result): Msg => ["UnsendResulted", { messageId, result }],
          ),
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
        pipe(
          insert({
            userId,
            conversationId,
            message: messageText,
          }),
          Cmd.perform(
            (result): Msg => ["SendResulted", { conversationId, result }],
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
    userId: UserId.UserId
  }): Task.Task<Result.Result<Problem, Message>> =>
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
  }): Task.Task<Result.Result<Problem, string>> =>
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
