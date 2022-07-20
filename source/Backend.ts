import * as Clients from "./Clients";
import * as Counter from "./Counter/Backend";
import * as Games from "./Games/Backend";
import { broadcast, fromFrontend } from "./Bridge/Backend";
import { ClientId } from "./Bridge/Bridge";
import { Cmd, Platform, Sub, pipe } from "./Core";
import { BackendModel, BackendMsg, ToBackend } from "./Types";
import { andThen, tag } from "./Utility";

//
//
//
// Model
//
//
//

type Model = BackendModel;

export const init: [Model, Cmd.Cmd<BackendMsg>] = [
  {
    clients: Clients.init,
    counter: Counter.init,
    games: Games.init,
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
  return pipe(
    [model, Cmd.None],
    andThen(updateMain, msg),
    andThen(updateAdmin, msg),
  );
};

export const updateMain = (
  msg: BackendMsg,
  model: Model,
): [Model, Cmd.Cmd<BackendMsg>] => {
  switch (msg[0]) {
    case "ToBackend":
      return updateFromFrontend(msg[1], msg[2], model);

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

    case "Games":
      const [gamesNew, gamesCmd] = Games.update(msg[1], model.games);
      return [
        { ...model, games: gamesNew },
        pipe(gamesCmd, Cmd.map(tag("Games"))),
      ];
  }
};

const updateAdmin = (
  msg: BackendMsg,
  model: Model,
): [Model, Cmd.Cmd<BackendMsg>] => {
  return [
    model,
    // broadcast(["Admin", ["BackendModel", model]])
    Cmd.None,
  ];
};

export const updateFromFrontend = (
  clientId: ClientId,
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

    case "Games":
      const [gamesNew, gamesCmd] = Games.updateFromFrontend(
        clientId,
        msg[1],
        model.games,
      );
      return [
        { ...model, games: gamesNew },
        pipe(gamesCmd, Cmd.map(tag("Games"))),
      ];
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
    pipe(Games.subscriptions(model.games), Sub.map(tag("Games"))),
    fromFrontend<BackendMsg>((clientId, toBackend) => [
      "ToBackend",
      clientId,
      toBackend,
    ]),
  ]);
};

//
//
//
// Main
//
//
//

const program = Platform.worker({
  init,
  subscriptions,
  update,
});

Platform.run(program);

console.clear();
console.log("[backend] [program] running");
