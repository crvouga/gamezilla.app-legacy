import type { WithEventId } from "gamezilla-app/app/spaces/@/event";
import type { FlowClientCtx } from "../../../@/flow-ctx";
import type { MsgCore } from "../../create.types";
import { CreateCore } from "../../create.core";

export const deriveModelCore =
	(ctx: FlowClientCtx) => (input: { msgCore?: WithEventId<MsgCore>[] }) => {
		return (input.msgCore ?? []).reduce(
			(modelCore, msgCore) =>
				CreateCore.updateCore({ modelCore, msgCore, ctx }),
			CreateCore.initCore({ ctx }),
		);
	};
