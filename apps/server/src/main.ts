import { configureStore, createAction } from "@reduxjs/toolkit";
import { apply, takeEvery } from "redux-saga/effects";
import * as express from "express";
import * as http from "http";
import createSagaMiddleware from "redux-saga";
import * as socketio from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new socketio.Server(server, {
  cors: {
    origin: "http://localhost:4200",
  },
});

app.get("/api", (_req, res) => {
  res.send({ message: "Welcome to server!" });
});

const port = process.env.port ?? 3333;
server.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});

const actions = {
  socket: {
    connected: createAction(`socket/connected`),
    disconnected: createAction(`socket/disconnected`),
  },
};

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: (state) => state,
  middleware: [sagaMiddleware],
});

io.on("connection", (socket) => {
  function* saga() {
    yield takeEvery("*", function* (action) {
      yield apply(console, console.log, [action]);
    });
  }

  sagaMiddleware.run(saga);

  socket.on("action", (action) => {
    store.dispatch(action);
  });

  socket.emit("action", actions.socket.connected());

  store.dispatch(actions.socket.connected());

  socket.on("disconnect", () => {
    store.dispatch(actions.socket.disconnected());
  });
});
