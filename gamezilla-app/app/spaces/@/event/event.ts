import { LamportTimestamp } from "gamezilla-app/@/lamport-clock/lamport-timestamp";
import { EventId } from "./event-id";
import { p } from "gamezilla-app/@/core/parser";

export const EventMeta = p.obj({
	happenedAt: LamportTimestamp,
	eventId: EventId,
});

export type EventMeta = p.Infer<typeof EventMeta>;

export type WithEventId<T> = T & {
	eventId: EventId;
	happenedAt?: LamportTimestamp | null | undefined;
};

export type WithEventMeta<T> = T & EventMeta;

export const WithEventMeta = <T>(parser: p.Parser<T>) => {
	return p.and(parser, EventMeta);
};

export const withEventMeta = <T>(msg: T): WithEventMeta<T> => {
	return {
		...msg,
		happenedAt: LamportTimestamp.fromNumber(0),
		eventId: EventId.generate(),
	};
};

export const withId = <T>(msg: T): WithEventId<T> => {
	return {
		...msg,
		eventId: EventId.generate(),
	};
};
