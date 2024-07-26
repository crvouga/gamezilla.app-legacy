import {CappedOrderedDict} from 'gamezilla-app/@/capped-ordered-dict/capped-ordered-dict';
import {ascend, eq, pipe} from 'gamezilla-app/@/core';
import {p} from 'gamezilla-app/@/core/parser';
import {LamportClock, LamportTimestamp} from 'gamezilla-app/@/lamport-clock';
import {SpaceId, UserId} from 'gamezilla-app/app/@/data';
import {
	EventId,
	EventMeta,
	type WithEventId,
	type WithEventMeta,
} from '../@/event';
import {SpaceCoreEvent} from './space-core-event';
import * as SpaceState from './space-core-state';

//
//
//
//
//
//

export const Model = p.obj({
	events: p.arr(p.and(EventMeta, SpaceCoreEvent)),
	eventIds: p.dict(EventId, EventId),
	clock: LamportClock,
	snapshots: CappedOrderedDict.parser(EventId, SpaceState.State),
});

export type Model = p.Infer<typeof Model>;

export const init: Model = {
	clock: LamportClock.init,
	events: [],
	snapshots: CappedOrderedDict.init({maxSize: 10}),
	eventIds: {},
};

export const isEqual = (left: Model, right: Model) => {
	return eq(deriveState(left), deriveState(right));
};

//
//
//
//
//
//

export const random = () => {
	return pipe(
		init,
		//
		(model) =>
			appendEvent({
				model,
				event: {
					t: 'user-started-space',
					eventId: EventId.generate(),
					spaceId: SpaceId.generate(),
					userId: UserId.generate(),
				},
			}),
	);
};

//
//
//
//
//
//

export const startFromLatestSnapshot = (model: Model): Model => {
	const events: WithEventMeta<SpaceCoreEvent>[] = [];
	const eventIds: Model['eventIds'] = {};

	for (let i = model.events.length - 1; i >= 0; i--) {
		const event = model.events[i];

		if (!event) {
			continue;
		}

		const snapshot = CappedOrderedDict.get(
			model.snapshots,
			event.eventId,
		);

		events.unshift(event);
		eventIds[event.eventId] = event.eventId;

		if (snapshot) {
			return {
				eventIds: events.reduce<
					Model['eventIds']
				>(
					(
						acc,
						event,
					) => {
						acc[
							event.eventId
						] =
							event.eventId;
						return acc;
					},
					{},
				),
				clock: model.clock,
				events: events,
				snapshots: CappedOrderedDict.add(
					init.snapshots,
					event.eventId,
					snapshot,
				),
			};
		}
	}

	return {
		clock: model.clock,
		events: events,
		snapshots: init.snapshots,
		eventIds: eventIds,
	};
};

//
//
//
//
//

export const appendEvent = ({
	model,
	event,
}: {
	model: Model;
	event: WithEventId<SpaceCoreEvent>;
}): Model => {
	if (model.eventIds[event.eventId]) {
		return model;
	}

	//
	//
	//

	const newEvent: WithEventMeta<SpaceCoreEvent> = {
		...event,
		happenedAt: LamportClock.toCurrentTime(
			model.clock,
		),
	};

	let newSnapshots = {...model.snapshots};

	const appended = [...model.events, newEvent];

	const newEvents = appended.sort(
		ascend((e) =>
			LamportTimestamp.toNumber(
				e.happenedAt,
			),
		),
	);

	const newEventIds = {
		...model.eventIds,
		[event.eventId]: event.eventId,
	};

	//
	// Remove invalid snapshots
	//

	const newEventIndex = newEvents.findIndex(
		(e) => e.eventId === event.eventId,
	);

	if (newEventIndex === -1) {
		// This should never happen because we just appended the event
		return model;
	}

	for (let i = newEventIndex; i < newEvents.length; i++) {
		const eventId = newEvents[i]?.eventId;
		if (eventId) {
			newSnapshots =
				CappedOrderedDict.remove(
					newSnapshots,
					eventId,
				);
		}
	}

	//
	// Add new snapshot
	//

	const snapshot = deriveState({
		clock: model.clock,
		events: newEvents,
		snapshots: newSnapshots,
		eventIds: newEventIds,
	});

	newSnapshots = CappedOrderedDict.add(
		newSnapshots,
		event.eventId,
		snapshot,
	);

	//
	//
	//

	const newClock = LamportClock.increment(model.clock);

	//
	//

	const modelNew: Model = {
		snapshots: newSnapshots,
		clock: newClock,
		events: newEvents,
		eventIds: newEventIds,
	};

	//
	//
	//

	return modelNew;
};

export const deriveState = (model: Model): SpaceState.State => {
	//
	//
	//

	let running = SpaceState.init;

	const events: WithEventMeta<SpaceCoreEvent>[] = [];

	for (let i = model.events.length - 1; i >= 0; i--) {
		const event = model.events[i];

		if (!event) {
			continue;
		}

		const snapshot = CappedOrderedDict.get(
			model.snapshots,
			event.eventId,
		);

		if (snapshot) {
			running = snapshot;
			break;
		}

		events.push(event);
	}

	//
	//
	//

	for (const event of events) {
		running = SpaceState.updateCore({
			state: running,
			msgSpace: event,
		});
	}

	return running;
};

export const toEventWithMeta = (model: Model, eventId: EventId) => {
	const event = model.events.find((e) => e.eventId === eventId);

	if (!event) {
		return null;
	}

	return event;
};

export const hasEvent = (model: Model, msgEvtId: EventId) => {
	return model.events.some((e) => e.eventId === msgEvtId);
};

export const toSpaceId = (model: Model): SpaceId | null => {
	const state = deriveState(model);

	switch (state.type) {
		case 'ended':
		case 'started': {
			return state.spaceId;
		}
		case 'initial': {
			return null;
		}
	}
};

export const toSpaceStarted = (model: Model): SpaceState.Started | null => {
	const state = deriveState(model);

	switch (state.type) {
		case 'started': {
			return state;
		}
		default: {
			return null;
		}
	}
};

export const toUserIds = (model: Model): UserId[] => {
	return SpaceState.toUserIds(deriveState(model));
};

export const mergeLeft = (left: Model, right: Model): Model => {
	const eventsNew: Model['events'] = [
		...left.events,
		...right.events,
	].sort(ascend((e) => LamportTimestamp.toNumber(e.happenedAt)));

	const distinctEvents = eventsNew.filter(
		(event, index, self) =>
			index ===
			self.findIndex(
				(e) =>
					e.eventId ===
					event.eventId,
			),
	);

	const snapshots = CappedOrderedDict.mergeLeft(
		left.snapshots,
		right.snapshots,
	);

	const clock = LamportClock.update(left.clock, right.clock);

	return {
		clock,
		events: distinctEvents,
		snapshots,
		eventIds: {
			...left.eventIds,
			...right.eventIds,
		},
	};
};
