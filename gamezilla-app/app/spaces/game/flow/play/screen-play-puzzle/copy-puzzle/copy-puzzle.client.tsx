import {
	APP_SOUND,
	copyToClipboard,
	playSound,
	showToast,
	type ClientCtx,
} from "gamezilla-app/app/@/client";
import { IconCopy } from "gamezilla-app/app/@/ui";
import type { ActionInput } from "gamezilla-app/app/@/ui/actions";
import { FlowGridShorthand } from "../../../@/flow/flow-variant/flow-grid";
import type { ClientModule, MsgClient } from "../../play.types";
import { FlowPlay } from "../../../@/flow/flow-play";

export const update: ClientModule["update"] = (input) => {
	switch (input.msgCore?.t) {
		case "user-clicked-copy-to-clipboard": {
			if (input.modelCore.screen.t !== "screen-play-puzzle") {
				return { model: input.model };
			}

			const flow = FlowPlay.toFlow({
				flow: input.modelCore.screen.flowPuzzle.flow,
				model: input.modelCore.screen.flowPlay,
			});

			if (flow.t !== "flow-grid") {
				return { model: input.model };
			}

			const shorthand = FlowGridShorthand.fromGrid(flow);

			const encoded = JSON.stringify(shorthand);

			return {
				model: input.model,
				msgCmd: [
					playSound(APP_SOUND.refreshFeed),
					showToast(input.ctx.t("app.copied-to-clipboard")),
					copyToClipboard(encoded),
				],
			};
		}
	}
	return {
		model: input.model,
	};
};

export const viewButtonAction = ({
	ctx,
	dispatch,
}: {
	ctx: ClientCtx;
	dispatch: (m: MsgClient) => void;
}): ActionInput[] => {
	if (ctx.currentUserRole !== "super") {
		return [];
	}
	return [
		{
			icon: (input) => <IconCopy {...input} />,
			label: ctx.t("flow.copy-puzzle-to-clipboard"),
			onClick: () => dispatch({ t: "user-clicked-copy-to-clipboard" }),
		},
	];
};
