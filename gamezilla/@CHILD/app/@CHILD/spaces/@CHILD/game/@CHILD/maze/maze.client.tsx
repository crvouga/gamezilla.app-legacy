import { SpaceClientCtx } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space";
import {
  ActionButton,
  IconArrowLeftOnRect,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { Eff, Keyboard, Sub, p } from "gamezilla/@SHARED/core";
import { Maze } from "./@SHARED/maze";
import { Direction, Position } from "./@SHARED/position";
import {
  ModelClient,
  MsgClient,
  Color,
  ModelServer,
  MsgToClient,
  initShared,
} from "./maze.core";

//
//
//
// Model
//
//
//

export type Model = ModelClient;

export const init = initShared;

//
//
//
// Update
//
//
//

export type Msg = MsgClient;

export const update = (msg: Msg, model: Model): [Model, Eff<Msg>] => {
  switch (msg[0]) {
    //
    //
    //

    case "key-up": {
      const direction = keyToDirection(msg[1]);

      if (!direction) {
        return [model, Eff.None];
      }

      return [model, Eff.None];
    }

    case "key-down": {
      const direction = keyToDirection(msg[1]);

      if (!direction) {
        return [model, Eff.None];
      }

      return [model, Eff.None];
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
      return [model, Eff.None];
    }
  }
};

export const updateFromServer = (
  msg: MsgToClient,
  model: Model
): [Model, Eff<Msg>] => {
  switch (msg[0]) {
    case "stop-game":
    case "input-seed":
    case "input-direction":
    case "start-game":
    case "stop-playing":
    case "start-playing": {
      if (msg[2].t === "err") {
        return [model, Eff.None];
      }
      const merged = mergeWithServer({
        clientModel: model,
        serverModel: msg[2].value,
      });
      return [merged, Eff.None];
    }

    case "tick": {
      const merged = mergeWithServer({
        clientModel: model,
        serverModel: msg[1],
      });
      return [merged, Eff.None];
    }
  }
};

export const mergeWithServer = ({
  serverModel,
}: {
  clientModel: ModelClient;
  serverModel: ModelServer;
}): ModelClient => {
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
  dispatch,
}: {
  ctx: SpaceClientCtx;
  model: Model;
  dispatch: (msg: Msg) => void;
}) => {
  if (model.type === "setup") {
    return <div></div>;
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
    <div>
      {!currentUserPlayer && <p>Spectating</p>}
      <svg width="100%" viewBox={viewBox}>
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
            stroke={"#fff"}
          >
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
              dispatch([
                "input-direction",
                { direction, userId: ctx.currentUserId },
              ])
            }
            onDone={() =>
              dispatch([
                "input-direction",
                { direction: "none", userId: ctx.currentUserId },
              ])
            }
            activeFill="#fff"
            fill="#000"
            stroke="#bcbcbc"
          />
          <div>
            <ActionButton
              icon={<IconArrowLeftOnRect className="h-6 w-6" />}
              label="Exit"
              onClick={() =>
                dispatch(["stop-game", { userId: ctx.currentUserId }])
              }
            />
          </div>
        </>
      )}
    </div>
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
    <div>
      <svg
        width="100%"
        viewBox="-1 -1 2 2"
        className="touch-none select-none overflow-hidden"
      >
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
            className="pointer-events-none touch-none select-none"
            stroke={stroke}
          />
          <circle
            x="0"
            y="0"
            r={0.98}
            className="pointer-events-none touch-none select-none"
            fill="transparent"
            stroke={stroke}
          />
        </g>
      </svg>
    </div>
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
