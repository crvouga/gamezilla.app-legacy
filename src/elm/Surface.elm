module Surface exposing (view)

import Html exposing (Attribute, Html, div)
import Html.Attributes exposing (class, style)


view : List (Attribute msg) -> List (Html msg) -> Html msg
view attrs html =
    div
        ([ class "p-4 drop-shadow-md rounded-md bg bg-slate-100" ] ++ attrs)
        html
