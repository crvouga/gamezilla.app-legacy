module Components.Backdrop exposing (view)

import Html exposing (Attribute, Html, div)
import Html.Attributes exposing (class, style)


view : List (Attribute msg) -> List (Html msg) -> Html msg
view attrs html =
    div
        ([ class "fixed top-0 left-0 bottom-0 right-0 z-50 flex items-center justify-center"
         , style "background-color" "rgba(0, 0, 0, 0.54)"
         ]
            ++ attrs
        )
        html
