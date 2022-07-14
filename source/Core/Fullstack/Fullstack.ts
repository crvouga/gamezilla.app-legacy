import * as Rx from "rxjs";
import { ToBackend, ToFrontend } from "Types";
import * as Browser from "../Browser";
import * as Cmd from "../Cmd";
import * as Option from "../Option";
import * as Platform from "../Platform";
import * as Sub from "../Sub";
import * as View from "../View";

//
//
//
// Bridge
//
//
//

const sendToFrontend$ = new Rx.Subject<{ clientId: string; msg: unknown }>();
const broadcast$ = new Rx.Subject<{ msg: unknown }>();
const sendToBackend$ = new Rx.Subject<{ msg: unknown }>();

export const broadcast = (msg: ToFrontend): Cmd.Cmd<never> => {
  return Rx.of(async () => {
    broadcast$.next({ msg });
    return Option.None;
  });
};

export const sendToFrontend = (
  clientId: string,
  msg: ToFrontend,
): Cmd.Cmd<never> => {
  return Rx.of(async () => {
    sendToFrontend$.next({ clientId, msg });
    return Option.None;
  });
};

export const sendToBackend = (msg: ToBackend): Cmd.Cmd<never> => {
  return Rx.of(async () => {
    sendToBackend$.next({ msg });
    return Option.None;
  });
};

//
//
//
// Backend
//
//
//

export const backend = <Model, Msg, ToBackend>({
  init,
  update,
  updateFromFrontend,
  subscriptions,
  onDisconnected,
  onConnected,
}: {
  init: [Model, Cmd.Cmd<Msg>];
  update: (msg: Msg, model: Model) => [Model, Cmd.Cmd<Msg>];
  updateFromFrontend: (msg: ToBackend, model: Model) => [Model, Cmd.Cmd<Msg>];
  subscriptions: (model: Model) => Sub.Sub<Msg>;
  onConnected: (clientId: string) => Msg;
  onDisconnected: (clientId: string) => Msg;
}): Platform.Program<Model, Msg> => {
  const connectionMsg$ = new Rx.Subject<Msg>();

  const subs = (model: Model): Sub.Sub<Msg> => {
    return Sub.batch([connectionMsg$, subscriptions(model)]);
  };

  const program = Platform.worker({
    init,
    update,
    subscriptions: subs,
  });

  import("socket.io").then((Socket) => {
    const server = new Socket.Server({
      cors: {
        origin: "*",
      },
    });

    //
    // To Backend
    //

    server.on("connection", (socket) => {
      socket.on("ToBackend", (msg: ToBackend) => {
        const statePrev = program.state$.getValue();
        const [modelNew, cmdNew] = updateFromFrontend(msg, statePrev.model);
        program.state$.next({
          model: modelNew,
          cmd: cmdNew,
          // @ts-ignore
          msg,
        });
      });

      socket.on("disconnect", () => {
        connectionMsg$.next(onDisconnected(socket.id));
      });

      connectionMsg$.next(onConnected(socket.id));
    });

    //
    // ToFrontend
    //

    broadcast$.subscribe((msg) => {
      server.emit("ToFrontend", msg.msg);
    });

    sendToFrontend$.subscribe((msg) => {
      server.to(msg.clientId).emit("ToFrontend", msg.msg);
    });

    //
    // todo put this in a program.run function
    // start server
    //

    const port = Number(process.env.PORT) || 5000;

    server.listen(port);
    console.clear();
    console.log(
      `backend server running at:\n\n> Local: http://localhost:${port}/\n\n`,
    );
  });

  return program;
};

//
//
//
// Frontend
//
//
//

export type ConnectionStatus =
  | { type: "Connecting" }
  | { type: "Reconnecting" }
  | { type: "Connected" }
  | { type: "Disconnected" };

export const frontend = <Model, Msg, Dom, ToFrontend>({
  onLocationChange,
  onConnectionChange,
  init,
  update,
  updateFromBackend,
  view,
  subscriptions,
  backendUrl,
}: {
  onLocationChange: (location: Browser.Location) => Msg;
  onConnectionChange: (status: ConnectionStatus) => Msg;
  init: (location: Browser.Location) => [Model, Cmd.Cmd<Msg>];
  update: (msg: Msg, model: Model) => [Model, Cmd.Cmd<Msg>];
  updateFromBackend: (msg: ToFrontend, model: Model) => [Model, Cmd.Cmd<Msg>];
  view: (model: Model) => View.View<Dom, Msg>;
  subscriptions: (model: Model) => Sub.Sub<Msg>;
  backendUrl: string;
}): Browser.Program<Model, Msg, Dom> => {
  const connectionMsg$ = new Rx.Subject<Msg>();

  const subs = (model: Model): Sub.Sub<Msg> => {
    return Sub.batch([connectionMsg$, subscriptions(model)]);
  };

  const program = Browser.application({
    onLocationChange,
    init,
    update,
    view,
    subscriptions: subs,
  });

  import("socket.io-client").then((Socket) => {
    const socket = Socket.io(backendUrl);

    connectionMsg$.next(onConnectionChange({ type: "Connecting" }));

    socket.on("connect", () => {
      connectionMsg$.next(onConnectionChange({ type: "Connected" }));
    });

    socket.on("connect_error", () => {
      connectionMsg$.next(
        onConnectionChange({
          type: "Reconnecting",
        }),
      );
    });

    socket.on("diconnect", () => {
      onConnectionChange({ type: "Disconnected" });
    });

    //
    // To Frontend
    //

    socket.on("ToFrontend", (msg: ToFrontend) => {
      const prev = program.state$.getValue();
      const [model, cmd] = updateFromBackend(msg, prev.model);
      program.state$.next({
        model,
        cmd,
        // @ts-ignore
        msg,
      });
    });

    //
    // To Backend
    //

    sendToBackend$.subscribe((msg) => {
      socket.emit("ToBackend", msg.msg);
    });
  });

  return program;
};
