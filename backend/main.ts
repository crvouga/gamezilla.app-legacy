import { Server } from "colyseus";
import { GameSessionRoom } from "./game-session-room";

import { COLYSEUS_DEV_PORT, ISayHello } from "../common";

const sayHello: ISayHello = () => "say hello!";

const port = process.env.PORT ? parseInt(process.env.PORT) : COLYSEUS_DEV_PORT;

const gameServer = new Server();

gameServer.define("GameSession", GameSessionRoom);

gameServer.listen(port, undefined, undefined, () => {
  console.log(`[colyseus] game server is listening on port ${port}`);
  console.log({ sayHello: sayHello() });
});
