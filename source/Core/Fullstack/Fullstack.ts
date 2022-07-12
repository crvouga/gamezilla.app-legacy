import * as Rx from "rxjs";
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

export const broadcast = <ToFrontend>(msg: ToFrontend): Cmd.Cmd<never> => {
  return Rx.of(async () => {
    broadcast$.next({ msg });
    return Option.None;
  });
};

export const sendToFrontend = <ToFrontend>(
  clientId: string,
  msg: ToFrontend,
): Cmd.Cmd<never> => {
  return Rx.of(async () => {
    sendToFrontend$.next({ clientId, msg });
    return Option.None;
  });
};

export const sendToBackend = <ToBackend>(msg: ToBackend): Cmd.Cmd<never> => {
  return Rx.of(async () => {
    sendToBackend$.next({ msg });
    return Option.None;
  });
};

export const onConnected = <Msg>(
  mapper: (clientId: string) => Msg,
): Sub.Sub<Msg> => {
  return Sub.None;
};

export const onDisconnected = <Msg>(
  mapper: (clientId: string) => Msg,
): Sub.Sub<Msg> => {
  return Sub.None;
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
}: {
  init: [Model, Cmd.Cmd<Msg>];
  update: (msg: Msg, model: Model) => [Model, Cmd.Cmd<Msg>];
  updateFromFrontend: (msg: ToBackend, model: Model) => [Model, Cmd.Cmd<Msg>];
  subscriptions: (model: Model) => Sub.Sub<Msg>;
}): Platform.Program<Model, Msg> => {
  const program = Platform.worker({
    init,
    update,
    subscriptions,
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

    const port = 5000;
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

export const frontend = <Model, Msg, Dom, ToFrontend>({
  onLocationChange,
  init,
  update,
  updateFromBackend,
  view,
  subscriptions,
  backendUrl,
}: {
  onLocationChange: (location: Browser.Location) => Msg;
  init: (location: Browser.Location) => [Model, Cmd.Cmd<Msg>];
  update: (msg: Msg, model: Model) => [Model, Cmd.Cmd<Msg>];
  updateFromBackend: (msg: ToFrontend, model: Model) => [Model, Cmd.Cmd<Msg>];
  view: (model: Model) => View.View<Dom, Msg>;
  subscriptions: (model: Model) => Sub.Sub<Msg>;
  backendUrl: string;
}): Browser.Program<Model, Msg, Dom> => {
  const program = Browser.application({
    onLocationChange,
    init,
    update,
    view,
    subscriptions,
  });

  import("socket.io-client").then((Socket) => {
    const socket = Socket.io(backendUrl);

    socket.on("connect", () => {
      console.log("connected to backend");
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
