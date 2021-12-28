module Components exposing (..)

import Html
import Html.Attributes
import Html.Events
import List


button : { text : String, class : String, onClick : msg } -> Html.Html msg
button { text, onClick, class } =
    Html.button
        [ Html.Attributes.class ("focus:ring-12 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded " ++ class), Html.Events.onClick onClick ]
        [ Html.text text ]


type Breakpoint
    = XS
    | SM
    | LG


toMaxWidthClass : Breakpoint -> String
toMaxWidthClass breakpoint =
    case breakpoint of
        XS ->
            "max-w-xs"

        SM ->
            "max-w-sm"

        LG ->
            "max-w-lg"


container : { maxWidth : Breakpoint } -> List (Html.Html msg) -> Html.Html msg
container { maxWidth } html =
    Html.div
        [ Html.Attributes.class ("m-auto flex flex-col justify-center items-center " ++ toMaxWidthClass maxWidth) ]
        html


type TypographyVariant
    = Header1


typography : { variant : TypographyVariant } -> String -> Html.Html msg
typography { variant } text =
    Html.h1
        [ Html.Attributes.class "text-center text-3xl font-bold" ]
        [ Html.text text ]
