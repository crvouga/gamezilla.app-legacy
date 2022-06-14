import { definitions } from "supabase-types";
import * as Supabase from "Supabase";
//
//
//
// Model
//
//
//

import { either, task } from "fp-ts";

export type Conversation = {
  conversationId: string;
};

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
  };
};

type Problem = { message: string };

export const insert =
  (): task.Task<either.Either<Problem, Conversation>> => async () => {
    const response = await Supabase.client
      .from<definitions["conversation"]>("conversation")
      .insert({})
      .single();

    if (response.error) {
      return either.left({ message: response.error.message });
    }

    return either.right(fromRow(response.data));
  };
