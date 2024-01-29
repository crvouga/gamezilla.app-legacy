import {
  Profile,
  ProfileAvatar,
  UserId,
  Username,
} from "gamezilla/@CHILD/app/@SHARED/data";
import {
  ServerCmd,
  ServerCtx,
  ServerEvent,
  sendToClient,
} from "gamezilla/@CHILD/app/@SHARED/server";
import { Result, err, isErr, ok } from "gamezilla/@SHARED/core";
import { AppServerModule } from "../../@SHARED/architecture/app-server";
import { ProfileDb } from "./profile-db/profile-db";
import { createProfileDb } from "./profile-db/profile-db-impl.sql";
import {
  ProfileCore,
  Req,
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
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
  InCmd: null;
  InEvent: ServerEvent;
  Model: ServerModel;
  Msg: ServerMsg;
  OutCmd: ServerCmd<ToClient>;
  OutEvent: null;
  ToClient: ToClient;
  ToServer: ToServer;
}>;

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

  if (input.fromClient) {
    return updateFromClient(input);
  }

  if (input.msgEvent) {
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
        cmd: [sendToClient([msg.clientId], msg.msg)],
      };
    }
  }
};

const updateFromClient: Module["update"] = async ({
  fromClient,
  model,
  ctx,
}) => {
  if (!fromClient) {
    return { model };
  }

  return {
    model,
    eff: async (dispatch) => {
      const userId = fromClient.userId;

      if (!userId) {
        return;
      }

      const ProfileDb = createProfileDb({ dbConn: ctx.dbConn });
      const result = await handler({
        ProfileDb,
        msg: fromClient,
        ctx: { ...ctx, currentUserId: userId },
      });

      dispatch({
        t: "handled",
        clientId: fromClient.clientId,
        msg: { ...fromClient, result },
      });
    },
  };
};

const updateFromEvent: Module["update"] = async ({ msgEvent, model, ctx }) => {
  if (!msgEvent) {
    return { model };
  }

  switch (msgEvent.t) {
    case "auth/client-authenticated": {
      return {
        model,
        eff: async (dispatch) => {
          const ProfileDb = createProfileDb({ dbConn: ctx.dbConn });
          const result = await findElseInsertNew({
            ProfileDb,
            userId: msgEvent.userId,
          });
          dispatch({
            t: "handled",
            clientId: msgEvent.clientId,
            msg: {
              t: "current-user-profile",
              result: Result.mapOk(result, profileCoreToProfile),
              source: msgEvent,
              loggedIn: msgEvent.loggedIn,
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
        profiles.map(profileCoreToProfile)
      );
    }

    case "change-username": {
      return err("not implemented");
    }

    case "delete-forever": {
      return err("not implemented");
    }

    case "search": {
      return err("not implemented");
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
    return ok(profile);
  }

  const randomSeed = await ProfileAvatar.generateRandomSeed();
  const randomUsername = Username.generate(".");
  const profileNew: ProfileCore = {
    userId,
    username: randomUsername,
    avatarSeed: randomSeed,
    avatarStyle: "adventurer-neutral",
  };

  const inserted = await ProfileDb.insertOne(profileNew);

  if (isErr(inserted)) {
    return inserted;
  }

  return ok(profileNew);
};
