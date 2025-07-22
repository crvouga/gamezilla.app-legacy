import { Eff } from '~/@/eff'
import { pipe } from '~/@/function/pipe'
import { KeyboardKey } from '~/@/keyboard'
import { Sub } from '~/@/sub'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Defs } from '~/@/vdom/primitives/defs'
import { G } from '~/@/vdom/primitives/g'
import { Rect } from '~/@/vdom/primitives/rect'
import { Svg } from '~/@/vdom/primitives/svg'
import { AppFrontendCtxBase } from '~/app/@/frontend/ctx'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { Maze } from './@/maze'
import { Direction, type Position } from './@/position'
import {
  type Color,
  type ModelBackend,
  type ModelFrontend,
  type MsgFrontend,
  type MsgToFrontend,
  initShared,
} from './types'

//
//
//
// Model
//
//
//

export type Model = ModelFrontend

export const init = initShared

//
//
//
// Update
//
//
//

export type Msg = MsgFrontend

export const update = (msg: Msg, model: Model): [Model, Eff<Msg>] => {
  switch (msg[0]) {
    //
    //
    //

    case 'key-up': {
      const direction = keyToDirection(msg[1])

      if (!direction) {
        return [model, Eff.None]
      }

      return [model, Eff.None]
    }

    case 'key-down': {
      const direction = keyToDirection(msg[1])

      if (!direction) {
        return [model, Eff.None]
      }

      return [model, Eff.None]
    }

    //
    //
    //

    case 'input-seed':
    case 'input-direction':
    case 'start-game':
    case 'stop-game':
    case 'stop-playing':
    case 'start-playing': {
      return [model, Eff.None]
    }
  }
}

export const updateFromBackend = (msg: MsgToFrontend, model: Model): [Model, Eff<Msg>] => {
  switch (msg[0]) {
    case 'stop-game':
    case 'input-seed':
    case 'input-direction':
    case 'start-game':
    case 'stop-playing':
    case 'start-playing': {
      if (msg[2].t === 'err') {
        return [model, Eff.None]
      }
      const merged = mergeWithBackend({
        frontendModel: model,
        backendModel: msg[2].value,
      })
      return [merged, Eff.None]
    }

    case 'tick': {
      const merged = mergeWithBackend({
        frontendModel: model,
        backendModel: msg[1],
      })
      return [merged, Eff.None]
    }
  }
}

export const mergeWithBackend = ({
  backendModel,
}: {
  frontendModel: ModelFrontend
  backendModel: ModelBackend
}): ModelFrontend => {
  return backendModel
}

const keyToDirection = (key: KeyboardKey): Direction | null => {
  switch (key) {
    case 'A':
    case 'a':
    case 'ArrowLeft':
      return 'West'

    case 'W':
    case 'w':
    case 'ArrowUp':
      return 'North'

    case 's':
    case 'S':
    case 'ArrowDown':
      return 'South'

    case 'd':
    case 'D':
    case 'ArrowRight':
      return 'East'

    default:
      return null
  }
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (input: { ctx: AppFrontendCtxBase }) => {
  return Sub.batch<Msg>([
    input.ctx.keyboard.keyDowns((key): Msg => ['key-down', key]),
    input.ctx.keyboard.keyUps((key): Msg => ['key-up', key]),
  ])
}

//
//
//
// View
//
//
//

const colorMap: { [color in Color]: string } = {
  Blue: '#0333FF',
  Green: '#02F900',
  Purple: '#992197',
  Red: '#FF2601',
  Cyan: '#02FEFF',
  Pink: '#FF40FF',
}

export const View = ({
  model,
  ctx,
  dispatch,
}: {
  ctx: SpaceFrontendCtx
  model: Model
  dispatch: (msg: Msg) => void
}) => {
  if (model.type === 'setup') {
    return h(Box, {})
  }

  const viewBox = [
    model.lower.x,
    model.lower.y,
    model.upper.x - model.lower.x + 1,
    model.upper.y - model.lower.y + 1,
  ].join(' ')

  const maze = Maze.makeMemoized(model)

  const currentUserPlayer = model.players[ctx.currentUser.userId]

  return h(Box, {}, [
    !currentUserPlayer && h(Box, {}, ['Spectating']),
    h(Svg, { width: '100%', viewBox }, [
      h(Rect, { x: model.lower.x, y: model.lower.y, width: '100%', height: '100%', fill: '#000' }),
      ...maze.edges.map(([a, b]) =>
        h(G, { key: [a.x, a.y, b.x, b.y].join('-'), 'stroke-width': '0.1', stroke: '#fff' }, [
          h('line', {
            x1: a.x + 1 / 2,
            y1: a.y + 1 / 2,
            x2: b.x + 1 / 2,
            y2: b.y + 1 / 2,
          }),
        ]),
      ),
      ...Object.values(model.players).map((player) =>
        h('circle', {
          key: player.userId,
          cx: player.position.x + 1 / 2,
          cy: player.position.y + 1 / 2,
          r: 1 / 3,
          fill: colorMap[player.color],
        }),
      ),
    ]),
    currentUserPlayer &&
      h(ViewJoystick, {
        activeDirection: pipe(currentUserPlayer.direction, (d) => (d === 'none' ? undefined : d)),
        onChange: (direction: Direction) =>
          dispatch([
            'input-direction',
            {
              direction,
              userId: ctx.currentUser.userId,
            },
          ]),
        onDone: () =>
          dispatch([
            'input-direction',
            {
              direction: 'none',
              userId: ctx.currentUser.userId,
            },
          ]),
        activeFill: '#fff',
        fill: '#000',
        stroke: '#bcbcbc',
      }),
  ])
}

const ViewJoystick = ({
  activeDirection,
  onChange,
  onDone,
  stroke,
  fill,
  activeFill,
}: {
  activeDirection?: Direction
  onChange: (direction: Direction) => void
  onDone: () => void
  stroke: string
  fill: string
  activeFill: string
}) => {
  return h(Box, {}, [
    h(Svg, { width: '100%', viewBox: '-1 -1 2 2', class: 'touch-none overflow-hidden select-none' }, [
      h(Defs, {}, [h('clipPath', { id: 'cut-off-bottom' }, [h('circle', { x: '0', y: '0', r: 1 })])]),
      h(G, { 'stroke-width': 0.025 }, [
        h(G, { 'clip-path': 'url(#cut-off-bottom)', stroke }, [
          ...Direction.all.map((direction) => {
            const { x, y } = directionToVector(direction)
            return h(Rect, {
              key: direction,
              x,
              y,
              width: 1,
              height: 1,
              fill: activeDirection === direction ? activeFill : fill,
              onTouchStart: () => onChange(direction),
              onTouchMove: () => onChange(direction),
              onTouchEnd: onDone,
              onTouchCancel: onDone,
              onAbort: onDone,
              onMouseDown: () => onChange(direction),
              onMouseOver: () => onChange(direction),
              onMouseUp: onDone,
            })
          }),
        ]),
        h('circle', {
          x: '0',
          y: '0',
          r: 0.5,
          fill,
          class: 'pointer-events-none touch-none select-none',
          stroke,
        }),
        h('circle', {
          x: '0',
          y: '0',
          r: 0.98,
          class: 'pointer-events-none touch-none select-none',
          fill: 'transparent',
          stroke,
        }),
      ]),
    ]),
  ])
}

const directionToVector = (direction: Direction): Position => {
  switch (direction) {
    case 'East':
      return {
        x: 0,
        y: -1,
      }
    case 'North':
      return {
        x: -1,
        y: -1,
      }
    case 'South':
      return {
        x: 0,
        y: 0,
      }
    case 'West':
      return {
        x: -1,
        y: 0,
      }
  }
}
