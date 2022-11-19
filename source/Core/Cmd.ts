import { p } from "./pipe"
import { Task } from "./Task"

export type Cmd<Msg = never> = ($d: (msg: Msg) => void) => void

const of = <Msg>(msg: Msg): Cmd<Msg> => {
  return ($d) => {
    $d(msg)
  }
}

const map =
  <A, B>(mapper: (a: A) => B) =>
    (cmd: Cmd<A>): Cmd<B> => {
      return ($d) => {
        cmd((a) => {
          $d(mapper(a))
        })
      }
    }


const chain =
  <A, B>(mapper: (a: A) => Cmd<B>) =>
    (cmd: Cmd<A>): Cmd<B> => {
      return ($d) => {
        cmd((a) => {
          mapper(a)(b => {
            $d(b)
          })
        })
      }
    }

const tag = <Tag extends string, Msg>(tagName: Tag, cmd: Cmd<Msg>): Cmd<[Tag, Msg]> => {
  return p(cmd, map(msg => [tagName, msg]))
}

const batch = <Msg>(cmdList: Cmd<Msg>[]): Cmd<Msg> => {
  return ($d) => {
    for (const cmd of cmdList) {
      cmd($d)
    }
  }
}

const None: Cmd = () => { }

const perform =
  <A, Msg>(f: (a: A) => Msg) =>
    (task: Task<A>): Cmd<Msg> => {
      return async ($d) => {
        const value = await task()

        $d(f(value))
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