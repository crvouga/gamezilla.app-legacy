import { IconPlus, VDom } from "gamezilla/@CHILD/app/@SHARED/ui"

const COLUMN_COUNT = 6
const ROW_COUNT = 6

export const toIndex = ({ x, y }: { x: number; y: number }) => {
    return y * COLUMN_COUNT + x
}

export const ViewPackPuzzleGrid = ({
    renderCell,
}: {
    renderCell: ({ x, y }: { x: number; y: number }) => VDom
}) => {
    const columns: VDom[] = []
    for (let y = 0; y < ROW_COUNT; y++) {
        const row: VDom[] = []
        for (let x = 0; x < COLUMN_COUNT; x++) {
            row.push(
                <div
                    key={`${y}-${x}`}
                    className="flex aspect-square w-1/6 items-center justify-center p-1"
                >
                    {renderCell({ x, y })}
                </div>,
            )
        }

        columns.push(
            <div key={y} className="flex w-full justify-between">
                {row}
            </div>,
        )
    }

    return <div className="w-full p-8">{columns}</div>
}

export const ViewAddCell = ({ onClick }: { onClick: () => void }) => {
    return (
        <button
            onClick={onClick}
            className="flex h-full w-full items-center justify-center overflow-hidden rounded border-2 border-neutral-700 bg-neutral-800 hover:opacity-90 active:opacity-80"
        >
            <IconPlus className="h-8 w-8" />
        </button>
    )
}

export const ViewEmptyCell = () => {
    return (
        <div className="flex h-full w-full items-center justify-center overflow-hidden rounded border-2 border-neutral-800 bg-neutral-900 opacity-70"></div>
    )
}
