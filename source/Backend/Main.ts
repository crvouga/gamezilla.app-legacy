import { Server } from "colyseus";
import express from "express";
import { createServer } from "http";
import { AppRoom } from "./Room";

//
//
//
//
// Main
//
//
//
//

const main = () => {
  const app = express();

  app.use(express.json());

  const gameServer = new Server({
    server: createServer(app),
  });

  const port = Number(process.env.port) || 5000;

  gameServer.listen(port);

  gameServer.define("App", AppRoom);
};

//
//
//
//
// Run
//
//
//
//

main();
