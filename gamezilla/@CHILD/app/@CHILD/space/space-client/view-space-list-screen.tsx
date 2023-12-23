import { withId } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/event";
import { ClientCtx } from "gamezilla/@CHILD/app/@SHARED/client";
import { SpaceId } from "gamezilla/@CHILD/app/@SHARED/data";
import {
  Button,
  IconGamepad,
  Avatar,
  TopBar,
  cn,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { ViewSpaceHostChip } from "gamezilla/@CHILD/app/@CHILD/space/@CHILD/game/@SHARED/game";
import { CoverArt } from "../@CHILD/game/game-cover-art";
import { GameName, gameNameToString } from "../@CHILD/game/game.core";
import {
  ClientModel,
  ClientMsg,
  toSpaceState,
  toUserState,
} from "../space.core";

export const ViewSpaceListScreen = ({
  ctx,
  dispatch,
  model,
}: {
  model: ClientModel;
  ctx: ClientCtx;
  dispatch: (m: ClientMsg) => void;
}) => {
  const user = toUserState(model, ctx.currentUserId);

  const spaces = Object.keys(model.events._indexes.indexSpaceId ?? {}).flatMap(
    (spaceId) => {
      if (!SpaceId.is(spaceId)) {
        return [];
      }

      const state = toSpaceState(model, spaceId);

      if (state.type !== "started") {
        return [];
      }

      return [state];
    }
  );

  return (
    <div class="flex w-full flex-1 flex-col overflow-hidden">
      <TopBar title="Spaces" />

      <div class="relative flex w-full flex-1 flex-col gap-5 overflow-hidden overflow-y-scroll p-5 pb-8">
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
              isCurrentSpace={user.spaceId === state.spaceId}
              users={users}
              gameName={gameName}
              onClick={() =>
                dispatch({ t: "clicked-space-card", spaceId: state.spaceId })
              }
            />
          );
        })}
      </div>

      {!user.spaceId && (
        <div class="w-full border-t border-neutral-700 p-4">
          <Button
            size="lg"
            class="w-full"
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

function EmptyState() {
  return (
    <div class="absolute inset-0 flex h-full w-full flex-1 flex-col items-center justify-center gap-2 px-5 text-center opacity-60">
      <div class="flex flex-col items-center justify-center gap-3">
        <p class="text-2xl font-bold ">No active spaces</p>

        <div class="flex aspect-square flex-col items-center justify-center rounded-full bg-neutral-700 p-7">
          <IconGamepad class="h-14 w-14" />
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
      class="flex flex-col gap-3 rounded-md bg-blue-600 p-4 active:opacity-70">
      <div class="flex w-full items-center justify-start">
        <p class="block flex-1 text-left font-bold uppercase">LIVE</p>
        {isCurrentSpace && <p class="block text-xs italic">Current space</p>}
      </div>

      {gameName && (
        <div class="flex items-center justify-start gap-2">
          <div class="h-12 w-12 overflow-hidden rounded border-2 border-white/40">
            <CoverArt gameName={gameName} />
          </div>
          <p class="text-xl">{gameNameToString(gameName)}</p>
        </div>
      )}

      <div class="flex items-center justify-start gap-2 overflow-hidden">
        <Avatar src={host.avatarUrl} alt="avatar" class="h-12 w-12" />

        <div class="flex-1 overflow-hidden">
          <p class="overflow-hidden text-ellipsis whitespace-nowrap text-xl">
            {host.username}
          </p>
        </div>
        <ViewSpaceHostChip />
      </div>

      {users.length > 1 && (
        <div class="flex items-center justify-start gap-2">
          <div class="flex items-center">
            {users.slice(0, MAX_AVATAR_COUNT).map((user, index) => (
              <Avatar
                key={user.username}
                src={user.avatarUrl}
                alt="avatar"
                class={cn("h-8 w-8", index !== 0 && "-ml-2")}
              />
            ))}
            {users.length > MAX_AVATAR_COUNT && (
              <div class="-ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/30">
                <p class="text-xs">
                  +{(users.length - MAX_AVATAR_COUNT).toLocaleString()}
                </p>
              </div>
            )}
          </div>
          <p class="text-lg">{users.length} people</p>
        </div>
      )}
    </button>
  );
};
