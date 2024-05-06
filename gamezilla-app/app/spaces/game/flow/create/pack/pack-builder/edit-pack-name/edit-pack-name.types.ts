import { RemoteResult, Result } from "gamezilla-app/@/core";
import { p } from "gamezilla-app/@/core/parser";
import { UserId } from "gamezilla-app/app/@/data";
import { FlowPack } from "../../../../@/flow-pack";
import { FlowPackName } from "../../../../@/flow-pack/flow-pack-name";

export type MsgClient = MsgCore;

type EditPackNameValidationError = { t: "name-cannot-be-empty" };

export type ModelCore = {
	pack: FlowPack;
	editPackNameDraft: string;
	editPackNameResult: RemoteResult<string, null>;
	editPackNameRollback: FlowPackName;
	editPackNameValidationError: EditPackNameValidationError | null;
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
		result: Result.parser(p.str, p.l(null)),
	}),
);
export type MsgCore = p.Infer<typeof MsgCore>;
