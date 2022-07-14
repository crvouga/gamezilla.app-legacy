import { Cmd } from "Core";

//
//
//
// Model
//
//
//

export type Model = { [clientId: string]: string };

export const init: Model = {};

//
//
//
// Update
//
//
//

export type Msg = ["Connected", string] | ["Disconnected", string];

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "Connected":
      return [{ ...model, [msg[1]]: msg[1] }, Cmd.None];

    case "Disconnected":
      return [dissoc(msg[1], model), Cmd.None];
  }
};

const dissoc = <T>(key: keyof T, record: T): Omit<T, keyof T> => {
  const { [key]: _value, ...rest } = record;

  return rest;
};
