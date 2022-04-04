export const RoomName = "Game";

export type IGameRoomState = {
  leaderId: string;
};

export type ICreateGameRoom = {
  type: "CreateGameRoom";
  payload: {
    userId: string;
  };
};

export type IGameRoomCreated = {
  type: "CreateGameRoom";
  payload: {
    userId: string;
  };
};
