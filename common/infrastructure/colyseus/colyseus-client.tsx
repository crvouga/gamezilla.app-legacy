import * as Colyseus from "colyseus.js";
import { COLYSEUS_DEV_URL } from "./colyseus";

export const colyseusClient = new Colyseus.Client(COLYSEUS_DEV_URL);
