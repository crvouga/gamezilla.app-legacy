import {
  ClientToServerEvents,
  ServerToClientEvents,
  backendServerPort,
  bridge$,
} from "Bridge";
import { Platform } from "Core";
import { Server } from "socket.io";
import * as Backend from "./Backend";

//
//
//
// Program
//
//
//

const program = Platform.worker({
  init: Backend.init,
  subscriptions: Backend.subscriptions,
  update: Backend.update,
});

//
//
//
// Talking to Frontend
//
//
//

const io = new Server<ClientToServerEvents, ServerToClientEvents>({
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  bridge$.onConnect.next(socket.id);

  socket.on("disconnect", () => {
    bridge$.onDisconnect.next(socket.id);
  });

  socket.on("ToBackend", (msg) => {
    program.dispatch(["FromFrontend", socket.id, msg]);
  });
});

bridge$.broadcast.subscribe((msg) => {
  io.emit("ToFrontend", msg);
});

bridge$.toFrontend.subscribe(([clientId, msg]) => {
  io.to(clientId).emit("ToFrontend", msg);
});

bridge$.toBackend.subscribe((msg) => {
  console.error("Can not send message to the backend from the backend", msg);
});

const port = Number(process.env.PORT) || backendServerPort;
io.listen(port);

console.clear();
console.log(`[backend] server running at:`);
console.log(`[backend] http://localhost:${backendServerPort}/`);

//
//
//
// Run
//
//
//

Platform.run(program);

program.state$.subscribe((state) => {
  const msg = state.msg;
  if (msg) {
    const msgType = [msg[0], msg[1][0], msg[1][1]?.[0], msg[1][1]?.[1]?.[0]]
      .filter((msgType) => typeof msgType === "string" && msgType.length > 2)
      .join(".");

    console.log(
      `[backend] ${JSON.stringify(msg)
        .replaceAll('"', "")
        .replaceAll("[", "")
        .replaceAll("]", "")
        .split(",")
        .join(", ")} `,
    );
    return;
  }

  console.log(`[backend] init ${JSON.stringify(state.model, null, 4)}`);
});
