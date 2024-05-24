import type { SpaceCtx } from "gamezilla-app/app/spaces/@/space";
import type { WithEventMeta } from "../../@/event";
import { BuilderCore } from "./builder/builder.core";
import type { ModelCore, MsgCore } from "./flow.types";
import { PlayCore } from "./play/play.core";

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
						c: PlayCore.updateCore({
							ctx,
							msgCore: msgCore.c,
							modelCore: modelCore.c,
						}),
					};
				}
				default: {
					return modelCore;
				}
			}
		}

		case "builder": {
			switch (modelCore.t) {
				case "builder": {
					return {
						t: "builder",
						c: BuilderCore.updateCore({
							ctx,
							msgCore: msgCore.c,
							modelCore: modelCore.c,
						}),
					};
				}
				default: {
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
						c: PlayCore.initCore({ ctx }),
					};
				}

				case "builder": {
					return {
						t: "builder",
						c: BuilderCore.initCore({ ctx }),
					};
				}
			}
		}
	}
};
