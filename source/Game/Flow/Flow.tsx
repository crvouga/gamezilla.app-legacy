
//   https://en.wikipedia.org/wiki/Numberlink


type DisjointSets<T,> = [T, T][]

export const union = <T,>(_a: T, _b: T, set: DisjointSets<T>): DisjointSets<T> => {
    return set
}


// export const find = <T>(element: T, set: DisjointSets<T>): boolean => {
//     // return set.map(([a, b]) => a === b)
// }



export type Model = {
    board: DisjointSets<Position>
}


type Position = {
    x: number,
    y: number
}

export const range = (upper: Position): Position[] => {
    const positions: Position[] = []

    for (let x = 0; x < upper.x; x++) {
        for (let y = 0; y < upper.y; y++) {
            positions.push({ x, y })
        }
    }

    return positions
}


export const generateBoard = () => {

}

export const paint = () => {

}


