import { SpaceClientCtx } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space"
import {
  Button,
  IconArrowLeftOnRect,
  IconRobot,
  IconUsers,
} from "gamezilla/@CHILD/app/@SHARED/ui"
import { ViewGameHeader } from "./view-game-header"
import { ViewUsersInSpaceList } from "./view-users-in-space-list"
import { UserId } from "gamezilla/@CHILD/app/@SHARED/data"
import {
  SpaceClientCmd,
  SpaceClientCmdTypes,
  exitGame,
  openUserDetails,
} from "../../../../@SHARED/space-client-cmd"
import { VDom } from "gamezilla/@SHARED/vdom"

//
//
//
//
//
//

export type Msg =
  | {
      t: "game-main-menu/clicked-open-user-details-button"
      userId: UserId
    }
  | {
      t: "game-main-menu/clicked-exit-game-button"
    }

export const update = <TModel, TMsg, T extends SpaceClientCmdTypes>({
  msg,
  model,
}: {
  model: TModel
  msg?: Msg | TMsg | null
}): {
  model: TModel
  msgCmd: SpaceClientCmd<T>[]
} => {
  if (typeof msg !== "object" || !msg || !("t" in msg)) {
    return { model, msgCmd: [] }
  }

  switch (msg?.t) {
    case "game-main-menu/clicked-exit-game-button": {
      return { model, msgCmd: [exitGame()] }
    }

    case "game-main-menu/clicked-open-user-details-button": {
      return { model, msgCmd: [openUserDetails(msg.userId)] }
    }

    default: {
      return { model, msgCmd: [] }
    }
  }
}

//
//
//
//
//
//

type MainMenuButton = {
  renderIcon: (input: { className: string }) => VDom
  title: string
  description: string
  onClick: () => void
}

export const View = ({
  title,
  renderCoverArt,
  buttons,
  ctx,
  dispatch,
}: {
  ctx: SpaceClientCtx
  title: string
  dispatch: (msg: Msg) => void
  renderCoverArt: (props: { className: string }) => VDom
  buttons: MainMenuButton[]
}) => {
  if (ctx.currentUserId !== ctx.space.hostId) {
    return (
      <div className="flex h-full w-full flex-col">
        <ViewGameHeader title={title} renderCoverArt={renderCoverArt} />
        <ViewUsersInSpaceList
          onOpenUserDetails={(userId) =>
            dispatch({
              t: "game-main-menu/clicked-open-user-details-button",
              userId,
            })
          }
          ctx={ctx}
        />
      </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-col overflow-y-hidden">
      <div className="flex w-full flex-1 flex-col items-center overflow-y-scroll">
        <ViewGameHeader title={title} renderCoverArt={renderCoverArt} />

        <div className="flex w-full flex-col p-4">
          {buttons.map(({ renderIcon, title, description, onClick }, index) => (
            <button
              className="mb-6 flex w-full items-center rounded-lg bg-neutral-800 p-6 active:opacity-70"
              onClick={onClick}
              key={`${index} ${title}`}
            >
              {renderIcon({
                className: "aspect-square w-12 h-12 mr-4",
              })}
              <div className="flex-1 text-left">
                <p className="text-2xl font-bold">{title}</p>

                {description && (
                  <p className="text-sm text-secondary">{description}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-center border-t border-neutral-600 p-4">
        <Button
          onClick={() =>
            dispatch({ t: "game-main-menu/clicked-exit-game-button" })
          }
          className="w-full"
          start={<IconArrowLeftOnRect className="h-6 w-6" />}
          text="Exit"
        />
      </div>
    </div>
  )
}

export const buttons = {
  playFriend: (input: { onClick: () => void }): MainMenuButton => {
    return {
      ...input,
      renderIcon: (props) => <IconUsers {...props} />,
      title: "Play Friend",
      description: "Play against people in your space",
    }
  },

  playComputer: (input: { onClick: () => void }): MainMenuButton => {
    return {
      ...input,
      renderIcon: (props) => <IconRobot {...props} />,
      title: "Play Computer",
      description: "Play against a computer",
    }
  },
}
