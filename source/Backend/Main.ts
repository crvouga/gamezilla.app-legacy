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

export type Msg = { type: "ClientConnected"; clientId: string };

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "ClientConnected":
      return [model, Cmd.None];
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

const io = new Server();

io.on("connection", (socket) => {
  program.dispatch({
    type: "ClientConnected",
    clientId: socket.id,
  });
  socket.on("ToBackend", (msg) => {
    program.dispatch(msg);
  });
  // toFrontend$.subscribe(msg => {
  //   socket.to(msg.clientIds)
  // })
});

const port = 5000;

io.listen(port);
