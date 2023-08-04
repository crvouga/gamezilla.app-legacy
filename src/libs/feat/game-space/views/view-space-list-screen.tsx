import { GameSpaceId } from "@gamezilla/shared/app";
import { ViewCtx } from "@gamezilla/shared/client";
import { ViewSpaceHostChip } from "@gamezilla/shared/game-space";
import {
  Button,
  IconGamepad,
  LoadingScreen,
  MyAvatar,
  TopBar,
  cn,
} from "@gamezilla/ui";
import { ClientModel, ClientMsg } from "../game-space.core";
import { GameName, ViewCoverArt, gameNameToString } from "../game.core";

export const ViewSpaceListScreen = ({
  ctx,
  dispatch,
  model,
}: {
  model: ClientModel;
  ctx: ViewCtx;
  dispatch: (m: ClientMsg) => void;
}) => {
  const user = model.users[ctx.currentUserId];
  const currentSpace = user ? model.spaces[user.spaceId] : undefined;
  const spaces = Object.values(model.spaces);

  const isLoading = model.req.list?.t === "loading";

  return (
    <div className="flex h-full max-h-full w-full flex-1 flex-col gap-4 overflow-hidden">
      <TopBar title="Spaces" />
      {!isLoading && spaces.length === 0 ? (
        <div className="flex h-full w-full flex-1 flex-col items-center justify-center gap-2 opacity-60">
          <div className="grid place-items-center rounded-full bg-white/20 p-6">
            <IconGamepad className="h-14 w-14" />
          </div>
          <p className="text-lg text-secondary">No active spaces</p>
        </div>
      ) : (
        <div className="relative flex h-full w-full flex-1 flex-col">
          {isLoading && <LoadingScreen absolute />}
          <div
            className={cn(
              isLoading && "pointer-events-none opacity-50",
              "flex w-full flex-1 flex-col gap-4 overflow-y-auto px-5"
            )}>
            {spaces.map((space) => {
              const host = ctx.profiles[space.hostId];
              const users = Object.values(model.users).flatMap((user) => {
                if (user.spaceId !== space.gameSpaceId) {
                  return [];
                }

                const profile = ctx.profiles[user.userId];

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

              const gameName = model.games[space.gameSpaceId]?.t;
              const currentSpaceId = model.users[ctx.currentUserId]?.spaceId;
              return (
                <ViewSpaceCard
                  host={{
                    username: host?.username ?? "...",
                    avatarUrl: host?.avatarUrl ?? "",
                  }}
                  key={space.gameSpaceId}
                  isCurrentSpace={currentSpaceId === space.gameSpaceId}
                  users={users}
                  gameName={gameName}
                  onClick={() => {
                    ctx.onPush({
                      t: "game-space",
                      c: { t: "game-space", spaceId: space.gameSpaceId },
                    });
                  }}
                />
              );
            })}
          </div>
        </div>
      )}

      {!currentSpace && (
        <div className="w-full p-4">
          <Button
            size="lg"
            className="w-full"
            color="primary"
            disabled={
              model.req.create?.t === "loading" ||
              model.req.list?.t === "loading"
            }
            onClick={() =>
              dispatch({ t: "create", spaceId: GameSpaceId.generate() })
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
  gameName?: GameName;
  users: { avatarUrl: string; username: string }[];
  onClick: () => void;
  isCurrentSpace?: boolean;
  host: {
    username: string;
    avatarUrl: string;
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

      <div className="flex items-center justify-start gap-2">
        <MyAvatar src={host.avatarUrl} alt="avatar" className="h-12 w-12" />

        <p className="text-xl">{host.username}</p>
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
