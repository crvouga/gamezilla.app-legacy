import * as Clients from "Clients";
import * as Counter from "Counter/Backend";
import { Cmd, Fullstack, Platform, Sub, pipe } from "Core";
import { BackendModel, BackendMsg, ToBackend } from "Types";
import { tag } from "Utility";

//
//
//
// Model
//
//
//

export type Model = BackendModel;

export const init: [Model, Cmd.Cmd<BackendMsg>] = [
  {
    clients: Clients.init,
    counter: Counter.init,
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

export const update = (
  msg: BackendMsg,
  model: Model,
): [Model, Cmd.Cmd<BackendMsg>] => {
  switch (msg[0]) {
    case "Clients":
      const [clientsNew, clientsCmd] = Clients.update(msg[1], model.clients);
      return [
        { ...model, clients: clientsNew },
        pipe(clientsCmd, Cmd.map(tag("Clients"))),
      ];

    case "Counter":
      const [counterNew, counterCmd] = Counter.update(msg[1], model.counter);
      return [
        { ...model, counter: counterNew },
        pipe(counterCmd, Cmd.map(tag("Counter"))),
      ];
  }
};

export const updateFromFrontend = (
  msg: ToBackend,
  model: Model,
): [Model, Cmd.Cmd<BackendMsg>] => {
  switch (msg[0]) {
    case "Counter": {
      const [counterNew, counterCmd] = Counter.updateFromFrontend(
        msg[1],
        model.counter,
      );
      return [
        { ...model, counter: counterNew },
        pipe(counterCmd, Cmd.map(tag("Counter"))),
      ];
    }
  }
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (model: Model): Sub.Sub<BackendMsg> => {
  return Sub.batch([
    pipe(Counter.subscriptions(model.counter), Sub.map(tag("Counter"))),
  ]);
};

//
//
//
//
//
//
//

const onConnected = (clientId: string): BackendMsg => {
  return ["Clients", ["Connected", clientId]];
};

const onDisconnected = (clientId: string): BackendMsg => {
  return ["Clients", ["Disconnected", clientId]];
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
  onConnected,
  onDisconnected,
});

Platform.run(program);

program.state$.subscribe((state) => {
  console.log(JSON.stringify(state, null, 4));
});
