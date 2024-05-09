import { Eff, Sub, batchMsgs, NotAsked } from "gamezilla-app/@/core";
import { isAnonymous } from "../@/client";
import { SpaceClientCmd } from "./@/space-client-cmd";
import {
	type Input,
	type Output,
	SpaceClientModule,
} from "./architecture/architecture";
import { CurrentSpaceBottomBar } from "./current-space-bottom-bar/current-space-bottom-bar";
import { EndSpaceClient } from "./end-space/end-space.client";
import { SpaceGameClient } from "./space-game/space-game.client";
import { GoHome } from "./go-home/go-home";
import { JoinSpaceClient } from "./join-space/join-space.client";
import { LeaveSpaceClient } from "./leave-space/leave-space.client";
import { ListSpacesClient } from "./list-spaces/list-spaces.client";
import { Modals } from "./modals/modals";
import { SpaceClient } from "./space/space.cient";
import { Spaces } from "./spaces-core";
import type { ClientModule, ModelClient } from "./spaces.types";
import { StartSpaceClient } from "./start-space/start-space.client";
import { SyncClient } from "./sync/sync.client";

//
//
//
// Model
//
//
//

export const init: ClientModule["init"] = ({ ctx }) => {
	const model: ModelClient = {
		...Spaces.init,
		games: {},
		modal: null,
		modalPreviewUserId: null,
		listSpacesRequest: NotAsked,
	};
	const listSpaces = ListSpacesClient.init({ ctx, model });
	return {
		model: {
			...model,
			...listSpaces.model,
		},
		eff: Eff.batch([listSpaces.eff]),
		msgCmd: SpaceClientCmd.toClientCmd(batchMsgs(listSpaces.msgCmd)),
	};
};

//
//
//
// Update
//
//
//

export const update: ClientModule["update"] = (input) => {
	const updated = updateMain(input);

	return {
		model: updated.model,
		eff: updated.eff,
		msgCmd: SpaceClientCmd.toClientCmd(updated.msgCmd),
	};
};

export const updateMain = (input: Input, initial?: Output): Output => {
	const acc = initial ?? updateChild(input);

	const [spaceEvent, ...spaceEventsRest] = acc.msgSpaceEvent ?? [];

	if (spaceEvent) {
		const updated = updateChild({
			ctx: input.ctx,
			model: acc.model,
			msgSpaceEvent: spaceEvent,
			modelLocation: input.modelLocation,
		});

		return updateMain(input, {
			model: updated.model,
			modelLocation: updated.modelLocation ?? acc.modelLocation,
			eff: Eff.batch([acc.eff, updated.eff]),
			msgSpaceEvent: batchMsgs(spaceEventsRest, updated.msgSpaceEvent),
			msgCmd: batchMsgs(acc.msgCmd, updated.msgCmd),
			msgEvt: [],
		});
	}

	const [spaceCmd, ...spaceCmdsRest] = SpaceClientCmd.toSpaceClientCmd(
		acc.msgCmd,
	);

	if (spaceCmd) {
		const updated = updateChild({
			ctx: input.ctx,
			model: acc.model,
			msgCmd: spaceCmd,
		});

		return updateMain(input, {
			model: updated.model,
			eff: Eff.batch([acc.eff, updated.eff]),
			msgSpaceEvent: batchMsgs(acc.msgSpaceEvent, updated.msgSpaceEvent),
			msgCmd: batchMsgs(spaceCmdsRest, updated.msgCmd),
			msgEvt: [],
		});
	}

	return acc;
};

const updateChild: SpaceClientModule["update"] = (input) => {
	if (
		input.msgSpaceEvent &&
		Spaces.hasEvent(
			input.model,
			input.msgSpaceEvent.spaceId,
			input.msgSpaceEvent.eventId,
		)
	) {
		return { model: input.model };
	}

	return SpaceClientModule.andThen(
		{ model: input.model },
		(model) => EndSpaceClient.update({ ...input, model }),
		(model) => LeaveSpaceClient.update({ ...input, model }),
		(model) => updateSpacesFromSpaceEvent({ ...input, model }),
		(model) => SpaceGameClient.update({ ...input, model }),
		(model) => SyncClient.update({ ...input, model }),
		(model) => StartSpaceClient.update({ ...input, model }),
		(model) => JoinSpaceClient.update({ ...input, model }),
		(model) => ListSpacesClient.update({ ...input, model }),
		(model) => GoHome.update({ ...input, model }),
		(model) => CurrentSpaceBottomBar.update({ ...input, model }),
		(model) => Modals.update({ ...input, model }),
	);
};

const updateSpacesFromSpaceEvent: SpaceClientModule["update"] = ({
	msgSpaceEvent,
	model,
}) => {
	if (!msgSpaceEvent) {
		return { model };
	}

	const updated = Spaces.updateFromSpaceEvent({
		model,
		spaceEvent: msgSpaceEvent,
	});

	return { model: { ...model, ...updated.model } };
};

//
//
//
//
// Subscriptions
//
//
//
//

export const subscriptions: ClientModule["subscriptions"] = (input) => {
	return Sub.batch([
		//
		SpaceGameClient.subscriptions(input),
	]);
};

//
//
//
//
// View
//
//
//
//

export const View: ClientModule["View"] = (props) => {
	switch (props.ctx.currentRoute.n) {
		case "spaces": {
			switch (props.ctx.currentRoute.t) {
				case "space-list": {
					return (
						<>
							<ListSpacesClient.View
								dispatch={props.dispatch}
								ctx={props.ctx}
								model={props.model}
							/>

							{props.slots?.bottomBar(null)}
						</>
					);
				}
				case "space": {
					if (isAnonymous(props.ctx)) {
						return null;
					}

					return (
						<SpaceClient.View
							spaceId={props.ctx.currentRoute.spaceId}
							ctx={props.ctx}
							dispatch={props.dispatch}
							model={props.model}
						/>
					);
				}
				default: {
					return null;
				}
			}
		}
		default: {
			return null;
		}
	}
};

export const ViewCurrentSpaceBar = CurrentSpaceBottomBar.View;
