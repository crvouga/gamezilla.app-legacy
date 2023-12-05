import { SpaceViewCtx } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/space";
import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import {
  IconRobot,
  MyAvatar,
  Transition,
  VDom,
  VDomChildren,
  cn,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { PlayerType, VsBotProps } from "../vs-bot";

//
//
//
// Model
//
//
//

export type Model = null;

export function init(_gameOver?: GameOver | null): Model {
  return null;
}

//
//
//
// Update
//
//
//

export type Msg = {
  t: null;
};

export const update = (model: Model, _msg: Msg): Model => {
  return model;
};

//
//
//
// View
//
//
//

export type GameOver =
  | {
      t: null;
    }
  | {
      t: "winner";
      winner: PlayerType;
    }
  | {
      t: "draw";
    };

type Props = {
  ctx: SpaceViewCtx;
  model?: Model;
  gameOver: GameOver | null;
  human: {
    userId: UserId;
    player: PlayerType;
  };
  bot: {
    label: string;
    renderIcon: (props: { class: string }) => VDom;
  };
  playerOne: {
    renderIcon: (props: { class: string }) => VDom;
  };
  playerTwo: {
    renderIcon: (props: { class: string }) => VDom;
  };
  onPlayAgain?: () => void;
};

export type VsBotGameProps = VsBotProps & {
  turn: PlayerType | null;
  human: {
    player: PlayerType;
    userId: UserId;
  };
};

export type Status =
  | {
      t: "playing";
      turn: PlayerType;
    }
  | {
      t: "winner";
      winner: PlayerType;
    }
  | {
      t: "draw";
    };

export const ViewStatusBar = (props: VsBotProps & { status: Status }) => {
  return (
    <Transition
      id="status-bar"
      mode="in-out"
      onEnter={fadeIn({ duration: 300, delay: 0 })}
      onExit={fadeOut({ duration: 300, delay: 0 })}
      class="relative h-8 w-full"
    >
      <div
        key={statusToKey(props.status)}
        class="absolute inset-0 flex items-center justify-center gap-1 text-secondary"
      >
        <ViewStatusBarContent {...props} />
      </div>
    </Transition>
  );
};

function statusToKey(status: Status) {
  switch (status.t) {
    case "playing": {
      switch (status.turn) {
        case "player-one": {
          return "playing/player-one";
        }

        case "player-two": {
          return "playing/player-two";
        }
      }
    }

    case "winner": {
      switch (status.winner) {
        case "player-one": {
          return "winner/player-one";
        }

        case "player-two": {
          return "winner/player-two";
        }
      }
    }

    case "draw": {
      return "draw";
    }
  }
}

const ViewStatusBarContent = (props: VsBotProps & { status: Status }) => {
  switch (props.status.t) {
    case "playing": {
      switch (props.status.turn) {
        case "player-one": {
          return (
            <>
              {props.playerOne.renderIcon({ class: "h-5 w-5" })}
              <p>Turn</p>
            </>
          );
        }

        case "player-two": {
          return (
            <>
              {props.playerTwo.renderIcon({ class: "h-5 w-5" })}
              <p>Turn</p>
            </>
          );
        }
      }
    }

    default: {
      return <p>Game Over</p>;
    }
  }
};

export const ViewGameOverOverlay = (props: Props) => {
  const { gameOver } = props;

  return (
    <Transition
      id="game-over-overlay"
      mode="out-in"
      onEnter={fadeIn({ duration: 200, delay: 500 })}
      onExit={fadeOut({ duration: 200, delay: 0 })}
    >
      {gameOver?.t === "winner" && (
        <button
          class="absolute inset-0 flex flex-col items-center justify-center bg-black/70"
          onClick={props.onPlayAgain}
        >
          <div class="flex-1"></div>

          <Winner {...props} winner={gameOver.winner} />

          {props.onPlayAgain ? (
            <div class="flex flex-1 items-center justify-center pb-2 text-2xl font-bold">
              Tap to play again
            </div>
          ) : (
            <div class="flex-1"></div>
          )}
        </button>
      )}
      {gameOver?.t === "draw" && (
        <button
          class="absolute inset-0 flex flex-col items-center justify-center bg-black/60"
          onClick={props.onPlayAgain}
        >
          <div class="flex-1"></div>

          <Draw {...props} />

          {props.onPlayAgain ? (
            <div class="flex flex-1 items-center justify-center pb-2 text-2xl font-bold opacity-0">
              Tap to play again
            </div>
          ) : (
            <div class="flex-1"></div>
          )}
        </button>
      )}
    </Transition>
  );
};

const Winner = ({
  ctx,
  playerOne,
  playerTwo,
  human,
  bot,
  winner,
}: Props & { winner: PlayerType }) => {
  const humanSlot = (
    <>
      <MyAvatar class="h-16 w-16" src={ctx.profiles[human.userId]?.avatarUrl} />
    </>
  );

  const botSlot = <>{bot.renderIcon({ class: "h-16 w-16" })}</>;

  const playerOneSlot = (
    <div class="flex flex-col items-center justify-center gap-3">
      <div class="flex items-center justify-center gap-3">
        {playerOne.renderIcon({ class: "h-16 w-16" })}
        {human.player === "player-one" ? humanSlot : botSlot}
      </div>
      <p class="text-center text-4xl font-black">
        {winner === "player-one" ? "Winner" : "Loser"}
      </p>
    </div>
  );

  const playerTwoSlot = (
    <div class="flex flex-col items-center justify-center gap-3">
      <div class="flex items-center justify-center gap-3">
        {playerTwo.renderIcon({ class: "h-16 w-16" })}

        {human.player === "player-two" ? humanSlot : botSlot}
      </div>

      <p class="text-center text-4xl font-black">
        {winner === "player-two" ? "Winner" : "Loser"}
      </p>
    </div>
  );

  return (
    <div class="grid w-full flex-1 grid-cols-2 items-center">
      {playerOneSlot}
      {playerTwoSlot}
    </div>
  );
};

const Draw = ({ ctx, playerOne, playerTwo, human }: Props) => {
  const humanSlot = (
    <>
      <MyAvatar src={ctx.profiles[ctx.currentUserId]?.avatarUrl} />
    </>
  );

  const botSlot = (
    <>
      <IconRobot class="h-6 w-6" />
    </>
  );

  const playerOneSlot = (
    <>
      {playerOne.renderIcon({ class: "h-5 w-5" })}
      {human.player === "player-one" ? humanSlot : botSlot}
    </>
  );

  const playerTwoSlot = (
    <>
      {playerTwo.renderIcon({ class: "h-5 w-5" })}
      {human.player === "player-two" ? humanSlot : botSlot}
    </>
  );

  return (
    <div class="flex h-full w-full flex-1 items-center justify-center">
      <div>
        {playerOneSlot}
        {playerTwoSlot}
      </div>
      <p>Tie</p>
    </div>
  );
};

export const VsBotPlayerSection = ({
  ctx,
  human,
  bot,
  playerOne,
  playerTwo,
  turn,
}: VsBotGameProps) => {
  const humanSlot = (
    <>
      <MyAvatar class="h-6 w-6 " src={ctx.profiles[human.userId]?.avatarUrl} />
      <p class="overflow-hidden text-ellipsis whitespace-nowrap">
        {ctx.profiles[human.userId]?.username}
      </p>
    </>
  );

  const botSlot = (
    <>
      {bot.renderIcon({ class: "h-6 w-6 flex-shrink-0" })}
      <p class="overflow-hidden text-ellipsis whitespace-nowrap">{bot.label}</p>
    </>
  );

  return (
    <section class="flex w-full items-center gap-3 px-3">
      <div class="flex w-1/2 items-center justify-center overflow-hidden">
        <Slot active={turn === "player-one"}>
          <div>{playerOne.renderIcon({ class: "h-6 w-6" })}</div>
          {human.player === "player-one" ? humanSlot : botSlot}
        </Slot>
      </div>

      <div class="flex w-1/2 items-center justify-center overflow-hidden">
        <Slot active={turn === "player-two"}>
          {playerTwo.renderIcon({ class: "h-6 w-6" })}
          {human.player === "player-two" ? humanSlot : botSlot}
        </Slot>
      </div>
    </section>
  );
};

const Slot = ({
  active,
  children,
}: {
  active: boolean;
  children: VDomChildren;
}) => {
  return (
    <div
      className={cn(
        "flex flex-1 items-center gap-2 rounded-md border border-b-2 border-neutral-600 bg-neutral-900 p-2 text-sm transition-colors duration-200 ease-in-out max-w-full",
        active && "border-b-blue-500"
      )}
    >
      {children}
    </div>
  );
};

//
//
//
//
//
//
//
//

const fadeIn =
  ({ duration, delay }: { delay: number; duration: number }) =>
  async (node: HTMLElement) => {
    await node.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: duration,
      delay: delay,
      easing: "ease-in-out",
      fill: "both",
    }).finished;
  };

const fadeOut =
  ({ duration, delay }: { delay: number; duration: number }) =>
  async (node: HTMLElement) => {
    await node.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: duration,
      delay: delay,
      easing: "ease-in-out",
      fill: "both",
    }).finished;
  };
