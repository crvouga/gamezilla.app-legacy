import { isErr, loading, notAsked } from "gamezilla-app/@/core";
import { ModelCore, MsgCore } from "./edit-pack-name.types";
import { SpaceCtx } from "gamezilla-app/app/spaces/@/space";
import { FlowPack } from "../../../../@/flow-pack";
import { FlowPackName } from "../../../../@/flow-pack/flow-pack-name";

const init = (input: { pack: FlowPack }): ModelCore => {
	return {
		pack: input.pack,
		editPackNameRollback: input.pack.name,
		editPackNameDraft: "",
		editPackNameResult: notAsked,
		editPackNameValidationError: null,
	};
};

const update = <TModel extends ModelCore, TMsg extends MsgCore>(input: {
	ctx: SpaceCtx;
	model: TModel;
	msg: TMsg;
}): TModel => {
	switch (input.msg.t) {
		case "edit-pack-name.user-clicked-save-button": {
			const parsed = FlowPackName.parse(input.model.editPackNameDraft);

			if (isErr(parsed)) {
				return input.model;
			}

			return {
				...input.model,
				pack: {
					...input.model.pack,
					name: parsed.value,
				},
				editPackNameResult: loading,
			};
		}

		case "edit-pack-name.user-inputted-draft-name": {
			if (input.msg.userId !== input.ctx.space.hostId) {
				return input.model;
			}

			if (input.msg.packNameDraft === "") {
				return {
					...input.model,
					editPackNameValidationError: { t: "name-cannot-be-empty" },
				};
			}

			return {
				...input.model,
				editPackNameDraft: input.msg.packNameDraft,
				editPackNameValidationError: null,
			};
		}

		case "edit-pack-name.server-persisted-pack": {
			if (isErr(input.msg.result)) {
				return {
					...input.model,
					editPackNameResult: input.msg.result,
					pack: {
						...input.model.pack,
						name: input.model.editPackNameRollback,
					},
				};
			}
			return {
				...input.model,
				editPackNameResult: input.msg.result,
			};
		}

		default: {
			return input.model;
		}
	}
};

export const EditPackNameCore = {
	update,
	init,
};
