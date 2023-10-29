import { withMeta } from "gamezilla/@SHARED/event-stream";
import { ViewCtx } from "gamezilla/app/@SHARED/client";
import { SpaceId } from "gamezilla/app/@SHARED/data";
import {
  Button,
  IconGamepad,
  MyAvatar,
  TopBar,
  cn,
} from "gamezilla/app/@SHARED/ui";
import { ViewSpaceHostChip } from "gamezilla/app/space/game/@SHARED";
import { GameName, ViewCoverArt, gameNameToString } from "../game/game.core";
import {
  ClientModel,
  ClientMsg,
  toStateSpace,
  toStateUser,
} from "../space.core";

export const ViewSpaceListScreen = ({
  ctx,
  dispatch,
  model,
}: {
  model: ClientModel;
  ctx: ViewCtx;
  dispatch: (m: ClientMsg) => void;
}) => {
  const user = toStateUser(model, ctx.currentUserId);

  const spaces = Object.keys(model.events.indexes.indexSpaceId ?? {}).flatMap(
    (spaceId) => {
      if (!SpaceId.is(spaceId)) {
        return [];
      }

      const state = toStateSpace(model, spaceId);

      if (state.type !== "started") {
        return [];
      }

      return [state];
    }
  );

  return (
    <div className="flex h-full max-h-full w-full flex-1 flex-col gap-4 overflow-hidden">
      <TopBar title="Spaces" />

      <div className="relative flex h-full w-full flex-1 flex-col">
        {spaces.length === 0 && (
          <div className="absolute inset-0 flex h-full w-full flex-1 flex-col items-center justify-center gap-2 opacity-60">
            <IconGamepad className="h-14 w-14" />
            <p className="text-lg text-secondary">No active spaces</p>
          </div>
        )}
        <div className="flex w-full flex-1 flex-col gap-4 overflow-x-hidden overflow-y-scroll px-5">
          {spaces.flatMap((state) => {
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
              <ViewSpaceCard
                host={{
                  username: host?.username ?? "...",
                  avatarUrl: host?.avatarUrl,
                }}
                key={state.spaceId}
                isCurrentSpace={user.spaceId === state.spaceId}
                users={users}
                gameName={gameName}
                onClick={() => {
                  ctx.push({
                    t: "space",
                    c: { t: "space", spaceId: state.spaceId },
                  });
                }}
              />
            );
          })}
        </div>
      </div>

      {!user.spaceId && (
        <div className="w-full p-4">
          <Button
            size="lg"
            className="w-full"
            color="primary"
            onClick={() =>
              dispatch(
                withMeta({
                  t: "user-started-space",
                  spaceId: SpaceId.generate(),
                  userId: ctx.currentUserId,
                })
              )
            }
            text="Create space"
          />
        </div>
      )}
    </div>
  );
};

const MAX_AVATAR_COUNT = 2;
const ViewSpaceCard = ({
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
      className="flex flex-col gap-3 rounded-md bg-blue-600 p-4 active:opacity-70">
      <div className="flex w-full items-center justify-start">
        <p className="block flex-1 text-left font-bold uppercase">LIVE</p>
        {isCurrentSpace && (
          <p className="block text-xs italic">Current space</p>
        )}
      </div>

      {gameName && (
        <div className="flex items-center justify-start gap-2">
          <div className="h-12 w-12 overflow-hidden rounded border-2 border-white/40">
            <ViewCoverArt gameName={gameName} />
          </div>
          <p className="text-xl">{gameNameToString(gameName)}</p>
        </div>
      )}

      <div className="flex items-center justify-start gap-2 overflow-hidden">
        <MyAvatar src={host.avatarUrl} alt="avatar" className="h-12 w-12" />

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
              <MyAvatar
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
