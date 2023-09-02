import { Eff, Transition } from "gamezilla/@SHARED/core";
import { UserId } from "gamezilla/app/@SHARED/data";
import { IconRobot, MyAvatar, VDom } from "gamezilla/app/@SHARED/ui";
import { SpaceViewCtx } from "gamezilla/app/space/@SHARED";
import { PlayerType } from "./view-vs-bot";

//
//
//
//
//
//

const toOverlayId = (gameOver: GameOver): string =>
  gameOver.t === null ? "not-game-over" : "game-over";

const overlayConfig = Transition.config<GameOver>({
  toId: toOverlayId,
  enter: (val) => fadeIn(toOverlayId(val)),
  exit: (val) => fadeOut(toOverlayId(val)),
});

async function fadeIn(id: string) {
  const node = await Transition.waitForElementById(id);

  await node?.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: 200,
    delay: 600,
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
    renderIcon: (props: { className: string }) => VDom;
  };
  playerOne: {
    renderIcon: (props: { className: string }) => VDom;
  };
  playerTwo: {
    renderIcon: (props: { className: string }) => VDom;
  };
};

export const ViewGameOverOverlay = (props: Props) => {
  const { model } = props;

  return (
    <>
      {model?.gameOverOverlay.map(({ item: gameOver }) => {
        return (
          <div
            id={String(overlayConfig.toId(gameOver))}
            key={String(overlayConfig.toId(gameOver))}>
            {gameOver?.t === "winner" && (
              <div className="absolute inset-0 bg-black/60">
                <Winner {...props} winner={gameOver.winner} />
              </div>
            )}
            {gameOver?.t === "draw" && (
              <div className="absolute inset-0 bg-black/60">
                <Draw {...props} />
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
      <MyAvatar
        className="h-16 w-16"
        src={ctx.profiles[human.userId]?.avatarUrl}
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
      <IconRobot className="h-6 w-6" />
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
