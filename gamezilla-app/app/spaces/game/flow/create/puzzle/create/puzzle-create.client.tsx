import {
  Posix,
  Result,
  Sub,
  Time,
  TimeSpan,
  isErr,
  isLoading,
  loading,
} from "gamezilla-app/@/core"
import {
  APP_SOUND,
  playSound,
  sendToServer,
  showCreatedSm,
  showErrSm,
} from "gamezilla-app/app/@shared/client"
import { Button, IconPlus } from "gamezilla-app/app/@shared/ui"
import { ClientModule } from "../../create.core"

const update: ClientModule["update"] = (input) => {
  const { msgSync, model, msg, ctx } = input

  switch (msg?.t) {
    case "puzzle-create.user-clicked-create-button": {
      return {
        model: {
          ...model,
          puzzleCreateRequest: loading,
          puzzleCreateRequestedAt: ctx.now,
        },
        msgCmd: [
          playSound(APP_SOUND.tap),
          sendToServer({
            t: "puzzle-create.user-clicked-create-button",
          }),
        ],
      }
    }

    case "time-passed": {
      if (
        isLoading(model.puzzleCreateRequest) &&
        TimeSpan.gte(
          Posix.diff(model.puzzleCreateRequestedAt, ctx.now),
          TimeSpan.fromSeconds(5),
        )
      ) {
        const errorMessage = "Request timed out"
        return {
          model: {
            ...model,
            puzzleCreateRequest: Result.Err(errorMessage),
          },
          msgCmd: showErrSm(errorMessage),
        }
      }
      return { model }
    }

    default: {
      break
    }
  }

  switch (msgSync?.t) {
    case "user-created-puzzle": {
      if (isErr(msgSync.created)) {
        return {
          model: { ...model, puzzleCreateRequest: msgSync.created },
          msgCmd: showErrSm(msgSync.created.error),
        }
      }

      const puzzleNew = msgSync.created.value

      return {
        model: {
          ...model,
          puzzleCreateRequest: Result.mapOk(msgSync.created, () => null),
          puzzles: { ...model.puzzles, [puzzleNew.id]: puzzleNew },
        },
        msgCmd: showCreatedSm("Puzzle created"),
      }
    }

    default: {
      break
    }
  }

  return { model }
}

const id = "puzzle-create-request"

const subscriptions: ClientModule["subscriptions"] = ({ model }) => {
  switch (model.puzzleCreateRequest.t) {
    case "loading": {
      return Time.interval(id, TimeSpan.fromSeconds(1), () => ({
        t: "time-passed",
      }))
    }
    default: {
      return Sub.None
    }
  }
}

const ViewCreateButton: ClientModule["View"] = (input) => {
  const { model, dispatch } = input

  return (
    <Button
      text="Create Puzzle"
      variant="contained"
      color="primary"
      loading={model.puzzleCreateRequest.t === "loading"}
      start={<IconPlus className="h-8 w-8" />}
      onClick={() =>
        dispatch({ t: "puzzle-create.user-clicked-create-button" })
      }
    />
  )
}

export const PuzzleCreateClient = {
  update,
  ViewCreateButton,
  subscriptions,
}
