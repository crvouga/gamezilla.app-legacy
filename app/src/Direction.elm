module Direction exposing (..)

import Position exposing (Position)


type Direction
    = North
    | South
    | East
    | West


vector : Direction -> Position
vector direction =
    case direction of
        North ->
            { x = 0
            , y = -1
            }

        South ->
            { x = 0
            , y = 1
            }

        West ->
            { x = -1
            , y = 0
            }

        East ->
            { x = 1
            , y = 0
            }


opposite : Direction -> Direction
opposite direction =
    case direction of
        North ->
            South

        South ->
            North

        East ->
            West

        West ->
            East
