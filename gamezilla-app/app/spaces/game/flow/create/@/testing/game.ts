import type { WithEventId } from "gamezilla-app/app/spaces/@/event";
import type { FlowClientCtx } from "../../../@/flow-ctx";
import type { MsgSync } from "../../create.core";
import { CreateSync } from "../../create.sync";

export const deriveModelSync =
	(ctx: FlowClientCtx) => (input: { msgSync?: WithEventId<MsgSync>[] }) => {
		return (input.msgSync ?? []).reduce(
			(modelSync, msgSync) => CreateSync.reducer({ modelSync, msgSync, ctx }),
			CreateSync.initSync({ ctx }),
		);
	};
