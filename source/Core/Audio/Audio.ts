// import Howler from "howler"
import * as Cmd from "../Cmd"
import { pipe } from "../pipe"
import * as Result from "../Result"
import * as Task from "../Task"
import { Unit } from "../Utility"

export type Problem = "Unknown"

export type PlayResult = Result.Result<Problem, Unit>

export const play = <msg>(src: string, mapper: (result: PlayResult) => msg) =>
  pipe(playTask(src), Cmd.perform(mapper))

const playTask =
  (src: string): Task.Task<PlayResult> =>
    async () => {
      // const sound = new Howler.Howl({
      //   src: [src],
      //   html5: true,
      //   onplayerror: () => {
      //     sound.once("unlock", () => {
      //       if (document.hasFocus()) {
      //         sound.play()
      //       }
      //     })
      //   },
      // })

      // if (document.hasFocus()) {
      //   sound.play()
      // }

      return Result.Ok(Unit)
    }
