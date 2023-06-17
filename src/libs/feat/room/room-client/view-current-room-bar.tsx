import { ViewCtx } from "@gamezilla/shared/client";
import { IconXMark, MyAvatar } from "@gamezilla/shared/ui";
import { viewCoverArt } from "../game.shared";
import { ClientModel, ClientMsg } from "../room.shared";

export const ViewCurrentRoomBar = ({
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

  const room = model.rooms[user.roomId];

  if (!room) {
    return null;
  }

  const game = model.games[room.roomId];
  const hostProfile = ctx.profiles[room.hostId];
  const userCount = Object.values(model.users).filter(
    (user) => user.roomId === room.roomId
  ).length;

  return (
    <div className="flex w-full items-center overflow-hidden border-t-2 border-blue-500 text-inherit">
      <button
        className="flex flex-1 items-center overflow-hidden"
        onClick={() => {
          ctx.$push({ t: "room", c: { t: "room", roomId: room.roomId } });
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
          if (ctx.currentUserId === room.hostId) {
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
