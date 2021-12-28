module Components exposing (..)

import Html exposing (Attribute, Html, button, div, h1)
import Html.Attributes exposing (class)
import Html.Events
import List


viewButton : List (Attribute msg) -> List (Html msg) -> Html msg
viewButton attrs html =
    button
        (attrs ++ [ class "focus:ring-12 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded " ])
        html


container : List (Attribute msg) -> List (Html msg) -> Html msg
container attrs html =
    div
        ([ class "m-auto flex flex-col justify-center items-center " ] ++ attrs)
        html


type TypographyVariant
    = Header1


typography : List (Attribute msg) -> List (Html msg) -> Html msg
typography attrs html =
    h1
        ([ class "text-center text-3xl font-bold" ] ++ attrs)
        html
