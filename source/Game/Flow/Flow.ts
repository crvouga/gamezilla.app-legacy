
//   https://en.wikipedia.org/wiki/Numberlink


type DisjointSets<T> = [T, T][]

export const union = <T>(a: T, b: T, set: DisjointSets<T>): DisjointSets<T> => {
    return set
}





export type Model = {
    board: DisjointSets<Position>
}

type Position = {
    x: number,
    y: number
}

export const generateBoard = () => {

}