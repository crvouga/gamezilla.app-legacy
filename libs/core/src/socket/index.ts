import { eventChannel } from "redux-saga";
import { call } from "redux-saga/effects";
import { io, Socket } from "socket.io-client";
import { Action } from "@reduxjs/toolkit";

const createSocketConnection = () => {
  return io("http://localhost:3333");
};

export const createSocketChannel = (socket: Socket) => {
  return eventChannel<Action>((emit) => {
    socket.on("message", emit);
    return () => {
      socket.off("message", emit);
    };
  });
};

export function* socketSaga() {
  yield;
}
