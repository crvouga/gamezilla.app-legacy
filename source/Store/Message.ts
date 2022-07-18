import produce from "immer";
import * as Supabase from "../Supabase";
import * as Types from "./Types";
import { Cmd, RemoteData, Result, Task, pipe } from "../Core";
import { definitions } from "../supabase-types";
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

export type Msg = InsertResulted | DeleteForeverResulted;

export type Action = Insert | DeleteForever;

export const Insert = ({
  userId,
  conversationId,
  messageText: message,
}: {
  userId: string;
  conversationId: string;
  messageText: string;
}) => {
  return {
    type: "Message/Insert",
    group: "Store",
    entity: "Message",
    userId,
    conversationId,
    message,
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

export const DeleteForever = ({ messageId }: { messageId: string }) => {
  return {
    type: "Message/DeleteForever",
    group: "Store",
    entity: "Message",

    messageId,
  } as const;
};
export type DeleteForever = ReturnType<typeof DeleteForever>;

export const DeleteForeverResulted = (
  messageId: string,
  result: Result.Result<Problem, string>,
) => {
  return {
    type: "Message/DeleteForeverResulted",
    group: "Store",
    entity: "Message",
    messageId,
    result,
  } as const;
};
export type DeleteForeverResulted = ReturnType<typeof DeleteForeverResulted>;

//
//
//
// Update
//
//
//

export const update = (msg: Msg, model: Store): [Store, Cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "Message/DeleteForeverResulted": {
      const modelNew = produce(model, (model) => {
        model.mutations.Message.DeleteForever[msg.messageId] = pipe(
          msg.result,
          RemoteData.fromResult,
        );
        if (msg.result.type === "Ok") {
          delete model.Message[msg.messageId];
        }
      });

      return [modelNew, Cmd.None];
    }

    case "Message/InsertResulted": {
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

      return [modelNew, Cmd.None];
    }
  }
};

export const runAction = (
  action: Action,
  model: Store,
): [Store, Cmd.Cmd<Msg>] => {
  switch (action.type) {
    case "Message/DeleteForever": {
      const modelNew = produce(model, (modelNew) => {
        modelNew.mutations.Message.DeleteForever[action.messageId] =
          RemoteData.Loading;
      });
      return [
        modelNew,
        pipe(
          deleteForever({ messageId: action.messageId }),
          Cmd.fromTask((result) =>
            DeleteForeverResulted(action.messageId, result),
          ),
        ),
      ];
    }

    case "Message/Insert": {
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

const deleteForever =
  ({
    messageId,
  }: {
    messageId: string;
  }): Task.Task<Result.Result<Problem, string>> =>
  async () => {
    const response = await Supabase.client
      .from<definitions["message"]>("message")
      .delete()
      .eq("id", messageId);

    if (response.error) {
      return Result.Err({ message: response.error.message });
    }

    return Result.Ok(messageId);
  };
