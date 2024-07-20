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
	const { model, msgCore } = input;

	switch (msgCore?.t) {
		case "user-changed-list-tab": {
			return {
				model,
				msgCmd: [playSound(APP_SOUND.tap)],
			};
		}

		default: {
			return { model };
		}
	}
};

const updateListTab: ClientModule["update"] = (input) => {
	const { model, msg } = input;

	switch (msg?.t) {
		case "user-changed-list-tab": {
			return {
				model,
				msgCore: [
					withId({
						t: "user-changed-list-tab",
						listTab: msg.listTab,
					}),
				],
			};
		}

		default: {
			return { model };
		}
	}
};

const View: ClientModule["View"] = (input) => {
	const { ctx, modelCore, dispatch } = input;

	const isSpectating = ctx.space.hostId !== ctx.currentUserId;

	if (isSpectating) {
		const host = ctx.profiles[ctx.space.hostId];
		const name = host?.username ?? "Host";
		return (
			<div className="h-ull flex w-full flex-1 flex-col items-center justify-center gap-4">
				<div className="flex w-full flex-col items-center justify-center gap-2">
					<Avatar src={host?.avatarUrl} className="h-20 w-20" />
					<div className="flex items-center gap-2">
						<p className="text-xl font-bold">{name}</p>
						<ViewSpaceHostChip ctx={ctx} />
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
				onBack={input.ctx.onQuit}
				title={input.ctx.t("flow.builder")}
			/>

			<Tabs
				tabs={["puzzles", "packs"]}
				labels={{
					packs: "Packs",
					puzzles: "Puzzles",
				}}
				onSelect={(listTab) =>
					dispatch({ t: "user-changed-list-tab", listTab })
				}
				selected={modelCore.listTab}
			/>

			{modelCore.listTab === "puzzles" && (
				<ScreenOpenPuzzleClient.View {...input} />
			)}

			{modelCore.listTab === "packs" && (
				<ScreenOpenPackClient.View {...input} />
			)}
		</div>
	);
};

export const ListTabsClient: Pick<ClientModule, "update" | "View"> = {
	update,
	View,
};
