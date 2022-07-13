import * as Clients from "Clients";
import * as Counter from "Counter/Backend";
import { Cmd, Fullstack, Platform, Sub } from "Core";
import { BackendModel, BackendMsg, ToBackend } from "Types";

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
    clients: Clients.init,
    counter: Counter.init[0],
  },
  Cmd.batch([Counter.init[1]]),
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
  switch (msg.group) {
    case "Clients":
      const [clientsNew, clientsCmd] = Clients.update(msg, model.clients);
      return [{ ...model, clients: clientsNew }, clientsCmd];

    case "Counter":
      const [counterNew, counterCmd] = Counter.update(msg, model.counter);
      return [{ ...model, counter: counterNew }, counterCmd];
  }
};

export const updateFromFrontend = (
  msg: ToBackend,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg.group) {
    case "Counter": {
      const [counterNew, counterCmd] = Counter.updateFromFrontend(
        msg,
        model.counter,
      );
      return [{ ...model, counter: counterNew }, counterCmd];
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

export const subscriptions = (model: Model): Sub.Sub<Msg> => {
  return Sub.batch([Counter.subscriptions(model.counter)]);
};

//
//
//
//
//
//
//

const onConnected = (clientId: string): Msg => {
  return { type: "Connected", group: "Clients", clientId };
};

const onDisconnected = (clientId: string): Msg => {
  return { type: "Disconnected", group: "Clients", clientId };
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
