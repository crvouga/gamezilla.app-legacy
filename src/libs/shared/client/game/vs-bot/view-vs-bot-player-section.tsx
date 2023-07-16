import { UserId } from "@gamezilla/shared/app";
import { MyAvatar, VDom } from "@gamezilla/ui";
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
      <p className="text-sm">{ctx.profiles[human.userId]?.username}</p>
    </>
  );

  const botSlot = (
    <>
      {bot.renderIcon({ className: "h-6 w-6" })}
      <p className="text-sm">{bot.label}</p>
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

const Slot = ({ children }: { children: VDom }) => {
  return (
    <div className="col-span-3 flex items-center gap-2 rounded-md border border-neutral-600 p-2">
      {children}
    </div>
  );
};
