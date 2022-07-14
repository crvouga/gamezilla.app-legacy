import { Cmd, Sub, Time } from "Core";
import { broadcast } from "Core/Fullstack";
import { BackendModel, BackendMsg, CounterModel, ToBackend } from "./Types";

//
//
//
// Model
//
//
//

export type Model = BackendModel;

export const init: Model = {
  count: 0,
  status: "Incrementing",
};

//
//
//
// Update
//
//
//

export type Msg = BackendMsg;

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "Ticked":
      switch (model.status) {
        case "Idle":
          return [model, Cmd.None];

        case "Incrementing": {
          const modelNew: Model = {
            ...model,
            count: model.count + 1,
          };
          return [modelNew, broadcast(["Counter", ["CounterNew", modelNew]])];
        }
      }
  }
};

export const updateFromFrontend = (
  msg: ToBackend,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "ClickedToggle": {
      const modelNew: Model = {
        ...model,
        status: toggleStatus(model.status),
      };
      return [modelNew, broadcast(["Counter", ["CounterNew", modelNew]])];
    }
  }
};

const toggleStatus = (
  status: CounterModel["status"],
): CounterModel["status"] => {
  switch (status) {
    case "Idle":
      return "Incrementing";

    case "Incrementing":
      return "Idle";
  }
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (model: Model): Sub.Sub<Msg> => {
  switch (model.status) {
    case "Idle":
      return Sub.None;

    case "Incrementing":
      return Time.every<Msg>(1000, () => ["Ticked"]);
  }
};
