import { either } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import { cmd, sub, time } from "Framework";
import * as Audio from "Framework/Audio";
import { Cmd } from "Framework/Cmd";
import * as Keyboard from "Framework/Keyboard";
import * as Navigation from "Framework/Navigation";
import { Sub } from "Framework/Sub";
import { attempt } from "Framework/Task";
import { useEffect, useRef } from "react";
import * as View from "View";
import * as Direction from "./Direction";
import * as Position from "./Position";

//
//
//
// Model
//
//
//

export type Model = {
  mouseStatus: MouseStatus;
  status: Status;
  head: Position.Position;
  tail: Position.Position[];
  food: Position.Position;
  tailLength: number;
  foodEatenCount: number;
  tickRate: number;
  direction: Direction.Direction;
  directionQueue: Direction.Direction[];
  bounds: {
    lower: Position.Position;
    upper: Position.Position;
  };
  touched?: Position.Position;
};

type Status = { type: "Paused" } | { type: "Playing" };

type MouseStatus = "active" | "inactive";

//
//
//
// Init
//
//
//

export const init: Model = {
  status: { type: "Paused" },
  mouseStatus: "inactive",
  tickRate: 1000 / 6,
  head: { x: 4, y: 6 },
  tail: [
    { x: 3, y: 6 },
    { x: 2, y: 6 },
  ],
  food: { x: 7, y: 6 },
  tailLength: 4,
  foodEatenCount: 0,
  direction: "right",
  directionQueue: [],
  bounds: {
    lower: {
      x: 0,
      y: 0,
    },
    upper: {
      x: 12,
      y: 21,
    },
  },
};

//
//
//
// Msg
//
//
//

export type Msg =
  | { type: "Elapsed" }
  | { type: "UserClickedBackButton" }
  | { type: "UserClickedRestartButton" }
  | { type: "UserClickedToggleButton" }
  | { type: "UserPressedKeyDown"; key: Keyboard.Key }
  | { type: "AudioFailed" }
  | { type: "AudioSucceeded" }
  | { type: "UserTouchMovedBoard"; position: Position.Position }
  | { type: "UserMouseMovedBoard"; position: Position.Position }
  | { type: "UserMouseDownBoard" }
  | { type: "UserMouseUpBoard" }
  | { type: "UserClickedRestartButton" };

//
//
//
// Update
//
//
//

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  switch (msg.type) {
    case "UserClickedRestartButton":
      return [init, cmd.none];

    case "Elapsed":
      switch (model.status.type) {
        case "Paused":
          return [model, cmd.none];

        case "Playing":
          const tailNew = [model.head]
            .concat(model.tail)
            .slice(0, model.tailLength);

          const queuedDirection = model.directionQueue[0] ?? model.direction;

          const [_, ...directionQueueNew] = model.directionQueue;

          const directionNew = Direction.isOpposite(
            queuedDirection,
            model.direction
          )
            ? model.direction
            : queuedDirection;

          const headNew = Position.add(
            model.head,
            Direction.toVector(directionNew)
          );

          const isSnakeEatingFood = [headNew, ...tailNew].some((position) =>
            Position.equals(position, model.food)
          );

          const foodNew = isSnakeEatingFood
            ? shuffle(toEmptyPositions(model))[0] ?? model.food
            : model.food;

          const tailLengthNew = isSnakeEatingFood
            ? model.tailLength + 1
            : model.tailLength;

          const foodEatenCountNew = isSnakeEatingFood
            ? model.foodEatenCount + 1
            : model.foodEatenCount;

          return [
            {
              ...model,
              head: headNew,
              tail: tailNew,
              food: foodNew,
              tailLength: tailLengthNew,
              foodEatenCount: foodEatenCountNew,
              directionQueue: directionQueueNew,
              direction: directionNew,
            },
            cmd.none,
          ];
      }

    case "UserClickedBackButton":
      return [model, Navigation.back()];

    case "UserMouseUpBoard":
      return [{ ...model, mouseStatus: "inactive" }, cmd.none];

    case "UserMouseDownBoard":
      return [{ ...model, mouseStatus: "active" }, cmd.none];

    case "UserPressedKeyDown":
      const statusNew: Status =
        msg.key === "Space"
          ? model.status.type === "Paused"
            ? { type: "Playing" }
            : { type: "Paused" }
          : model.status;

      const directionFromKey = Direction.fromKey(msg.key, model.direction);

      return [
        enqueueDirection(directionFromKey, {
          ...model,
          status: statusNew,
        }),
        cmd.none,
      ];

    case "UserClickedToggleButton":
      switch (model.status.type) {
        case "Paused":
          return [{ ...model, status: { type: "Playing" } }, cmd.none];

        case "Playing":
          return [{ ...model, status: { type: "Paused" } }, cmd.none];
      }

    case "AudioFailed":
      return [model, cmd.none];

    case "AudioSucceeded":
      return [model, cmd.none];

    case "UserMouseMovedBoard":
    case "UserTouchMovedBoard":
      const previous = model.touched;

      if (!previous) {
        return [{ ...model, touched: msg.position }, cmd.none];
      }

      const touchedNew = msg.position;

      const delta = Position.subtract(previous, touchedNew);

      const maxDeltaMagnitude = Math.max(Math.abs(delta.x), Math.abs(delta.y));

      if (maxDeltaMagnitude < 4) {
        return [{ ...model, touched: touchedNew }, cmd.none];
      }

      const xDirection = delta.x > 0 ? "left" : "right";

      const yDirection = delta.y > 0 ? "up" : "down";

      const directionFromSwipe =
        Math.abs(delta.x) > Math.abs(delta.y) ? xDirection : yDirection;

      return [
        enqueueDirection(directionFromSwipe, { ...model, touched: touchedNew }),
        cmd.none,
      ];
  }
};

const enqueueDirection = (
  direction: Direction.Direction,
  model: Model
): Model => {
  const directionQueueNew = unqiue(
    [...model.directionQueue, direction].slice(0, 2)
  );

  return {
    ...model,
    directionQueue: directionQueueNew,
  };
};

const toEmptyPositions = (model: Model) => {
  const snake = [model.head, ...model.tail];
  return Position.range(model.bounds).filter((position) =>
    snake.every((snakePosition) => !Position.equals(position, snakePosition))
  );
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (model: Model): Sub<Msg> => {
  switch (model.status.type) {
    case "Paused":
      return keyDowns;

    case "Playing":
      return sub.batch([
        keyDowns,
        time.every<Msg>(model.tickRate, () => ({ type: "Elapsed" })),
      ]);
  }
};

const keyDowns = Keyboard.keyDowns<Msg>((key) => ({
  type: "UserPressedKeyDown",
  key,
}));

//
//
//
// View
//
//
//

const theme = {
  light: "#AAD751",
  dark: "#A2D149",
  snake: "#4573E8",
  apple: "#E7471D",
};

export const view =
  (model: Model): View.View<Msg> =>
  (dispatch) => {
    return (
      <View.Page>
        <View.Header
          left={
            <View.HeaderBackButton
              onClick={() => dispatch({ type: "UserClickedBackButton" })}
            />
          }
          title={
            model.status.type === "Playing"
              ? `${model.foodEatenCount} apples`
              : "Snake"
          }
          right={
            <>
              <View.IconButton
                onClick={() => dispatch({ type: "UserClickedToggleButton" })}
              >
                {model.status.type === "Paused" ? (
                  <View.Icons.PlayArrow />
                ) : (
                  <View.Icons.Pause />
                )}
              </View.IconButton>
              <View.IconButton
                onClick={() => dispatch({ type: "UserClickedRestartButton" })}
              >
                <View.Icons.RestartAlt />
              </View.IconButton>
            </>
          }
        />

        {/* <View.Box sx={{ paddingX: 2, paddingY: 1 }}>
          <View.Button
            size="large"
            fullWidth
            onClick={() => dispatch({ type: "UserClickedRestartButton" })}
            sx={{ marginBottom: 2 }}
          >
            Restart
          </View.Button>
          <View.Button
            size="large"
            fullWidth
            onClick={() => {
              dispatch({ type: "UserClickedToggleButton" });
            }}
          >
            {model.status === "playing" ? "pause" : "play"}
          </View.Button>
        </View.Box> */}

        <Canvas model={model} dispatch={dispatch} />
      </View.Page>
    );
  };

const Canvas = ({
  model,
  dispatch,
}: {
  model: Model;
  dispatch: (msg: Msg) => void;
}) => {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");

    if (canvas && ctx) {
      const dpi = 1000;
      ctx.scale(dpi, dpi);

      const width = canvas.width;
      const height = canvas.height;

      draw({ width, height }, model, ctx);
    }
  }, [model]);

  return (
    <View.Box sx={{ flex: 1, width: "100%" }}>
      <canvas
        style={{
          width: "100%",
          height: "100%",
          maxHeight: "100%",
          minHeight: "100%",
        }}
        ref={ref}
        onMouseDown={() => {
          dispatch({ type: "UserMouseDownBoard" });
        }}
        onMouseUp={() => {
          dispatch({ type: "UserMouseUpBoard" });
        }}
        onMouseMove={(event) => {
          if (model.mouseStatus === "active") {
            const x = event.clientX;
            const y = event.clientY;
            dispatch({ type: "UserMouseMovedBoard", position: { x, y } });
          }
        }}
        onClick={() => {
          // dispatch({ type: "UserClicj" });
        }}
        onTouchMove={(event) => {
          const touch = event.touches[0];
          if (touch) {
            const x = touch.clientX;
            const y = touch.clientY;
            dispatch({ type: "UserTouchMovedBoard", position: { x, y } });
          }
        }}
      />
    </View.Box>
  );
};

const draw = (
  { width, height }: { width: number; height: number },
  model: Model,
  ctx: CanvasRenderingContext2D
): void => {
  const scale = 100;

  const tileWidth = width / (model.bounds.upper.x - model.bounds.lower.x);
  const tileHeight = height / (model.bounds.upper.y - model.bounds.lower.y);

  ctx.canvas.width = width;
  ctx.canvas.height = height;

  ctx.fillStyle = theme.light;
  ctx.fillRect(0, 0, width, height);

  for (const position of Position.range(model.bounds)) {
    ctx.fillStyle = theme[toTileVariant(position)];
    ctx.fillRect(
      position.x * tileWidth,
      position.y * tileHeight,
      tileWidth,
      tileHeight
    );
  }

  for (const position of [model.food]) {
    ctx.fillStyle = theme.apple;
    ctx.fillRect(
      position.x * tileWidth,
      position.y * tileHeight,
      tileWidth,
      tileHeight
    );
  }

  for (const position of [model.head, ...model.tail]) {
    ctx.fillStyle = theme.snake;
    ctx.strokeStyle = theme.snake;
    ctx.strokeRect(
      position.x * tileWidth,
      position.y * tileHeight,
      tileWidth,
      tileHeight
    );
    ctx.fillRect(
      position.x * tileWidth,
      position.y * tileHeight,
      tileWidth,
      tileHeight
    );
  }
};

type TileVariant = "light" | "dark";

const toTileVariant = (position: Position.Position): TileVariant => {
  if (
    (isEven(position.x) && isOdd(position.y)) ||
    (isOdd(position.x) && isEven(position.y))
  ) {
    return "light";
  }
  return "dark";
};

const toViewbox = ({ lower, upper }: Model["bounds"]) =>
  [lower.x, lower.y, upper.x, upper.y].join(", ");

export const Icon = () => {
  const bounds: Model["bounds"] = {
    lower: {
      x: 0,
      y: 0,
    },
    upper: {
      x: 4,
      y: 4,
    },
  };
  return (
    <svg width="100%" viewBox={toViewbox(bounds)}>
      {Position.range(bounds).map(({ x, y }, index) => (
        <rect
          key={`${x} ${y} ${index}`}
          x={x}
          y={y}
          width={1}
          height={1}
          fill={theme[toTileVariant({ x, y })]}
          stroke="none"
        />
      ))}
    </svg>
  );
};

//
//
//
// Sounds
//
//
//

const playSound = (file: string) => {
  return pipe(
    Audio.play(file),
    attempt(
      either.fold<{}, {}, Msg>(
        () => ({ type: "AudioFailed" }),
        () => ({ type: "AudioSucceeded" })
      )
    )
  );
};

const soundAssets = {
  changedDirectionUp:
    "https://carolinegabriel.com/demo/js-keyboard/sounds/040.wav",

  changedDirectionDown:
    "https://carolinegabriel.com/demo/js-keyboard/sounds/040.wav",

  changedDirectionRight:
    "https://carolinegabriel.com/demo/js-keyboard/sounds/040.wav",

  changedDirectionLeft:
    "https://carolinegabriel.com/demo/js-keyboard/sounds/040.wav",

  roar: "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3",
};

//
//
//
// Helpers
//
//
//

const shuffle = <T,>(xs: T[]): T[] => {
  const ys = [...xs];

  ys.sort(() => (Math.random() > 0.5 ? 1 : -1));

  return ys;
};

const minBy = <T,>(keyFn: (a: T) => number, a: T, b: T) => {
  if (keyFn(a) < keyFn(b)) {
    return a;
  }

  return b;
};

const isEven = (x: number) => x % 2 === 0;

const isOdd = (x: number) => !isEven(x);

const unqiue = <T,>(as: T[]): T[] => {
  return Array.from(new Set(as));
};
