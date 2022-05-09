import Colyseus from "colyseus.js";
import { Task } from "fp-ts/lib/Task";
import * as Rx from "rxjs";

const client = new Colyseus.Client("ws://localhost:5000");

type RoomName = "App";

type Room = Colyseus.Room<unknown>;

export const create =
  ({ roomName }: { roomName: RoomName }): Task<Room> =>
  () =>
    client.create(roomName);

type Msg = { type: "Lefted" } | { type: "Errored" };

export const joinOrCreate = ({ roomName }: { roomName: RoomName }) => {
  return async () => {
    const room = await client.joinOrCreate(roomName);

    const subject = new Rx.Subject<Msg>();

    room.onMessage("Msg", () => {});

    room.onLeave(() => {
      subject.next({ type: "Lefted" });
    });

    room.onError(() => {
      subject.next({ type: "Errored" });
    });

    const leave = () => async () => {
      room.leave();
      return {};
    };

    const send =
      <Msg>(msg: Msg) =>
      async () => {
        room.send("Msg", msg);
        return {};
      };

    return {
      msg$: subject,
      leave,
      send,
    };
  };
};
