import { withMeta } from "./event";
import { EventStream } from "./event-stream";

type Event =
  | {
      t: "user-incremented-counted";
      userId: string;
    }
  | {
      t: "user-decremented-counted";
      userId: string;
    };

type Indexes = "byUserId" | "bySpaceId";

const config = EventStream.initConfig<Event, Indexes>({
  byUserId: (event) => event.userId,
  bySpaceId: (event) => event.userId,
});

const stream = EventStream.init<Event>();

const stream1 = EventStream.append<Event>(
  stream,
  withMeta({
    t: "user-incremented-counted",
    userId: "1",
  })
);

const stream2 = EventStream.append<Event>(
  stream1,
  withMeta({
    t: "user-incremented-counted",
    userId: "2",
  })
);

const stream3 = EventStream.append<Event>(
  stream2,
  withMeta({
    t: "user-decremented-counted",
    userId: "1",
  })
);

const user1 = EventStream.subset(config, stream3, "byUserId");
