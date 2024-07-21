import type { TranslatedText } from "gamezilla-app/@/l18n";
import type { VDom } from "gamezilla-app/@/vdom";
import type { ClientCtx } from "gamezilla-app/app/@/client";
import type { SpaceId } from "gamezilla-app/app/@/data";
import {
	Button,
	IconChevronDown,
	IconUserGroup,
	Typography,
} from "gamezilla-app/app/@/ui";
import type { SpaceClientCtx } from "gamezilla-app/app/spaces/@/space";
import type { SpaceClientModule } from "../architecture/architecture";
import { EndSpaceClient } from "../end-space/end-space.client";
import { Feed } from "../feed/feed";
import { JoinSpaceClient } from "../join-space/join-space.client";
import { LeaveSpaceClient } from "../leave-space/leave-space.client";
import { Modals } from "../modals/modals";
import * as SpacesCoreClient from "../spaces-core/spaces-core.client";
import type { ModelClient, MsgClient } from "../spaces.types";
import { SpaceGameClient } from "./space-game.client";

const View = (input: {
	model: ModelClient;
	ctx: ClientCtx;
	dispatch: (m: MsgClient) => void;
	spaceId: SpaceId;
}) => {
	const spaceState = SpacesCoreClient.toSpaceState(input.model, input.spaceId);

	switch (spaceState.type) {
		case "initial": {
			return <ViewSpaceNotFound {...input} />;
		}

		case "ended": {
			return <EndSpaceClient.ViewSpaceEnded {...input} />;
		}

		case "started": {
			const spaceCtx: SpaceClientCtx = {
				...input.ctx,
				currentUserId: input.ctx.currentUserId,
				space: spaceState,
			};

			const currentUserSpaceId = SpacesCoreClient.toSpaceIdByUserId(
				input.model,
				input.ctx.currentUserId,
			);

			if (currentUserSpaceId !== spaceCtx.space.spaceId) {
				return (
					<>
						<JoinSpaceClient.View {...input} ctx={spaceCtx} />
						<Modals.View {...input} ctx={spaceCtx} />
					</>
				);
			}

			return (
				<div className="flex h-full w-full flex-1 flex-col">
					<Modals.View {...input} ctx={spaceCtx} />

					<ViewTopBar {...input} ctx={spaceCtx} />

					{false && (
						<Feed.View
							spaceState={spaceState}
							ctx={spaceCtx}
							model={input.model}
							dispatch={input.dispatch}
						/>
					)}

					<div className="flex w-full flex-1 flex-col overflow-hidden">
						<SpaceGameClient.View {...input} ctx={spaceCtx} />
					</div>
				</div>
			);
		}
	}
};

const ViewTopBar: SpaceClientModule["View"] = (input) => {
	if (!input.ctx.space || !input.ctx.currentUserId) {
		return null;
	}

	const peopleCount = Object.keys(input.ctx.space.users).length;

	return (
		<nav className="flex h-14 w-full items-center border-b border-neutral-700">
			<ViewTopBarButton
				onClick={() => input.dispatch({ t: "clicked-go-home-button" })}
				label={input.ctx.t("spaces.home")}
				icon={<IconChevronDown className="h-6 w-6" />}
			/>

			<ViewTopBarButton
				onClick={() => input.dispatch({ t: "clicked-people-button" })}
				label={input.ctx.t("spaces.people-count", peopleCount)}
				icon={<IconUserGroup className="h-6 w-6" />}
			/>

			<div className="flex-1" />

			{input.ctx.space.hostId !== input.ctx.currentUserId && (
				<div className="p-2">
					<LeaveSpaceClient.ViewLeaveSpaceButton {...input} />
				</div>
			)}

			{input.ctx.space.hostId === input.ctx.currentUserId && (
				<div className="p-2">
					<EndSpaceClient.ViewEndSpaceButton {...input} />
				</div>
			)}
		</nav>
	);
};

const ViewTopBarButton = (input: {
	icon: VDom;
	label: TranslatedText;
	onClick: () => void;
}) => {
	return (
		<button
			type="button"
			className="grid w-20 place-items-center py-1"
			onClick={input.onClick}
		>
			{input.icon}
			<Typography text={input.label} variant="caption" />
		</button>
	);
};

const ViewSpaceNotFound = (input: {
	ctx: ClientCtx;
	dispatch: (m: MsgClient) => void;
}) => {
	return (
		<div className="flex flex-1 flex-col items-center justify-center gap-4">
			<Typography
				variant="title"
				text={input.ctx.t("spaces.space-not-found")}
			/>
			<Button
				onClick={() => input.dispatch({ t: "clicked-go-home-button" })}
				size="lg"
				variant="contained"
				color="primary"
				text={input.ctx.t("spaces.go-home")}
			/>
		</div>
	);
};

export const SpaceClient = {
	View,
};
