import { expect, test } from "vitest";
import { withMeta } from "./event";
import { EventStream } from "./event-stream";

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

const config = EventStream.init<Event, Indexes>({
  byUserId: (event) => event.userId,
  byCounterId: (event) => event.counterId,
});

test("should be able to append events", () => {
  const before = EventStream.empty(config);
  const event = withMeta<Event>({
    t: "incremented",
    userId: "1",
    counterId: "1",
  });
  const after = EventStream.append(config, before, event);

  expect(EventStream.count(config, before)).toEqual(0);
  expect(EventStream.count(config, after)).toEqual(1);
  expect(EventStream.toArray(config, before)).toEqual([]);
  expect(EventStream.toArray(config, after)).toEqual([event]);
});

test("should be able to append events", () => {
  const before = EventStream.fromArray(config, [
    withMeta<Event>({ t: "incremented", userId: "1", counterId: "1" }),
    withMeta<Event>({ t: "incremented", userId: "1", counterId: "2" }),
  ]);

  const event = withMeta<Event>({
    t: "incremented",
    userId: "1",
    counterId: "3",
  });

  const after = EventStream.append(config, before, event);

  expect(EventStream.count(config, before)).toEqual(2);

  expect(EventStream.count(config, after)).toEqual(3);
});

test("should be able get subsets", () => {
  const eventUser1Count1 = withMeta<Event>({
    t: "incremented",
    userId: "userA",
    counterId: "counterA",
  });

  const eventUser1Count2 = withMeta<Event>({
    t: "incremented",
    userId: "userA",
    counterId: "counterB",
  });

  const eventUser2Count1 = withMeta<Event>({
    t: "incremented",
    userId: "2",
    counterId: "userA",
  });

  const stream = EventStream.fromArray(config, [
    eventUser1Count1,
    eventUser1Count2,
    eventUser2Count1,
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

  expect(EventStream.toArray(config, userA)).toEqual([
    eventUser1Count1,
    eventUser1Count2,
  ]);
  expect(EventStream.toArray(config, userB)).toEqual([eventUser2Count1]);
  expect(EventStream.toArray(config, counterA)).toEqual([
    eventUser1Count1,
    eventUser2Count1,
  ]);
  expect(EventStream.toArray(config, counterB)).toEqual([eventUser1Count2]);
});
