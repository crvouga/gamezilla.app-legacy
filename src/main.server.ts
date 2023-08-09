import { AppServer, ServerModel, ServerMsg } from "@gamezilla/app";
import { Program, toMsgType } from "@gamezilla/core";
import { DbConnMySql } from "@gamezilla/shared/server";
import { createServer } from "http";
import { createTransportServer } from "./transport.server";

console.log("[server] planet scale connecting...");

const DATABASE_URL =
  'mysql://scuu9usphxh6zuxltqbe:pscale_pw_lkZooGgR8H09Uc59IVrcZEt8avVQ54VObBfoFwbCIa3@aws.connect.psdb.cloud/gamezilla?ssl={"rejectUnauthorized":true}';

// @ts-ignore
const mySql = await DbConnMySql.create({
  connectionString: DATABASE_URL,
});

console.log("[server] planet scale connected.");

let model: ServerModel | null = null;
let msg: ServerMsg | null = null;

const httpServer = createServer((_request, response) => {
  response.end(JSON.stringify({ msgType: msg, model: model }));
});

const transport = createTransportServer({
  httpServer,
  onClientMsg: AppServer.onClientMsg,
  onWireMsg: AppServer.onWireMsg,
});

const program = Program.create({
  init: () => AppServer.init,

  update: (input) => {
    return AppServer.update({
      model: input.model,
      msg: input.msg,
      broadcast: transport.broadcast,
      sendToClient: transport.sendToClient,
      ctx: {
        mySql,
        now: input.ctx.now,
      },
    });
  },

  subscriptions: (input) => {
    return AppServer.subscriptions({
      ...input,
      ctx: {
        mySql,
        now: input.ctx.now,
      },
    });
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

const port = Number(process.env["PORT"]) || 5000;

httpServer.listen(port, () => {
  console.log(`[server] http server listening: http://localhost:${port}/`);
});
