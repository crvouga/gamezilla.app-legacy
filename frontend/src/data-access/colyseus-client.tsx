import * as Colyseus from "colyseus.js";

const COLYSEUS_DEVELOPMENT_SERVER_PORT = 8000;

export const colyseusClient = new Colyseus.Client(
  `ws://localhost:${COLYSEUS_DEVELOPMENT_SERVER_PORT}`
);
