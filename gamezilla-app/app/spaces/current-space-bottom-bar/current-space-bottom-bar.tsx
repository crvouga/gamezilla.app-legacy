import {
	APP_SOUND,
	type ClientCtx,
	playSound,
	pushRoute,
} from "gamezilla-app/app/@/client";
import { Avatar, Button, Typography } from "gamezilla-app/app/@/ui";
import { CoverArt } from "../game/game-cover-art";
import type { SpaceClientModule } from "../architecture/architecture";
import * as SpacesCoreClient from "../spaces-core/spaces-core.client";
import type { ModelClient, MsgClient } from "../spaces.types";

const update: SpaceClientModule["update"] = ({ model, msg, ctx }) => {
	switch (msg?.t) {
		case "clicked-current-space-bottom-bar": {
			const { currentUserId } = ctx;
			const currentUsersSpaceId = SpacesCoreClient.toSpaceIdByUserId(
				model,
				currentUserId,
			);

			if (!currentUsersSpaceId) {
				return { model };
			}

			return {
				model,
				msgCmd: [
					playSound(APP_SOUND.navForwardMin),
					pushRoute({
						n: "spaces",
						t: "space",
						spaceId: currentUsersSpaceId,
					}),
				],
			};
		}

		default: {
			return { model };
		}
	}
};

const View = ({
	ctx,
	model,
	dispatch,
}: {
	ctx: ClientCtx;
	model: ModelClient;
	dispatch: (msg: MsgClient) => void;
}) => {
	const userSpaceId = model.spaceIdByUserId[ctx.currentUserId];

	if (!userSpaceId) {
		return null;
	}

	const space = SpacesCoreClient.toSpaceStarted(model, userSpaceId);

	if (!space) {
		return null;
	}

	const hostProfile = ctx.profiles[space.hostId];

	if (!hostProfile) {
		return null;
	}

	const userCount = Object.values(space.users).length;

	return (
		<div className="flex w-full flex-col items-center justify-center overflow-hidden text-inherit">
			<div className="h-1 w-full bg-gradient-to-tr from-blue-700  via-blue-600 to-sky-500" />
			<div className="flex w-full items-center overflow-hidden text-inherit">
				<button
					type="button"
					className="flex flex-1 items-center gap-3 overflow-hidden"
					onClick={() => dispatch({ t: "clicked-current-space-bottom-bar" })}
				>
					<div className="p-2">
						{!space.game ? (
							<Avatar
								src={hostProfile?.avatarUrl}
								alt="Host Avatar"
								className="h-14 w-14"
							/>
						) : (
							<div className="h-14 w-14 overflow-hidden rounded border border-neutral-700">
								<CoverArt gameName={space.game.t} />
							</div>
						)}
					</div>

					<div className="flex flex-1 flex-col gap-1 overflow-hidden py-3">
						<Typography
							variant="title"
							className="truncate"
							text={ctx.t("spaces.current-space", {
								hostUsername: hostProfile.username,
							})}
						/>
						<Typography
							variant="subtitle"
							className="truncate"
							text={ctx.t("space-card.people-count", userCount)}
						/>
					</div>
				</button>

				<div className="pr-4">
					{ctx.currentUserId === space.hostId && (
						<Button
							color="danger"
							text={ctx.t("spaces.end")}
							onClick={() => dispatch({ t: "clicked-end-space-button" })}
							size="sm"
						/>
					)}

					{ctx.currentUserId !== space.hostId && (
						<Button
							color="danger"
							text={ctx.t("spaces.leave")}
							onClick={() => dispatch({ t: "clicked-leave-space-button" })}
							size="sm"
						/>
					)}
				</div>
			</div>
		</div>
	);
};

export const CurrentSpaceBottomBar = {
	update,
	View,
};
