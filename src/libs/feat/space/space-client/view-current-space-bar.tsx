import { ViewCtx } from "@gamezilla/shared/client";
import { IconXMark, MyAvatar } from "@gamezilla/shared/ui";
import { viewCoverArt } from "../game.shared";
import { ClientModel, ClientMsg } from "../space.shared";

export const ViewCurrentSpaceBar = ({
  ctx: ctxPrev,
  model,
  $send,
}: {
  ctx: ViewCtx;
  model: ClientModel;
  $send: (msg: ClientMsg) => void;
}) => {
  const ctx: ViewCtx = {
    ...ctxPrev,
    profiles: {
      ...ctxPrev.profiles,
      ...model.profiles,
    },
  };
  const user = model.users[ctx.currentUserId];

  if (!user) {
    return null;
  }

  const space = model.spaces[user.spaceId];

  if (!space) {
    return null;
  }

  const game = model.games[space.spaceId];
  const hostProfile = ctx.profiles[space.hostId];
  const userCount = Object.values(model.users).filter(
    (user) => user.spaceId === space.spaceId
  ).length;

  return (
    <div className="flex w-full items-center overflow-hidden border-t-2 border-blue-500 text-inherit">
      <button
        className="flex flex-1 items-center overflow-hidden"
        onClick={() => {
          ctx.$push({ t: "space", c: { t: "space", spaceId: space.spaceId } });
        }}>
        <div className="mr-2 p-2">
          {!game && (
            <MyAvatar
              src={hostProfile?.avatarUrl ?? ""}
              alt="Host Avatar"
              className="h-12 w-12"
            />
          )}
          {game && (
            <div className="h-12 w-12 overflow-hidden rounded">
              {viewCoverArt(game.t)}
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1 overflow-hidden">
          <p className="text-left">
            {hostProfile ? `${hostProfile.username}'s space` : "..."}
          </p>
          <p className="text-left text-xs text-neutral-300">
            {userCount} in space
          </p>
        </div>
      </button>

      <button
        onClick={() => {
          if (ctx.currentUserId === space.hostId) {
            $send({ t: "destroy", userId: ctx.currentUserId });
            return;
          }
          $send({ t: "leave", userId: ctx.currentUserId });
        }}
        className="mr-4">
        <IconXMark className="h-8 w-8" />
      </button>
    </div>
  );
};
