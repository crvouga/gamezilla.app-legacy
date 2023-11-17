import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { MyAvatar, VDom, VDomChildren } from "gamezilla/@CHILD/app/@SHARED/ui";
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
    <section class="flex w-full items-center">
      <Slot>
        <div>{playerOne.renderIcon({ class: "h-6 w-6" })}</div>
        {human.player === "player-one" ? humanSlot : botSlot}
      </Slot>
      <Slot>
        {playerTwo.renderIcon({ class: "h-6 w-6" })}
        {human.player === "player-two" ? humanSlot : botSlot}
      </Slot>
    </section>
  );
};

const Slot = ({ children }: { children: VDomChildren }) => {
  return (
    <div class="w-1/2 p-2">
      <div class="flex items-center gap-2 rounded-md border border-neutral-600 bg-neutral-900 p-2 text-sm">
        {children}
      </div>
    </div>
  );
};
