import { Chess } from 'chess.js'
import { sx } from '~/@/ui/theme/theme'
import { h } from '~/@/vdom/h'
import { Circle } from '~/@/vdom/primitives/svg/circle'
import { G } from '~/@/vdom/primitives/svg/g'
import { Path } from '~/@/vdom/primitives/svg/path'
import { Rect } from '~/@/vdom/primitives/svg/rect'
import { Svg } from '~/@/vdom/primitives/svg/svg'
import type { VDom } from '~/@/vdom/vdom'
import {
  type Color,
  type Model,
  type Piece,
  type Square,
  fenToPieces,
  positionToSquare,
  sanToSquare,
  squareToChecker,
  toLowercaseSquare,
} from '../../chess'

//
//
//
//
//
//

export type ChessboardInput = {
  id: string
  model?: Model
  'draggable-pieces'?: boolean
  onPieceDrop?: (input: { source: Square; target: Square }) => boolean
  isPieceDraggable?: (input: { piece: Piece; square: Square }) => boolean
  orientation?: Color
}

//
//
//
//
//
//

type Checker = {
  id: string
  x: number
  y: number
  color: 'white' | 'black'
}

const CHECKERS: Checker[] = []

for (let x = 0; x < 8; x++) {
  for (let y = 0; y < 8; y++) {
    const color = (x + y) % 2 === 0 ? 'white' : 'black'
    CHECKERS.push({
      id: `${x},${y}`,
      x,
      y,
      color,
    })
  }
}

//
//
//
//
//
//

const THEME = {
  lightChecker: '#f0d9b5',
  darkChecker: '#b58863',
  legalMoveDot: 'green',
}

//
//
//
//
//
//

let touched: {
  node: EventTarget & SVGSVGElement
  piece: Piece
  source: {
    x: number
    y: number
  }
} | null = null
let visibleDropZoneNode: SVGCircleElement | null = null

const instance = new Chess()

//
//
//
//
//
//

const setVisibleDropZoneNode = (node: SVGCircleElement | null) => {
  if (!node) {
    if (visibleDropZoneNode) {
      visibleDropZoneNode.setAttribute('fill', 'transparent')
    }
    visibleDropZoneNode = null
    return
  }

  if (visibleDropZoneNode && visibleDropZoneNode !== node) {
    visibleDropZoneNode.setAttribute('fill', 'transparent')
    node.setAttribute('fill', 'black')
  }
  visibleDropZoneNode = node
}

//
//
//
//
//
//
//

const SCALE = 1
const GRID_DIVISIONS = 8
const WIDTH = GRID_DIVISIONS * SCALE
const HEIGHT = GRID_DIVISIONS * SCALE
const TOUCHED_SCALED = SCALE * 2
const TOUCHED_SCALED_OFFSET = TOUCHED_SCALED * 0.5
const TOUCHED_Y_OFFSET = SCALE

//
//
//
//
//
//

const onDragStartOrMove = (input: ChessboardInput) => (e: unknown) => {
  if (e instanceof MouseEvent) {
    e.preventDefault()
  } else if (e instanceof TouchEvent) {
    e.preventDefault()
  } else {
  }

  let clientX: number
  let clientY: number

  if (e instanceof MouseEvent) {
    clientX = e.clientX
    clientY = e.clientY
  } else if (e instanceof TouchEvent && e.touches[0]) {
    clientX = e.touches[0].clientX
    clientY = e.touches[0].clientY
  } else {
    return
  }

  const target = e.currentTarget

  if (!(target instanceof SVGSVGElement)) {
    return
  }

  const rect = target.getBoundingClientRect()
  const scaleX = WIDTH / rect.width
  const scaleY = HEIGHT / rect.height

  const newX = (clientX - rect.left) * scaleX - TOUCHED_SCALED_OFFSET
  const newY = (clientY - rect.top) * scaleY - TOUCHED_SCALED_OFFSET - TOUCHED_Y_OFFSET

  if (touched) {
    touched.node.setAttribute('x', `${newX}`)
    touched.node.setAttribute('y', `${newY}`)
  }

  updateDropZoneUI(input.orientation ?? 'w')
  showSourceCheckerUI(input.orientation ?? 'w')
  setLegalMoveDotsFill(input, THEME.legalMoveDot)
}

const updateDropZoneUI = (orientation: Color) => {
  if (!touched) {
    return
  }

  const currentX = Number.parseFloat(touched.node.getAttribute('x') || '0')
  const currentY = Number.parseFloat(touched.node.getAttribute('y') || '0')

  const newX = currentX + TOUCHED_SCALED_OFFSET / 2
  const newY = currentY + TOUCHED_SCALED_OFFSET / 2 + TOUCHED_Y_OFFSET

  const stepX = WIDTH / GRID_DIVISIONS
  const stepY = HEIGHT / GRID_DIVISIONS

  const roundedX = Math.round(newX / stepX) * stepX
  const roundedY = Math.round(newY / stepY) * stepY

  const square = positionToSquare(
    {
      x: roundedX,
      y: roundedY,
    },
    orientation,
  )

  const dropzoneId = square ? toDropZoneId(square) : null

  const dropZoneNode = dropzoneId ? document.getElementById(dropzoneId) : null

  if (dropZoneNode instanceof SVGCircleElement) {
    setVisibleDropZoneNode(dropZoneNode)
  }
}

const setLegalMoveDotsFill = (input: ChessboardInput, fill: string) => {
  if (!touched) {
    return
  }
  const sourceSquare = positionToSquare(touched.source, input.orientation ?? 'w')
  if (!sourceSquare) {
    return
  }
  const legalMoves = instance.moves({
    square: toLowercaseSquare(sourceSquare),
  })
  for (const legalMove of legalMoves) {
    const square = sanToSquare(legalMove)
    const id = toLegalMoveDotId(square)
    const node = document.getElementById(id)
    if (!(node instanceof SVGCircleElement)) {
      continue
    }
    node.setAttribute('fill', fill)
  }
}

const showSourceCheckerUI = (orientation: Color) => {
  if (!touched) {
    return
  }
  const sourceSquare = positionToSquare(touched.source, orientation)
  const checkerId = sourceSquare ? toCheckerId(sourceSquare) : null
  const sourceCheckerNode = checkerId ? document.getElementById(checkerId) : null

  if (sourceCheckerNode instanceof SVGRectElement) {
    sourceCheckerNode.setAttribute('fill', 'yellow')
    return
  }
}

const hideSourceCheckerUI = (orientation: Color) => {
  if (!touched) {
    return
  }
  const sourceSquare = positionToSquare(touched.source, orientation)

  const checkerId = sourceSquare ? toCheckerId(sourceSquare) : null
  const sourceCheckerNode = checkerId ? document.getElementById(checkerId) : null
  const sourceCheckerColor = sourceSquare ? squareToChecker(sourceSquare) : null
  if (sourceCheckerColor && sourceCheckerNode instanceof SVGRectElement) {
    sourceCheckerNode.setAttribute('fill', sourceCheckerColor === 'Light' ? THEME.lightChecker : THEME.darkChecker)
    return
  }
}

const onDragEnd = (input: ChessboardInput) => (_e: unknown) => {
  if (!touched) {
    return
  }

  const currentX = Number.parseFloat(touched.node.getAttribute('x') || '0')
  const currentY = Number.parseFloat(touched.node.getAttribute('y') || '0')

  const newX = currentX + TOUCHED_SCALED_OFFSET / 2
  const newY = currentY + TOUCHED_SCALED_OFFSET / 2 + TOUCHED_Y_OFFSET

  const stepX = WIDTH / GRID_DIVISIONS
  const stepY = HEIGHT / GRID_DIVISIONS

  const roundedX = Math.round(newX / stepX) * stepX
  const roundedY = Math.round(newY / stepY) * stepY

  touched.node.setAttribute('x', `${roundedX}`)
  touched.node.setAttribute('y', `${roundedY}`)

  touched.node.width.baseVal.value = SCALE * 1
  touched.node.height.baseVal.value = SCALE * 1
  const source = positionToSquare(touched.source, input.orientation ?? 'w')
  const target = positionToSquare(
    {
      x: Math.floor(roundedX / stepX),
      y: Math.floor(roundedY / stepY),
    },
    input.orientation ?? 'w',
  )

  if (input.onPieceDrop && source && target) {
    const isValidDrop = input.onPieceDrop({
      source,
      target,
    })

    if (!isValidDrop) {
      touched.node.setAttribute('x', `${touched.source.x}`)
      touched.node.setAttribute('y', `${touched.source.y}`)
    }
  }

  if (!target) {
    touched.node.setAttribute('x', `${touched.source.x}`)
    touched.node.setAttribute('y', `${touched.source.y}`)
  }

  hideSourceCheckerUI(input.orientation ?? 'w')
  setVisibleDropZoneNode(null)
  setLegalMoveDotsFill(input, 'none')

  touched = null
}

const onPieceDragStart =
  (input: { input: ChessboardInput; source: { x: number; y: number }; piece: Piece }) => (e: unknown) => {
    const square = positionToSquare(input.source, input.input.orientation ?? 'w')

    if (!square) {
      return
    }

    if (
      input.input.isPieceDraggable &&
      !input.input.isPieceDraggable({
        square,
        piece: input.piece,
      })
    ) {
      return
    }

    if (!(e instanceof MouseEvent) && !(e instanceof TouchEvent)) {
      return
    }

    const target = e.currentTarget
    if (!(target instanceof SVGSVGElement)) {
      return
    }

    target.width.baseVal.value = TOUCHED_SCALED
    target.height.baseVal.value = TOUCHED_SCALED
    touched = {
      node: target,
      piece: input.piece,
      source: input.source,
    }

    // make sure piece is rendered on top of other pieces
    if (touched?.node?.parentNode) {
      touched.node.parentNode.appendChild(touched.node)
    }
    updateDropZoneUI(input.input.orientation ?? 'w')
  }

const toDropZoneId = (square: Square) => {
  return `dropzone-${square}`
}

const toCheckerId = (square: Square) => {
  return `checker-${square}`
}

const toLegalMoveDotId = (square: Square) => {
  return `legal-move-dot-${square}`
}

export const onDragCancel = (input: ChessboardInput) => (_e: unknown) => {
  hideSourceCheckerUI(input.orientation ?? 'w')
  setVisibleDropZoneNode(null)
  setLegalMoveDotsFill(input, 'none')

  if (touched) {
    touched.node.setAttribute('x', `${touched.source.x}`)
    touched.node.setAttribute('y', `${touched.source.y}`)
    touched.node.width.baseVal.value = SCALE * 1
    touched.node.height.baseVal.value = SCALE * 1
  }

  touched = null
}

export const Chessboard = (input: ChessboardInput) => {
  const pieces = input.model?.fen ? fenToPieces(input.model.fen, input.orientation ?? 'w') : []

  if (input.model?.fen) {
    instance.load(input.model?.fen)
  }

  return h(
    Svg,
    {
      width: '100%',
      viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
      preserveAspectRatio: 'xMinYMin meet',
      onPress: onDragStartOrMove(input),
      onPressOut: onDragEnd(input),
    },
    [
      h(
        G,
        {},
        CHECKERS.map((checker) => {
          const square = positionToSquare(checker, input.orientation ?? 'w')
          return h(Rect, {
            key: checker.id,
            id: square ? toCheckerId(square) : undefined,
            x: checker.x * SCALE,
            y: checker.y * SCALE,
            width: SCALE * 1,
            height: SCALE * 1,
            stroke: 'none',
            fill:
              input.model?.previousMove?.from === square
                ? 'orange'
                : input.model?.previousMove?.to === square
                  ? 'yellow'
                  : checker.color === 'white'
                    ? THEME.lightChecker
                    : THEME.darkChecker,
          })
        }),
      ),

      h(
        G,
        {},
        CHECKERS.map((checker) => {
          const square = positionToSquare(checker, input.orientation ?? 'w')
          return h(Circle, {
            key: checker.id,
            id: square ? toLegalMoveDotId(square) : undefined,
            cx: checker.x * SCALE + SCALE / 2,
            cy: checker.y * SCALE + SCALE / 2,
            style: sx({ pointerEvents: 'none' }),
            r: (SCALE * 1) / 4,
            'fill-opacity': '0.5',
            fill: 'none',
          })
        }),
      ),

      h(
        G,
        {},
        CHECKERS.map((checker) => {
          const square = positionToSquare(checker, input.orientation ?? 'w')
          return h(Circle, {
            key: checker.id,
            id: square ? toDropZoneId(square) : undefined,
            cx: checker.x * SCALE + SCALE / 2,
            cy: checker.y * SCALE + SCALE / 2,
            style: sx({ pointerEvents: 'none' }),
            r: SCALE * 1.25,
            'fill-opacity': '0.2',
            fill: 'none',
          })
        }),
      ),

      h(
        G,
        {},
        pieces?.map(({ piece, x, y }) => {
          return h(
            Svg,
            {
              key: [piece, x, y, input.model?.fen].join(','),
              x: SCALE * x,
              y: SCALE * y,
              width: SCALE * 1,
              height: SCALE * 1,
              onPress: onPieceDragStart({
                input,
                piece,
                source: { x, y },
              }),
              viewBox: '0 0 45 45',
            },
            [
              h(Rect, {
                fill: 'transparent',
                stroke: 'transparent',
                x: '0',
                y: '0',
                width: '100%',
                height: '100%',
              }),
              renderPiece[piece](),
            ],
          )
        }),
      ),
    ],
  )
}

const renderPiece: { [piece in Piece]: () => VDom } = {
  wK: () =>
    h(
      G,
      {
        fill: 'none',
        'fill-opacity': '1',
        'fill-rule': 'evenodd',
        stroke: '#000000',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-miterlimit': '4',
        'stroke-dasharray': 'none',
        'stroke-opacity': '1',
      },
      [
        h(Path, {
          d: 'M 22.5,11.63 L 22.5,6',
          fill: 'none',
          stroke: '#000000',
          'stroke-linejoin': 'miter',
        }),
        h(Path, {
          d: 'M 20,8 L 25,8',
          fill: 'none',
          stroke: '#000000',
          'stroke-linejoin': 'miter',
        }),
        h(Path, {
          d: 'M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 25.5,14.5 24.5,12 22.5,12 C 20.5,12 19.5,14.5 19.5,14.5 C 18,17.5 22.5,25 22.5,25',
          fill: '#ffffff',
          stroke: '#000000',
          'stroke-linecap': 'butt',
          'stroke-linejoin': 'miter',
        }),
        h(Path, {
          d: 'M 11.5,37 C 17,40.5 27,40.5 32.5,37 L 32.5,30 C 32.5,30 41.5,25.5 38.5,19.5 C 34.5,13 25,16 22.5,23.5 L 22.5,27 L 22.5,23.5 C 19,16 9.5,13 6.5,19.5 C 3.5,25.5 11.5,29.5 11.5,29.5 L 11.5,37 z ',
          fill: '#ffffff',
          stroke: '#000000',
        }),
        h(Path, {
          d: 'M 11.5,30 C 17,27 27,27 32.5,30',
          fill: 'none',
          stroke: '#000000',
        }),
        h(Path, {
          d: 'M 11.5,33.5 C 17,30.5 27,30.5 32.5,33.5',
          fill: 'none',
          stroke: '#000000',
        }),
        h(Path, {
          d: 'M 11.5,37 C 17,34 27,34 32.5,37',
          fill: 'none',
          stroke: '#000000',
        }),
      ],
    ),

  wQ: () =>
    h(
      G,
      {
        fill: '#ffffff',
        'fill-opacity': '1',
        'fill-rule': 'evenodd',
        stroke: '#000000',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-miterlimit': '4',
        'stroke-dasharray': 'none',
        'stroke-opacity': '1',
      },
      [
        h(Path, {
          d: 'M 9 13 A 2 2 0 1 1  5,13 A 2 2 0 1 1  9 13 z',
          transform: 'translate(-1,-1)',
        }),
        h(Path, {
          d: 'M 9 13 A 2 2 0 1 1  5,13 A 2 2 0 1 1  9 13 z',
          transform: 'translate(15.5,-5.5)',
        }),
        h(Path, {
          d: 'M 9 13 A 2 2 0 1 1  5,13 A 2 2 0 1 1  9 13 z',
          transform: 'translate(32,-1)',
        }),
        h(Path, {
          d: 'M 9 13 A 2 2 0 1 1  5,13 A 2 2 0 1 1  9 13 z',
          transform: 'translate(7,-4.5)',
        }),
        h(Path, {
          d: 'M 9 13 A 2 2 0 1 1  5,13 A 2 2 0 1 1  9 13 z',
          transform: 'translate(24,-4)',
        }),
        h(Path, {
          d: 'M 9,26 C 17.5,24.5 30,24.5 36,26 L 38,14 L 31,25 L 31,11 L 25.5,24.5 L 22.5,9.5 L 19.5,24.5 L 14,10.5 L 14,25 L 7,14 L 9,26 z ',
          'stroke-linecap': 'butt',
        }),
        h(Path, {
          d: 'M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 10.5,36 10.5,36 C 9,37.5 11,38.5 11,38.5 C 17.5,39.5 27.5,39.5 34,38.5 C 34,38.5 35.5,37.5 34,36 C 34,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 C 27.5,24.5 17.5,24.5 9,26 z ',
          'stroke-linecap': 'butt',
        }),
        h(Path, {
          d: 'M 11.5,30 C 15,29 30,29 33.5,30',
          fill: 'none',
        }),
        h(Path, {
          d: 'M 12,33.5 C 18,32.5 27,32.5 33,33.5',
          fill: 'none',
        }),
      ],
    ),

  wB: () =>
    h(
      G,
      {
        fill: 'none',
        'fill-rule': 'evenodd',
        'fill-opacity': '1',
        stroke: '#000000',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-miterlimit': '4',
        'stroke-dasharray': 'none',
        'stroke-opacity': '1',
      },
      [
        h(
          G,
          {
            fill: '#ffffff',
            stroke: '#000000',
            'stroke-linecap': 'butt',
          },
          [
            h(Path, {
              d: 'M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.646,38.99 6.677,38.97 6,38 C 7.354,36.06 9,36 9,36 z',
            }),
            h(Path, {
              d: 'M 15,32 C 17.5,34.5 27.5,34.5 30,32 C 30.5,30.5 30,30 30,30 C 30,27.5 27.5,26 27.5,26 C 33,24.5 33.5,14.5 22.5,10.5 C 11.5,14.5 12,24.5 17.5,26 C 17.5,26 15,27.5 15,30 C 15,30 14.5,30.5 15,32 z',
            }),
            h(Path, {
              d: 'M 25 8 A 2.5 2.5 0 1 1  20,8 A 2.5 2.5 0 1 1  25 8 z',
            }),
          ],
        ),
        h(Path, {
          d: 'M 17.5,26 L 27.5,26 M 15,30 L 30,30 M 22.5,15.5 L 22.5,20.5 M 20,18 L 25,18',
          fill: 'none',
          stroke: '#000000',
          'stroke-linejoin': 'miter',
        }),
      ],
    ),

  wN: () =>
    h(
      G,
      {
        fill: 'none',
        'fill-opacity': '1',
        'fill-rule': 'evenodd',
        stroke: '#000000',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-miterlimit': '4',
        'stroke-dasharray': 'none',
        'stroke-opacity': '1',
      },
      [
        h(Path, {
          d: 'M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18',
          fill: '#ffffff',
          stroke: '#000000',
        }),
        h(Path, {
          d: 'M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,6.5 16.5,10 16.5,10 L 18.5,10 C 18.5,10 19.28,8.008 21,7 C 22,7 22,10 22,10',
          fill: '#ffffff',
          stroke: '#000000',
        }),
        h(Path, {
          d: 'M 9.5 25.5 A 0.5 0.5 0 1 1 8.5,25.5 A 0.5 0.5 0 1 1 9.5 25.5 z',
          fill: '#000000',
          stroke: '#000000',
        }),
        h(Path, {
          d: 'M 15 15.5 A 0.5 1.5 0 1 1  14,15.5 A 0.5 1.5 0 1 1  15 15.5 z',
          transform: 'matrix(0.866,0.5,-0.5,0.866,9.693,-5.173)',
          fill: '#000000',
          stroke: '#000000',
        }),
      ],
    ),

  wR: () =>
    h(
      G,
      {
        fill: '#ffffff',
        'fill-opacity': '1',
        'fill-rule': 'evenodd',
        stroke: '#000000',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-miterlimit': '4',
        'stroke-dasharray': 'none',
        'stroke-opacity': '1',
      },
      [
        h(Path, {
          d: 'M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z ',
          'stroke-linecap': 'butt',
        }),
        h(Path, {
          d: 'M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z ',
          'stroke-linecap': 'butt',
        }),
        h(Path, {
          d: 'M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14',
          'stroke-linecap': 'butt',
        }),
        h(Path, {
          d: 'M 34,14 L 31,17 L 14,17 L 11,14',
        }),
        h(Path, {
          d: 'M 31,17 L 31,29.5 L 14,29.5 L 14,17',
          'stroke-linecap': 'butt',
          'stroke-linejoin': 'miter',
        }),
        h(Path, {
          d: 'M 31,29.5 L 32.5,32 L 12.5,32 L 14,29.5',
        }),
        h(Path, {
          d: 'M 11,14 L 34,14',
          fill: 'none',
          stroke: '#000000',
          'stroke-linejoin': 'miter',
        }),
      ],
    ),

  wP: () =>
    h(G, {}, [
      h(Path, {
        d: 'M 22,9 C 19.79,9 18,10.79 18,13 C 18,13.89 18.29,14.71 18.78,15.38 C 16.83,16.5 15.5,18.59 15.5,21 C 15.5,23.03 16.44,24.84 17.91,26.03 C 14.91,27.09 10.5,31.58 10.5,39.5 L 33.5,39.5 C 33.5,31.58 29.09,27.09 26.09,26.03 C 27.56,24.84 28.5,23.03 28.5,21 C 28.5,18.59 27.17,16.5 25.22,15.38 C 25.71,14.71 26,13.89 26,13 C 26,10.79 24.21,9 22,9 z ',
        fill: '#ffffff',
        'fill-opacity': '1',
        'fill-rule': 'nonzero',
        stroke: '#000000',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'miter',
        'stroke-miterlimit': '4',
        'stroke-dasharray': 'none',
        'stroke-opacity': '1',
      }),
    ]),

  bK: () =>
    h(
      G,
      {
        fill: 'none',
        'fill-opacity': '1',
        'fill-rule': 'evenodd',
        stroke: '#000000',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-miterlimit': '4',
        'stroke-dasharray': 'none',
        'stroke-opacity': '1',
      },
      [
        h(Path, {
          d: 'M 22.5,11.63 L 22.5,6',
          fill: 'none',
          stroke: '#000000',
          'stroke-linejoin': 'miter',
        }),
        h(Path, {
          d: 'M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 25.5,14.5 24.5,12 22.5,12 C 20.5,12 19.5,14.5 19.5,14.5 C 18,17.5 22.5,25 22.5,25',
          fill: '#000000',
          'fill-opacity': '1',
          'stroke-linecap': 'butt',
          'stroke-linejoin': 'miter',
        }),
        h(Path, {
          d: 'M 11.5,37 C 17,40.5 27,40.5 32.5,37 L 32.5,30 C 32.5,30 41.5,25.5 38.5,19.5 C 34.5,13 25,16 22.5,23.5 L 22.5,27 L 22.5,23.5 C 19,16 9.5,13 6.5,19.5 C 3.5,25.5 11.5,29.5 11.5,29.5 L 11.5,37 z ',
          fill: '#000000',
          stroke: '#000000',
        }),
        h(Path, {
          d: 'M 20,8 L 25,8',
          fill: 'none',
          stroke: '#000000',
          'stroke-linejoin': 'miter',
        }),
        h(Path, {
          d: 'M 32,29.5 C 32,29.5 40.5,25.5 38.03,19.85 C 34.15,14 25,18 22.5,24.5 L 22.51,26.6 L 22.5,24.5 C 20,18 9.906,14 6.997,19.85 C 4.5,25.5 11.85,28.85 11.85,28.85',
          fill: 'none',
          stroke: '#ffffff',
        }),
        h(Path, {
          d: 'M 11.5,30 C 17,27 27,27 32.5,30 M 11.5,33.5 C 17,30.5 27,30.5 32.5,33.5 M 11.5,37 C 17,34 27,34 32.5,37',
          fill: 'none',
          stroke: '#ffffff',
        }),
      ],
    ),

  bQ: () =>
    h(
      G,
      {
        fill: '#000000',
        'fill-opacity': '1',
        'fill-rule': 'evenodd',
        stroke: '#000000',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-miterlimit': '4',
        'stroke-dasharray': 'none',
        'stroke-opacity': '1',
      },
      [
        h(
          G,
          {
            fill: '#000000',
            stroke: 'none',
          },
          [
            h(Circle, { cx: '6', cy: '12', r: '2.75' }),
            h(Circle, { cx: '14', cy: '9', r: '2.75' }),
            h(Circle, { cx: '22.5', cy: '8', r: '2.75' }),
            h(Circle, { cx: '31', cy: '9', r: '2.75' }),
            h(Circle, { cx: '39', cy: '12', r: '2.75' }),
          ],
        ),
        h(Path, {
          d: 'M 9,26 C 17.5,24.5 30,24.5 36,26 L 38.5,13.5 L 31,25 L 30.7,10.9 L 25.5,24.5 L 22.5,10 L 19.5,24.5 L 14.3,10.9 L 14,25 L 6.5,13.5 L 9,26 z',
          'stroke-linecap': 'butt',
          stroke: '#000000',
        }),
        h(Path, {
          d: 'M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 10.5,36 10.5,36 C 9,37.5 11,38.5 11,38.5 C 17.5,39.5 27.5,39.5 34,38.5 C 34,38.5 35.5,37.5 34,36 C 34,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 C 27.5,24.5 17.5,24.5 9,26 z',
          'stroke-linecap': 'butt',
        }),
        h(Path, {
          d: 'M 11,38.5 A 35,35 1 0 0 34,38.5',
          fill: 'none',
          stroke: '#000000',
          'stroke-linecap': 'butt',
        }),
        h(Path, {
          d: 'M 11,29 A 35,35 1 0 1 34,29',
          fill: 'none',
          stroke: '#ffffff',
        }),
        h(Path, {
          d: 'M 12.5,31.5 L 32.5,31.5',
          fill: 'none',
          stroke: '#ffffff',
        }),
        h(Path, {
          d: 'M 11.5,34.5 A 35,35 1 0 0 33.5,34.5',
          fill: 'none',
          stroke: '#ffffff',
        }),
        h(Path, {
          d: 'M 10.5,37.5 A 35,35 1 0 0 34.5,37.5',
          fill: 'none',
          stroke: '#ffffff',
        }),
      ],
    ),

  bB: () =>
    h(
      G,
      {
        fill: 'none',
        'fill-rule': 'evenodd',
        'fill-opacity': '1',
        stroke: '#000000',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-miterlimit': '4',
        'stroke-dasharray': 'none',
        'stroke-opacity': '1',
      },
      [
        h(
          G,
          {
            fill: '#000000',
            stroke: '#000000',
            'stroke-linecap': 'butt',
          },
          [
            h(Path, {
              d: 'M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.646,38.99 6.677,38.97 6,38 C 7.354,36.06 9,36 9,36 z',
            }),
            h(Path, {
              d: 'M 15,32 C 17.5,34.5 27.5,34.5 30,32 C 30.5,30.5 30,30 30,30 C 30,27.5 27.5,26 27.5,26 C 33,24.5 33.5,14.5 22.5,10.5 C 11.5,14.5 12,24.5 17.5,26 C 17.5,26 15,27.5 15,30 C 15,30 14.5,30.5 15,32 z',
            }),
            h(Path, { d: 'M 25 8 A 2.5 2.5 0 1 1  20,8 A 2.5 2.5 0 1 1  25 8 z' }),
          ],
        ),
        h(Path, {
          d: 'M 17.5,26 L 27.5,26 M 15,30 L 30,30 M 22.5,15.5 L 22.5,20.5 M 20,18 L 25,18',
          fill: 'none',
          stroke: '#ffffff',
          'stroke-linejoin': 'miter',
        }),
      ],
    ),

  bN: () =>
    h(
      G,
      {
        fill: 'none',
        'fill-opacity': '1',
        'fill-rule': 'evenodd',
        stroke: '#000000',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-miterlimit': '4',
        'stroke-dasharray': 'none',
        'stroke-opacity': '1',
      },
      [
        h(Path, {
          d: 'M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18',
          fill: '#000000',
          stroke: '#000000',
        }),
        h(Path, {
          d: 'M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,6.5 16.5,10 16.5,10 L 18.5,10 C 18.5,10 19.28,8.008 21,7 C 22,7 22,10 22,10',
          fill: '#000000',
          stroke: '#000000',
        }),
        h(Path, {
          d: 'M 9.5 25.5 A 0.5 0.5 0 1 1 8.5,25.5 A 0.5 0.5 0 1 1 9.5 25.5 z',
          fill: '#ffffff',
          stroke: '#ffffff',
        }),
        h(Path, {
          d: 'M 15 15.5 A 0.5 1.5 0 1 1  14,15.5 A 0.5 1.5 0 1 1  15 15.5 z',
          transform: 'matrix(0.866,0.5,-0.5,0.866,9.693,-5.173)',
          fill: '#ffffff',
          stroke: '#ffffff',
        }),
        h(Path, {
          d: 'M 24.55,10.4 L 24.1,11.85 L 24.6,12 C 27.75,13 30.25,14.49 32.5,18.75 C 34.75,23.01 35.75,29.06 35.25,39 L 35.2,39.5 L 37.45,39.5 L 37.5,39 C 38,28.94 36.62,22.15 34.25,17.66 C 31.88,13.17 28.46,11.02 25.06,10.5 L 24.55,10.4 z ',
          fill: '#ffffff',
          stroke: 'none',
        }),
      ],
    ),

  bR: () =>
    h(
      G,
      {
        fill: '#000000',
        'fill-opacity': '1',
        'fill-rule': 'evenodd',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-miterlimit': '4',
        'stroke-dasharray': 'none',
        'stroke-opacity': '1',
      },
      [
        h(Path, {
          d: 'M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z ',
          'stroke-linecap': 'butt',
        }),
        h(Path, {
          d: 'M 12.5,32 L 14,29.5 L 31,29.5 L 32.5,32 L 12.5,32 z ',
          'stroke-linecap': 'butt',
        }),
        h(Path, {
          d: 'M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z ',
          'stroke-linecap': 'butt',
        }),
        h(Path, {
          d: 'M 14,29.5 L 14,16.5 L 31,16.5 L 31,29.5 L 14,29.5 z ',
          'stroke-linecap': 'butt',
          'stroke-linejoin': 'miter',
        }),
        h(Path, {
          d: 'M 14,16.5 L 11,14 L 34,14 L 31,16.5 L 14,16.5 z ',
          'stroke-linecap': 'butt',
        }),
        h(Path, {
          d: 'M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14 L 11,14 z ',
          'stroke-linecap': 'butt',
        }),
        h(Path, {
          d: 'M 12,35.5 L 33,35.5 L 33,35.5',
          fill: 'none',
          stroke: '#ffffff',
          'stroke-width': '1',
          'stroke-linejoin': 'miter',
        }),
        h(Path, {
          d: 'M 13,31.5 L 32,31.5',
          fill: 'none',
          stroke: '#ffffff',
          'stroke-width': '1',
          'stroke-linejoin': 'miter',
        }),
        h(Path, {
          d: 'M 14,29.5 L 31,29.5',
          fill: 'none',
          stroke: '#ffffff',
          'stroke-width': '1',
          'stroke-linejoin': 'miter',
        }),
        h(Path, {
          d: 'M 14,16.5 L 31,16.5',
          fill: 'none',
          stroke: '#ffffff',
          'stroke-width': '1',
          'stroke-linejoin': 'miter',
        }),
        h(Path, {
          d: 'M 11,14 L 34,14',
          fill: 'none',
          stroke: '#ffffff',
          'stroke-width': '1',
          'stroke-linejoin': 'miter',
        }),
      ],
    ),

  bP: () =>
    h(G, {}, [
      h(Path, {
        d: 'M 22,9 C 19.79,9 18,10.79 18,13 C 18,13.89 18.29,14.71 18.78,15.38 C 16.83,16.5 15.5,18.59 15.5,21 C 15.5,23.03 16.44,24.84 17.91,26.03 C 14.91,27.09 10.5,31.58 10.5,39.5 L 33.5,39.5 C 33.5,31.58 29.09,27.09 26.09,26.03 C 27.56,24.84 28.5,23.03 28.5,21 C 28.5,18.59 27.17,16.5 25.22,15.38 C 25.71,14.71 26,13.89 26,13 C 26,10.79 24.21,9 22,9 z ',
        fill: '#000000',
        'fill-opacity': '1',
        'fill-rule': 'nonzero',
        stroke: '#000000',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'miter',
        'stroke-miterlimit': '4',
        'stroke-dasharray': 'none',
        'stroke-opacity': '1',
      }),
    ]),
}
