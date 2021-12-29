module Direction exposing (..)


type Direction
    = North
    | South
    | East
    | West


opposite : Direction -> Direction
opposite direction =
    case direction of
        North ->
            South

        South ->
            North

        West ->
            East

        East ->
            West


vector : Direction -> { x : Int, y : Int }
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

        East ->
            { x = 1
            , y = 0
            }

        West ->
            { x = -1
            , y = 0
            }
