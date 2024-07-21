import { Ok, RequestResponse, requesting } from "gamezilla-app/@/core";
import {
	APP_SOUND,
	playSound,
	pushRoute,
	sendToServer,
} from "gamezilla-app/app/@/client";
import type { SpaceId } from "gamezilla-app/app/@/data";
import { IconGamepad, TopBar } from "gamezilla-app/app/@/ui";
import { EmptyState } from "gamezilla-app/app/@/ui/empty-state";
import type { SpaceClientModule } from "../architecture/architecture";
import type { SpaceCoreState } from "../spaces-core";
import * as Spaces from "../spaces-core/spaces-core.client";
import { StartSpaceClient } from "../start-space/start-space.client";
import { ViewSpaceCard } from "./space-card";

//
//
//
//
//

const sendListSpacesRequest: SpaceClientModule["update"] = ({ model, ctx }) => {
	return {
		model: {
			...model,
			listSpacesRequest: requesting(ctx.now),
		},
		msgCmd: [sendToServer({ t: "list-spaces", limit: 100, offset: 0 })],
	};
};

//
//
//
//
//
//

const init: SpaceClientModule["init"] = ({ model, ctx }) => {
	return sendListSpacesRequest({ model, ctx });
};

//
//
//
//
//
//
//

const update: SpaceClientModule["update"] = (input) => {
	const { ctx, msgServer, model, msgEvt, msg } = input;

	switch (msgEvt?.t) {
		case "routing/route-changed": {
			if (msgEvt.route.t === "space-list") {
				return sendListSpacesRequest({ model, ctx });
			}
			return { model };
		}

		case "wire/server-connected": {
			return sendListSpacesRequest({ model, ctx });
		}
	}

	switch (msg?.t) {
		case "time-passed": {
			return {
				model: {
					...model,
					listSpacesRequest: RequestResponse.elapsed(
						model.listSpacesRequest,
						ctx.now,
					),
				},
			};
		}

		case "clicked-space-card": {
			return {
				model,
				msgCmd: [
					pushRoute({
						n: "spaces",
						t: "space",
						spaceId: msg.spaceId,
					}),
					playSound(APP_SOUND.navForwardMin),
				],
			};
		}
	}

	switch (msgServer?.t) {
		case "listed-spaces": {
			const merged = Spaces.mergeMany({ model, spaces: msgServer.spaces });
			return {
				model: {
					...model,
					spaceIdByUserId: merged.spaceIdByUserId,
					spaces: merged.spaces,
					listSpacesRequest: RequestResponse.response(
						model.listSpacesRequest,
						ctx.now,
						Ok(null),
					),
				},
			};
		}
	}

	return { model };
};

//
//
//
// View
//
//
//

const toSpaces = (model: Spaces.Model) => {
	const spaces: SpaceCoreState.Started[] = [];
	for (const spaceId in model.spaces) {
		const started = Spaces.toSpaceStarted(model, spaceId as SpaceId);
		if (started) {
			spaces.push(started);
		}
	}
	return spaces;
};

const View: SpaceClientModule["View"] = (input) => {
	const currentUserId = input.ctx.currentUserId;

	if (!currentUserId) {
		return null;
	}

	const currentUserSpaceId = input.model.spaceIdByUserId[currentUserId];

	const spaces = toSpaces(input.model);

	return (
		<div className="relative flex w-full flex-1 flex-col overflow-hidden">
			<TopBar
				onBack={false}
				ctx={input.ctx}
				center
				title={input.ctx.t("spaces.spaces")}
			/>

			<div className="relative flex w-full flex-1 flex-col overflow-hidden overflow-y-scroll pb-8">
				{spaces.length === 0 && (
					<EmptyState
						renderIcon={(input) => <IconGamepad {...input} />}
						label={input.ctx.t("spaces.no-spaces")}
					/>
				)}

				<div className="flex w-full flex-1 flex-col gap-5 p-5">
					{spaces.flatMap((state) => {
						return (
							<ViewSpaceCard
								key={state.spaceId}
								ctx={{ ...input.ctx, currentUserId }}
								onClick={() => {
									input.dispatch({
										t: "clicked-space-card",
										spaceId: state.spaceId,
									});
								}}
								state={state}
							/>
						);
					})}
				</div>
			</div>

			{!currentUserSpaceId && (
				<div className="absolute right-4 bottom-6">
					<StartSpaceClient.ViewStartSpaceButton {...input} />
				</div>
			)}
		</div>
	);
};

export const ListSpacesClient = {
	init,
	update,
	View,
};
