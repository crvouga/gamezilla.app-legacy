import { TimeSpan, isErr } from "gamezilla-app/@/core";
import { AppServerModule } from "gamezilla-app/app/@/architecture/app-server";
import type { ServerModule } from "../auth.types";

const update: ServerModule["update"] = async (input) => {
	return AppServerModule.andThen({ model: input.model }, (model) =>
		updateFromClient({ ...input, model }),
	);
};

const updateFromClient: ServerModule["update"] = async ({
	model,
	msgClient,

	deps,
}) => {
	switch (msgClient?.t) {
		case "logout": {
			const zapped = await deps.sessionDb.zapBySessionId(msgClient.sessionId);

			if (isErr(zapped)) {
				return { model };
			}

			return {
				model,
				msgEvt: [
					{
						...msgClient,
						t: "auth/client-unauthenticated",
					},
				],
			};
		}

		default: {
			return { model };
		}
	}
};

export const LogoutServer = {
	update,
};
