import { Program, isErr } from "gamezilla/@SHARED/core";
import * as AppServer from "./@CHILD/app/app.server";

const main = async () => {
  const created = await AppServer.createCtx();

  if (isErr(created)) {
    console.error(created.error);
    return;
  }

  const baseCtx = created.value;

  const program = await Program.create({
    init: async ({ ctx }) => {
      const initial = await AppServer.init({
        ctx: { ...baseCtx, ...ctx },
      });

      return initial;
    },

    update: async (input) => {
      const updated = await AppServer.update({
        ctx: { ...baseCtx, ...input.ctx },
        model: input.model,
        msg: input.msg,
      });

      return updated;
    },

    subscriptions: async (input) => {
      const sub = await AppServer.subscriptions({
        ...input,
        ctx: { ...baseCtx, ...input.ctx },
      });

      return sub;
    },
  });

  program.start();
};

main();
