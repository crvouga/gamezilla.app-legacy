import * as Snackbar from "Snackbar"
import * as Supabase from "Supabase"
import { Cmd, Result, Task } from "Core"
import { definitions } from "supabase-types"
import * as Store from "./Store"

//
//
//
// Model
//
//
//

type Model = Store.Model

export type Conversation = {
  conversationId: string
}

type Problem = { message: string }

//
//
//
// Msg
//
//
//

export type Msg = Created | Create

export const Create = (userIds: string[]) => {
  return {
    type: "Conversation/Create",
    group: "Store",
    entity: "Conversation",
    userIds,
  } as const
}

export type Create = ReturnType<typeof Create>

export const Created = (result: Result.Result<Problem, Conversation>) => {
  return {
    type: "Conversation/Created",
    group: "Store",
    entity: "Conversation",
    result,
  } as const
}

export type Created = ReturnType<typeof Created>

//
//
//
// Update
//
//
//

type Action = Snackbar.GroupedMsg

export const update = (
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, Action[]] => {
  switch (msg.type) {
    case "Conversation/Create":
      const mutationsNew: Model["mutations"] = {
        ...model.mutations,
      }
      return [{ ...model, mutations: mutationsNew }, Cmd.none, []]

    case "Conversation/Created":
      return [model, Cmd.none, []]
  }
}

//
//
//
// Data Access
//
//
//

const fromRow = (row: definitions["conversation"]): Conversation => {
  return {
    conversationId: row.id,
  }
}

export const insert =
  (): Task.Task<Result.Result<Problem, Conversation>> => async () => {
    const response = await Supabase.client
      .from<definitions["conversation"]>("conversation")
      .insert({})
      .single()

    if (response.error) {
      return Result.Err({ message: response.error.message })
    }

    return Result.Ok(fromRow(response.data))
  }
