import { INaturalNumber, List, NaturalNumber, Record } from "../../../utils";
import { IPosition, Position } from "./snake-position";

type IState = {
  type: "SnakeState";
  randomSeed: string;
  head: IPosition;
  tail: IPosition[];
  tailLength: INaturalNumber;
  apples: IPosition[];
  appleCount: INaturalNumber;
  direction: IPosition;

  bounds: {
    lower: IPosition;
    upper: IPosition;
  };
};

export const init = (randomSeed: string): IState => {
  return {
    type: "SnakeState",
    randomSeed,
    head: Position.ZERO,
    tail: [Position.ZERO, Position.ZERO, Position.ZERO],
    tailLength: NaturalNumber.floor(1),
    apples: [Position.ZERO],
    appleCount: NaturalNumber.floor(2),
    direction: Position.ZERO,
    bounds: {
      lower: Position.ZERO,
      upper: Position.ZERO,
    },
  };
};

type IMessage =
  | {
      type: "STEP";
    }
  | {
      type: "APPLE_SPAWNED";
      position: IPosition;
    };

const nextState = (state: IState, message: IMessage): IState => {
  switch (message.type) {
    case "APPLE_SPAWNED": {
      const position = message.position;

      return Record.mergeLeft(state, {
        apples: List.concat(state.apples, [position]),
      });
    }

    case "STEP": {
      const nextHead = Position.add(state.head, state.direction);

      const nextTail = List.take(
        state.tailLength,
        List.concat([state.head], state.tail)
      );

      const isSnakeEatingApple = List.any(
        (apple) => Position.equals(apple, nextHead),
        state.apples
      );

      if (!isSnakeEatingApple) {
        return Record.mergeLeft(state, {
          head: nextHead,
          tail: nextTail,
          tailLength: NaturalNumber.floor(state.tailLength + 1),
        });
      }

      const allPositions = Position.range(
        state.bounds.lower,
        state.bounds.upper
      );

      const allNonEmptyPositions = List.concat(
        [state.head],
        state.tail,
        state.apples
      );

      const allEmptyPositions = List.difference(
        allPositions,
        allNonEmptyPositions
      );

      const nextApples = List.take(
        state.appleCount,
        List.concat(state.apples, List.shuffle(allEmptyPositions))
      );

      return Record.mergeLeft(state, {
        head: nextHead,
        tail: nextTail,
        apples: nextApples,
      });
    }
  }
};

export default {
  nextState,
};
