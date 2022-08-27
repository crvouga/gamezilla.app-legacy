import { pipe } from "../pipe"
import * as Result from "../Result"
import * as Task from "../Task"
import * as Cmd from "../Cmd"
import { Unit } from "../Utility"
import Howler from "howler"

export type Problem = "Unknown"

export type PlayResult = Result.Result<Problem, Unit>

export const play = <msg>(src: string, mapper: (result: PlayResult) => msg) =>
  pipe(
    playTask(src),
    Cmd.perform((result) => mapper(result)),
  )

const playTask =
  (src: string): Task.Task<PlayResult> =>
  async () => {
    const sound = new Howler.Howl({
      src: [src],
      html5: true,
      onplayerror: () => {
        sound.once("unlock", () => {
          sound.play()
        })
      },
    })

    sound.play()

    return Result.Ok(Unit)
  }
