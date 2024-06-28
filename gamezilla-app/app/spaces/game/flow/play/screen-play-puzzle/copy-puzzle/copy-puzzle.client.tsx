import {
	APP_SOUND,
	type ClientCtx,
	playSound,
} from "gamezilla-app/app/@/client";
import { IconCopy } from "gamezilla-app/app/@/ui";
import type { ButtonActionProps } from "gamezilla-app/app/@/ui/bottom-actions";
import type { ClientModule, MsgClient } from "../../play.types";

export const update: ClientModule["update"] = (input) => {
	switch (input.msgCore?.t) {
		case "user-clicked-copy-to-clipboard": {
			return {
				model: input.model,
				msgCmd: [playSound(APP_SOUND.navForwardMin)],
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
