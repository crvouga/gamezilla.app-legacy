module Components.PageBar exposing (view, viewTitle)

import Html exposing (Attribute, Html, div, h1)
import Html.Attributes exposing (class, style)


viewTitle : List (Attribute msg) -> List (Html msg) -> Html msg
viewTitle attrs html =
    h1
        (attrs ++ [ class "text-xl font-bold flex items-center justify-center flex-1" ])
        html


view : List (Attribute msg) -> List (Html msg) -> Html msg
view attrs html =
    div
        (attrs
            ++ [ class "w-full p-2 border-b-2"
               ]
        )
        html
