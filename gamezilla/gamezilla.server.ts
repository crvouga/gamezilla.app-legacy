import { Posix, Program, isErr } from "gamezilla/@SHARED/core";
import * as AppServer from "./@CHILD/app/app.server";
import { createStaticFileServer } from "./static-file-server";
import { PUBLIC_APP_CONFIG } from "config";

const main = async () => {
  const httpServer = await createStaticFileServer();

  await new Promise((resolve) =>
    httpServer.listen(PUBLIC_APP_CONFIG.SERVER_PORT, () => resolve(null))
  );

  const got = await AppServer.getDeps({ httpServer });

  if (isErr(got)) {
    console.error(got.error);
    return;
  }

  const deps = got.value;

  const program = Program.create({
    getCtx: () => {
      return {
        now: Posix.now(),
      };
    },
    init: async ({ ctx }) => {
      const initial = await AppServer.init({
        ctx,
        deps,
      });

      return initial;
    },

    update: async (input) => {
      const updated = await AppServer.update({
        ...input,
        deps,
      });

      return updated;
    },

    subscriptions: async (input) => {
      const sub = await AppServer.subscriptions({
        ctx: input.ctx,
        model: input.model,
        deps,
      });

      return sub;
    },

    onCrash: (e) => {
      console.error("Crashed!", e);
    },
  });

  program.start();

  deps.logger.info("Server started");
};

main();
