import type { ClientCtx } from "gamezilla-app/app/@/client";
import { IconCopy } from "gamezilla-app/app/@/ui";
import { ButtonActionProps } from "gamezilla-app/app/@/ui/bottom-actions";
import type { ClientModule, MsgClient } from "../../play.types";

export const update: ClientModule["update"] = (input) => {
  return {
    model: input.model,
  };
};

export const viewButtonAction = ({ ctx, dispatch }: { ctx: ClientCtx, dispatch: (m: MsgClient) => void }): ButtonActionProps => {
	return {
		icon: (props) => <IconCopy {...props} />,
		label: ctx.t('flow.copy-puzzle-to-clipboard'),
		onClick: () => dispatch({t: 'user-clicked-copy-to-clipboard'}),
	};
}