import { ViewSpaceHostChip } from "gamezilla/@CHILD/app/@CHILD/spaces/@CHILD/game/@SHARED/game";
import { withId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event";
import { ClientCtx } from "gamezilla/@CHILD/app/@SHARED/client";
import { SpaceId } from "gamezilla/@CHILD/app/@SHARED/data";
import {
  Avatar,
  Button,
  IconGamepad,
  LoadingScreen,
  TopBar,
  cn
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { CoverArt } from "../@CHILD/game/game-cover-art";
import { GameName, gameNameToString } from "../@CHILD/game/game.core";
import * as Spaces from "../spaces-core/spaces";
import { ClientModel, ClientMsg } from "../spaces.core";

export const ViewScreenListSpaces = ({
  ctx,
  dispatch,
  model,
}: {
  model: ClientModel;
  ctx: ClientCtx;
  dispatch: (m: ClientMsg) => void;
}) => {
  const currentUserSpaceId =
    model.spaceIdByUserId[ctx.currentUserId];

  const spaces = Object.keys(model.spaces).flatMap((spaceId) => {
    const space = Spaces.toSpaceStarted(model, spaceId as SpaceId)
    if (!space) {
      return [];
    }
    return [space];
  });

  return (
    <div className="flex w-full flex-1 flex-col overflow-hidden">
      <TopBar
        title="Spaces"

      />

      <div className="relative flex w-full flex-1 flex-col gap-5 overflow-hidden overflow-y-scroll p-5 pb-8">
        {spaces.length === 0 && <EmptyState />}

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
              isCurrentSpace={currentUserSpaceId === state.spaceId}
              users={users}
              gameName={gameName}
              onClick={() =>
                dispatch({ t: "clicked-space-card", spaceId: state.spaceId })
              }
            />
          );
        })}
      </div>


      {!currentUserSpaceId && (
        <div className="w-full border-t border-neutral-600 p-4">
          <Button
            size="lg"
            className="w-full"
            color="primary"
            onClick={() =>
              dispatch({
                t: "event",
                c: withId({
                  t: "user-started-space",
                  spaceId: SpaceId.generate(),
                  userId: ctx.currentUserId,
                }),
              })
            }
            text="Start space"
          />
        </div>
      )}
    </div>
  );
};

const EmptyState = () => {
  return (
    <div className="absolute inset-0 flex h-full w-full flex-1 flex-col items-center justify-center gap-2 px-5 text-center opacity-60">
      <div className="flex flex-col items-center justify-center gap-3">
        <p className="text-2xl font-bold ">No active spaces</p>

        <div className="flex aspect-square flex-col items-center justify-center rounded-full bg-neutral-700 p-7">
          <IconGamepad className="h-14 w-14" />
        </div>
      </div>
    </div>
  );
}

const MAX_AVATAR_COUNT = 3;
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
