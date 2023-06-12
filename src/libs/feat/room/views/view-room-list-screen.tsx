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
import { gameNameToString, viewCoverArt } from "../game";
import { GameName } from "../game.shared";
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
    <div className="flex-1 flex flex-col w-full h-full max-h-full overflow-hidden">
      <div>
        <TopBar title="Rooms" />
      </div>

      <div className="flex flex-col flex-1 w-full">
        {!isLoading && rooms.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center opacity-60">
            <IconGamepad className="w-12 h-12" />
            <p className="text-lg">No active rooms</p>
          </div>
        )}

        {isLoading && rooms.length === 0 && (
          <div className="flex-1 flex flex-col gap-4 px-5 overflow-hidden">
            {[1, 2, 3].map((i) => {
              return (
                <div
                  key={i}
                  className="cursor-wait w-full aspect-video rounded-lg bg-white/20 animate-pulse"
                />
              );
            })}
          </div>
        )}

        {rooms.length > 0 && (
          <div className="flex-1 flex flex-col relative">
            {isLoading && (
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                <IconSpinner className="animate-spin w-12 h-12" />
              </div>
            )}
            <div
              className={cn(
                isLoading && "opacity-50 pointer-events-none",
                "w-full flex-1 flex flex-col gap-4 px-5 overflow-y-auto"
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
            Create Room
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
      className="bg-blue-500 rounded-md flex flex-col gap-3 p-4 active:opacity-70">
      <div className="w-full flex items-center justify-start">
        <p className="block uppercase text-left font-bold animate-pulse flex-1">
          LIVE
        </p>
        {isCurrentRoom && (
          <p className="block text-xs font-light opacity-50 italic">
            Current Room
          </p>
        )}
      </div>

      {gameName && (
        <div className="flex items-center justify-start gap-2">
          <div className="w-12 h-12 rounded overflow-hidden border-2 border-white/40">
            {viewCoverArt(gameName)}
          </div>
          <p className="text-xl">{gameNameToString(gameName)}</p>
        </div>
      )}

      <div className="flex items-center justify-start gap-2">
        <MyAvatar src={host.avatarUrl} alt="avatar" className="w-12 h-12" />

        <p className="text-xl">{host.username}</p>
        <span className="bg-white/30 rounded-full p-1 px-2 text-xs">Host</span>
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
