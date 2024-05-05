import type { SpaceCtx } from "gamezilla-app/app/spaces/@/space";
import type { WithEventMeta } from "../../@/event";
import { CreateSync } from "./create/create.sync";
import type { ModelSync, MsgSync } from "./flow.core";
import * as Play from "./play/play.core";

export const initSync = () => {
	return { t: null };
};

export const reducer = ({
	ctx,
	msgSync,
	modelSync,
}: {
	ctx: SpaceCtx;
	msgSync: WithEventMeta<MsgSync>;
	modelSync: ModelSync;
}): ModelSync => {
	switch (msgSync.t) {
		case "play": {
			switch (modelSync.t) {
				case "play": {
					return {
						t: "play",
						c: Play.reducer({
							ctx,
							msgSync: msgSync.c,
							modelSync: modelSync.c,
						}),
					};
				}
				default: {
					console.error("Invalid modelSync", modelSync);
					return modelSync;
				}
			}
		}

		case "create": {
			switch (modelSync.t) {
				case "create": {
					return {
						t: "create",
						c: CreateSync.reducer({
							ctx,
							msgSync: msgSync.c,
							modelSync: modelSync.c,
						}),
					};
				}
				default: {
					console.error("Invalid modelSync", modelSync);
					return modelSync;
				}
			}
		}

		case "user-changed-mode": {
			if (msgSync.userId !== ctx.space.hostId) {
				return modelSync;
			}

			switch (msgSync.mode) {
				case null: {
					return { t: null };
				}

				case "play": {
					return {
						t: "play",
						c: Play.initSync({ ctx }),
					};
				}

				case "create": {
					return {
						t: "create",
						c: CreateSync.initSync({ ctx }),
					};
				}
			}
		}
	}
};
