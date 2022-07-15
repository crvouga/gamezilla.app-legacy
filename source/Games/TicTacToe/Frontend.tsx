import * as Route from "Route";
import * as Store from "Store";
import * as UI from "UI";
import { sendToBackend } from "Bridge/Frontend";
import { Cmd, Option, RemoteData, Result, pipe } from "Core";
import * as Board from "./Board";
import {
  FrontendModel,
  FrontendMsg,
  Room,
  ToFrontend,
  toCurrentRoom,
  toPlayer,
} from "./Types";

//
//
//
// Model
//
//
//

export type Model = FrontendModel;

export const init: [Model, Cmd.Cmd<Msg>] = [
  {
    createRoom: RemoteData.NotAsked,
    leaveRoom: RemoteData.NotAsked,
    joinRoom: RemoteData.NotAsked,
    init: RemoteData.Loading,
    move: RemoteData.NotAsked,
    rooms: {},
    users: {},
  },
  sendToBackend(["Games", ["TicTacToe", ["Init"]]]),
];

//
//
//
// Update
//
//
//

export type Msg = FrontendMsg;

export type OutAction = ["Store", Store.Action];

export const update = (
  { authUserId }: { authUserId: string },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "ClickedLeaveRoom":
      return [
        { ...model, leaveRoom: RemoteData.Loading },
        sendToBackend([
          "Games",
          ["TicTacToe", ["LeaveRoom", { userId: authUserId }]],
        ]),
      ];

    case "ClickedRestart": {
      return [
        model,
        sendToBackend([
          "Games",
          ["TicTacToe", ["Restart", { userId: authUserId }]],
        ]),
      ];
    }

    case "ClickedProfile":
      return [model, Route.push({ type: "Profile", userId: msg[1].userId })];

    case "ClickedJoinRoom":
      return [
        { ...model, joinRoom: RemoteData.Loading },
        sendToBackend([
          "Games",
          [
            "TicTacToe",
            ["JoinRoom", { userId: authUserId, roomId: msg[1].roomId }],
          ],
        ]),
      ];

    case "ClickedCreateRoom":
      return [
        { ...model, createRoom: RemoteData.Loading },
        sendToBackend([
          "Games",
          ["TicTacToe", ["CreateRoom", { userId: authUserId }]],
        ]),
      ];

    case "ClickedBack":
      return [model, Route.back];

    case "ClickedBoard":
      const roomsNew = pipe(
        toCurrentRoom(authUserId, model),
        Option.map((room) => {
          const player = toPlayer(authUserId, room);

          if (player === "None") {
            return room;
          }

          const boardNew = pipe(
            Board.move(
              room.board,
              player === "Both" ? Board.toTurn(room.board) : player,
              msg[1],
            ),
            Result.withDefault(room.board),
          );

          return {
            ...room,
            board: boardNew,
          };
        }),
        Option.fold(
          () => model.rooms,
          (room) => ({
            ...model.rooms,
            [room.roomId]: room,
          }),
        ),
      );

      return [
        { ...model, rooms: roomsNew, move: RemoteData.Loading },
        sendToBackend([
          "Games",
          ["TicTacToe", ["Move", { position: msg[1], userId: authUserId }]],
        ]),
      ];
  }
};

export const updateFromBackend = (
  msg: ToFrontend,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case "Sync":
      const userIds = Object.keys(msg[1].users);
      return [
        {
          ...model,
          init: RemoteData.Success({}),
          rooms: msg[1].rooms,
          users: msg[1].users,
        },
        Cmd.None,
        [["Store", Store.Profile.GetMany(userIds)]],
      ];

    case "RestartResulted": {
      return [model, Cmd.None, []];
    }

    case "MoveResulted": {
      return [model, Cmd.None, []];
    }

    case "JoinRoomResulted": {
      return [
        {
          ...model,
          joinRoom: RemoteData.fromResult(msg[1]),
        },
        Cmd.None,
        [],
      ];
    }

    case "LeaveRoomResulted": {
      return [
        {
          ...model,
          leaveRoom: RemoteData.fromResult(msg[1]),
        },
        Cmd.None,
        [],
      ];
    }

    case "CreateRoomResulted":
      return [
        {
          ...model,
          createRoom: RemoteData.fromResult(msg[1]),
        },
        Cmd.None,
        [],
      ];
  }
};

//
//
//
// View
//
//
//

export const view = (
  { currentUserId, store }: { currentUserId: string; store: Store.Model },
  model: Model,
): UI.View<Msg> => {
  const maybeCurrentRoom = toCurrentRoom(currentUserId, model);

  switch (maybeCurrentRoom.type) {
    case "None":
      return viewNotInRoom({ currentUserId, store }, model);

    case "Some":
      const room = maybeCurrentRoom.value;
      return viewInRoom({ room, currentUserId, store }, model);
  }
};

const viewNotInRoom =
  (
    { currentUserId, store }: { currentUserId: string; store: Store.Model },
    model: Model,
  ): UI.View<Msg> =>
  (dispatch) => {
    return (
      <UI.Page>
        <UI.Header
          left={
            <UI.HeaderBackButton onClick={() => dispatch(["ClickedBack"])} />
          }
          title="Tic Tac Toe"
        />

        <UI.Box sx={{ p: 2 }}>
          <UI.Button
            size="large"
            fullWidth
            loading={model.createRoom.type === "Loading"}
            onClick={() => dispatch(["ClickedCreateRoom"])}
            variant="contained"
          >
            New Room
          </UI.Button>
        </UI.Box>

        <UI.Box sx={{ paddingX: 2 }}>
          <UI.Typography variant="h5">Rooms</UI.Typography>

          {Object.values(model.rooms).length === 0 &&
            model.init.type !== "Loading" && (
              <UI.Typography sx={{ marginTop: 1 }} color="text.secondary">
                No rooms found.
              </UI.Typography>
            )}
        </UI.Box>

        <UI.List sx={{ overflowY: "scroll" }}>
          {Object.values(model.rooms)
            .map((room) => ({
              room,
              profiles: Object.values(store.Profile).filter(
                (profile) =>
                  model.users[profile.userId]?.roomId === room.roomId,
              ),
            }))
            .map(({ room, profiles }) => (
              <UI.ListItemButton
                key={room.roomId}
                onClick={() =>
                  dispatch(["ClickedJoinRoom", { roomId: room.roomId }])
                }
              >
                <UI.AvatarGroup>
                  {profiles.map((item) => (
                    <UI.Avatar key={item.userId} src={item.avatarUrl} />
                  ))}
                </UI.AvatarGroup>
                <UI.ListItemText
                  primaryTypographyProps={{
                    noWrap: true,
                    sx: { wordWrap: "break-word" },
                  }}
                  primary={profiles.map((item) => item.username).join(",")}
                />
              </UI.ListItemButton>
            ))}

          <UI.Backdrop open={model.joinRoom.type === "Loading"}>
            <UI.CircularProgress />
          </UI.Backdrop>

          {model.init.type === "Loading" && (
            <UI.Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                py: 2,
              }}
            >
              <UI.CircularProgress />
            </UI.Box>
          )}
        </UI.List>
      </UI.Page>
    );
  };

const viewInRoom =
  (
    {
      currentUserId,
      room,
      store,
    }: {
      currentUserId: string;
      room: Room;
      store: Store.Model;
    },
    model: Model,
  ): UI.View<Msg> =>
  (dispatch) => {
    const x =
      room.players.X.type === "User"
        ? store.Profile[room.players.X.userId]
        : undefined;

    const o =
      room.players.O.type === "User"
        ? store.Profile[room.players.O.userId]
        : undefined;
    return (
      <>
        <UI.Header
          left={
            <UI.HeaderBackButton onClick={() => dispatch(["ClickedBack"])} />
          }
          title="Tic Tac Toe"
        />

        <UI.Box
          sx={{
            display: "flex",

            alignItems: "center",
          }}
        >
          {x ? (
            <ScoreCard
              avatarUrl={x.avatarUrl}
              player="X"
              score={room.scores.X}
            />
          ) : (
            <></>
          )}

          {o ? (
            <ScoreCard
              avatarUrl={o.avatarUrl}
              player="O"
              score={room.scores.O}
            />
          ) : (
            <></>
          )}
        </UI.Box>

        <ViewBoard
          board={room.board}
          onClick={(position) => dispatch(["ClickedBoard", position])}
        />

        <UI.Box sx={{ p: 2 }}>
          {room.hostId === currentUserId && (
            <UI.Button
              sx={{ marginBottom: 2 }}
              onClick={() => dispatch(["ClickedRestart"])}
              loading={model.leaveRoom.type === "Loading"}
              fullWidth
              variant="contained"
            >
              Restart
            </UI.Button>
          )}

          <UI.Button
            onClick={() => dispatch(["ClickedLeaveRoom"])}
            loading={model.leaveRoom.type === "Loading"}
            fullWidth
            variant="contained"
          >
            {room.hostId === currentUserId ? "End Room" : "Leave Room"}
          </UI.Button>
        </UI.Box>

        {Object.values(store.Profile)
          .filter(
            (profile) =>
              model.users[profile.userId] &&
              model.users[profile.userId]?.roomId === room.roomId,
          )
          .map((profile) => (
            <UI.ButtonBase
              key={profile.userId}
              sx={{ width: "100%", display: "flex" }}
              onClick={() => dispatch(["ClickedProfile", profile])}
            >
              <UI.Box
                key={profile.userId}
                sx={{
                  p: 2,
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <UI.Avatar src={profile.avatarUrl} sx={{ marginRight: 2 }} />
                <UI.Typography>{profile.username}</UI.Typography>

                <UI.Box sx={{ flex: 1 }} />
                {profile.userId === room.hostId && (
                  <UI.Typography
                    color="text.secondary"
                    sx={{
                      fontStyle: "italic",
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <UI.Icons.Star sx={{ marginRight: 1 / 2 }} />
                    Host
                  </UI.Typography>
                )}
              </UI.Box>
            </UI.ButtonBase>
          ))}
      </>
    );
  };

const ScoreCard = ({
  avatarUrl,
  player,
  score,
}: {
  avatarUrl: string;
  player: Board.Player;
  score: number;
}) => {
  return (
    <UI.Box
      sx={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        paddingX: 2,
      }}
    >
      <UI.Avatar src={avatarUrl} />
      <svg width={60} viewBox="0 0 1 1">
        <ViewSlot slot={player} cx={0.5} cy={0.5} r={0.3} />
      </svg>
      <UI.Box sx={{ flex: 1 }} />
      <UI.Typography variant="h2">{score}</UI.Typography>
    </UI.Box>
  );
};

//
//
//
// Icon
//
//
//

export const Icon = () => {
  const positions: [Board.Position, Board.Slot][] = [
    [{ row: 0, column: 0 }, "X"],
    [{ row: 0, column: 1 }, "Empty"],
    [{ row: 1, column: 0 }, "Empty"],
    [{ row: 1, column: 1 }, "O"],
  ];

  const LINES = [
    { x1: 1, y1: 0, x2: 1, y2: 3 },
    { x1: 0, y1: 1, x2: 3, y2: 1 },
  ] as const;

  return (
    <svg width="100%" height="100%" viewBox="0 0 2 2">
      <rect x={0} y={0} width={2} height={2} fill={theme.background} />

      {LINES.map((line, index) => (
        <line key={index} {...line} stroke={theme.line} strokeWidth={0.1} />
      ))}

      {positions.map(([{ column, row }, slot], index) => (
        <ViewSlot
          key={index}
          slot={slot}
          cx={Number(column) + 0.5}
          cy={Number(row) + 0.5}
          r={0.3}
        />
      ))}
    </svg>
  );
};

//
//
//
// View
//
//
//

export const theme = {
  background: "#14BDAC",
  line: "#0DA192",
  cross: "#545454",
  naught: "#F2EBD3",
};

export const ViewBoard = ({
  board,
  onClick,
}: {
  board: Board.Board;
  onClick: (position: Board.Position) => void;
}) => {
  return (
    <svg width={"100%"} viewBox="0 0 3 3">
      <rect width="100%" height="100%" fill={theme.background} />
      {lines.map((line, index) => (
        <line
          key={index}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke={theme.line}
          strokeWidth={0.1}
        />
      ))}
      {Board.allPositions.map((position) => (
        <ViewSlot
          key={[
            position.column,
            position.row,
            Board.toSlot(board, position),
          ].join(" ")}
          slot={Board.toSlot(board, position)}
          cx={Number(position.column) + 0.5}
          cy={Number(position.row) + 0.5}
          r={0.3}
        />
      ))}

      {Board.allPositions.map((position) => (
        <rect
          key={[
            position.column,
            position.row,
            Board.toSlot(board, position),
          ].join(" ")}
          x={Number(position.column)}
          y={Number(position.row)}
          width={1}
          height={1}
          onClick={() => onClick(position)}
          fill="transparent"
        />
      ))}
    </svg>
  );
};

const lines = [
  { x1: 1, y1: 0, x2: 1, y2: 3 },
  { x1: 2, y1: 0, x2: 2, y2: 3 },
  { x1: 0, y1: 1, x2: 3, y2: 1 },
  { x1: 0, y1: 2, x2: 3, y2: 2 },
];

export const ViewSlot = ({
  slot,
  cx,
  cy,
  r,
}: {
  slot: Board.Slot;
  r: number;
  cx: number;
  cy: number;
}) => {
  switch (slot) {
    case "Empty":
      return <g></g>;

    case "O":
      return <Naught r={r} cx={cx} cy={cy} />;

    case "X":
      return <Cross r={r} cx={cx} cy={cy} />;
  }
};

const Cross = ({ cx, cy, r }: { r: number; cx: number; cy: number }) => {
  return (
    <g strokeWidth={0.1} stroke={theme.cross}>
      {/* direction: \ */}
      <line x1={cx - r} y1={cy - r} x2={cx + r} y2={cy + r} />
      {/* direction: / */}
      <line x1={cx + r} y1={cy - r} x2={cx - r} y2={cy + r} />
    </g>
  );
};

const Naught = ({ cx, cy, r }: { r: number; cx: number; cy: number }) => {
  return (
    <circle
      r={r}
      cx={cx}
      cy={cy}
      stroke={theme.naught}
      strokeWidth={0.1}
      fill="transparent"
    />
  );
};
