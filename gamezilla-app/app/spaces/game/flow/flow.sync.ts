import type { SpaceCtx } from "gamezilla-app/app/spaces/@/space";
import type { WithEventMeta } from "../../@/event";
import { CreateCore } from "./create/create.core";
import type { ModelCore, MsgCore } from "./flow.types";
import * as Play from "./play/play.types";

export const initCore = () => {
	return { t: null };
};

export const updateCore = ({
	ctx,
	msgCore,
	modelCore,
}: {
	ctx: SpaceCtx;
	msgCore: WithEventMeta<MsgCore>;
	modelCore: ModelCore;
}): ModelCore => {
	switch (msgCore.t) {
		case "play": {
			switch (modelCore.t) {
				case "play": {
					return {
						t: "play",
						c: Play.updateCore({
							ctx,
							msgCore: msgCore.c,
							modelCore: modelCore.c,
						}),
					};
				}
				default: {
					console.error("Invalid modelCore", modelCore);
					return modelCore;
				}
			}
		}

		case "create": {
			switch (modelCore.t) {
				case "create": {
					return {
						t: "create",
						c: CreateCore.updateCore({
							ctx,
							msgCore: msgCore.c,
							modelCore: modelCore.c,
						}),
					};
				}
				default: {
					console.error("Invalid modelCore", modelCore);
					return modelCore;
				}
			}
		}

		case "user-changed-mode": {
			if (msgCore.userId !== ctx.space.hostId) {
				return modelCore;
			}

			switch (msgCore.mode) {
				case null: {
					return { t: null };
				}

				case "play": {
					return {
						t: "play",
						c: Play.initCore({ ctx }),
					};
				}

				case "create": {
					return {
						t: "create",
						c: CreateCore.initCore({ ctx }),
					};
				}
			}
		}
	}
};
