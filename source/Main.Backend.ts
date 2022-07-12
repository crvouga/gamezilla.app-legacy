import { Cmd, Fullstack, Platform, Sub, Time } from "Core";
import {
  BackendModel,
  BackendMsg,
  Counter,
  ToBackend,
  broadcast,
  sendToFrontend,
} from "Types";

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
    clients: {},
    counter: {
      count: 0,
      status: "Incrementing",
    },
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
    case "TimeElapsed":
      switch (model.counter.status) {
        case "Idle":
          return [model, Cmd.None];

        case "Incrementing": {
          const counterNew: Counter = {
            ...model.counter,
            count: model.counter.count + 1,
          };
          return [
            { ...model, counter: counterNew },
            broadcast({ type: "GotCounter", counter: counterNew }),
          ];
        }
      }

    case "ClientConnected":
      return [
        {
          ...model,
          clients: { ...model.clients, [msg.clientId]: msg.clientId },
        },
        Cmd.batch([
          sendToFrontend(msg.clientId, {
            type: "GotCounter",
            counter: model.counter,
          }),
        ]),
      ];

    case "ClientDisconnected":
      return [
        {
          ...model,
          clients: removeKey(msg.clientId, model.clients),
        },
        Cmd.None,
      ];
  }
};

const removeKey = <T>(key: keyof T, object: T): Omit<T, typeof key> => {
  const { [key]: value, ...without } = object;
  return without;
};

export const updateFromFrontend = (
  msg: ToBackend,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg.group) {
    case "TicTacToe": {
      switch (msg.type) {
        case "NewRoom":
          return [model, Cmd.None];
      }
    }
    case "Counter": {
      switch (msg.type) {
        case "Toggle":
          const counterNew: Counter = {
            ...model.counter,
            status: toggleStatus(model.counter.status),
          };
          return [
            {
              ...model,
              counter: counterNew,
            },
            broadcast({ type: "GotCounter", counter: counterNew }),
          ];

        case "Reset": {
          const counterNew: Counter = {
            ...model.counter,
            count: 0,
          };
          return [
            {
              ...model,
              counter: counterNew,
            },
            broadcast({ type: "GotCounter", counter: counterNew }),
          ];
        }
      }
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
  return Sub.batch([
    counterSubs(model),
    Fullstack.onConnected<Msg>((clientId) => ({
      type: "ClientConnected",
      clientId,
    })),
    Fullstack.onDisconnected<Msg>((clientId) => ({
      type: "ClientDisconnected",
      clientId,
    })),
  ]);
};

export const counterSubs = (model: Model): Sub.Sub<Msg> => {
  switch (model.counter.status) {
    case "Idle":
      return Sub.None;

    case "Incrementing":
      return Sub.None;
  }
};
//
//
//
// Main
//
//
//

const program = Fullstack.backend({
  init,
  update,
  updateFromFrontend,
  subscriptions,
});

Platform.run(program);

program.state$.subscribe((state) => {
  console.log(JSON.stringify(state, null, 4));
});
