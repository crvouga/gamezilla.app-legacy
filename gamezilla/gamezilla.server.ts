import {
  attachServerTransport,
  Program,
  toMsgType,
} from "gamezilla/@SHARED/core";
import { createServer } from "http";
import * as AppServer from "./app/app.server";
import { ServerModel } from "./app/app.core";
import { SpaceStore } from "./app/space/space.server";

let model: ServerModel;
const httpServer = createServer((_request, response) => {
  response.end(JSON.stringify({ model, SpaceStore: SpaceStore.toJSON() }));
});

attachServerTransport({
  httpServer,
  wire: AppServer.wire,
  clientToServer: AppServer.clientToServer,
  serverToClient: AppServer.serverToClient,
  serverToClientBroadcast: AppServer.serverToClientBroadcast,
});

const run = async () => {
  const ctx = await AppServer.initCtx();

  const program = Program.create({
    init: () => AppServer.init,

    update: (input) => {
      const updated = AppServer.update({
        model: input.model,
        msg: input.msg,
        ctx: {
          mySql: ctx.mySql,
          now: input.ctx.now,
        },
      });

      return updated;
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

  program.subscribe((modelNew, _ctx, msg) => {
    model = modelNew;
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
