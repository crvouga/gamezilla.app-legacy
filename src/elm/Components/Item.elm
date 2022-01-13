module Components.Item exposing (view, viewCenter, viewEnd, viewStart)

import Html exposing (Attribute, Html, div, h1, text)
import Html.Attributes exposing (class)



-- VIEW


viewStart : List (Attribute msg) -> List (Html msg) -> Html msg
viewStart attrs html =
    div (attrs ++ [ class "mr-2" ]) html


viewCenter : List (Attribute msg) -> List (Html msg) -> Html msg
viewCenter attrs html =
    div (attrs ++ [ class "flex-1" ]) html


viewEnd : List (Attribute msg) -> List (Html msg) -> Html msg
viewEnd attrs html =
    div attrs html


view : List (Attribute msg) -> List (Html msg) -> Html msg
view attrs html =
    div
        (attrs ++ [ class "w-full flex flex-row justify-start items-center font-bold p-4 border-b-2 hover:bg-gray-100 active:bg-gray-200 cursor-pointer" ])
        html
