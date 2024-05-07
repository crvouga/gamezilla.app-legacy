import { type RemoteResult, Result } from "gamezilla-app/@/core";
import { p } from "gamezilla-app/@/core/parser";
import { UserId } from "gamezilla-app/app/@/data";
import type { FlowPack } from "../../../../@/flow-pack";
import type { FlowPackName } from "../../../../@/flow-pack/flow-pack-name";

export type MsgClient = MsgCore;

type EditPackNameValidationError = { t: "name-cannot-be-empty" };

export type ModelCore = {
	pack: FlowPack;
	draft: string;
	result: RemoteResult<string, null>;
	rollback: FlowPackName;
	validationError: EditPackNameValidationError | null;
};

export const MsgCore = p.or(
	p.obj({
		t: p.l("edit-pack-name.user-inputted-draft-name"),
		userId: UserId,
		packNameDraft: p.str,
	}),
	p.obj({
		t: p.l("edit-pack-name.user-clicked-save-button"),
		userId: UserId,
	}),
	p.obj({
		t: p.l("edit-pack-name.server-persisted-pack"),
		userId: UserId,
		result: Result.parser(p.str, p.unknown),
	}),
	p.obj({
		t: p.l("edit-pack-name.user-closed-drawer"),
		userId: UserId,
	}),
);
export type MsgCore = p.Infer<typeof MsgCore>;
