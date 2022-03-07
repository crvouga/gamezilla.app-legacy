import { COLYSEUS_DEVELOPMENT_SERVER_PORT } from "@libs/server-interface";
import { Client } from "colyseus.js";

export const colyseusClient = new Client(
  `ws://localhost:${COLYSEUS_DEVELOPMENT_SERVER_PORT}`
);
