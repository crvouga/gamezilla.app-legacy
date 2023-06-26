import { Cmd, Keyboard, p, Sub } from "@gamezilla/shared/core";
import { SpaceCtx, SpaceViewCtx, ViewCtx } from "@gamezilla/shared/client";
import {
  ActionButton,
  Avatar,
  Box,
  Button,
  FillBox,
  IconButton,
  Icons,
  InputAdornment,
  TextField,
  Typography,
} from "@gamezilla/shared/ui";
import { Maze } from "./maze";
import {
  ServerModel,
  Color,
  ClientModel,
  ClientMsg,
  handle,
  initShared,
  ToServer,
  ToClient,
} from "./maze.shared";
import { Direction, Position } from "./position";

//
//
//
// Model
//
//
//

export type Model = ClientModel;

export const init = initShared;

//
//
//
// Update
//
//
//

export type Msg = ClientMsg;

export const update = (
  { ctx, sendToServer }: { ctx: SpaceCtx; sendToServer: (m: ToServer) => Cmd },
  msg: Msg,
  model: Model
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    //
    //
    //

    case "key-up": {
      const direction = keyToDirection(msg[1]);

      if (!direction) {
        return [model, Cmd.None];
      }

      return [
        model,
        sendToServer([
          "input-direction",
          { userId: ctx.currentUserId, direction: "none" },
        ]),
      ];
    }

    case "key-down": {
      const direction = keyToDirection(msg[1]);

      if (!direction) {
        return [model, Cmd.None];
      }

      return [
        model,
        sendToServer([
          "input-direction",
          { userId: ctx.currentUserId, direction },
        ]),
      ];
    }

    //
    //
    //

    case "input-seed":
    case "input-direction":
    case "start-game":
    case "stop-game":
    case "stop-playing":
    case "start-playing": {
      return [model, sendToServer(msg)];
    }
  }
};

export const updateFromServer = (
  msg: ToClient,
  model: Model
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case "stop-game":
    case "input-seed":
    case "input-direction":
    case "start-game":
    case "stop-playing":
    case "start-playing": {
      if (msg[2].t === "err") {
        return [model, Cmd.None];
      }
      const merged = syncWithServer({
        clientModel: model,
        serverModel: msg[2].value,
      });
      return [merged, Cmd.None];
    }

    case "tick": {
      const merged = syncWithServer({
        clientModel: model,
        serverModel: msg[1],
      });
      return [merged, Cmd.None];
    }
  }
};

export const syncWithServer = ({
  serverModel,
}: {
  clientModel: ClientModel;
  serverModel: ServerModel;
}): ClientModel => {
  return serverModel;
};

const keyToDirection = (key: Keyboard.Key): Direction | null => {
  switch (key) {
    case "A":
    case "a":
    case "ArrowLeft":
      return "West";

    case "W":
    case "w":
    case "ArrowUp":
      return "North";

    case "s":
    case "S":
    case "ArrowDown":
      return "South";

    case "d":
    case "D":
    case "ArrowRight":
      return "East";

    default:
      return null;
  }
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (_model: Model) => {
  return Sub.batch<Msg>([
    Keyboard.keyDowns((key) => ["key-down", key]),
    Keyboard.keyUps((key) => ["key-up", key]),
  ]);
};

//
//
//
// View
//
//
//

const colorMap: { [color in Color]: string } = {
  Blue: "#0333FF",
  Green: "#02F900",
  Purple: "#992197",
  Red: "#FF2601",
  Cyan: "#02FEFF",
  Pink: "#FF40FF",
};

export const View = ({
  model,
  ctx,
  $send,
  gameSpaceCtx,
}: {
  gameSpaceCtx: SpaceViewCtx;
  ctx: ViewCtx;
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  if (model.type === "setup") {
    return (
      <FillBox>
        <Box sx={{ px: 2, pt: 2 }}>
          <TextField
            disabled={
              handle(
                ["input-seed", { userId: ctx.currentUserId, seed: model.seed }],
                model
              ).t === "err"
            }
            value={model.seed}
            onChange={(e) =>
              $send([
                "input-seed",
                { userId: ctx.currentUserId, seed: e.target.value },
              ])
            }
            fullWidth
            label="Seed"
            InputProps={{
              endAdornment: (
                <InputAdornment
                  position="end"
                  onClick={() =>
                    $send([
                      "input-seed",
                      {
                        userId: ctx.currentUserId,
                        seed: `s${Math.floor(Math.random() * 1_000_000_000)}`,
                      },
                    ])
                  }>
                  <IconButton>
                    <Icons.Shuffle />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Typography sx={{ pt: 2, px: 2, color: "text.secondary" }}>
          Players
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            px: 2,
            mt: 1,
            flex: 1,
          }}>
          {Object.values(model.players).map((player) => (
            <Box
              key={player.userId}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
              }}>
              <svg width="36px" viewBox="-1 -1 2 2">
                <circle cx={0} cy={0} r={1} fill={colorMap[player.color]} />
              </svg>
              <Avatar
                src={ctx.profiles[player.userId]?.avatarUrl}
                sx={{ ml: 1, mr: 2 }}
              />
              <Typography noWrap sx={{ flex: 1 }}>
                {ctx.profiles[player.userId]?.username ?? "..."}
              </Typography>
              {player.userId === ctx.currentUserId && (
                <Button
                  onClick={() =>
                    $send(["stop-playing", { userId: ctx.currentUserId }])
                  }>
                  Stop Playing
                </Button>
              )}
            </Box>
          ))}

          {!model.players[ctx.currentUserId] && (
            <Button
              variant="outlined"
              fullWidth
              onClick={() =>
                $send(["start-playing", { userId: ctx.currentUserId }])
              }
              disabled={
                handle(["start-playing", { userId: ctx.currentUserId }], model)
                  .t === "err"
              }>
              Start Playing
            </Button>
          )}
        </Box>

        <Box sx={{ display: "flex", gap: 2, p: 2 }}>
          <Button fullWidth variant="outlined" onClick={gameSpaceCtx.onQuit}>
            Back
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={() => $send(["start-game", { userId: ctx.currentUserId }])}
            disabled={
              handle(["start-game", { userId: ctx.currentUserId }], model).t ===
              "err"
            }>
            Start Game
          </Button>
        </Box>
      </FillBox>
    );
  }

  const viewBox = [
    model.lower.x,
    model.lower.y,
    model.upper.x - model.lower.x + 1,
    model.upper.y - model.lower.y + 1,
  ].join(" ");

  const maze = Maze.makeMemoized(model);

  const currentUserPlayer = model.players[ctx.currentUserId];

  return (
    <FillBox sx={{ alignItems: "center" }}>
      {!currentUserPlayer && (
        <Typography sx={{ p: 1 }} color="primary.light">
          Spectating
        </Typography>
      )}
      <svg
        // style={{ maxWidth: "400px", margin: 0 }}
        width="100%"
        viewBox={viewBox}>
        <rect
          x={model.lower.x}
          y={model.lower.y}
          width="100%"
          height="100%"
          fill={"#000"}
        />
        {maze.edges.map(([a, b]) => (
          <g
            key={[a.x, a.y, b.x, b.y].join("-")}
            strokeWidth="0.1"
            stroke={"#fff"}>
            <line
              x1={a.x + 1 / 2}
              y1={a.y + 1 / 2}
              x2={b.x + 1 / 2}
              y2={b.y + 1 / 2}
            />
          </g>
        ))}

        {Object.values(model.players).map((player) => (
          <circle
            key={player.userId}
            cx={player.position.x + 1 / 2}
            cy={player.position.y + 1 / 2}
            r={1 / 3}
            fill={colorMap[player.color]}
          />
        ))}
      </svg>
      {currentUserPlayer && (
        <>
          <ViewJoystick
            activeDirection={p(currentUserPlayer.direction, (d) =>
              d === "none" ? undefined : d
            )}
            onChange={(direction) =>
              $send([
                "input-direction",
                { direction, userId: ctx.currentUserId },
              ])
            }
            onDone={() =>
              $send([
                "input-direction",
                { direction: "none", userId: ctx.currentUserId },
              ])
            }
            activeFill="#fff"
            fill="#000"
            stroke="#bcbcbc"
          />
          <Box sx={{ width: "100%" }}>
            <ActionButton
              icon={<Icons.ExitToApp sx={{ transform: "rotate(180deg)" }} />}
              label="Exit"
              onClick={() =>
                $send(["stop-game", { userId: ctx.currentUserId }])
              }
            />
          </Box>
        </>
      )}
    </FillBox>
  );
};

const ViewJoystick = ({
  activeDirection,
  onChange,
  onDone,
  stroke,
  fill,
  activeFill,
}: {
  activeDirection?: Direction;
  onChange: (direction: Direction) => void;
  onDone: () => void;
  stroke: string;
  fill: string;
  activeFill: string;
}) => {
  return (
    <Box
      sx={{
        maxWidth: "40vw",
        margin: "auto",
        transform: "rotate(45deg)",
        transformOrigin: "center",
        transformBox: "fill-box",
      }}>
      <svg
        width="100%"
        viewBox="-1 -1 2 2"
        style={{ overflow: "hidden", userSelect: "none", touchAction: "none" }}>
        <defs>
          <clipPath id="cut-off-bottom">
            <circle x="0" y="0" r={1} />
          </clipPath>
        </defs>

        <g strokeWidth={0.025}>
          <g clipPath="url(#cut-off-bottom)" stroke={stroke}>
            {Direction.all.map((direction) => {
              const { x, y } = directionToVector(direction);
              return (
                <rect
                  key={direction}
                  x={x}
                  y={y}
                  width={1}
                  height={1}
                  fill={activeDirection === direction ? activeFill : fill}
                  //
                  onTouchStart={() => onChange(direction)}
                  onTouchMove={() => onChange(direction)}
                  onTouchEnd={onDone}
                  onTouchCancel={onDone}
                  onAbort={onDone}
                  //
                  onMouseDown={() => onChange(direction)}
                  onMouseOver={() => onChange(direction)}
                  onMouseUp={onDone}
                />
              );
            })}
          </g>

          <circle
            x="0"
            y="0"
            r={0.5}
            fill={fill}
            style={{
              touchAction: "none",
              userSelect: "none",
              pointerEvents: "none",
            }}
            stroke={stroke}
          />
          <circle
            x="0"
            y="0"
            r={0.98}
            style={{
              touchAction: "none",
              userSelect: "none",
              pointerEvents: "none",
            }}
            fill="transparent"
            stroke={stroke}
          />
        </g>
      </svg>
    </Box>
  );
};

const directionToVector = (direction: Direction): Position => {
  switch (direction) {
    case "East":
      return { x: 0, y: -1 };
    case "North":
      return { x: -1, y: -1 };
    case "South":
      return { x: 0, y: 0 };
    case "West":
      return { x: -1, y: 0 };
  }
};
