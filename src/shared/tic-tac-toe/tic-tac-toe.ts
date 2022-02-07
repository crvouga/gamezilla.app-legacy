import { IInteger } from "../utility/integer";

type IPosition = {
  x: IInteger;
  y: IInteger;
};

export type IState = {
  gameId: string;
  board: ("x" | "o")[][];
};

export type IMessage =
  | {
      type: "MOVE";
      position: IPosition;
      gameId: string;
      userId: string;
    }
  | {
      type: "GAME_STARTED";
      gameId: string;
      userId: string;
    };

export type ChannelId = string;

export const nextState = () => {
  return;
};
