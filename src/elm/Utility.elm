module Utility exposing (cartesian2, isEven, isOdd)

import List


cartesian2 : List a -> List b -> List ( a, b )
cartesian2 xs ys =
    List.concatMap
        (\x -> List.map (\y -> ( x, y )) ys)
        xs


isEven : Int -> Bool
isEven n =
    modBy 2 n == 0


isOdd : Int -> Bool
isOdd n =
    not (isEven n)
