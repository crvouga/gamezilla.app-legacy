module Container exposing (view)

import Html exposing (Attribute, Html, div)
import Html.Attributes exposing (class)


view : List (Attribute msg) -> List (Html msg) -> Html msg
view attrs html =
    div
        ([ class "m-auto max-w-md flex flex-col justify-center items-center" ] ++ attrs)
        html
