import { Program, isErr } from "gamezilla/@SHARED/core";
import * as AppServer from "./@CHILD/app/app.server";

async function main() {
  const created = await AppServer.createCtx();

  if (isErr(created)) {
    console.error(created.error);
    return;
  }

  const ctx = created.value;

  const program = Program.create({
    init: () => {
      const initial = AppServer.init({
        ctx,
      });

      return initial;
    },

    update: (input) => {
      const updated = AppServer.update({
        model: input.model,
        msg: input.msg,
        ctx,
      });

      return updated;
    },

    subscriptions: (input) => {
      const sub = AppServer.subscriptions({
        ...input,
        ctx,
      });

      return sub;
    },
  });

  program.start();
}

main();
