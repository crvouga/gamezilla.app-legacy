import { SpaceViewCtx } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED";
import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import {
  IconRobot,
  MyAvatar,
  Transition,
  VDom,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { PlayerType, VsBotProps } from "../vs-bot";

//
//
//
//
//
//

export type Model = null;

export function init(_gameOver?: GameOver | null): Model {
  return null;
}

export type Msg = {
  t: null;
};

export const update = (model: Model, _msg: Msg): Model => {
  return model;
};

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

export const ViewGameOverOverlay = (props: Props) => {
  const { gameOver } = props;

  return (
    <Transition
      id="game-over-overlay"
      mode="out-in"
      onEnter={fadeIn}
      onExit={fadeOut}>
      {gameOver?.t === "winner" && (
        <button
          class="absolute inset-0 flex flex-col items-center justify-center bg-black/70"
          onClick={props.onPlayAgain}>
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
          onClick={props.onPlayAgain}>
          
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

const fadeIn = async (node: HTMLElement) => {
  await node.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: 200,
    delay: 500,
    easing: "ease-in-out",
    fill: "both",
  }).finished;
};

const fadeOut = async (node: HTMLElement) => {
  await node.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: 200,
    delay: 0,
    easing: "ease-in-out",
    fill: "both",
  }).finished;
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
