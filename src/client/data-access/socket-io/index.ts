import { Action } from "@reduxjs/toolkit";
import { eventChannel } from "redux-saga";
import { io, Socket } from "socket.io-client";

export const createSocket = () => {
  const socket = io("http://localhost:3333");

  return socket;
};

export const createActionSocketChannel = (socket: Socket) => {
  return eventChannel<Action>((emit) => {
    socket.on("action", emit);
    return () => {
      socket.off("action", emit);
    };
  });
};
