import { Cmd, Sub, Time } from "Core";
import { broadcast } from "Types";
import { BackendModel, BackendMsg, Counter, ToBackend } from "./Types";

//
//
//
// Model
//
//
//

export type Model = BackendModel;

export const init: [Model, Cmd.Cmd<Msg>] = [
  {
    count: 0,
    status: "Incrementing",
  },
  Cmd.None,
];

//
//
//
// Update
//
//
//

export type Msg = BackendMsg;

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "Ticked":
      switch (model.status) {
        case "Idle":
          return [model, Cmd.None];

        case "Incrementing": {
          const modelNew: Model = {
            ...model,
            count: model.count + 1,
          };
          return [
            modelNew,
            broadcast({
              type: "CounterNew",
              group: "Counter",
              counter: modelNew,
            }),
          ];
        }
      }
  }
};

export const updateFromFrontend = (
  msg: ToBackend,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "Toggle": {
      const modelNew: Model = {
        ...model,
        status: toggleStatus(model.status),
      };
      return [
        modelNew,
        broadcast({
          type: "CounterNew",
          group: "Counter",
          counter: modelNew,
        }),
      ];
    }
  }
};

const toggleStatus = (status: Counter["status"]): Counter["status"] => {
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
      return Time.every<Msg>(1000, () => ({
        group: "Counter",
        type: "Ticked",
      }));
  }
};
