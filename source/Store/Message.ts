import * as Snackbar from "Snackbar";
import * as Supabase from "Supabase";
import { Cmd, RemoteData, Result, Task, Uuid, pipe } from "Core";
import produce from "immer";
import { definitions } from "supabase-types";
import * as Types from "./Types";
import { Problem, Store } from "./Types";

//
//
//
// Model
//
//
//

export type Message = Types.Message;

//
//
//
// Msg
//
//
//

export type Msg = InsertResulted;

export type Action = Insert;

export const Insert = ({
  userId,
  conversationId,
  messageText: message,
}: {
  userId: string;
  conversationId: string;
  messageText: string;
}) => {
  const messageId = Uuid.generateSync();
  return {
    type: "Message/Insert",
    group: "Store",
    entity: "Message",
    userId,
    conversationId,
    message,
    messageId,
  } as const;
};
export type Insert = ReturnType<typeof Insert>;

export const InsertResulted = (
  conversationId: string,
  result: Result.Result<Problem, Message>,
) => {
  return {
    type: "Message/InsertResulted",
    group: "Store",
    entity: "Message",
    conversationId,
    result,
  } as const;
};
export type InsertResulted = ReturnType<typeof InsertResulted>;

//
//
//
// Update
//
//
//

type OutAction = Snackbar.Action;

export const update = (
  msg: Msg,
  model: Store,
): [Store, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (msg.type) {
    case "Message/InsertResulted":
      const modelNew = produce(model, (model) => {
        model.mutations.Message.Insert[msg.conversationId] = pipe(
          msg.result,
          RemoteData.fromResult,
          RemoteData.mapSuccess((item) => item.messageId),
        );
        if (msg.result.type === "Ok") {
          const data = msg.result.value;
          model.Message[data.messageId] = data;
        }
      });

      return [modelNew, Cmd.None, []];
  }
};

export const runAction = (
  action: Action,
  model: Store,
): [Store, Cmd.Cmd<Msg>] => {
  switch (action.type) {
    case "Message/Insert":
      const modelNew = produce(model, (model) => {
        model.mutations.Message.Insert[action.conversationId] =
          RemoteData.Loading;
      });

      return [
        modelNew,
        pipe(
          insert({
            userId: action.userId,
            conversationId: action.conversationId,
            message: action.message,
          }),
          Cmd.fromTask((result) =>
            InsertResulted(action.conversationId, result),
          ),
        ),
      ];
  }
};

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
    conversationId: string;
    message: string;
    userId: string;
  }): Task.Task<Result.Result<Problem, Message>> =>
  async () => {
    const messageResponse = await Supabase.client
      .from<definitions["message"]>("message")
      .insert({ message, user_id: userId, conversation_id: conversationId })
      .single();

    if (messageResponse.error) {
      return Result.Err({ message: messageResponse.error.message });
    }

    const data = messageResponse.data;

    return Result.Ok({
      messageId: data.id,
      conversationId: data.conversation_id,
      userId: data.user_id,
      message: data.message,
    });
  };
