module Status exposing (..)


type Status
    = Paused
    | Playing


toggle : Status -> Status
toggle status =
    case status of
        Paused ->
            Playing

        Playing ->
            Paused
