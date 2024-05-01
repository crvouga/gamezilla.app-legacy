import {
	type Profile,
	ProfileAvatar,
	type UserId,
	Username,
} from "gamezilla-app/app/@shared/data";
import {
	type ServerCmd,
	type ServerCtx,
	type ServerEvent,
	sendToClient,
} from "gamezilla-app/app/@shared/server";
import { Err, Ok, Result, isErr } from "gamezilla-app/@shared/core";
import type { AppServerModule } from "../@shared/architecture/app-server";
import type { ProfileDb } from "./profile-db/profile-db";
import { createProfileDb } from "./profile-db/profile-db-impl.postgres";
import {
	type MsgServer,
	type MsgToClient,
	type MsgToServer,
	type ProfileCore,
	type Req,
	profileCoreToProfile,
} from "./profile.core";

//
//
//
//
//
//

type Module = AppServerModule<{
	Ctx: ServerCtx;
	MsgInCmd: null;
	MsgInEvent: ServerEvent;
	Model: null;
	Msg: MsgServer;
	MsgOutCmd: ServerCmd<MsgToClient>;
	MsgOutEvent: null;
	MsgToClient: MsgToClient;
	MsgToServer: MsgToServer;
	Deps: Deps;
}>;
//
//
//
//
//
//

export type Deps = {};

export const getDeps: Module["getDeps"] = async () => {
	return {};
};

//
//
//
// model
//
//
//

export const init: Module["init"] = async () => {
	return {
		model: null,
	};
};

//
//
//
// update
//
//
//

export const update: Module["update"] = async (input) => {
	if (input.msg) {
		return updateFromMsg(input);
	}

	if (input.msgClient) {
		return updateFromClient(input);
	}

	if (input.msgEvt) {
		return updateFromEvent(input);
	}

	return { model: input.model };
};

const updateFromMsg: Module["update"] = async ({ msg, model }) => {
	if (!msg) {
		return { model };
	}

	switch (msg.t) {
		case "handled": {
			return {
				model,
				msgCmd: [sendToClient([msg.clientId], msg.msg)],
			};
		}
	}
};

const updateFromClient: Module["update"] = async ({
	msgClient,
	model,
	ctx,
}) => {
	if (!msgClient) {
		return { model };
	}

	return {
		model,
		eff: async (dispatch) => {
			const userId = msgClient.userId;

			if (!userId) {
				return;
			}

			const ProfileDb = createProfileDb({ dbConn: ctx.dbConnSql });
			const result = await handler({
				ProfileDb,
				msg: msgClient,
				ctx: { ...ctx, currentUserId: userId },
			});

			dispatch({
				t: "handled",
				clientId: msgClient.clientId,
				msg: { ...msgClient, result },
			});
		},
	};
};

const updateFromEvent: Module["update"] = async ({ msgEvt, model, ctx }) => {
	if (!msgEvt) {
		return { model };
	}

	switch (msgEvt.t) {
		case "auth/client-authenticated": {
			return {
				model,
				eff: async (dispatch) => {
					const ProfileDb = createProfileDb({ dbConn: ctx.dbConnSql });
					const result = await findElseInsertNew({
						ProfileDb,
						userId: msgEvt.account.userId,
					});
					dispatch({
						t: "handled",
						clientId: msgEvt.clientId,
						msg: {
							t: "current-user-profile",
							result: Result.mapOk(result, profileCoreToProfile),
							source: msgEvt,
							loggedIn: msgEvt.loggedIn,
						},
					});
				},
			};
		}

		default: {
			return { model };
		}
	}
};

const handler = async ({
	ProfileDb,
	msg,
}: {
	ProfileDb: ProfileDb;
	msg: Req;
	ctx: { currentUserId: UserId };
}): Promise<Result<string, Profile[]>> => {
	switch (msg.t) {
		case "find-one": {
			const found = await ProfileDb.findOneByUserId(msg.userId);
			return Result.mapOk(found, (profiles) =>
				profiles.map(profileCoreToProfile),
			);
		}

		case "change-username": {
			return Err("not implemented");
		}

		case "delete-forever": {
			return Err("not implemented");
		}

		case "search": {
			return Err("not implemented");
		}
	}
};

const findElseInsertNew = async ({
	ProfileDb,
	userId,
}: {
	ProfileDb: ProfileDb;
	userId: UserId;
}) => {
	const found = await ProfileDb.findOneByUserId(userId);

	if (isErr(found)) {
		return found;
	}

	const profile = found.value[0];

	if (profile) {
		return Ok(profile);
	}

	const randomSeed = ProfileAvatar.generateRandomSeed();
	const randomUsername = await Username.generate(".");
	const profileNew: ProfileCore = {
		userId,
		username: randomUsername,
		avatarSeed: randomSeed,
		avatarStyle: "thumbs",
	};

	const inserted = await ProfileDb.insertOne(profileNew);

	if (isErr(inserted)) {
		return inserted;
	}

	return Ok(profileNew);
};
