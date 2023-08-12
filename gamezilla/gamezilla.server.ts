import {
  createTransportServer,
  Program,
  toMsgType,
} from "gamezilla/@SHARED/core";
import { createServer } from "http";
import * as AppServer from "./app/app.server";

const httpServer = createServer((_request, response) => {
  response.end(JSON.stringify({ message: "hello from gamezilla.app server" }));
});

const transport = createTransportServer({
  httpServer,
  onClientMsg: AppServer.onClientMsg,
  onWireMsg: AppServer.onWireMsg,
});

const run = async () => {
  const ctx = await AppServer.initCtx();

  const program = Program.create({
    init: () => AppServer.init,

    update: (input) => {
      return AppServer.update({
        model: input.model,
        msg: input.msg,
        broadcast: transport.broadcast,
        sendToClient: transport.sendToClient,
        ctx: {
          mySql: ctx.mySql,
          now: input.ctx.now,
        },
      });
    },

    subscriptions: (input) => {
      return AppServer.subscriptions({
        ...input,
        ctx: {
          mySql: ctx.mySql,
          now: input.ctx.now,
        },
      });
    },
  });

  program.subscribe((_model, _ctx, msg) => {
    if (msg) {
      console.log(toMsgType(msg));
    }
  });

  program.start();

  const port = Number(process.env["PORT"]) || 5000;

  httpServer.listen(port, () => {
    console.log(`[server] http server listening: http://localhost:${port}/`);
  });
};

run();
