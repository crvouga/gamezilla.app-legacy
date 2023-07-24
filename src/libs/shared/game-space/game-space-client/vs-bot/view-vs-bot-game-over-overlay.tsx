import { UserId } from "@gamezilla/shared/app";
import { IconRobot, MyAvatar, VDom } from "@gamezilla/ui";
import { Transition, TransitionGroup } from "react-transition-group";
import { GameSpaceViewCtx } from "../game-space-client";
import { PlayerType } from "./view-vs-bot";

type GameOver =
  | {
      t: "winner";
      winner: PlayerType;
    }
  | {
      t: "draw";
    };

type Props = {
  ctx: GameSpaceViewCtx;

  gameOver: GameOver | null;
  human: {
    userId: UserId;
    player: PlayerType;
  };
  bot: {
    label: string;
    renderIcon: (props: { className: string }) => VDom;
  };
  playerOne: {
    renderIcon: (props: { className: string }) => VDom;
  };
  playerTwo: {
    renderIcon: (props: { className: string }) => VDom;
  };
};

export const VsBotGameOverOverlay = (
  props: Props & { fadeInDelay?: number }
) => {
  const { gameOver } = props;

  return (
    <TransitionGroup className="pointer-events-none">
      {gameOver && (
        <Transition
          addEndListener={() => {
            //
          }}
          onEnter={fadeIn({ delay: props.fadeInDelay ?? 0 })}
          onExit={fadeOut}>
          <div className="absolute inset-0 bg-black/60">
            {gameOver.t === "winner" && (
              <Winner {...props} winner={gameOver.winner} />
            )}
            {gameOver.t === "draw" && <Draw {...props} />}
          </div>
        </Transition>
      )}
    </TransitionGroup>
  );
};

const fadeIn =
  ({ delay }: { delay: number }) =>
  (node: HTMLElement) => {
    node.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 200,
      easing: "ease-in-out",
      fill: "both",
      delay,
    });
  };

const fadeOut = (node: HTMLElement) => {
  node.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: 200,
    easing: "ease-in-out",
    fill: "both",
  });
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
      <MyAvatar
        className="h-16 w-16"
        src={ctx.profiles[ctx.currentUserId]?.avatarUrl}
      />
    </>
  );

  const botSlot = <>{bot.renderIcon({ className: "h-16 w-16" })}</>;

  const playerOneSlot = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="flex items-center justify-center gap-3">
        {playerOne.renderIcon({ className: "h-16 w-16" })}
        {human.player === "player-one" ? humanSlot : botSlot}
      </div>
      <p className="text-center text-4xl font-black">
        {winner === "player-one" ? "Winner" : "Loser"}
      </p>
    </div>
  );

  const playerTwoSlot = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="flex items-center justify-center gap-3">
        {playerTwo.renderIcon({ className: "h-16 w-16" })}

        {human.player === "player-two" ? humanSlot : botSlot}
      </div>

      <p className="text-center text-4xl font-black">
        {winner === "player-two" ? "Winner" : "Loser"}
      </p>
    </div>
  );

  return (
    <div className="grid h-full w-full grid-cols-2 items-center">
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
      <IconRobot />
    </>
  );

  const playerOneSlot = (
    <>
      {playerOne.renderIcon({ className: "h-5 w-5" })}
      {human.player === "player-one" ? humanSlot : botSlot}
    </>
  );

  const playerTwoSlot = (
    <>
      {playerTwo.renderIcon({ className: "h-5 w-5" })}
      {human.player === "player-two" ? humanSlot : botSlot}
    </>
  );

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div>
        {playerOneSlot}
        {playerTwoSlot}
      </div>
      <p>Tie</p>
    </div>
  );
};
