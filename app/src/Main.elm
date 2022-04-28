module Main exposing (..)

import Browser
import Element
import Element.Font as Font
import InteropDefinitions exposing (ToElm(..))
import InteropPorts
import Material.Icons.Types exposing (Coloring(..))
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



-- { backgroundColor = Element.rgb255 40 40 40
-- , fontColor = Element.rgb255 255 255 255
-- , primary = Element.rgb255 76 175 80
-- }


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
            layout "Sign In"
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
                        (Element.text "Gamezilla")
                    , Widget.textButton (Material.containedButton palette)
                        { text = "Continue with Google"
                        , onPress = Just SignInWithGoogle
                        }
                    ]
                )

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
                    , Widget.textButton (Material.containedButton palette)
                        { text = "Sign out"
                        , onPress = Just SignOut
                        }
                    ]
                )


layout : String -> Element.Element msg -> Browser.Document msg
layout title child =
    { title = title
    , body =
        [ Element.layout []
            (Element.el
                [ Element.width Element.fill
                , Element.height Element.fill
                ]
                child
            )
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
