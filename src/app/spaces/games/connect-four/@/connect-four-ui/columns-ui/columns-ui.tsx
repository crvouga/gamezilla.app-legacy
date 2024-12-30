import { Eff } from '~/@/program/eff'
import { COLUMN_COUNT, type Columns, MAX_COLUMN_HEIGHT, type Win, findWins, winToId } from '../../connect-four'
import './columns-element'
import { ViewColumnsCanvas } from './columns-ui-canvas'
import { ViewColumnsSvg } from './columns-ui-svg'
import { type Disc, type Model as SharedModel, type ViewColumnsinput, toDiscs } from './shared'
import { easeAttrs } from '~/@/animation'
import { Transition } from '~/@/transition'

const discEnter = async (disc: Disc) => {
  const { y, id } = disc

  const node = await Transition.waitForElementById(id, rootId)

  if (!node) {
    return
  }
  await easeAttrs(node, {
    cy: {
      from: MAX_COLUMN_HEIGHT + 1,
      to: y,
      duration: 200 + 300 * (1 - y / MAX_COLUMN_HEIGHT),
      easing: {
        type: 'ease-out-quint'
      }
    }
  })
}

const discExit = async (disc: Disc) => {
  const { x, y, id } = disc

  const node = await Transition.waitForElementById(id, rootId)

  if (!node) {
    return
  }

  await easeAttrs(node, {
    cy: {
      from: y,
      to: y - MAX_COLUMN_HEIGHT,
      duration: 750,
      easing: {
        type: 'ease-in-back'
      },
      delay: (x / COLUMN_COUNT) * 500
    }
  })
}

const draw = async (win: Win) => {
  const id = winToId(win)

  const node = await Transition.waitForElementById(id, rootId)

  if (!(node instanceof SVGRectElement)) {
    return
  }

  const length = node.getTotalLength()
  node.style.strokeDasharray = length.toString()
  node.style.strokeDashoffset = length.toString()
  node.style.stroke = '#fff'

  const animation = node.animate(
    [
      {
        strokeDashoffset: length
      },
      {
        strokeDashoffset: 0
      }
    ],
    {
      duration: 500,
      easing: 'ease-in-out',
      fill: 'both'
    }
  )

  await animation.finished
}

const undraw = async (win: Win) => {
  const id = winToId(win)

  const node = await Transition.waitForElementById(id, rootId)

  if (!(node instanceof SVGRectElement)) {
    return
  }

  const length = node.getTotalLength()
  node.style.strokeDasharray = length.toString()
  node.style.strokeDashoffset = '0'

  const animation = node.animate(
    [
      {
        strokeDashoffset: 0
      },
      {
        strokeDashoffset: length
      }
    ],
    {
      duration: 500,
      easing: 'ease-in-out',
      fill: 'both'
    }
  )

  await animation.finished
}

export type Model = SharedModel

//
//
//
//
//

const discsConfig = Transition.config<Disc>({
  toId: (disc) => disc.id,
  enter: discEnter,
  exit: discExit
})

const winsConfig = Transition.config<Win>({
  toId: winToId,
  enter: draw,
  exit: undraw
})

const rootId = 'connect-four-columns-svg'

//
//
//
//
//
//

export const init = (columns?: Columns): Model => {
  return {
    discs: Transition.init(discsConfig.toId, columns ? toDiscs(columns) : []),
    wins: Transition.init(winsConfig.toId, columns ? findWins(columns) : [])
  }
}

//
//
//
//
//
//
//

export type Msg = { t: 'discs'; c: Transition.Msg } | { t: 'wins'; c: Transition.Msg }

export const watch = (model: Model, columns?: Columns) => {
  const discs = Transition.watch<Disc>(discsConfig, model.discs, columns ? toDiscs(columns) : undefined)
  const wins = Transition.watch<Win>(winsConfig, model.wins, columns ? findWins(columns) : undefined)
  return {
    model: {
      discs: discs.model,
      wins: wins.model
    },
    eff: Eff.batch<Msg>([Eff.tag('discs', discs.eff), Eff.tag('wins', wins.eff)])
  }
}

export const update = (model: Model, msg: Msg) => {
  const discs = Transition.update<Disc>(model.discs, msg.t === 'discs' ? msg.c : undefined)
  const wins = Transition.update<Win>(model.wins, msg.t === 'wins' ? msg.c : undefined)
  return {
    discs: discs,
    wins: wins
  }
}

//
//
//
//
//
//
//

export const View = ({
  implementation = 'svg',
  ...input
}: ViewColumnsinput & {
  implementation?: 'svg' | 'canvas'
}) => {
  switch (implementation) {
    case 'canvas': {
      return <ViewColumnsCanvas {...input} />
    }

    case 'svg': {
      return <ViewColumnsSvg id={rootId} {...input} />
    }
  }
}

//
//
//
//
//
//
//
//
