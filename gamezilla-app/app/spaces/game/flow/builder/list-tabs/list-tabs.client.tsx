import { APP_SOUND, playSound } from "gamezilla-app/app/@/client";
import { Avatar, Tabs, TopBar } from "gamezilla-app/app/@/ui";
import { GameClientModule } from "gamezilla-app/app/spaces/@/architecture/game-client-v2";
import { withId } from "gamezilla-app/app/spaces/@/event";
import { ViewSpaceHostChip } from "../../../@/game";
import type { ClientModule } from "../builder.types";
import { ScreenOpenPackClient } from "../screen-open-pack/screen-open-pack.client";
import { ScreenOpenPuzzleClient } from "../screen-open-puzzle/screen-open-puzzle.client";

const update: ClientModule["update"] = (input) => {
	return GameClientModule.andThen(
		{ model: input.model },
		//
		(model) => updateListTab({ ...input, model }),
		(model) => updateUserChangedListTab({ ...input, model }),
	);
};

const updateUserChangedListTab: ClientModule["update"] = (input) => {
	switch (input.msgCore?.t) {
		case "user-changed-list-tab": {
			return {
				model: input.model,
				msgCmd: [playSound(APP_SOUND.tap)],
			};
		}
			
		case 'user-clicked-back-button': {
			return {
				model: input.model,
				msgCmd: [playSound(APP_SOUND.navBackwardMin)],
			}
		}

		default: {
			return { model: input.model };
		}
	}
};

const updateListTab: ClientModule["update"] = (input) => {
	const { msg } = input;

	if (!msg) {
		return { model: input.model };
	}

	switch (msg.t) {
		case "user-changed-list-tab":
		case "user-clicked-back-button": {
			return {
				model: input.model,
				msgCore: [withId(msg)],
			};
		}

		default: {
			return { model: input.model };
		}
	}
};

const View: ClientModule["View"] = (input) => {
	const isSpectating = input.ctx.space.hostId !== input.ctx.currentUserId;

	if (isSpectating) {
		const host = input.ctx.profiles[input.ctx.space.hostId];
		const name = host?.username ?? "Host";
		return (
			<div className="h-ull flex w-full flex-1 flex-col items-center justify-center gap-4">
				<div className="flex w-full flex-col items-center justify-center gap-2">
					<Avatar src={host?.avatarUrl} className="h-20 w-20" />
					<div className="flex items-center gap-2">
						<p className="text-xl font-bold">{name}</p>
						<ViewSpaceHostChip ctx={input.ctx} />
					</div>
				</div>
				<p className="text-lg font-bold text-neutral-300">
					Browsing puzzles and packs
				</p>
			</div>
		);
	}

	return (
		<div className="flex h-full w-full flex-1 flex-col">
			<TopBar
				ctx={input.ctx}
				onBack={() =>
					input.dispatch({
						t: "user-clicked-back-button",
						userId: input.ctx.currentUserId,
					})
				}
				title={input.ctx.t("flow.builder")}
			/>

			<Tabs
				tabs={["puzzles", "packs"]}
				labels={{
					packs: input.ctx.t("flow.packs"),
					puzzles: input.ctx.t("flow.puzzles"),
				}}
				onSelect={(listTab) =>
					input.dispatch({
						t: "user-changed-list-tab",
						listTab,
						userId: input.ctx.currentUserId,
					})
				}
				selected={input.modelCore.listTab}
			/>

			{input.modelCore.listTab === "puzzles" && (
				<ScreenOpenPuzzleClient.View {...input} />
			)}

			{input.modelCore.listTab === "packs" && (
				<ScreenOpenPackClient.View {...input} />
			)}
		</div>
	);
};

export const ListTabsClient = {
	update,
	View,
};
