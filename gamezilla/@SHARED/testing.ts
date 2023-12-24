import { Browser, Posix, Program } from "gamezilla/@SHARED/core";
import * as AppClient from "../@CHILD/app/app.client";
import * as AppServer from "../@CHILD/app/app.server";
import { ServerCtx } from "gamezilla/@CHILD/app/@SHARED/server";
import { createDbConnSqlite } from "gamezilla/@CHILD/app/app-server/db-conn-sql/db-conn-sql-impl-sqlite";
import { LoggerConsole } from "gamezilla/@CHILD/app/@SHARED/server/logger";

export const makeAppClient = async () => {
  return Program.create({
    init: (input) => {
      return AppClient.init({
        ...input,
        location: Browser.getLocation(),
        stored: null,
      });
    },

    update: AppClient.update,

    subscriptions: AppClient.subscriptions,
  });
};

export const makeAppServer = async () => {
  const logger = LoggerConsole("server");
  const dbConn = await createDbConnSqlite({
    databaseUrl: ":memory:",
    logger: logger,
  });
  const baseCtx: ServerCtx = {
    dbConn: dbConn,
    logger,
    now: Posix.now$(),
  };

  const program = await Program.create({
    getCtx: () => baseCtx,
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

  return program;
};

export const makeApp = async () => {
  const clientA = await makeAppClient();
  const clientB = await makeAppClient();
  const clientC = await makeAppClient();
  const server = await makeAppServer();

  return { clientA, clientB, clientC, server };
};
