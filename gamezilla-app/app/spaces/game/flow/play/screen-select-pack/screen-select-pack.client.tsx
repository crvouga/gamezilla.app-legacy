import { APP_SOUND, playSound } from "gamezilla-app/app/@/client";
import { GameClientModule } from "gamezilla-app/app/spaces/@/architecture/game-client-v2";
import { withId } from "gamezilla-app/app/spaces/@/event";
import { ViewBottomBarExitButton } from "../../../@/game";
import { ViewScreenTitle } from "../../../@/game/view-screen-title";
import { FlowPackListClient } from "../../@/flow-pack";
import type { ClientModule } from "../play.types";

const update: ClientModule["update"] = (input) => {
	return GameClientModule.andThen(
		{ model: input.model },
		(model) => updateFromMsg({ ...input, model }),
		(model) => updateFromMsgCore({ ...input, model }),
	);
};

const updateFromMsg: ClientModule["update"] = (input) => {
	switch (input.msg?.t) {
		case "user-clicked-open-pack-list-item": {
			return {
				model: input.model,
				msgCore: [withId(input.msg)],
			};
		}
		default: {
			return {
				model: input.model,
			};
		}
	}
};

const updateFromMsgCore: ClientModule["update"] = (input) => {
	switch (input.msgCore?.t) {
		case "user-clicked-open-pack-list-item": {
			return {
				model: input.model,
				msgCmd: [playSound(APP_SOUND.navForwardMin)],
			};
		}
		default: {
			return {
				model: input.model,
			};
		}
	}
};

const View: ClientModule["View"] = (input) => {
	return (
		<div className="w-full h-full flex-1 flex flex-col">
			<ViewScreenTitle title={input.ctx.t("flow.play")} />
			<FlowPackListClient.View
				ctx={input.ctx}
				dispatch={(c) => input.dispatch({ t: "flow-pack-list", c })}
				model={{
					...input.model.flowPackList,
					packs: input.model.flowPacks,
				}}
				emits={{
					clickedPackItem(pack) {
						input.dispatch({ t: "user-clicked-open-pack-list-item", pack });
					},
				}}
			/>
			<ViewBottomBarExitButton ctx={input.ctx} onClick={input.ctx.onQuit} />
		</div>
	);
};

export const ScreenSelectPackClient = {
	update,
	View,
};
