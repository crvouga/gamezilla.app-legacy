import type { TimeSpan } from "gamezilla-app/@/core";
import type { ClientCtx } from "gamezilla-app/app/@/client";
import type { ClientModule, MsgClient } from "../../play.types";

export const update: ClientModule["update"] = (input) => {
	return {
		model: input.model,
	};
};

export const View = (_input: {
	open: boolean;
	delay: TimeSpan;
	dispatch: (m: MsgClient) => void;
	ctx: ClientCtx;
}) => {
	return null;
};
