import * as Clients from "Clients";
import * as Counter from "Counter/Backend";
import * as Games from "Games/Backend";
import { fromFrontend } from "Bridge/Backend";
import { ClientId } from "Bridge/Bridge";
import { Cmd, Platform, Sub, pipe } from "Core";
import { formatMsg } from "Core/Debug";
import { BackendModel, BackendMsg, ToBackend } from "Types";
import { tag } from "Utility";

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
  init: init,
  subscriptions: subscriptions,
  update: update,
});

Platform.run(program);

program.state$.subscribe((state) => {
  const msg = state.msg;
  if (msg) {
    console.log(`[backend] ${formatMsg(msg)} `);
    return;
  }
  console.log(`[backend] init ${JSON.stringify(state.model, null, 4)}`);
});
