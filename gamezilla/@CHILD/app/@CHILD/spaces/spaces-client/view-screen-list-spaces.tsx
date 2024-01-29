import { ViewSpaceHostChip } from "gamezilla/@CHILD/app/@CHILD/spaces/@CHILD/game/@SHARED/game";
import { withId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event";
import { ClientCtx } from "gamezilla/@CHILD/app/@SHARED/client";
import { SpaceId } from "gamezilla/@CHILD/app/@SHARED/data";
import {
  Avatar,
  Button,
  IconGamepad,
  TopBar,
  cn,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { CoverArt } from "../@CHILD/game/game-cover-art";
import { GameName, gameNameToString } from "../@CHILD/game/game.core";
import * as Spaces from "../spaces-core/spaces";
import * as SpaceState from "../spaces-core/space-state";
import { ClientModel, ClientMsg } from "../spaces.core";
import { EmptyState } from "gamezilla/@CHILD/app/@SHARED/ui/empty-state";

export const ViewScreenListSpaces = ({
  ctx,
  emit,
  model,
}: {
  model: ClientModel;
  ctx: ClientCtx;
  emit: (m: ClientMsg) => void;
}) => {
  const currentUserSpaceId = model.spaceIdByUserId[ctx.currentUserId];

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
                ctx={ctx}
                emit={emit}
                state={state}
              />
            );
          })}
        </div>
      </div>

      {!currentUserSpaceId && (
        <div className="w-full border-t border-neutral-600 p-4">
          <Button
            size="lg"
            className="w-full"
            color="primary"
            onClick={() =>
              emit({
                t: "msgEvent",
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

const ViewSpaceCard = ({
  ctx,
  state,
  emit,
}: {
  ctx: ClientCtx;
  state: SpaceState.Started;
  emit: (m: ClientMsg) => void;
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
      onClick={() => emit({ t: "clicked-space-card", spaceId: state.spaceId })}
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
