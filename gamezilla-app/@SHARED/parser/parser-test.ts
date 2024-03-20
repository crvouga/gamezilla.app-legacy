import { or } from "./or"
import { Infer } from "./parser"
import { p } from "./parser-impl-zod"

const Msg = or(
  p.obj({
    t: p.l("a"),
    foo: p.str,
  }),
  p.obj({
    t: p.l("b"),
    bar: p.num,
  }),
  p.obj({
    t: p.l("c"),
    baz: p.arr(p.str),
  }),
  p.obj({
    t: p.l("d"),
    qux: p.maybe(p.str),
  }),
  p.obj({
    t: p.l("e"),
  }),
  p.obj({
    t: p.l("f"),
  }),
  p.obj({
    t: p.l("g"),
  }),
  p.obj({
    t: p.l("h"),
  }),
  p.obj({
    t: p.l("i"),
  }),
  p.obj({
    t: p.l("j"),
  }),
  p.obj({
    t: p.l("k"),
  }),
  p.obj({
    t: p.l("l"),
  }),
  p.obj({
    t: p.l("m"),
  }),
  p.obj({
    t: p.l("n"),
  }),
  p.obj({
    t: p.l("o"),
  }),
  p.obj({
    t: p.l("p"),
  }),
  p.obj({
    t: p.l("q"),
  }),
  p.obj({
    t: p.l("r"),
  }),
  p.obj({
    t: p.l("s"),
  }),
  p.obj({
    t: p.l("t"),
  }),
  p.obj({
    t: p.l("u"),
  }),
  p.obj({
    t: p.l("v"),
  }),
  p.obj({
    t: p.l("w"),
  }),
  p.obj({
    t: p.l("x"),
  }),
)

type Msg = Infer<typeof Msg>

const x = {
  t: "a",
  x: "y",
}
const parsed = Msg.parse(x)

if (parsed.t == "ok") {
  switch (parsed.value.t) {
    case "a": {
      console.log("a")
      parsed.value.foo
      break
    }
    case "b": {
      console.log("b")
      break
    }
    case "d": {
      break
    }
  }
}
