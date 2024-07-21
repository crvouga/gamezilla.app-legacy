import type { VDom } from "gamezilla-app/@/vdom";
import type { UserId } from "gamezilla-app/app/@/data";
import { IconRobot, IconUsers, Typography } from "gamezilla-app/app/@/ui";
import type { SpaceClientCtx } from "gamezilla-app/app/spaces/@/space";
import {
	type SpaceClientCmd,
	type SpaceClientCmdTypes,
	exitGame,
	openUserDetails,
} from "../../../@/space-client-cmd";
import { ViewGameHeader } from "./view-game-header";
import { ViewUsersInSpaceList } from "./view-users-in-space-list";
import { TranslatedText } from "gamezilla-app/@/l18n";
import { Translator } from "gamezilla-app/@/l18n/generated";

//
//
//
//
//
//

export type Msg =
	| {
			t: "game-main-menu/clicked-open-user-details-button";
			userId: UserId;
	  }
	| {
			t: "game-main-menu/clicked-exit-game-button";
	  };

export const update = <TModel, TMsg, T extends SpaceClientCmdTypes>({
	msg,
	model,
}: {
	model: TModel;
	msg?: Msg | TMsg | null;
}): {
	model: TModel;
	msgCmd: SpaceClientCmd<T>[];
} => {
	if (typeof msg !== "object" || !msg || !("t" in msg)) {
		return { model, msgCmd: [] };
	}

	switch (msg?.t) {
		case "game-main-menu/clicked-exit-game-button": {
			return { model, msgCmd: [exitGame()] };
		}

		case "game-main-menu/clicked-open-user-details-button": {
			return { model, msgCmd: [openUserDetails(msg.userId)] };
		}

		default: {
			return { model, msgCmd: [] };
		}
	}
};

//
//
//
//
//
//

type MainMenuButton = {
	renderIcon: (input: { className: string }) => VDom;
	title: TranslatedText;
	description: TranslatedText;
	onClick: () => void;
};

export const View = ({
	title,
	renderCoverArt,
	buttons,
	ctx,
	dispatch,
}: {
	ctx: SpaceClientCtx;
	title: TranslatedText;
	dispatch: (msg: Msg) => void;
	renderCoverArt: (input: { className: string; key: string }) => VDom;
	buttons: MainMenuButton[];
}) => {
	if (ctx.currentUserId !== ctx.space.hostId) {
		return (
			<div className="flex h-full w-full flex-col">
				<ViewGameHeader
					ctx={ctx}
					onBack={() =>
						dispatch({ t: "game-main-menu/clicked-exit-game-button" })
					}
					title={title}
					renderCoverArt={renderCoverArt}
				/>
				<ViewUsersInSpaceList
					onOpenUserDetails={(userId) =>
						dispatch({
							t: "game-main-menu/clicked-open-user-details-button",
							userId,
						})
					}
					ctx={ctx}
				/>
			</div>
		);
	}

	return (
		<div className="flex h-full w-full flex-col overflow-y-hidden">
			<div className="flex w-full flex-1 flex-col items-center overflow-y-scroll">
				<ViewGameHeader
					ctx={ctx}
					onBack={() =>
						dispatch({ t: "game-main-menu/clicked-exit-game-button" })
					}
					title={title}
					renderCoverArt={renderCoverArt}
				/>

				<div className="flex w-full flex-col p-4">
					{buttons.map(({ renderIcon, title, description, onClick }, index) => (
						<button
							className="mb-6 flex w-full items-center rounded bg-neutral-800 p-6 active:opacity-70"
							onClick={onClick}
							key={`${index} ${title}`}
						>
							{renderIcon({
								className: "aspect-square w-10 h-10 mr-4",
							})}
							<div className="flex-1 text-left">
								<Typography variant="title" text={title} />

								{description && (
									<Typography variant="label" text={description} />
								)}
							</div>
						</button>
					))}
				</div>
			</div>
		</div>
	);
};

export const buttons = {
	playFriend: (input: {
		onClick: () => void;
		ctx: { t: Translator };
	}): MainMenuButton => {
		return {
			...input,
			renderIcon: (input) => <IconUsers {...input} />,
			title: input.ctx.t("game.play-friend-title"),
			description: input.ctx.t("game.play-friend-description"),
		};
	},

	playComputer: (input: {
		onClick: () => void;
		ctx: { t: Translator };
	}): MainMenuButton => {
		return {
			...input,
			renderIcon: (input) => <IconRobot {...input} />,
			title: input.ctx.t("game.play-computer-title"),
			description: input.ctx.t("game.play-computer-description"),
		};
	},
};
