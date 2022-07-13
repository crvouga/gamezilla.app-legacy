//
//
//
// Model
//
//
//
import { Cmd } from "Core";

export type Model = { [clientId: string]: string };

export const init: Model = {};

//
//
//
// Update
//
//
//

export type Msg =
  | { group: "Clients"; type: "Connected"; clientId: string }
  | { group: "Clients"; type: "Disconnected"; clientId: string };

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "Connected":
      return [{ ...model, [msg.clientId]: msg.clientId }, Cmd.None];

    case "Disconnected":
      return [dissoc(msg.clientId, model), Cmd.None];
  }
};

const dissoc = <T>(key: keyof T, record: T): Omit<T, keyof T> => {
  const { [key]: _value, ...rest } = record;

  return rest;
};
