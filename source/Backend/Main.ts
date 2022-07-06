import { Cmd, Platform, Sub } from "Core";
import { Server } from "socket.io";

//
//
//
// Model
//
//
//

export type Model = {
  clients: { [userId: string]: string };
};

export const init: [Model, Cmd.Cmd<Msg>] = [
  {
    clients: {},
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

export type Msg =
  | { type: "ClientConnected"; clientId: string }
  | { type: "ClientDisconnected"; clientId: string };

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "ClientConnected":
      return [
        {
          ...model,
          clients: { ...model.clients, [msg.clientId]: msg.clientId },
        },
        Cmd.None,
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

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (model: Model): Sub.Sub<Msg> => {
  return Sub.None;
};

//
//
//
// Main
//
//
//

const program = Platform.Worker({ init, update, subscriptions });

program.state$.subscribe((state) => {
  console.log(state);
});

//
//
//
// Server
//
//
//

const server = new Server({
  cors: {
    origin: "*",
  },
});

server.on("connection", (socket) => {
  program.dispatch({
    type: "ClientConnected",
    clientId: socket.id,
  });
  socket.on("ToBackend", (msg) => {
    program.dispatch(msg);
  });
  socket.on("disconnect", () => {
    program.dispatch({ type: "ClientDisconnected", clientId: socket.id });
  });
  // toFrontend$.subscribe(msg => {
  //   socket.to(msg.clientIds)
  // })
});

const port = 5000;

server.listen(port);

console.log(
  `backend server running at:\n\n> Local: http://localhost:${port}/\n\n`,
);
