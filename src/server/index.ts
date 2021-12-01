import { Action, configureStore } from "@reduxjs/toolkit";
import { createAction } from "@shared";
import express from "express";
import * as http from "http";
import createSagaMiddleware, { eventChannel } from "redux-saga";
import { takeEvery } from "redux-saga/effects";
import * as socketio from "socket.io";
import next from "next";

const expressApp = express();

const httpServer = http.createServer(expressApp);
const socketServer = new socketio.Server(httpServer, {
  cors: {
    origin: "http://localhost:4200",
  },
});

const nextApp = next({
  dev: process.env.NODE_ENV !== "production",
});
const handle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  expressApp.all("*", (req, res) => {
    return handle(req, res);
  });

  const port = process.env.port ?? 3333;

  httpServer.listen(port, () => {
    console.log(`Listening at http://localhost:${port}/api`);
  });
});

const actions = {
  socket: {
    connected: createAction("socket", "connected"),
    disconnected: createAction("socket", "disconnected"),
  },
};

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: (state) => state,
  middleware: [sagaMiddleware],
});

const socketChannel = eventChannel<Action>((emit) => {
  socketServer.on("connection", (socket) => {
    emit(actions.socket.connected());

    socket.on("action", emit);

    socket.on("disconnect", () => {
      emit(actions.socket.disconnected());
    });
  });

  return () => {
    socketServer.close();
  };
});

function* saga() {
  yield takeEvery(socketChannel, function* (action) {
    console.log({ action });
  });
}

sagaMiddleware.run(saga);
