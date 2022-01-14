module Components.Button exposing (view)

import Html exposing (Attribute, Html, button)
import Html.Attributes exposing (class)


view : List (Attribute msg) -> List (Html msg) -> Html msg
view attrs html =
    button
        (attrs ++ [ class "focus:ring-12 bg-blue-700 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded" ])
        html
