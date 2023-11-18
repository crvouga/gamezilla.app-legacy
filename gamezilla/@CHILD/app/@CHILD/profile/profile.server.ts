import { Eff, err, ok, p, Result } from "gamezilla/@SHARED/core";
import {
  Profile,
  ProfileAvatar,
  UserId,
  Username,
} from "gamezilla/@CHILD/app/@SHARED/data";
import {
  ReqCtx,
  sendToClient,
  ServerCmd,
  ServerCtx,
  ServerEvt,
} from "gamezilla/@CHILD/app/@SHARED/server";
import { ProfileDb } from "./profile-db/profile-db";
import { createProfileDb } from "./profile-db/profile-db-impl.sql";
import {
  ProfileCore,
  profileCoreToProfile,
  Req,
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
} from "./profile.core";

//
//
//
// model
//
//
//

export const init: ServerModel = null;

//
//
//
// update
//
//
//

export const update = ({
  msg,
  model,
}: {
  msg: ServerMsg;
  model: ServerModel;
}): {
  model: ServerModel;
  cmd: ServerCmd<ToClient>[];
} => {
  switch (msg.t) {
    case "handled": {
      return {
        model,
        cmd: [sendToClient([msg.clientId], msg.msg)],
      };
    }
  }
};

export const updateFromClient = ({
  msg,
  model,
  ctx,
}: {
  msg: ToServer;
  model: ServerModel;
  ctx: ReqCtx;
}): {
  model: ServerModel;
  eff?: Eff<ServerMsg>;
} => {
  return {
    model,
    eff: async (dispatch) => {
      const ProfileDb = createProfileDb({ dbConn: ctx.dbConn });
      const result = await handler({ ProfileDb, msg, ctx });

      dispatch({
        t: "handled",
        clientId: ctx.clientId,
        msg: { ...msg, result },
      });
    },
  };
};

export const updateFromEvent = ({
  msg,
  model,
  ctx,
}: {
  ctx: ServerCtx;
  msg: ServerEvt;
  model: ServerModel;
}): {
  model: ServerModel;
  eff?: Eff<ServerMsg>;
} => {
  switch (msg.t) {
    case "client-authenticated": {
      return {
        model,
        eff: async (dispatch) => {
          const ProfileDb = createProfileDb({ dbConn: ctx.dbConn });
          const result = await findElseInsertNew({
            ProfileDb,
            userId: msg.userId,
          });
          dispatch({
            t: "handled",
            clientId: msg.clientId,
            msg: {
              t: "current-user-profile",
              result: Result.mapOk(result, profileCoreToProfile),
              source: msg,
              loggedIn: msg.loggedIn,
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
  ctx,
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

  if (found.t === "err") {
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

  if (inserted.t === "err") {
    return inserted;
  }

  return ok(profileNew);
};
