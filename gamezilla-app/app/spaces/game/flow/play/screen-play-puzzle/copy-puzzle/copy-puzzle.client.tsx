import {
	APP_SOUND,
	copyToClipboard,
	playSound,
	showToast,
	type ClientCtx,
} from "gamezilla-app/app/@/client";
import { IconCopy } from "gamezilla-app/app/@/ui";
import type { ButtonActionProps } from "gamezilla-app/app/@/ui/bottom-actions";
import { FlowVariantPlay } from "../../../@/flow";
import type { ClientModule, MsgClient } from "../../play.types";

export const update: ClientModule["update"] = (input) => {
	switch (input.msgCore?.t) {
		case "user-clicked-copy-to-clipboard": {
			if (input.modelCore.screen.t !== 'screen-play-puzzle') {
				return {model: input.model};
			}
			FlowVariantPlay.deriveFlow({
				flow: input.modelCore.screen.flowPuzzle.flow,
				model: input.modelCore.screen.flowPlay,
			})
			// const shorthand = FlowVariantPlay.toShorthand({flow});
			return {
				model: input.model,
				msgCmd: [
					playSound(APP_SOUND.navForwardMin),
					showToast(input.ctx.t('app.copied-to-clipboard')),
					copyToClipboard("Todo"),
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
}: { ctx: ClientCtx; dispatch: (m: MsgClient) => void }): ButtonActionProps => {
	return {
		icon: (props) => <IconCopy {...props} />,
		label: ctx.t("flow.copy-puzzle-to-clipboard"),
		onClick: () => dispatch({ t: "user-clicked-copy-to-clipboard" }),
	};
};
