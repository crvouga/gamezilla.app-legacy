import Colyseus from "colyseus.js";

export const colyseusClient = new Colyseus.Client("ws://localhost:8000");
