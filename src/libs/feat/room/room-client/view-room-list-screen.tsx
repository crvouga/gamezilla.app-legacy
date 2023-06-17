import { RoomId } from "@gamezilla/shared/app";
import { ViewCtx } from "@gamezilla/shared/client";
import {
  IconGamepad,
  IconSpinner,
  MyAvatar,
  MyButton,
  TopBar,
  cn,
} from "@gamezilla/shared/ui";
import { GameName, gameNameToString, viewCoverArt } from "../game.shared";
import { ClientModel, ClientMsg } from "../room.shared";

export const ViewRoomListScreen = ({
  ctx,
  $send,
  model,
}: {
  model: ClientModel;
  ctx: ViewCtx;
  $send: (m: ClientMsg) => void;
}) => {
  const user = model.users[ctx.currentUserId];
  const currentRoom = user ? model.rooms[user.roomId] : undefined;
  const rooms = Object.values(model.rooms);

  const isLoading = model.requests.list?.t === "loading";

  return (
    <div className="flex h-full max-h-full w-full flex-1 flex-col overflow-hidden">
      <TopBar title="Spaces" />

      <div className="flex w-full flex-1 flex-col">
        {!isLoading && rooms.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center opacity-60">
            <IconGamepad className="h-12 w-12" />
            <p className="text-lg">No active rooms</p>
          </div>
        )}

        {isLoading && rooms.length === 0 && (
          <div className="flex flex-1 flex-col gap-4 overflow-hidden px-5">
            {[1, 2, 3].map((i) => {
              return (
                <div
                  key={i}
                  className="aspect-video w-full animate-pulse cursor-wait rounded-lg bg-white/20"
                />
              );
            })}
          </div>
        )}

        {rooms.length > 0 && (
          <div className="relative flex flex-1 flex-col">
            {isLoading && (
              <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center">
                <IconSpinner className="h-12 w-12 animate-spin" />
              </div>
            )}
            <div
              className={cn(
                isLoading && "pointer-events-none opacity-50",
                "flex w-full flex-1 flex-col gap-4 overflow-y-auto px-5"
              )}>
              {rooms.map((room) => {
                const host = ctx.profiles[room.hostId];
                const users = Object.values(model.users).flatMap((user) => {
                  if (user.roomId !== room.roomId) {
                    return [];
                  }
                  const profile = ctx.profiles[user.userId];
                  if (!profile) {
                    return [];
                  }
                  return [profile];
                });
                const gameName = model.games[room.roomId]?.t;
                const currentRoomId = model.users[ctx.currentUserId]?.roomId;
                return (
                  <ViewRoomCard
                    host={{
                      username: host?.username ?? "...",
                      avatarUrl: host?.avatarUrl ?? "",
                    }}
                    key={room.roomId}
                    isCurrentRoom={currentRoomId === room.roomId}
                    users={users}
                    gameName={gameName}
                    onClick={() => {
                      ctx.$push({
                        t: "room",
                        c: { t: "room", roomId: room.roomId },
                      });
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      {!currentRoom && (
        <div className="w-full p-4">
          <MyButton
            size="lg"
            className="w-full"
            color="primary"
            onClick={() => $send({ t: "create", roomId: RoomId.generate() })}>
            Create space
          </MyButton>
        </div>
      )}
    </div>
  );
};

const ViewRoomCard = ({
  gameName,
  onClick,
  isCurrentRoom,
  host,
}: {
  gameName?: GameName;
  users: { avatarUrl: string; username: string }[];
  onClick: () => void;
  isCurrentRoom?: boolean;
  host: {
    username: string;
    avatarUrl: string;
  };
}) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col gap-3 rounded-md bg-blue-500 p-4 active:opacity-70">
      <div className="flex w-full items-center justify-start">
        <p className="block flex-1 animate-pulse text-left font-bold uppercase">
          LIVE
        </p>
        {isCurrentRoom && (
          <p className="block text-xs italic opacity-70">Current space</p>
        )}
      </div>

      {gameName && (
        <div className="flex items-center justify-start gap-2">
          <div className="h-12 w-12 overflow-hidden rounded border-2 border-white/40">
            {viewCoverArt(gameName)}
          </div>
          <p className="text-xl">{gameNameToString(gameName)}</p>
        </div>
      )}

      <div className="flex items-center justify-start gap-2">
        <MyAvatar src={host.avatarUrl} alt="avatar" className="h-12 w-12" />

        <p className="text-xl">{host.username}</p>
        <span className="rounded-full bg-white/30 p-1 px-2 text-xs">Host</span>
      </div>
    </button>
  );
};

export const formatUsername = (username: string) => {
  if (username.length > 12) {
    return username.slice(0, 12) + "...";
  }
  return username;
};

export const formatUsernames = (usernames: string[]) => {
  const formatted = usernames.map(formatUsername);
  if (formatted.length > 3) {
    return `${formatted.slice(0, 3).join(", ")} & ${formatted.length - 3} more`;
  }
  return formatted.join(", ");
};
