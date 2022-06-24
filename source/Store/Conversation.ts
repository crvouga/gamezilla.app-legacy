import { definitions } from "supabase-types"
import * as Supabase from "Supabase"
import { either, task } from "fp-ts"
import * as Result from "Core/Result"

//
//
//
// Model
//
//
//

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
//
//
//
//

const fromRow = (row: definitions["conversation"]): Conversation => {
  return {
    conversationId: row.id,
  }
}

export const insert =
  (): task.Task<either.Either<Problem, Conversation>> => async () => {
    const response = await Supabase.client
      .from<definitions["conversation"]>("conversation")
      .insert({})
      .single()

    if (response.error) {
      return either.left({ message: response.error.message })
    }

    return either.right(fromRow(response.data))
  }
