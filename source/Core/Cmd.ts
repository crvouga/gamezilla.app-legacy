import * as Task from "./Task"

export type Cmd<Msg> = (dispatch: (msg: Msg) => void) => void

export const of = <Msg>(msg: Msg): Cmd<Msg> => {
  return (dispatch) => {
    dispatch(msg)
  }
}



export const map =
  <A, B>(mapper: (a: A) => B) =>
    (cmd: Cmd<A>): Cmd<B> => {
      return (dispatch) => {
        cmd((a) => {
          dispatch(mapper(a))
        })
      }
    }

export const batch = <Msg>(cmdList: Cmd<Msg>[]): Cmd<Msg> => {
  return (dispatch) => {
    for (const cmd of cmdList) {
      cmd(dispatch)
    }
  }
}

export const None: Cmd<never> = () => { }

export const perform =
  <A, Msg>(f: (a: A) => Msg) =>
    (task: Task.Task<A>): Cmd<Msg> => {
      return async (dispatch) => {
        const value = await task()

        dispatch(f(value))
      }
    }
