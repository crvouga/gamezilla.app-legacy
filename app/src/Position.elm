module Position exposing (..)


type alias Position =
    { x : Int
    , y : Int
    }


add : Position -> Position -> Position
add a b =
    { x = a.x + b.x
    , y = a.y + b.y
    }


cartesianProduct : List a -> List b -> List ( a, b )
cartesianProduct xs ys =
    List.concatMap
        (\x -> List.map (\y -> ( x, y )) ys)
        xs


range : Position -> Position -> List Position
range lower upper =
    List.map (\( x, y ) -> { x = x, y = y })
        (cartesianProduct
            (List.range lower.x upper.x)
            (List.range lower.y upper.y)
        )


equals : Position -> Position -> Bool
equals a b =
    a.x == b.x && a.y == b.y
