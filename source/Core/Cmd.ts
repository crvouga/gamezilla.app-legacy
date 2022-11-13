import { p } from "./pipe"
import { Task } from "./Task"

export type Cmd<Msg = never> = (dispatch: (msg: Msg) => void) => void

const of = <Msg>(msg: Msg): Cmd<Msg> => {
  return (dispatch) => {
    dispatch(msg)
  }
}

const map =
  <A, B>(mapper: (a: A) => B) =>
    (cmd: Cmd<A>): Cmd<B> => {
      return (dispatch) => {
        cmd((a) => {
          dispatch(mapper(a))
        })
      }
    }


const chain =
  <A, B>(mapper: (a: A) => Cmd<B>) =>
    (cmd: Cmd<A>): Cmd<B> => {
      return (dispatch) => {
        cmd((a) => {
          mapper(a)(b => {
            dispatch(b)
          })
        })
      }
    }

const tag = <Tag extends string, Msg>(tagName: Tag, cmd: Cmd<Msg>): Cmd<[Tag, Msg]> => {
  return p(cmd, map(msg => [tagName, msg]))
}

const batch = <Msg>(cmdList: Cmd<Msg>[]): Cmd<Msg> => {
  return (dispatch) => {
    for (const cmd of cmdList) {
      cmd(dispatch)
    }
  }
}

const None: Cmd<never> = () => { }

const perform =
  <A, Msg>(f: (a: A) => Msg) =>
    (task: Task<A>): Cmd<Msg> => {
      return async (dispatch) => {
        const value = await task()

        dispatch(f(value))
      }
    }



export const Cmd = {
  None,
  perform,
  batch,
  tag,
  chain,
  map,
  of
}