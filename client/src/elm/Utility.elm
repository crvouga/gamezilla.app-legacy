module Utility exposing (..)

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


cartesianProduct : List (List a) -> List (List a)
cartesianProduct ll =
    case ll of
        [] ->
            [ [] ]

        xs :: xss ->
            lift2 (::) xs (cartesianProduct xss)


lift2 : (a -> b -> c) -> List a -> List b -> List c
lift2 f la lb =
    la |> List.concatMap (\a -> lb |> List.concatMap (\b -> [ f a b ]))
