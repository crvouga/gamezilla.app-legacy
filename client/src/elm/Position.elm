module Position exposing (..)

import List exposing (map, range)
import Utility exposing (cartesian2, cartesianProduct)


type alias Position =
    { x : Int, y : Int }


add : Position -> Position -> Position
add a b =
    { x = a.x + b.x
    , y = a.y + b.y
    }


subtract : Position -> Position -> Position
subtract a b =
    { x = a.x - b.x
    , y = a.y - b.y
    }


equals : Position -> Position -> Bool
equals a b =
    a.x == b.x && a.y == b.y


circular : Position -> Position -> Position
circular bounds position =
    { x = modBy bounds.x position.x
    , y = modBy bounds.y position.y
    }


all : Position -> List Position
all bounds =
    cartesian2 (range 0 bounds.x) (range 0 bounds.y)
        |> map (\( x, y ) -> { x = x, y = y })
