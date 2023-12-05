import { IEventStream } from "./event-stream-v2";

type Event = { t: "inc" } | { t: "dec" };

export const buildTest = <T>(_eventStream: IEventStream<Event, "", T>) => {
  //
};
