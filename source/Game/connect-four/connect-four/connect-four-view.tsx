import { useLayoutEffect, useRef } from "react"
import { Uuid } from "../../../Core"
import * as Spring from "../../../Core/animation/spring"
import { SvgIcon, Sx } from "../../../UI"
import { ColumnIndex, Columns, COLUMN_COUNT, isColumnIndex, MAX_COLUMN_HEIGHT, PlayerType } from "./connect-four"

// 
// 
// 
// 
// 

export type VisualModel = VisualDisc[][]

export type VisualDisc = {
    type: "entry" | "exit";
    yPosition: Spring.Model;
    playerType: PlayerType
}

// 
// 
// 
// 
// 

export const gameTheme = {
    primary: {
        light: "#1976D2",
        dark: "#2195F2",
        darker: "#0D47A1",
    },
    PlayerOne: {
        light: "#f45e55",
        dark: "#c12521",
    },
    PlayerTwo: {
        light: "#FFB74D",
        dark: "#ff9a06",
    },
}

export const ViewSvgDefs = () => {
    return <></>
}

export const ViewPlayerOneGradientDef = ({
    gradientId,
    cx,
    cy,
    r,
}: {
    gradientId: string
    cx: number
    cy: number
    r: number
}) => {
    return (
        <radialGradient
            id={gradientId}
            gradientTransform="rotate(90)"
            cx={cx}
            cy={cy}
            r={r}
        >
            <stop offset="50%" stopColor={gameTheme.PlayerOne.light} />
            <stop offset="100%" stopColor={gameTheme.PlayerOne.dark} />
        </radialGradient>
    )
}

export const ViewPlayerTwoGradientDef = ({
    gradientId,
}: {
    gradientId: string
}) => {
    return (
        <radialGradient id={gradientId} gradientTransform="rotate(90)">
            <stop offset="0%" stopColor={gameTheme.PlayerTwo.light} />
            <stop offset="100%" stopColor={gameTheme.PlayerTwo.dark} />
        </radialGradient>
    )
}

type ViewColumnsProps = {
    columns: Columns
    ghost?: { columnIndex: ColumnIndex; playerType: PlayerType }
    onClick?: (columnIndex: ColumnIndex) => void
    onHover?: (columnINdex: ColumnIndex) => void
    disabled?: boolean
    visual: VisualModel
}

export const ViewColumns = ({
    implementation = "canvas",
    ...props
}: ViewColumnsProps & {
    implementation?: "svg" | "canvas"
}) => {
    switch (implementation) {
        case "canvas": {
            return <ViewColumnsCanvas {...props} />
        }

        case "svg": {
            return <ViewColumnsSvg {...props} />
        }
    }
}

const ViewColumnsSvg = ({
    columns,
    onClick,
    onHover,
    // ghost,
    disabled,
    visual
}: ViewColumnsProps) => {
    const ref = useRef(Uuid.generateSync())
    const ids = {
        playerOneGradient: `playerOneGradient${ref.current}`,
        playerTwoGradient: `playerTwoGradient${ref.current}`,
        holePattern: `holePattern${ref.current}`,
        columnGradient: `columnGradient${ref.current}`,
        holeMask: `holeMask${ref.current}`,
    }

    const playerOneFill = `url(#${ids.playerOneGradient})`
    const playerTwoFill = `url(#${ids.playerTwoGradient})`

    return (
        <svg width="100%" viewBox={"0 0 7 6"}>
            <defs>
                <pattern
                    id={ids.holePattern}
                    patternUnits="userSpaceOnUse"
                    width={1}
                    height={1}
                >
                    <circle cx={0.5} cy={0.5} r={0.425} fill="black"></circle>
                </pattern>

                <mask id={ids.holeMask}>
                    <rect
                        x={0}
                        y={0}
                        width={COLUMN_COUNT}
                        height={MAX_COLUMN_HEIGHT}
                        fill="white"
                    ></rect>
                    <rect
                        x={0}
                        y={0}
                        width={COLUMN_COUNT}
                        height={MAX_COLUMN_HEIGHT}
                        fill={`url(#${ids.holePattern})`}
                    ></rect>
                </mask>

                <linearGradient id={ids.columnGradient} gradientTransform="rotate(90)">
                    <stop offset="0%" stopColor={gameTheme.primary.light} />
                    <stop offset="100%" stopColor={gameTheme.primary.dark} />
                </linearGradient>

                <linearGradient
                    id={ids.playerOneGradient}
                    gradientTransform="rotate(90)"
                >
                    <stop offset="0%" stopColor={gameTheme.PlayerOne.light} />
                    <stop offset="100%" stopColor={gameTheme.PlayerOne.dark} />
                </linearGradient>

                <linearGradient
                    id={ids.playerTwoGradient}
                    gradientTransform="rotate(90)"
                >
                    <stop offset="0%" stopColor={gameTheme.PlayerTwo.light} />
                    <stop offset="100%" stopColor={gameTheme.PlayerTwo.dark} />
                </linearGradient>
            </defs>

            <rect x={0} y={0} width={7} height={6} fill={gameTheme.primary.darker} />

            {/* {columns.map((column, columnIndex) =>
        column.map((player, rowIndex) => (
          <circle
            key={[columnIndex, rowIndex].join(", ")}
            cx={columnIndex + 0.5}
            cy={MAX_COLUMN_HEIGHT - (rowIndex + 0.5)}
            r={0.5}
            fill={player === "PlayerOne" ? playerOneFill : playerTwoFill}
          />
        )),
      )} */}

            {visual.map((columnVisual, columnIndex) =>
                columnVisual.map((disc, rowIndex) => (
                    <circle
                        key={[columnIndex, rowIndex].join(", ")}
                        cx={columnIndex + 0.5}
                        cy={MAX_COLUMN_HEIGHT - (disc.yPosition.current + 0.5)}
                        r={0.5}
                        fill={disc.playerType === "PlayerOne" ? playerOneFill : playerTwoFill}
                    />
                )),
            )}

            {/* {!disabled && ghost &&  (
        <circle
          cx={ghost.columnIndex + 0.5}
          cy={
            MAX_COLUMN_HEIGHT -
            (columns[ghost.columnIndex]?.length ?? 0) +
            0.5 -
            1
          }
          r={0.5}
          style={{ opacity: 2 / 3 }}
          fill={
            ghost.playerType === "PlayerOne" ? playerOneFill : playerTwoFill
          }
        />
      )} */}

            <rect
                x={0}
                y={0}
                width={COLUMN_COUNT}
                height={MAX_COLUMN_HEIGHT}
                fill={`url(#${ids.columnGradient})`}
                mask={`url(#${ids.holeMask})`}
            />

            {[...new Array(COLUMN_COUNT)].map((_, columnIndex) => (
                <rect
                    style={{
                        cursor:
                            disabled || !onClick
                                ? undefined
                                : (columns[columnIndex]?.length ?? 0) >= MAX_COLUMN_HEIGHT
                                    ? "not-allowed"
                                    : "pointer",
                    }}
                    onMouseOver={() => {
                        if (!disabled && isColumnIndex(columnIndex) && onHover) {
                            onHover(columnIndex)
                        }
                    }}
                    onClick={() => {
                        if (!disabled && isColumnIndex(columnIndex) && onClick) {
                            onClick(columnIndex)
                        }
                    }}
                    key={columnIndex}
                    x={columnIndex}
                    y={0}
                    width={1}
                    height={MAX_COLUMN_HEIGHT}
                    fill="transparent"
                />
            ))}
        </svg>
    )
}

const ViewColumnsCanvas = ({ columns, onClick, visual }: ViewColumnsProps) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)

    useLayoutEffect(() => {
        const canvas = canvasRef.current

        if (!canvas) {
            return
        }

        const context = canvas.getContext("2d")

        if (!context) {
            return
        }

        context.canvas.height =
            (MAX_COLUMN_HEIGHT / COLUMN_COUNT) * context.canvas.width

        paint({ context, columns, visual })
    })

    return (
        <canvas
            style={{ width: "100%" }}
            ref={canvasRef}
            onClick={(event) => {
                const columnIndex = Math.floor(
                    rescale({
                        value: event.pageX - event.currentTarget.offsetLeft,
                        from: [0, event.currentTarget.width],
                        to: [0, COLUMN_COUNT - 1],
                    }),
                )

                if (onClick && isColumnIndex(columnIndex)) {
                    onClick(columnIndex)
                    return
                }
            }}
        />
    )
}

type Range = [number, number]

const rescale = ({
    value,
    from,
    to,
}: {
    value: number
    from: Range
    to: Range
}) => {
    return ((value - from[0]) * (to[1] - to[0])) / (from[1] - from[0]) + to[0]
}

const paint = ({ context, visual }: { visual: VisualModel; context: CanvasRenderingContext2D, columns: Columns }): void => {
    const width = context.canvas.width
    const height = context.canvas.height

    // put origin on bottom left
    context.translate(0, height)
    context.scale(1, -1)

    context.fillStyle = gameTheme.primary.darker
    context.fillRect(0, 0, width, height)

    const cellWidth = width / COLUMN_COUNT
    const cellHeight = height / MAX_COLUMN_HEIGHT


    let x, y, cx, cy, r, column, disc, gradient;


    for (x = 0; x < visual.length; x++) {
        column = visual[x]!
        for (y = 0; y < column.length; y++) {
            disc = column[y]!

            cx = (x + 1 / 2) * cellWidth
            cy = (disc.yPosition.current + 1 / 2) * cellHeight
            r = cellWidth / 2

            context.beginPath()
            context.arc(cx, cy, r, 0, Math.PI * 2)
            gradient = context.createRadialGradient(cx, cy, 0, cx, cy, r * 0.74)
            gradient.addColorStop(0, gameTheme[disc.playerType].light)
            gradient.addColorStop(1, gameTheme[disc.playerType].dark)
            context.fillStyle = gradient
            context.fill()
            context.closePath()
        }
    }

    // this is a hack that prevents a bug when creating the holes in board using the evenodd fill method
    context.beginPath()
    context.arc(
        width + cellWidth,
        height + cellHeight,
        cellWidth / 2,
        0,
        Math.PI * 2,
    )
    context.fillStyle = "purple"
    context.fill()
    context.closePath()

    //
    //
    //
    //

    for (x = 0; x < COLUMN_COUNT; x++) {
        for (y = 0; y < MAX_COLUMN_HEIGHT; y++) {
            const cx = (x + 1 / 2) * cellWidth
            const cy = (y + 1 / 2) * cellHeight
            const r = (cellWidth / 2) * 0.8
            context.moveTo(cy, cy)
            context.arc(cx, cy, r, 0, Math.PI * 2)
        }
    }

    context.fillStyle = gameTheme.primary.light
    context.rect(0, 0, width, height)
    context.fill("evenodd")
}

//
//
//
// Animation
//
//
//

// source: https://easings.net/#easeOutBounce
// const easeOutBounce = (x: number): number => {
//   const n1 = 7.5625
//   const d1 = 2.75
//   if (x < 1 / d1) {
//     return n1 * x * x
//   } else if (x < 2 / d1) {
//     return n1 * (x -= 1.5 / d1) * x + 0.75
//   } else if (x < 2.5 / d1) {
//     return n1 * (x -= 2.25 / d1) * x + 0.9375
//   } else {
//     return n1 * (x -= 2.625 / d1) * x + 0.984375
//   }
// }


export const viewCoverArt = () => {
    const ref = useRef(Uuid.generateSync())
    const ids = {
        playerOneGradient: `playerOneGradient${ref.current}`,
        playerTwoGradient: `playerTwoGradient${ref.current}`,
        holePattern: `holePattern${ref.current}`,
        columnGradient: `columnGradient${ref.current}`,
        holeMask: `holeMask${ref.current}`,
    }

    const playerOneFill = `url(#${ids.playerOneGradient})`
    const playerTwoFill = `url(#${ids.playerTwoGradient})`

    return (
        <svg width="100%" viewBox={"0 0 2 2"}>
            <defs>
                <pattern
                    id={ids.holePattern}
                    patternUnits="userSpaceOnUse"
                    width={1}
                    height={1}
                >
                    <circle cx={0.5} cy={0.5} r={0.425} fill="black"></circle>
                </pattern>

                <mask id={ids.holeMask}>
                    <rect
                        x={0}
                        y={0}
                        width={COLUMN_COUNT}
                        height={MAX_COLUMN_HEIGHT}
                        fill="white"
                    ></rect>
                    <rect
                        x={0}
                        y={0}
                        width={COLUMN_COUNT}
                        height={MAX_COLUMN_HEIGHT}
                        fill={`url(#${ids.holePattern})`}
                    ></rect>
                </mask>

                <linearGradient id={ids.columnGradient} gradientTransform="rotate(90)">
                    <stop offset="0%" stopColor={gameTheme.primary.light} />
                    <stop offset="100%" stopColor={gameTheme.primary.dark} />
                </linearGradient>

                <linearGradient
                    id={ids.playerOneGradient}
                    gradientTransform="rotate(90)"
                >
                    <stop offset="0%" stopColor={gameTheme.PlayerOne.light} />
                    <stop offset="100%" stopColor={gameTheme.PlayerOne.dark} />
                </linearGradient>

                <linearGradient
                    id={ids.playerTwoGradient}
                    gradientTransform="rotate(90)"
                >
                    <stop offset="0%" stopColor={gameTheme.PlayerTwo.light} />
                    <stop offset="100%" stopColor={gameTheme.PlayerTwo.dark} />
                </linearGradient>
            </defs>

            <rect x={0} y={0} width={2} height={2} fill={gameTheme.primary.darker} />

            <circle cx={0.5} cy={0} r={0.5} fill={playerOneFill} />

            <circle cx={1.5} cy={0.5} r={0.5} fill={playerTwoFill} />

            <circle cx={1.5} cy={1.5} r={0.5} fill={playerOneFill} />

            <circle cx={0.5} cy={1.5} r={0.5} fill={playerTwoFill} />

            <rect
                x={0}
                y={0}
                width={COLUMN_COUNT}
                height={MAX_COLUMN_HEIGHT}
                fill={`url(#${ids.columnGradient})`}
                mask={`url(#${ids.holeMask})`}
            />
        </svg>
    )
}


export const PlayerIcon = ({
    playerType,
    sx,
}: {
    playerType: PlayerType
    sx?: Sx
}) => {
    switch (playerType) {
        case "PlayerOne": {
            return <PlayerOneIcon sx={sx} />
        }

        case "PlayerTwo": {
            return <PlayerTwoIcon sx={sx} />
        }
    }
}

export const PlayerOneIcon = ({ sx }: { sx?: Sx }) => {
    const ref = useRef(Uuid.generateSync())
    return (
        <SvgIcon viewBox="-1 -1 2 2" sx={{ ...sx }}>
            <ViewPlayerOneGradientDef
                cx={0}
                cy={0}
                r={1}
                gradientId={ref.current}
            />
            <circle cx={0} cy={0} r={1} fill={`url(#${ref.current})`} />
        </SvgIcon>
    )
}

export const PlayerTwoIcon = ({ sx }: { sx?: Sx }) => {
    const ref = useRef(Uuid.generateSync())
    return (
        <SvgIcon viewBox="-1 -1 2 2" sx={{ ...sx }}>
            <ViewPlayerTwoGradientDef gradientId={ref.current} />
            <circle cx={0} cy={0} r={1} fill={`url(#${ref.current})`} />
        </SvgIcon>
    )
}

export const step = ({ columns, current }: { columns: Columns, current: VisualModel }): VisualModel => {
    const ret: VisualModel = []

    for (let i = 0; i < COLUMN_COUNT; i++) {
        const ret_i: VisualDisc[] = []
        for (let j = 0; j < MAX_COLUMN_HEIGHT; j++) {
            const discTrue = columns[i]?.[j]
            const discVisual = current[i]?.[j]

            // entry
            if (!discVisual && discTrue) {
                ret_i.push({
                    type: "entry",
                    playerType: discTrue,
                    yPosition: Spring.init({ from: MAX_COLUMN_HEIGHT + 1, to: j })
                })
                continue
            }

            // exit
            if (!discTrue && discVisual && discVisual.type !== 'exit') {
                ret_i.push({
                    ...discVisual,
                    type: "exit",
                    yPosition: Spring.init({ from: discVisual.yPosition.current, to: -j })
                })
                continue
            }

            const shouldRemove = discVisual && discVisual.type === 'exit' && Spring.isDone(discVisual.yPosition)

            if (discVisual && !shouldRemove) {
                ret_i.push({
                    ...discVisual,
                    yPosition: Spring.step(discVisual.yPosition)
                })
                continue
            }
        }

        ret.push(ret_i)
    }

    return ret
}

export const initVisual = (columns: Columns): VisualModel => {
    const ret: VisualModel = []

    for (let i = 0; i < COLUMN_COUNT; i++) {
        const ret_i: VisualDisc[] = []
        for (let j = 0; j < MAX_COLUMN_HEIGHT; j++) {
            const discTrue = columns[i]?.[j]
            if (discTrue) {
                ret_i.push({ type: "entry", playerType: discTrue, yPosition: Spring.init({ from: j, to: j }) })
            }
        }
        ret.push(ret_i)
    }

    return ret
}

export const isDone = (model: VisualModel): boolean => {
    for (let i = 0; i < COLUMN_COUNT; i++) {
        for (let j = 0; j < MAX_COLUMN_HEIGHT; j++) {
            const discVisual = model[i]?.[j]
            if (discVisual && !Spring.isDone(discVisual.yPosition)) {
                return false
            }
        }
    }

    return true
}
