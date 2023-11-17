import { Eff, Transition } from "gamezilla/@SHARED/core";
import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { IconRobot, MyAvatar, VDom } from "gamezilla/@CHILD/app/@SHARED/ui";
import { SpaceViewCtx } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED";
import { PlayerType } from "./view-vs-bot";

//
//
//
//
//
//

const toOverlayId = (gameOver: GameOver): string =>
  gameOver.t === null ? "not-game-over" : "game-over";

const PLAY_AGAIN_ID = "play-again";

const overlayConfig = Transition.config<GameOver>({
  toId: toOverlayId,
  enter: async (val) => {
    const playAgainNode = await Transition.waitForElementById(PLAY_AGAIN_ID);
    if (playAgainNode) {
      playAgainNode.style.opacity = "0";
    }
    await fadeIn(toOverlayId(val), 600);
    await fadeIn(PLAY_AGAIN_ID, 600);
  },
  exit: async (val) => {
    await fadeOut(toOverlayId(val));
    await fadeOut(PLAY_AGAIN_ID);
  },
});

async function fadeIn(id: string, delay: number = 0) {
  const node = await Transition.waitForElementById(id);

  await node?.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: 200,
    delay,
    easing: "ease-in-out",
    fill: "both",
  }).finished;
}

async function fadeOut(id: string) {
  const node = await Transition.waitForElementById(id);
  await node?.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: 200,
    easing: "ease-in-out",
    fill: "both",
  }).finished;
}

//
//
//
//
//
//

export type Model = {
  gameOverOverlay: Transition.Model<GameOver>;
};

export function init(gameOver?: GameOver | null): Model {
  return {
    gameOverOverlay: Transition.init(
      overlayConfig.toId,
      gameOver ? [gameOver] : []
    ),
  };
}

export type Msg = {
  t: "overlay";
  c: Transition.Msg;
};

export const update = (model: Model, msg: Msg): Model => {
  const overlay = Transition.update(model?.gameOverOverlay, msg.c);

  return { gameOverOverlay: overlay };
};

export const watch = (
  model: Model,
  gameOver?: GameOver
): { model: Model; eff: Eff<Msg> } => {
  const overlay = Transition.watch(
    overlayConfig,
    model.gameOverOverlay,
    gameOver ? [gameOver] : undefined
  );
  return {
    model: { gameOverOverlay: overlay.model },
    eff: Eff.t("overlay", overlay.eff),
  };
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

export const ViewGameOverOverlay = (props: Props) => {
  const { model } = props;

  return (
    <>
      {model?.gameOverOverlay.map(({ item: gameOver }) => {
        return (
          <div
            id={String(overlayConfig.toId(gameOver))}
            key={String(overlayConfig.toId(gameOver))}
            onClick={props.onPlayAgain}>
            {gameOver?.t === "winner" && (
              <div class="absolute inset-0 flex cursor-pointer flex-col justify-center bg-black/60">
                <div class="flex-1"></div>
                <Winner {...props} winner={gameOver.winner} />
                {props.onPlayAgain ? (
                  <div
                    class="flex flex-1 items-center justify-center pb-2 text-2xl font-bold opacity-0"
                    id={PLAY_AGAIN_ID}>
                    Tap to play again
                  </div>
                ) : (
                  <div class="flex-1"></div>
                )}
              </div>
            )}
            {gameOver?.t === "draw" && (
              <div class="absolute inset-0 cursor-pointer bg-black/60">
                <div class="flex-1"></div>
                <Draw {...props} />
                {props.onPlayAgain ? (
                  <div
                    class="flex flex-1 items-center justify-center pb-2 text-2xl font-bold opacity-0"
                    id={PLAY_AGAIN_ID}>
                    Tap to play again
                  </div>
                ) : (
                  <div class="flex-1"></div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </>
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
