import { createAction } from "@reduxjs/toolkit";
import { Client } from "colyseus.js";
import { call, put, takeEvery } from "redux-saga/effects";
import { Task } from "../../../utils";
import { IGameRoomState, RoomName } from "../../game-room";
import { GameRoomDataAccess } from "./game-room-data-access";

type IState =
  | {
      type: "Connected";
      gameRoomState: IGameRoomState;
    }
  | {
      type: "Disconnected";
    }
  | {
      type: "Reconnecting";
    }
  | {
      type: "Creating";
    };

enum ActionTypes {
  Create = "game-room/Create",
  Reconnect = "game-room/Reconnect",
}

type IReconnect = {
  type: ActionTypes.Reconnect;
};

export const Reconnect = (): IReconnect => {
  return {
    type: ActionTypes.Reconnect,
  };
};

type IAction = IReconnect;

const Create = createAction("game-room/Create");
const Created = createAction("game-room/Created");

export const reducer = (state: IState, action: IAction): IState => {
  if (Create.match(action)) {
    return {
      type: "Creating",
    };
  }

  switch (action.type) {
    case ActionTypes.Reconnect:
      return {
        type: "Reconnecting",
      };
  }
};

export function* saga({ colyseusClient }: { colyseusClient: Client }) {
  yield put(Reconnect());
}

function* roomSaga(room: any) {}
