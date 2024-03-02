import { UserId } from "gamezilla/@CHILD/app/@SHARED/data"
import {
  IconArrowLeftOnRect,
  IconQuestionMark,
  Avatar,
  Button,
} from "gamezilla/@CHILD/app/@SHARED/ui"
import { SpaceClientCtx } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space"
import { ViewGameHeader } from "../game/view-game-header"
import { VDom } from "gamezilla/@SHARED/vdom"

type IconProps = { className: string }

type PlayerProp = {
  label: string
  userId: UserId | null
  onStartPlaying: () => void
  onStopPlaying: () => void
  renderIcon: (props: IconProps) => VDom
}

const VersusSection = ({
  playerOne,
  playerTwo,
  ctx,
}: {
  playerOne: PlayerProp
  playerTwo: PlayerProp
  ctx: SpaceClientCtx
}) => {
  return (
    <div className="flex w-full flex-col gap-2 p-4">
      <div className="grid w-full grid-cols-7">
        <PlayerIcons player={playerOne} ctx={ctx} />

        <div className="col-span-1">
          <p className=" flex h-full flex-1 flex-col items-center justify-center  text-3xl font-black">
            VS
          </p>
        </div>

        <PlayerIcons player={playerTwo} ctx={ctx} />
      </div>

      <div className="grid w-full grid-cols-7">
        <PlayerLabels player={playerOne} ctx={ctx} />

        <div className="col-span-1"></div>

        <PlayerLabels player={playerTwo} ctx={ctx} />
      </div>

      <div className="mt-2 grid w-full grid-cols-7">
        <PlayerButtons player={playerOne} ctx={ctx} />

        <div className="col-span-1"></div>

        <PlayerButtons player={playerTwo} ctx={ctx} />
      </div>
    </div>
  )
}

export const VsUserSetup = {
  VersusSection,
}

const PlayerButtons = ({
  player,
  ctx,
}: {
  ctx: SpaceClientCtx
  player: PlayerProp
}) => {
  return (
    <div className="col-span-3 w-full">
      {player.userId && player.userId === ctx.currentUserId && (
        <Button
          key="toggle-play-button"
          className="w-full"
          variant="text"
          color="primary"
          onClick={player.onStopPlaying}
          text="Stop Playing"
        />
      )}

      {!player.userId && (
        <Button
          key="toggle-play-button"
          className="w-full"
          variant="contained"
          color="primary"
          onClick={player.onStartPlaying}
          text="Start Playing"
        />
      )}
    </div>
  )
}

const PlayerIcons = ({
  player,
  ctx,
}: {
  ctx: SpaceClientCtx
  player: PlayerProp
}) => {
  return (
    <div
      className="col-span-3 grid w-full cursor-pointer grid-cols-2 place-items-center text-center"
      onClick={
        player.userId === ctx.currentUserId
          ? player.onStopPlaying
          : player.onStartPlaying
      }
    >
      {player.userId ? (
        <Avatar
          className="h-14 w-14"
          src={ctx.profiles[player.userId]?.avatarUrl}
          alt=""
        />
      ) : (
        <div
          role="button"
          className="grid h-14 w-14 place-items-center overflow-hidden rounded-full bg-neutral-600"
        >
          <IconQuestionMark className="h-10 w-10 text-neutral-300" />
        </div>
      )}

      {player.renderIcon({ className: "h-14 w-14" })}
    </div>
  )
}

const PlayerLabels = ({
  player,
  ctx,
}: {
  ctx: SpaceClientCtx
  player: PlayerProp
}) => {
  return (
    <div className="col-span-3 grid w-full grid-cols-2 place-items-center text-center text-sm text-secondary">
      <p className="w-full overflow-hidden text-ellipsis whitespace-nowrap text-center">
        {player.userId ? ctx.profiles[player.userId]?.username ?? "..." : "?"}
      </p>

      <p className="w-full overflow-hidden text-ellipsis whitespace-nowrap text-center">
        {player.label}
      </p>
    </div>
  )
}

export const VsUserSetupScreen = ({
  playerOne,
  playerTwo,
  ctx,
  title,
  renderCoverArt,
  onStartGame,
  onQuit,
  canStartGame = Boolean(playerOne.userId && playerTwo.userId),
}: {
  ctx: SpaceClientCtx
  title: string
  renderCoverArt: (props: { className: string }) => VDom
  playerOne: PlayerProp
  playerTwo: PlayerProp
  onStartGame: () => void
  onQuit: () => void
  canStartGame?: boolean
}) => {
  return (
    <div className="flex h-full w-full flex-1 flex-col overflow-hidden">
      <div className="flex w-full flex-1 flex-col overflow-y-scroll">
        <ViewGameHeader title={title} renderCoverArt={renderCoverArt} />

        <VersusSection playerOne={playerOne} playerTwo={playerTwo} ctx={ctx} />
      </div>

      {ctx.currentUserId === ctx.space.hostId && (
        <div className="flex w-full items-center gap-4 border-t border-neutral-600 p-4">
          <Button
            variant="contained"
            color="default"
            className="flex-1"
            onClick={onQuit}
            start={<IconArrowLeftOnRect className="h-6 w-6" />}
            text="Exit"
          />

          <Button
            disabled={!canStartGame}
            variant="contained"
            color="primary"
            className="flex-1"
            onClick={onStartGame}
            text="Start Game"
          />
        </div>
      )}
    </div>
  )
}
