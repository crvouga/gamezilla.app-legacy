module Utility exposing (..)

import List


cartesian2 : List a -> List b -> List ( a, b )
cartesian2 xs ys =
    List.concatMap
        (\x -> List.map (\y -> ( x, y )) ys)
        xs


partition : (x -> Bool) -> List x -> ( List x, List x )
partition predicate xs =
    ( List.filter predicate xs, List.filter (\x -> not (predicate x)) xs )


isEven : Int -> Bool
isEven n =
    modBy 2 n == 0


isOdd : Int -> Bool
isOdd n =
    not (isEven n)
