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
    <div className="text-inherit border-t-2 border-blue-500 overflow-hidden w-full flex items-center">
      <button
        className="flex-1 flex items-center overflow-hidden"
        onClick={() => {
          ctx.$push({ t: "room", c: { t: "room", roomId: room.roomId } });
        }}>
        <div className="p-2 mr-2">
          {!game && (
            <MyAvatar
              src={hostProfile?.avatarUrl ?? ""}
              alt="Host Avatar"
              className="w-12 h-12"
            />
          )}
          {game && (
            <div className="rounded overflow-hidden w-12 h-12">
              {viewCoverArt(game.t)}
            </div>
          )}
        </div>

        <div className="overflow-hidden flex-1 flex flex-col gap-1">
          <p className="text-left">
            {hostProfile ? `${hostProfile.username}'s room` : "..."}
          </p>
          <p className="text-xs text-left text-neutral-300">
            {userCount} in room
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
        <IconXMark className="w-8 h-8" />
      </button>
    </div>
  );
};
