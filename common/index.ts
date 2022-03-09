export type ISayHello = () => "say hello!";

export const COLYSEUS_DEV_PORT = 8001;
export const COLYSEUS_DEV_URL = `ws://localhost:${COLYSEUS_DEV_PORT}`;
export const RoomNames = {
  Game: "GameRoom",
} as const;
