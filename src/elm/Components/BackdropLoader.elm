module Components.BackdropLoader exposing (view, viewTitle)

import Components.Backdrop
import Components.Loader
import Components.Surface
import Html exposing (Attribute, Html, h1, text)
import Html.Attributes exposing (class)


viewTitle : List (Attribute msg) -> List (Html msg) -> Html msg
viewTitle attr html =
    h1
        (attr ++ [ class "text-lg font-medium" ])
        html


view : List (Attribute msg) -> List (Html msg) -> Html msg
view attr html =
    Components.Backdrop.view attr
        [ Components.Surface.view [ class "flex items-center" ]
            ([ Components.Loader.view [ class "mr-4" ] []
             ]
                ++ html
            )
        ]
