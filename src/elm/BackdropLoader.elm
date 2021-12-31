module BackdropLoader exposing (view)

import Backdrop
import Html exposing (Html, h1, text)
import Html.Attributes exposing (class)
import Loader
import Surface


view : { title : String } -> Html msg
view { title } =
    Backdrop.view []
        [ Surface.view [ class "flex items-center" ]
            [ Loader.view [ class "mr-4" ] []
            , h1 [ class "text-lg font-medium" ] [ text title ]
            ]
        ]
