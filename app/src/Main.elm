module Main exposing (..)

import Browser
import Element
import Element.Background as Background
import Element.Border
import Element.Font as Font
import Element.Input as Input
import Icons
import InteropDefinitions exposing (FromElm(..), ToElm(..))
import InteropPorts
import Widget
import Widget.Material as Material
import Widget.Material.Typography as Typography



-- Main


main : Program () Model Msg
main =
    Browser.document
        { update = update
        , view = view
        , subscriptions = subscriptions
        , init = init
        }



-- Model


type alias Flags =
    InteropDefinitions.Flags


type Model
    = Loading
    | Unauthenticated
    | Unauthenticating
    | Authenticating
    | Authenticated


init : () -> ( Model, Cmd Msg )
init _ =
    ( Loading
    , Cmd.none
    )



-- Update


type Msg
    = Greet
    | ToElm InteropDefinitions.ToElm
    | Problem String
    | SignInWithGoogle
    | SignOut


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Greet ->
            ( model, greet "Hello" )

        SignInWithGoogle ->
            ( Authenticating, signIn "sign in" )

        SignOut ->
            ( Unauthenticating, signOut "sign in" )

        ToElm toElm ->
            case toElm of
                SignedIn _ ->
                    ( Authenticated, Cmd.none )

                SignedOut ->
                    ( Unauthenticated, Cmd.none )

        Problem _ ->
            ( model, Cmd.none )


greet : String -> Cmd msg
greet text =
    text
        |> InteropDefinitions.Alert
        |> InteropPorts.fromElm


signIn : String -> Cmd msg
signIn text =
    text
        |> InteropDefinitions.SignIn
        |> InteropPorts.fromElm


signOut : String -> Cmd msg
signOut text =
    text
        |> InteropDefinitions.SignOut
        |> InteropPorts.fromElm



-- Subscriptions


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.map
        (\result ->
            case result of
                Err _ ->
                    Problem "Something went wrong"

                Ok toElm ->
                    ToElm toElm
        )
        InteropPorts.toElm



-- View


type alias Theme =
    { backgroundColor : Element.Color
    , fontColor : Element.Color
    , primary : Element.Color
    }


palette : Material.Palette
palette =
    Material.defaultPalette


theme : Theme
theme =
    { backgroundColor = Element.rgb255 40 40 40
    , fontColor = Element.rgb255 255 255 255
    , primary = Element.rgb255 76 175 80
    }


view : Model -> Browser.Document Msg
view model =
    case model of
        Loading ->
            loadingLayout "Loading..."

        Unauthenticating ->
            loadingLayout "Signing Out..."

        Authenticating ->
            loadingLayout "Signing in..."

        Unauthenticated ->
            layout "Sign In" viewSignInScreen

        Authenticated ->
            layout "Sign Out"
                (Element.column
                    [ Element.centerX
                    , Element.centerY
                    , Element.spacing 12
                    ]
                    [ Element.el
                        (List.append Typography.h1
                            [ Font.size 48
                            , Element.centerX
                            , Element.centerY
                            ]
                        )
                        (Element.text "Welcome")
                    , button [] { onPress = Just SignOut, label = "Sign Out", icon = Nothing }
                    ]
                )


viewSignInScreen : Element.Element Msg
viewSignInScreen =
    Element.column
        [ Element.centerX
        , Element.centerY
        , Element.spacing 12
        , Element.width Element.fill
        , Element.padding 12
        ]
        [ Element.el
            (List.append Typography.h1
                [ Font.size 48
                , Element.centerX
                , Element.centerY
                ]
            )
            (Element.text "Gamezilla")
        , button []
            { onPress = Just SignInWithGoogle
            , label = "Continue With Google"
            , icon = Just (Icons.google [])
            }
        ]


button : List (Element.Attribute msg) -> { onPress : Maybe msg, icon : Maybe (Element.Element msg), label : String } -> Element.Element msg
button attrs { onPress, icon, label } =
    Input.button
        (List.append attrs
            [ Background.color theme.primary
            , Font.color theme.fontColor
            , Element.padding 12
            , Element.Border.rounded 24
            , Element.mouseDown [ Element.alpha 0.5 ]
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
            ]
            child
        ]
    }


loadingLayout : String -> Browser.Document msg
loadingLayout title =
    layout title
        (Element.column
            [ Element.centerX
            , Element.centerY
            ]
            [ Widget.circularProgressIndicator (Material.progressIndicator Material.defaultPalette) Nothing
            , Element.text title
            ]
        )
