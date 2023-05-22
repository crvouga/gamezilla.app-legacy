import {
  AppServer,
  ClientToServerEvents,
  ServerToClientEvents,
  ToClient,
  serverPort,
  sessionIdKey,
} from "@gamezilla/app";
import { ClientId, SessionId } from "@gamezilla/shared/app";
import { Cmd, Program, toMsgType } from "@gamezilla/shared/core";
import { DatabaseConnectionMySQL } from "@gamezilla/shared/server";
import { RequestListener, createServer } from "http";
import { Server } from "socket.io";

//
//
//
// Main
//
//
//

const main = async () => {
  console.log("[server] planet scale connecting...");

  const DATABASE_URL =
    'mysql://scuu9usphxh6zuxltqbe:pscale_pw_lkZooGgR8H09Uc59IVrcZEt8avVQ54VObBfoFwbCIa3@aws.connect.psdb.cloud/gamezilla?ssl={"rejectUnauthorized":true}';

  const mySql = await DatabaseConnectionMySQL.create({
    connectionString: DATABASE_URL,
  });

  console.log("[server] planet scale connected.");

  const requestListener: RequestListener = (_request, response) => {
    const state = program.state$.getValue();
    response.end(JSON.stringify({ msgType: state.msg, model: state.model }));
  };

  const httpServer = createServer(requestListener);

  const io = new Server<ClientToServerEvents, ServerToClientEvents>(
    httpServer,
    {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      cors: {
        origin: "*",
        credentials: true,
      },
    }
  );

  io.on("connection", (socket) => {
    const maybeSessionId: unknown = socket.handshake.auth[sessionIdKey];

    const sessionId = SessionId.is(maybeSessionId)
      ? maybeSessionId
      : SessionId.generate();

    socket.emit("session-id", sessionId);

    if (ClientId.is(socket.id)) {
      AppServer.onConnect.next({ sessionId, clientId: socket.id });
    }

    socket.on("to-server", (msg) => {
      if (ClientId.is(socket.id)) {
        AppServer.fromClientMsgs.next({ sessionId, clientId: socket.id, msg });
      }
    });

    socket.on("disconnect", () => {
      if (ClientId.is(socket.id)) {
        AppServer.onDisconnect.next({ sessionId, clientId: socket.id });
      }
    });
  });

  const port = Number(process.env["PORT"]) || serverPort;

  httpServer.listen(port, () => {
    console.log(`[server] http server listening: http://localhost:${port}/`);
  });

  const sendToClient =
    (clientIds: ClientId[], msg: ToClient): Cmd =>
    () => {
      io.to(clientIds).emit("to-client", msg);
    };

  const broadcast =
    (msg: ToClient): Cmd =>
    () => {
      io.emit("to-client", msg);
    };

  const program = Program.create({
    init: AppServer.init,
    subscriptions: AppServer.subscriptions,
    update: (input) => {
      try {
        return AppServer.update({
          model: input.model,
          msg: input.msg,
          broadcast,
          sendToClient,
          ctx: {
            mySql,
            now: input.now,
          },
        });
      } catch (error) {
        console.error("Server Crashed!", error);
        return {
          model: input.model,
          cmd: Cmd.None,
        };
      }
    },
  });

  program.state$.subscribe((state) => {
    if (state.msg) {
      const type = toMsgType(state.msg);
      // const _payload = toMsgType(state.msg);
      console.log(type);
    }
  });

  Program.run(program);
};

main();
