import { GameClientModule } from "gamezilla-app/app/spaces/@shared/architecture/game-client-v2";
import { withId } from "gamezilla-app/app/spaces/@shared/event";
import { APP_SOUND, playSound } from "gamezilla-app/app/@shared/client";
import {
	Avatar,
	Button,
	IconArrowLeftOnRect,
	Tabs,
} from "gamezilla-app/app/@shared/ui";
import { ViewSpaceHostChip } from "../../../@shared/game";
import type { ClientModule } from "../create.core";
import { PackListClient } from "../pack/list/pack-list.client";
import { PuzzleListClient } from "../puzzle/list/puzzle-list.client";

const update: ClientModule["update"] = (input) => {
	return GameClientModule.andThen(
		{ model: input.model },
		//
		(model) => updateListTab({ ...input, model }),
		(model) => updateUserChangedListTab({ ...input, model }),
	);
};

const updateUserChangedListTab: ClientModule["update"] = (input) => {
	const { model, msgSync } = input;

	switch (msgSync?.t) {
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
				msgSync: [
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
	const { ctx, modelSync, dispatch } = input;

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
			<Tabs
				tabs={["puzzles", "packs"]}
				labels={{
					packs: "Packs",
					puzzles: "Puzzles",
				}}
				onSelect={(listTab) =>
					dispatch({ t: "user-changed-list-tab", listTab })
				}
				selected={modelSync.listTab}
			/>

			{modelSync.listTab === "puzzles" && <PuzzleListClient.View {...input} />}

			{modelSync.listTab === "packs" && <PackListClient.View {...input} />}

			<div className="flex w-full items-center gap-4 border-t border-neutral-700 p-4">
				<Button
					onClick={input.ctx.onQuit}
					className="flex-1"
					text="Exit"
					start={<IconArrowLeftOnRect className="h-6 w-6" />}
					variant="contained"
					color="default"
				/>
			</div>
		</div>
	);
};

export const ListTabsClient: Pick<ClientModule, "update" | "View"> = {
	update,
	View,
};
