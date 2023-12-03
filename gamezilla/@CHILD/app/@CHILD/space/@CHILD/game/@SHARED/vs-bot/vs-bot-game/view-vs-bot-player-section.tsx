import { MyAvatar, VDomChildren, cn } from "gamezilla/@CHILD/app/@SHARED/ui";
import { VsBotGameProps } from "./vs-bot-game";

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
    <section class="flex w-full items-center">
      <Slot active={turn === "player-one"}>
        <div>{playerOne.renderIcon({ class: "h-6 w-6" })}</div>
        {human.player === "player-one" ? humanSlot : botSlot}
      </Slot>
      <Slot active={turn === "player-two"}>
        {playerTwo.renderIcon({ class: "h-6 w-6" })}
        {human.player === "player-two" ? humanSlot : botSlot}
      </Slot>
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
    <div class="w-1/2 p-2">
      <div
        className={cn(
          "flex items-center gap-2 rounded-md border border-neutral-600 bg-neutral-900 p-2 text-sm border-b-2 transition-colors duration-200 ease-in-out",
          active && "border-b-blue-500"
        )}
      >
        {children}
      </div>
    </div>
  );
};
