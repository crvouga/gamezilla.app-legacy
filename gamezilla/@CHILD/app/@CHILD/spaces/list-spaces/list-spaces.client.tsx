import { ViewSpaceHostChip } from "gamezilla/@CHILD/app/@CHILD/spaces/@CHILD/game/@SHARED/game";
import {
  ClientCtx,
  pushRoute,
  sendToServer,
} from "gamezilla/@CHILD/app/@SHARED/client";
import { SpaceId } from "gamezilla/@CHILD/app/@SHARED/data";
import {
  Avatar,
  IconGamepad,
  TopBar,
  cn,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { EmptyState } from "gamezilla/@CHILD/app/@SHARED/ui/empty-state";
import { RequestResponse, ok, requesting } from "gamezilla/@SHARED/core";
import { CoverArt } from "../@CHILD/game/game-cover-art";
import { GameName, gameNameToString } from "../@CHILD/game/game.core";
import { SpaceClientModule } from "../architechure/space-client";
import * as SpaceState from "../spaces-core/space-state";
import * as Spaces from "../spaces-core/spaces";
import { MsgClient } from "../spaces.core";
import { StartSpaceClient } from "../start-space/start-space.client";

//
//
//
//
//

const sendListSpacesRequest: SpaceClientModule["update"] = ({ model, ctx }) => {
  return {
    model: {
      ...model,
      listSpacesRequest: requesting(ctx.now),
    },
    msgCmd: [sendToServer({ t: "list-spaces", limit: 100, offset: 0 })],
  };
};

//
//
//
//
//
//

const init: SpaceClientModule["init"] = ({ model, ctx }) => {
  return sendListSpacesRequest({ model, ctx });
};

//
//
//
// Update
//
//
//

const update: SpaceClientModule["update"] = (input) => {
  const { ctx, msgServer, model, msgEvt, msg } = input;

  switch (msgEvt?.t) {
    case "routing/route-changed": {
      if (msgEvt.route.t === "spaces" && msgEvt.route.c.t === "space-list") {
        return sendListSpacesRequest({ model, ctx });
      }
      return { model };
    }
  }

  switch (msg?.t) {
    case "time-passed": {
      return {
        model: {
          ...model,
          listSpacesRequest: RequestResponse.timePassed(
            model.listSpacesRequest,
            ctx.now
          ),
        },
      };
    }

    case "clicked-space-card": {
      return {
        model,
        msgCmd: [
          pushRoute({ t: "spaces", c: { t: "space", spaceId: msg.spaceId } }),
        ],
      };
    }
  }

  switch (msgServer?.t) {
    case "listed-spaces": {
      const merged = Spaces.mergeMany({ model, spaces: msgServer.spaces });
      return {
        model: {
          ...model,
          spaceIdByUserId: merged.spaceIdByUserId,
          spaces: merged.spaces,
          listSpacesRequest: RequestResponse.response(
            model.listSpacesRequest,
            ctx.now,
            ok(null)
          ),
        },
      };
    }
  }

  return { model };
};

//
//
//
// View
//
//
//

const View: SpaceClientModule["View"] = (input) => {
  const { ctx, dispatch, model } = input;

  const currentUserId = ctx.currentUserId;

  if (!currentUserId) {
    return null;
  }

  const currentUserSpaceId = model.spaceIdByUserId[currentUserId];

  const spaces = Object.keys(model.spaces).flatMap((spaceId) => {
    const space = Spaces.toSpaceStarted(model, spaceId as SpaceId);
    if (!space) {
      return [];
    }
    return [space];
  });

  return (
    <div className="flex w-full flex-1 flex-col overflow-hidden">
      <TopBar title="Spaces" />

      <div className="relative flex w-full flex-1 flex-col overflow-hidden overflow-y-scroll pb-8">
        {spaces.length === 0 && (
          <EmptyState
            renderIcon={(props) => <IconGamepad {...props} />}
            label="No active spaces"
          />
        )}

        <div className="flex w-full flex-1 flex-col gap-5 p-5">
          {spaces.flatMap((state) => {
            return (
              <ViewSpaceCard
                key={state.spaceId}
                ctx={{ ...ctx, currentUserId }}
                dispatch={dispatch}
                state={state}
              />
            );
          })}
        </div>
      </div>

      {!currentUserSpaceId && (
        <div className="w-full border-t border-neutral-600 p-4">
          <StartSpaceClient.ViewStartSpaceButton {...input} />
        </div>
      )}
    </div>
  );
};

const ViewSpaceCard = ({
  ctx,
  state,
  dispatch,
}: {
  ctx: ClientCtx;
  state: SpaceState.Started;
  dispatch: (m: MsgClient) => void;
}) => {
  const host = ctx.profiles[state.hostId];
  const users = Object.values(state.users).flatMap((userId) => {
    const profile = ctx.profiles[userId];

    if (!profile) {
      return [];
    }

    return [
      {
        username: profile.username,
        avatarUrl: profile.avatarUrl,
      },
    ];
  });

  const gameName = state.game?.t ?? null;

  return (
    <SpaceCard
      host={{
        username: host?.username ?? "...",
        avatarUrl: host?.avatarUrl,
      }}
      key={state.spaceId}
      users={users}
      gameName={gameName}
      onClick={() =>
        dispatch({ t: "clicked-space-card", spaceId: state.spaceId })
      }
    />
  );
};

const MAX_AVATAR_COUNT = 3;
const SpaceCard = ({
  gameName,
  onClick,
  isCurrentSpace,
  users,
  host,
}: {
  gameName?: GameName | null;
  users: { avatarUrl: string; username: string }[];
  onClick: () => void;
  isCurrentSpace?: boolean;
  host: {
    username: string;
    avatarUrl?: string;
  };
}) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col gap-3 rounded-md bg-blue-600 p-4 active:opacity-70"
    >
      <div className="flex w-full items-center justify-start">
        <p className="block flex-1 text-left font-bold uppercase">LIVE</p>
        {isCurrentSpace && (
          <p className="block text-xs italic">Current space</p>
        )}
      </div>

      {gameName && (
        <div className="flex items-center justify-start gap-2">
          <div className="h-12 w-12 overflow-hidden rounded border-2 border-white/40">
            <CoverArt gameName={gameName} />
          </div>
          <p className="text-xl">{gameNameToString(gameName)}</p>
        </div>
      )}

      <div className="flex items-center justify-start gap-2 overflow-hidden">
        <Avatar src={host.avatarUrl} alt="avatar" className="h-12 w-12" />

        <div className="flex-1 overflow-hidden">
          <p className="overflow-hidden text-ellipsis whitespace-nowrap text-xl">
            {host.username}
          </p>
        </div>
        <ViewSpaceHostChip />
      </div>

      {users.length > 1 && (
        <div className="flex items-center justify-start gap-2">
          <div className="flex items-center">
            {users.slice(0, MAX_AVATAR_COUNT).map((user, index) => (
              <Avatar
                key={user.username}
                src={user.avatarUrl}
                alt="avatar"
                className={cn("h-8 w-8", index !== 0 && "-ml-2")}
              />
            ))}
            {users.length > MAX_AVATAR_COUNT && (
              <div className="-ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/30">
                <p className="text-xs">
                  +{(users.length - MAX_AVATAR_COUNT).toLocaleString()}
                </p>
              </div>
            )}
          </div>
          <p className="text-lg">{users.length} people</p>
        </div>
      )}
    </button>
  );
};

export const ListSpacesClient = {
  init,
  update,
  View,
};
