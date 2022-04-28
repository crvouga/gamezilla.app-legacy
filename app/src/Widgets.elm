module Widgets exposing (..)

import Animator
import Animator.Css
import Browser
import Element
import Element.Background as Background
import Element.Border
import Element.Font as Font
import Element.Input as Input
import Html exposing (Html)
import Html.Attributes exposing (attribute)
import Svg exposing (path, svg, text)
import Svg.Attributes exposing (d, fill, viewBox)



-- theme


type alias Theme =
    { backgroundColor : Element.Color
    , fontColor : Element.Color
    , fontSecondaryColor : Element.Color
    , primary : Element.Color
    , spacing : Int
    }


theme : Theme
theme =
    { backgroundColor = Element.rgb255 0 0 0
    , fontColor = Element.rgb255 255 255 255
    , primary = Element.rgb255 76 175 80
    , fontSecondaryColor = Element.rgb255 180 180 180
    , spacing = 8
    }



-- layout


layout : String -> Element.Element msg -> Browser.Document msg
layout title child =
    { title = title
    , body =
        [ Element.layoutWith
            { options =
                [ Element.focusStyle
                    { borderColor = Nothing
                    , backgroundColor = Nothing
                    , shadow = Nothing
                    }
                ]
            }
            [ Background.color theme.backgroundColor
            , Font.color theme.fontColor
            , Element.width Element.fill
            , Element.height Element.fill
            , Font.family
                [ Font.typeface "Nunito"
                ]
            ]
            child
        ]
    }



-- button


button : List (Element.Attribute msg) -> { onPress : Maybe msg, icon : Maybe (Element.Element msg), label : String } -> Element.Element msg
button attrs { onPress, icon, label } =
    Input.button
        (List.append attrs
            [ Background.color theme.primary
            , Font.color theme.fontColor
            , Element.padding (theme.spacing * 1)
            , Element.Border.rounded 24
            , Element.mouseDown [ Element.alpha 0.5 ]
            , Element.mouseOver [ Element.alpha 0.8 ]
            , Element.width Element.fill
            , Font.size 18
            , Font.center
            ]
        )
        { onPress = onPress
        , label =
            Element.row
                [ Element.centerX
                , Element.centerY
                , Element.spacing 6
                ]
                [ case icon of
                    Just element ->
                        element

                    Nothing ->
                        Element.none
                , Element.text label
                ]
        }



-- spinner


type SpinnerState
    = Spinning


spinner : List (Element.Attribute msg) -> Element.Element msg
spinner attrs =
    Element.el
        (List.append
            [ Font.color (Element.rgb255 80 80 80)
            , Element.width (Element.px 52)
            , Element.height (Element.px 52)
            ]
            attrs
        )
        (Element.html
            (Animator.Css.div (Animator.init Spinning)
                [ Animator.Css.transform
                    (\state ->
                        case state of
                            Spinning ->
                                Animator.Css.rotating (Animator.seconds 2)
                    )
                ]
                []
                [ svg
                    [ fill "green"
                    , attribute "role" "status"
                    , viewBox "0 0 100 101"
                    , attribute "xmlns" "http://www.w3.org/2000/svg"
                    ]
                    [ path [ d "M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z", fill "currentColor" ]
                        []
                    , text "    "
                    , path [ d "M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z", fill "currentFill" ]
                        []
                    , text ""
                    ]
                ]
            )
        )
