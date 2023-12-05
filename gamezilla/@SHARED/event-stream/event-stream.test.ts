import { expect, test } from "bun:test";
import { Posix } from "../core";
import { EventMeta, withMeta$ } from "./event";
import { EventStream } from "./event-stream";
import { EventId } from "./event-id";

type Event =
  | {
      t: "incremented";
      userId: string;
      counterId: string;
    }
  | {
      t: "decremented";
      userId: string;
      counterId: string;
    };

type Indexes = "byUserId" | "byCounterId";

const config = EventStream.initConfig<Event & EventMeta, Indexes, EventId>({
  indexes: {
    byUserId: (event) => event.userId,
    byCounterId: (event) => event.counterId,
  },
  toId: (event) => event.eventId,
  toOrdering: (event) => event.happenedAt,
});

test("should be able to append events", () => {
  const before = EventStream.empty(config);
  const event = withMeta$<Event>({
    t: "incremented",
    userId: "1",
    counterId: "1",
  });
  const after = EventStream.append(config, before, event);

  expect(EventStream.toArray(before)).toEqual([]);
  expect(EventStream.toArray(after)).toEqual([event]);
});

test("should be able to append events", () => {
  const event1 = withMeta$<Event>({
    t: "incremented",
    userId: "1",
    counterId: "1",
  });
  const event2 = withMeta$<Event>({
    t: "incremented",
    userId: "1",
    counterId: "2",
  });
  const event3 = withMeta$<Event>({
    t: "incremented",
    userId: "1",
    counterId: "3",
  });
  const before = EventStream.fromArray(config, [event1, event2]);

  const after = EventStream.append(config, before, event3);

  expect(EventStream.toArray(before)).toEqual([event1, event2]);

  expect(EventStream.toArray(after)).toEqual([event1, event2, event3]);
});

test("should be able get subsets", () => {
  const user_a_count_a = withMeta$<Event>({
    t: "incremented",
    userId: "userA",
    counterId: "counterA",
  });

  const user_a_count_b = withMeta$<Event>({
    t: "incremented",
    userId: "userA",
    counterId: "counterB",
  });

  const user_b_count_a = withMeta$<Event>({
    t: "incremented",
    userId: "userB",
    counterId: "counterB",
  });

  const stream = EventStream.fromArray(config, [
    user_a_count_a,
    user_a_count_b,
    user_b_count_a,
  ]);

  const userA = EventStream.subset(config, stream, "byUserId", "userA");
  const userB = EventStream.subset(config, stream, "byUserId", "userB");
  const counterA = EventStream.subset(
    config,
    stream,
    "byCounterId",
    "counterA"
  );
  const counterB = EventStream.subset(
    config,
    stream,
    "byCounterId",
    "counterB"
  );

  expect(EventStream.toArray(userA)).toEqual([user_a_count_a, user_a_count_b]);
  expect(EventStream.toArray(userB)).toEqual([user_b_count_a]);
  expect(EventStream.toArray(counterA)).toEqual([user_a_count_a]);
  expect(EventStream.toArray(counterB)).toEqual([
    user_a_count_b,
    user_b_count_a,
  ]);
});

test("should be able to merge", () => {
  const t0 = Posix.now$();

  const event1 = withMetaAt(
    {
      t: "incremented",
      userId: "1",
      counterId: "1",
    },
    t0
  );

  const event2 = withMetaAt(
    {
      t: "incremented",
      userId: "1",
      counterId: "2",
    },
    Posix.fromNumber(t0 + 1000)
  );

  const event3 = withMetaAt(
    {
      t: "incremented",
      userId: "1",
      counterId: "3",
    },
    Posix.fromNumber(t0 + 2000)
  );

  const streamA = EventStream.fromArray(config, [event1, event3]);
  const streamB = EventStream.fromArray(config, [event2]);
  const actual = EventStream.mergeLeft(config, streamA, streamB);
  const expected = EventStream.fromArray(config, [event1, event2, event3]);

  expect(EventStream.toArray(actual)).toEqual(EventStream.toArray(expected));
});

function withMetaAt(event: Event, happenedAt: Posix): Event & EventMeta {
  return {
    ...withMeta$<Event>(event),
    happenedAt,
  };
}
