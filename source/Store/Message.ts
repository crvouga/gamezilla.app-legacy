import * as Snackbar from "Snackbar";
import { Cmd, Result } from "Core";
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

export type Msg = Inserted;

export type Action = Insert;

export const Insert = (creatorId: string, userIds: string[]) => {
  return {
    type: "Message/Insert",
    group: "Store",
    entity: "Message",
    userIds,
    creatorId,
  } as const;
};
export type Insert = ReturnType<typeof Insert>;

export const Inserted = (
  userIds: string[],
  result: Result.Result<Problem, { message: Message }>,
) => {
  return {
    type: "Message/Inserted",
    group: "Store",
    entity: "Message",
    userIds,
    result,
  } as const;
};
export type Inserted = ReturnType<typeof Inserted>;

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
    case "Message/Inserted":
      return [model, Cmd.None, []];
  }
};

export const runAction = (
  action: Action,
  model: Store,
): [Store, Cmd.Cmd<Msg>] => {
  switch (action.type) {
    case "Message/Insert":
      return [model, Cmd.None];
  }
};

//
//
//
// Data Access
//
//
//
