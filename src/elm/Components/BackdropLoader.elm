module Components.BackdropLoader exposing (view)

import Components.Backdrop
import Components.Loader
import Components.Surface
import Html exposing (Html, h1, text)
import Html.Attributes exposing (class)


view : { title : String, isOpen : Bool } -> Html msg
view { title, isOpen } =
    Components.Backdrop.view { isOpen = isOpen }
        []
        [ Components.Surface.view [ class "flex items-center" ]
            [ Components.Loader.view [ class "mr-4" ] []
            , h1 [ class "text-lg font-medium" ] [ text title ]
            ]
        ]
