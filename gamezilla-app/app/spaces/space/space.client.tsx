import type { VDom } from "gamezilla-app/@/vdom";
import type { ClientCtx } from "gamezilla-app/app/@/client";
import type { SpaceId } from "gamezilla-app/app/@/data";
import { Button, IconHome, IconUserGroup } from "gamezilla-app/app/@/ui";
import type { SpaceClientCtx } from "gamezilla-app/app/spaces/@/space";
import type { SpaceClientModule } from "../architecture/architecture";
import { EndSpaceClient } from "../end-space/end-space.client";
import { Feed } from "../feed/feed";
import { JoinSpaceClient } from "../join-space/join-space.client";
import { LeaveSpaceClient } from "../leave-space/leave-space.client";
import { Modals } from "../modals/modals";
import { SpaceGameClient } from "../space-game/space-game.client";
import * as SpacesCoreClient from "../spaces-core/spaces-core.client";
import type { ModelClient, MsgClient } from "../spaces.types";

const View = (props: {
	model: ModelClient;
	ctx: ClientCtx;
	dispatch: (m: MsgClient) => void;
	spaceId: SpaceId;
}) => {
	const spaceState = SpacesCoreClient.toSpaceState(props.model, props.spaceId);

	switch (spaceState.type) {
		case "initial": {
			return <ViewSpaceNotFound {...props} />;
		}

		case "ended": {
			return <EndSpaceClient.ViewSpaceEnded {...props} />;
		}

		case "started": {
			const spaceCtx: SpaceClientCtx = {
				...props.ctx,
				currentUserId: props.ctx.currentUserId,
				space: spaceState,
			};

			const currentUserSpaceId = SpacesCoreClient.toSpaceIdByUserId(
				props.model,
				props.ctx.currentUserId,
			);

			if (currentUserSpaceId !== spaceCtx.space.spaceId) {
				return (
					<>
						<JoinSpaceClient.View {...props} ctx={spaceCtx} />
						<Modals.View {...props} ctx={spaceCtx} />
					</>
				);
			}

			return (
				<div className="flex h-full w-full flex-1 flex-col">
					<Modals.View {...props} ctx={spaceCtx} />

					<ViewTopBar {...props} ctx={spaceCtx} />

					{false && (
						<Feed.View
							spaceState={spaceState}
							ctx={spaceCtx}
							model={props.model}
							dispatch={props.dispatch}
						/>
					)}

					<div className="flex w-full flex-1 flex-col overflow-hidden">
						<SpaceGameClient.View {...props} ctx={spaceCtx} />
					</div>
				</div>
			);
		}
	}
};

const ViewTopBar: SpaceClientModule["View"] = (props) => {
	if (!props.ctx.space || !props.ctx.currentUserId) {
		return null;
	}

	const peopleCount = Object.keys(props.ctx.space.users).length;

	return (
		<nav className="flex h-14 w-full items-center border-b border-neutral-700">
			<ViewTopBarButton
				onClick={() => props.dispatch({ t: "clicked-go-home-button" })}
				label="Home"
				icon={<IconHome className="h-6 w-6" />}
			/>

			<ViewTopBarButton
				onClick={() => props.dispatch({ t: "clicked-people-button" })}
				label={peopleCount > 1 ? `People (${peopleCount})` : "People"}
				icon={<IconUserGroup className="h-6 w-6" />}
			/>

			<div className="flex-1" />

			{props.ctx.space.hostId !== props.ctx.currentUserId && (
				<div className="p-2">
					<LeaveSpaceClient.ViewLeaveSpaceButton {...props} />
				</div>
			)}

			{props.ctx.space.hostId === props.ctx.currentUserId && (
				<div className="p-2">
					<EndSpaceClient.ViewEndSpaceButton {...props} />
				</div>
			)}
		</nav>
	);
};

const ViewTopBarButton = ({
	icon,
	label,
	onClick,
}: {
	icon: VDom;
	label: string;
	onClick: () => void;
}) => {
	return (
		<button
			type="button"
			className="grid w-20 place-items-center py-1"
			onClick={onClick}
		>
			{icon}
			<p className="text-xs">{label}</p>
		</button>
	);
};

const ViewSpaceNotFound = ({
	dispatch,
}: {
	dispatch: (m: MsgClient) => void;
}) => {
	return (
		<div className="flex flex-1 flex-col items-center justify-center gap-4">
			<p className="text-center text-2xl">Space not found</p>
			<Button
				onClick={() => dispatch({ t: "clicked-go-home-button" })}
				size="lg"
				variant="contained"
				color="primary"
				text="Go Home"
			/>
		</div>
	);
};

export const SpaceClient = {
	View,
};
