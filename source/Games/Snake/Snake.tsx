import { either } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import { cmd, sub, time } from "Framework";
import * as Audio from "Framework/Audio";
import { Cmd } from "Framework/Cmd";
import * as Keyboard from "Framework/Keyboard";
import { Sub } from "Framework/Sub";
import { attempt } from "Framework/Task";
import * as Navigation from "Navigation";
import { useEffect, useRef, useState } from "react";
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
  status: Status;
  head: Position.Position;
  tail: Position.Position[];
  food: Position.Position;
  tailLength: number;
  direction: Direction.Direction;
  eatenAppleCount: number;
  tick: number;
  bounds: {
    lower: Position.Position;
    upper: Position.Position;
  };
  touched?: Position.Position;
};

type Status = "paused" | "playing";

const toggle = (status: Status): Status => {
  switch (status) {
    case "paused":
      return "playing";

    case "playing":
      return "paused";
  }
};

//
//
//
// Init
//
//
//

export const init: Model = {
  status: "paused",
  tick: 1000 / 8,
  head: { x: 4, y: 4 },
  tail: [
    { x: 3, y: 4 },
    { x: 2, y: 4 },
  ],
  food: { x: 7, y: 4 },
  direction: "right",
  tailLength: 4,
  eatenAppleCount: 0,
  bounds: {
    lower: {
      x: 0,
      y: 0,
    },
    upper: {
      x: 20,
      y: 20,
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
  | { type: "Ticked" }
  | { type: "UserClickedBoard" }
  | { type: "UserClickedBackButton" }
  | { type: "UserClickedRestartButton" }
  | { type: "UserClickedToggleButton" }
  | { type: "UserSwipedBoard" }
  | { type: "UserPressedKeyDown"; key: Keyboard.Key }
  | { type: "AudioFailed" }
  | { type: "AudioSucceeded" }
  | { type: "UserTouchedBoard"; position: Position.Position };

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

    case "UserSwipedBoard":
      return [model, cmd.none];

    case "Ticked":
      switch (model.status) {
        case "paused":
          return [model, cmd.none];

        case "playing":
          const tailNew = [model.head, ...model.tail].slice(
            0,
            model.tailLength
          );

          const headNew = Position.add(
            model.head,
            Direction.toVector(model.direction)
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

          const eatenAppleCountNew = isSnakeEatingFood
            ? model.eatenAppleCount + 1
            : model.eatenAppleCount;

          return [
            {
              ...model,
              head: headNew,
              tail: tailNew,
              food: foodNew,
              tailLength: tailLengthNew,
              eatenAppleCount: eatenAppleCountNew,
            },
            cmd.none,
          ];
      }

    case "UserClickedBackButton":
      return [model, Navigation.back()];

    case "UserClickedBoard":
      return [model, cmd.none];

    case "UserPressedKeyDown":
      const directionNew = Direction.fromKey(msg.key, model.direction);

      const statusNew =
        msg.key === "Space" ? toggle(model.status) : model.status;

      const soundCmd =
        model.direction !== directionNew
          ? playSound(soundAssets.changedDirectionDown)
          : cmd.none;

      return [
        {
          ...model,
          status: statusNew,
          direction: directionNew,
        },
        // soundCmd,
        cmd.none,
      ];

    case "UserClickedToggleButton":
      switch (model.status) {
        case "paused":
          return [{ ...model, status: "playing" }, cmd.none];

        case "playing":
          return [{ ...model, status: "paused" }, cmd.none];
      }

    case "AudioFailed":
      return [model, cmd.none];

    case "AudioSucceeded":
      return [model, cmd.none];

    case "UserTouchedBoard":
      const previous = model.touched;

      if (!previous) {
        return [{ ...model, touched: msg.position }, cmd.none];
      }

      const current = msg.position;

      const delta = Position.subtract(previous, current);

      const xDirection = delta.x > 0 ? "left" : "right";

      const yDirection = delta.y > 0 ? "up" : "down";

      const direction =
        Math.abs(delta.x) > Math.abs(delta.y) ? xDirection : yDirection;

      return [
        { ...model, direction: direction, touched: msg.position },
        cmd.none,
      ];
  }
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
// Subscriptions
//
//
//

export const subscriptions = (model: Model): Sub<Msg> => {
  switch (model.status) {
    case "paused":
      return keyDowns;

    case "playing":
      return sub.batch([
        keyDowns,
        time.every<Msg>(model.tick, () => ({ type: "Ticked" })),
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
      <>
        <View.Header
          left={
            <View.HeaderBackButton
              onClick={() => dispatch({ type: "UserClickedBackButton" })}
            />
          }
          title={
            model.status === "playing"
              ? `${model.eatenAppleCount} apples`
              : "Snake"
          }
        />

        <Canvas model={model} dispatch={dispatch} />

        <View.Box sx={{ paddingX: 2, paddingY: 1 }}>
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
            onClick={(event) => {
              dispatch({ type: "UserClickedToggleButton" });
            }}
          >
            {model.status === "playing" ? "pause" : "play"}
          </View.Button>
        </View.Box>
      </>
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

    if (ctx) {
      draw(model, ctx);
    }
  }, [model]);

  return (
    <canvas
      ref={ref}
      onTouchMove={(event) => {
        const x = event.touches[0]?.clientX;
        const y = event.touches[0]?.clientY;

        if (x && y) {
          dispatch({ type: "UserTouchedBoard", position: { x, y } });
        }
      }}
    />
  );
};

const draw = (model: Model, ctx: CanvasRenderingContext2D): void => {
  const width = window.innerWidth;
  const height = window.innerWidth;
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

  for (const position of [model.head, ...model.tail]) {
    ctx.fillStyle = theme.snake;
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
