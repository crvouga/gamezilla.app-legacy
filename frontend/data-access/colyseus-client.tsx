import * as Colyseus from "colyseus.js";
import { COLYSEUS_DEV_PORT } from "../../common";

export const colyseusClient = new Colyseus.Client(
  `ws://localhost:${COLYSEUS_DEV_PORT}`
);
