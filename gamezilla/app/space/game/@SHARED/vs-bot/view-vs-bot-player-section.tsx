import { UserId } from "gamezilla/app/@SHARED/data";
import { MyAvatar, VDom } from "gamezilla/app/@SHARED/ui";
import { PlayerType, VsBotProps } from "./view-vs-bot";

export const VsBotPlayerSection = ({
  ctx,
  human,
  bot,
  playerOne,
  playerTwo,
}: VsBotProps & {
  human: {
    userId: UserId;
    player: PlayerType;
  };
}) => {
  const humanSlot = (
    <>
      <MyAvatar
        className="h-6 w-6"
        src={ctx.profiles[human.userId]?.avatarUrl}
      />

      <p className="text-ellipsis whitespace-nowrap text-sm">
        {ctx.profiles[human.userId]?.username}
      </p>
    </>
  );

  const botSlot = (
    <>
      {bot.renderIcon({ className: "h-6 w-6" })}
      <p className="text-ellipsis whitespace-nowrap text-sm">{bot.label}</p>
    </>
  );

  const playerOneSlot = (
    <Slot>
      {playerOne.renderIcon({ className: "h-6 w-6" })}
      {human.player === "player-one" ? humanSlot : botSlot}
    </Slot>
  );

  const playerTwoSlot = (
    <Slot>
      {playerTwo.renderIcon({ className: "h-6 w-6" })}
      {human.player === "player-two" ? humanSlot : botSlot}
    </Slot>
  );

  return (
    <section className="grid w-full grid-cols-7 gap-2 p-4">
      {playerOneSlot}
      <p className="flex items-center justify-center text-2xl font-black uppercase">
        vs
      </p>
      {playerTwoSlot}
    </section>
  );
};

const Slot = ({ children }: { children: VDom | VDom[] }) => {
  return (
    <div className="col-span-3 flex items-center gap-2 rounded-md border border-neutral-600 p-2">
      {children}
    </div>
  );
};
