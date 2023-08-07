import { AppClient, ToServer } from "@gamezilla/app";
import { Browser, Program } from "@gamezilla/core";
import { render } from "inferno";
import "./main.css";
import { createTransportClient } from "./transport-client";

const env = {
  isDev: process.env.NODE_ENV === "development",
  isProd: process.env.NODE_ENV === "production",
  useNgrok: false,
};

const serverUrl = env.isProd
  ? "https://server.gamezilla.app/"
  : env.useNgrok
  ? "https://gamezilla-server.ngrok.io/"
  : `http://localhost:${5000}/`;

const transport = createTransportClient(serverUrl);

transport.onConnect.subscribe(() => {
  AppClient.wireSub.publish({ t: "connected" });
});

transport.onConnectError.subscribe(() => {
  AppClient.wireSub.publish({ t: "connect-error" });
});

transport.onDisconnect.subscribe(() => {
  AppClient.wireSub.publish({ t: "disconnected" });
});

transport.onServerMsg.subscribe((m) => AppClient.fromServerSub.publish(m));

const program = Program.create({
  init: () => {
    return AppClient.init({ location: Browser.getLocation() });
  },
  update: (input) => {
    return AppClient.update({
      now: input.ctx.now,
      model: input.model,
      msg: input.msg,
      sendToServer: transport.sendToServer,
    });
  },
  subscriptions: (input) => {
    return AppClient.subscriptions({
      now: input.ctx.now,
      model: input.model,
    });
  },
});

program.subscribe(async function (model, ctx, msg) {
  console.log(msg);
  render(
    <AppClient.View now={ctx.now} model={model} dispatch={program.dispatch} />,
    document.body
  );
});

program.start();
