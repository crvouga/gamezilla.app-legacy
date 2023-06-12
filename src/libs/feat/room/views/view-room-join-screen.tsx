import { RoomId, UserId } from "@gamezilla/shared/app";
import { ViewCtx } from "@gamezilla/shared/client";
import {
  Avatar,
  Box,
  Button,
  ButtonBase,
  Chip,
  Divider,
  Icons,
  TopBar,
  TopBarBackButton,
  Typography,
  useTheme,
} from "@gamezilla/shared/ui";
import { gameNameToString, viewCoverArt } from "../game";
import { ClientModel, ClientMsg, toRoomUsers } from "../room.shared";

export const ViewRoomJoinScreen = ({
  model,
  ctx,
  room,
  $send,
}: {
  room: { roomId: RoomId; hostId: UserId };
  ctx: ViewCtx;
  model: ClientModel;
  $send: (msg: ClientMsg) => void;
}) => {
  const usersInRoom = toRoomUsers(room.roomId, model);
  const host = ctx.profiles[room.hostId];
  const title = `${host?.username ?? "..."}'s room`;
  const game = model.games[room.roomId];
  const theme = useTheme();
  return (
    <div className="w-full h-full flex flex-col">
      <TopBar
        left={
          <TopBarBackButton
            onClick={() => ctx.$push({ t: "room", c: { t: "room-list" } })}
          />
        }
        title={title}
      />

      <Box
        sx={{
          flex: 1,
          overflow: "hidden",
        }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            justifyContent: "center",
            width: "100%",
            height: "33.3333%",
            maxHeight: "33.3333%",
          }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              mb: 1,
              overflow: "hidden",
              borderRadius: 1,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: "background.paper",
            }}>
            {game ? (
              viewCoverArt(game.t)
            ) : (
              <Icons.SportsEsports
                sx={{
                  color: "text.secondary",
                  width: "100%",
                  height: "100%",
                }}
              />
            )}
          </Box>
          <Typography variant="h4" color="text.secondary">
            {game ? gameNameToString(game.t) : "..."}
          </Typography>
        </Box>

        <Divider />
        <Box
          sx={{
            width: "100%",
            height: "66.6666%",
            maxHeight: "66.6666%",
            overflowY: "scroll",
          }}>
          <ViewRoomUserListItem
            isHost
            key={room.hostId}
            userId={room.hostId}
            ctx={ctx}
            onClick={() => {
              $send({ t: "clicked-user", userId: room.hostId });
            }}
          />

          {usersInRoom.map((user) => {
            if (user.userId === room.hostId) {
              return null;
            }
            return (
              <ViewRoomUserListItem
                key={user.userId}
                userId={user.userId}
                ctx={ctx}
                onClick={() => {
                  $send({ t: "clicked-user", userId: user.userId });
                }}
              />
            );
          })}
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 2, width: "100%", padding: 2 }}>
        <Button
          fullWidth
          endIcon={<Icons.ChevronRight />}
          variant="contained"
          loading={model.requests["join"]?.t === "loading"}
          onClick={() => {
            $send({
              t: "join",
              userId: ctx.currentUserId,
              roomId: room.roomId,
            });
          }}>
          Join Room
        </Button>
      </Box>
    </div>
  );
};

const ViewRoomUserListItem = ({
  ctx,
  userId,
  onClick,
  isHost,
}: {
  ctx: ViewCtx;
  userId: UserId;
  onClick: () => void;
  isHost?: boolean;
}) => {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        px: 2,
        py: 1,
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        width: "100%",
      }}>
      <Avatar sx={{ mr: 1 }} src={ctx.profiles[userId]?.avatarUrl ?? ""} />
      <Typography align="left">
        {ctx.profiles[userId]?.username ?? "..."}
      </Typography>
      {ctx.currentUserId === userId && <Chip sx={{ ml: 1 }} label="You" />}
      {isHost && <Chip sx={{ ml: 1 }} label="Host" />}
    </ButtonBase>
  );
};
