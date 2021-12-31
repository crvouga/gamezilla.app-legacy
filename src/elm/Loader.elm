module Loader exposing (view)

import Html exposing (Attribute, Html, div)
import Html.Attributes exposing (class, style)


view : List (Attribute msg) -> List (Html msg) -> Html msg
view attrs html =
    div
        ([ class "animate-spin rounded-full border-8 border-slate-300 border-t-blue-500 w-10 h-10" ] ++ attrs)
        html
