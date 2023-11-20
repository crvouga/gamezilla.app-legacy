import { Program, isErr } from "gamezilla/@SHARED/core";
import * as AppServer from "./@CHILD/app/app.server";

async function main() {
  const created = await AppServer.createCtx();

  if (isErr(created)) {
    console.error(created.error);
    return;
  }

  const baseCtx = created.value;

  const program = Program.create({
    init: ({ ctx }) => {
      const initial = AppServer.init({
        ctx: { ...baseCtx, ...ctx },
      });

      return initial;
    },

    update: (input) => {
      const updated = AppServer.update({
        ctx: { ...baseCtx, ...input.ctx },
        model: input.model,
        msg: input.msg,
      });

      return updated;
    },

    subscriptions: (input) => {
      const sub = AppServer.subscriptions({
        ...input,
        ctx: { ...baseCtx, ...input.ctx },
      });

      return sub;
    },
  });

  program.start();
}

main();
