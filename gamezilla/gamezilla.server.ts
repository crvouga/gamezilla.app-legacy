import { Program, toMsgType } from "gamezilla/@SHARED/core";
import * as AppServer from "./@CHILD/app/app.server";
import { attachServerTransport } from "./@CHILD/app/wire/wire.server";

attachServerTransport({
  wire: AppServer.wire,
  fromClient: AppServer.fromClient,
  toClient: AppServer.toClient,
  toClientBroadcast: AppServer.toClientBroadcast,
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
          dbConn: ctx.dbConn,
          now: input.ctx.now,
        },
      });

      return updated;
    },

    subscriptions: (input) => {
      return AppServer.subscriptions({
        ...input,
        ctx: {
          dbConn: ctx.dbConn,
          now: input.ctx.now,
        },
      });
    },
  });

  program.subscribe((modelNew, _ctx, msg) => {
    if (msg) {
      console.log(toMsgType(msg));
    }
  });

  program.start();
};

run();
