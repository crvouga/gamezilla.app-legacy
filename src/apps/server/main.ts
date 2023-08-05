import {
  AppServer,
  ClientToServerEvents,
  ServerToClientEvents,
  ToClient,
  serverPort,
  ServerModel,
  ServerMsg,
  sessionIdKey,
} from "@gamezilla/app";
import { ClientId, SessionId } from "@gamezilla/shared/app";
import { Cmd, Program, toMsgType } from "@gamezilla/core";
import { DbConnMySql } from "@gamezilla/shared/server";
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

  const mySql = await DbConnMySql.create({
    connectionString: DATABASE_URL,
  });

  console.log("[server] planet scale connected.");
  let model: ServerModel | null = null;
  let msg: ServerMsg | null = null;
  const requestListener: RequestListener = (_request, response) => {
    response.end(JSON.stringify({ msgType: msg, model: model }));
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
      AppServer.onConnect.publish({ sessionId, clientId: socket.id });
    }

    socket.on("to-server", (msg) => {
      if (ClientId.is(socket.id)) {
        AppServer.fromClientMsgs.publish({
          sessionId,
          clientId: socket.id,
          msg,
        });
      }
    });

    socket.on("disconnect", () => {
      if (ClientId.is(socket.id)) {
        AppServer.onDisconnect.publish({ sessionId, clientId: socket.id });
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
    init: () => AppServer.init,
    subscriptions: (input) => {
      return AppServer.subscriptions({
        ...input,
        ctx: {
          mySql,
          now: input.ctx.now,
        },
      });
    },
    update: (input) => {
      try {
        return AppServer.update({
          model: input.model,
          msg: input.msg,
          broadcast,
          sendToClient,
          ctx: {
            mySql,
            now: input.ctx.now,
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

  program.subscribe(async (model_, _ctx, msg_) => {
    if (msg_) {
      const type = toMsgType(msg_);
      console.log(type);
    }
    model = model_;
    msg = msg_;
  });

  program.start();
};

main();
