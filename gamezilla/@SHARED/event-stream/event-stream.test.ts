import { expect, test } from "bun:test";
import { Posix } from "../core";
import { IEventStream } from "./event-stream";

//
//
//
//
//

type EventId = string;

type EventMeta = {
  happenedAt: Posix;
  msgEvtId: EventId;
};

const withId = <T>(msgEvtNew: T): T & EventMeta => {
  return {
    ...msgEvtNew,
    happenedAt: Posix.now(),
    msgEvtId: Math.random().toString(),
  };
};

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

const withMetaAt = (msgEvt: Event, happenedAt: Posix): Event & EventMeta => {
  return {
    ...withId<Event>(msgEvt),
    happenedAt,
  };
};

//
//
//
//
//
//

export const buildTest = <TInstance>(
  EventStream: IEventStream<EventId, Event & EventMeta, Indexes, TInstance>
) => {
  const config = EventStream.config({
    indexes: {
      byUserId: (msgEvt) => msgEvt.userId,
      byCounterId: (msgEvt) => msgEvt.counterId,
    },
    toId: (msgEvt) => msgEvt.msgEvtId,
    toOrdering: (msgEvt) => msgEvt.happenedAt,
  });
  test("should be able to append msgEvts", async () => {
    const before = await EventStream.init(config);
    const msgEvt = withId<Event>({
      t: "incremented",
      userId: "1",
      counterId: "1",
    });
    const after = await EventStream.append(config, before, msgEvt);

    expect(await EventStream.toArray(before)).toEqual([]);
    expect(await EventStream.toArray(after)).toEqual([msgEvt]);
  });

  test("should be able to append msgEvts", async () => {
    const msgEvt1 = withId<Event>({
      t: "incremented",
      userId: "1",
      counterId: "1",
    });
    const msgEvt2 = withId<Event>({
      t: "incremented",
      userId: "1",
      counterId: "2",
    });
    const msgEvt3 = withId<Event>({
      t: "incremented",
      userId: "1",
      counterId: "3",
    });
    const before = await EventStream.fromArray(config, [msgEvt1, msgEvt2]);

    const after = await EventStream.append(config, before, msgEvt3);

    expect(await EventStream.toArray(before)).toEqual([msgEvt1, msgEvt2]);

    expect(await EventStream.toArray(after)).toEqual([
      msgEvt1,
      msgEvt2,
      msgEvt3,
    ]);
  });

  test("should be able get subsets", async () => {
    const user_a_count_a = withId<Event>({
      t: "incremented",
      userId: "userA",
      counterId: "counterA",
    });

    const user_a_count_b = withId<Event>({
      t: "incremented",
      userId: "userA",
      counterId: "counterB",
    });

    const user_b_count_a = withId<Event>({
      t: "incremented",
      userId: "userB",
      counterId: "counterB",
    });

    const stream = await EventStream.fromArray(config, [
      user_a_count_a,
      user_a_count_b,
      user_b_count_a,
    ]);

    const userA = await EventStream.subset(config, stream, "byUserId", "userA");
    const userB = await EventStream.subset(config, stream, "byUserId", "userB");
    const counterA = await EventStream.subset(
      config,
      stream,
      "byCounterId",
      "counterA"
    );
    const counterB = await EventStream.subset(
      config,
      stream,
      "byCounterId",
      "counterB"
    );

    expect(await EventStream.toArray(userA)).toEqual([
      user_a_count_a,
      user_a_count_b,
    ]);
    expect(await EventStream.toArray(userB)).toEqual([user_b_count_a]);
    expect(await EventStream.toArray(counterA)).toEqual([user_a_count_a]);
    expect(await EventStream.toArray(counterB)).toEqual([
      user_a_count_b,
      user_b_count_a,
    ]);
  });

  test("should be able to merge", async () => {
    const t0 = Posix.now();

    const msgEvt1 = withMetaAt(
      {
        t: "incremented",
        userId: "1",
        counterId: "1",
      },
      t0
    );

    const msgEvt2 = withMetaAt(
      {
        t: "incremented",
        userId: "1",
        counterId: "2",
      },
      Posix.fromNumber(t0 + 1000)
    );

    const msgEvt3 = withMetaAt(
      {
        t: "incremented",
        userId: "1",
        counterId: "3",
      },
      Posix.fromNumber(t0 + 2000)
    );

    const streamA = await EventStream.fromArray(config, [msgEvt1, msgEvt3]);
    const streamB = await EventStream.fromArray(config, [msgEvt2]);
    const actual = await EventStream.mergeLeft(config, streamA, streamB);
    const expected = await EventStream.fromArray(config, [
      msgEvt1,
      msgEvt2,
      msgEvt3,
    ]);

    expect(await EventStream.toArray(actual)).toEqual(
      await EventStream.toArray(expected)
    );
  });
};
