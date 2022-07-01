import { Server } from "colyseus";
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
  const server = createServer();

  const gameServer = new Server({ server });

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
